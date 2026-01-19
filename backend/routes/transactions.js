const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
const { readSheet, writeSheet } = require("../utils/excel");

// router.get("/", (req, res) => {
//   res.json(readSheet("data/transactions.xlsx", "transactions"));
// });

router.get("/", (req, res) => {
  let transactions = readSheet("data/transactions.xlsx", "transactions");

  const {
    offset = 0,
    limit = 20,
    startDate,
    endDate
  } = req.query;

  // ✅ FIXED DATE FILTER LOGIC
  if (startDate) {
    let start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // start of day

    let end;
    if (endDate) {
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // end of end date
    } else {
      // only start date selected → same day range
      end = new Date(startDate);
      end.setHours(23, 59, 59, 999);
    }

    transactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= start && txDate <= end;
    });
  }

  // Sort latest first
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Pagination
  const paginated = transactions.slice(
    Number(offset),
    Number(offset) + Number(limit)
  );

  res.json({
    data: paginated,
    hasMore: Number(offset) + Number(limit) < transactions.length
  });
});


router.post("/", (req, res) => {
  const { product, product_id, quantity } = req.body;

  const stocks = readSheet("data/stocks.xlsx", product);
  const transactions = readSheet("data/transactions.xlsx", "transactions");

  const item = stocks.find(s => s.id === product_id);
  if (!item) return res.status(400).json({ error: "Product not found" });

  item.stock += quantity;
  if (item.stock < 0)
    return res.status(400).json({ error: "Insufficient stock" });

  transactions.push({
    transaction_id: uuidv4(),
    product,
    product_id,
    date: new Date().toISOString(),
    quantity,
    remaining_product_stock: item.stock
  });

  writeSheet("data/stocks.xlsx", product, stocks);
  writeSheet("data/transactions.xlsx", "transactions", transactions);

  res.json({ message: "Transaction successful" });
});

router.delete("/:id", (req, res) => {
  let transactions = readSheet("data/transactions.xlsx", "transactions");
  const tx = transactions.find(t => t.transaction_id === req.params.id);
  if (!tx) return res.sendStatus(404);

  const stocks = readSheet("data/stocks.xlsx", tx.product);
  const item = stocks.find(s => s.id === tx.product_id);
  item.stock -= tx.quantity;

  transactions = transactions.filter(t => t.transaction_id !== tx.transaction_id);

  writeSheet("data/stocks.xlsx", tx.product, stocks);
  writeSheet("data/transactions.xlsx", "transactions", transactions);

  res.json({ message: "Transaction deleted & stock reverted" });
});

module.exports = router;