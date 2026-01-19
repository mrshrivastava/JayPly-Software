const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();

/* ================= DOWNLOAD STOCKS ================= */
router.get("/stocks", (req, res) => {
  const filePath = path.join(__dirname, "../data/stocks.xlsx");

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Stocks file not found" });
  }

  res.download(filePath, "stocks.xlsx");
});

/* ================= DOWNLOAD TRANSACTIONS ================= */
router.get("/transactions", (req, res) => {
  const filePath = path.join(__dirname, "../data/transactions.xlsx");

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Transactions file not found" });
  }

  res.download(filePath, "transactions.xlsx");
});

module.exports = router;
