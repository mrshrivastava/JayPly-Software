const router = require("express").Router();
const { readSheet, writeSheet } = require("../utils/excel");

router.get("/:type", (req, res) => {
  res.json(readSheet("data/stocks.xlsx", req.params.type));
});


router.post("/:type", (req, res) => {
  const { id, stock } = req.body;
  const data = readSheet("data/stocks.xlsx", req.params.type);

  const exists = data.find(item => item.id === id);
  if (exists) {
    return res.status(400).json({
      message: "Product ID already exists"
    });
  }

  data.push({ id, stock });
  writeSheet("data/stocks.xlsx", req.params.type, data);

  res.json({ message: "Stock added successfully" });
});

router.put("/:type/:id", (req, res) => {
  const { stock } = req.body;
  let data = readSheet("data/stocks.xlsx", req.params.type);

  const item = data.find(d => d.id === req.params.id);
  if (!item) {
    return res.status(404).json({ message: "Product not found" });
  }

  item.stock = Number(stock);
  writeSheet("data/stocks.xlsx", req.params.type, data);

  res.json({ message: "Stock updated successfully" });
});


router.delete("/:type/:id", (req, res) => {
  let data = readSheet("data/stocks.xlsx", req.params.type);
  data = data.filter(d => d.id !== req.params.id);
  writeSheet("data/stocks.xlsx", req.params.type, data);
  res.json({ message: "Stock deleted" });
});


module.exports = router;