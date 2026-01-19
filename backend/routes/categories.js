const express = require("express");
const router = express.Router();

const {
  readSheet,
  writeSheet,
  ensureSheet,
  deleteSheet
} = require("../utils/excel");

/* ================= GET ALL CATEGORIES ================= */
router.get("/", (req, res) => {
  const categories = readSheet("data/categories.xlsx", "categories");
  res.json(categories);
});

/* ================= ADD CATEGORY ================= */
router.post("/", (req, res) => {
  let { id, name } = req.body;

  if (!id || !name) {
    return res.status(400).json({ message: "Invalid category data" });
  }

  id = id.trim().toLowerCase();
  name = name.trim();

  const categories = readSheet("data/categories.xlsx", "categories");

  const exists = categories.some(
    c => c.id.toLowerCase() === id
  );

  if (exists) {
    return res.status(400).json({ message: "Category already exists" });
  }

  /* 1️⃣ Save category */
  categories.push({ id, name });
  writeSheet("data/categories.xlsx", "categories", categories);

  /* 2️⃣ Auto-create stock sheet */
  ensureSheet(
    "data/stocks.xlsx",
    id,
    ["id", "stock"]
  );

  res.json({
    message: "Category added and stock sheet created successfully"
  });
});

/* ================= DELETE CATEGORY ================= */
router.delete("/:id", (req, res) => {
  const id = req.params.id.toLowerCase();

  const categories = readSheet("data/categories.xlsx", "categories");

  const categoryExists = categories.find(c => c.id === id);
  if (!categoryExists) {
    return res.status(404).json({ message: "Category not found" });
  }

  /* Check stock sheet */
  const stockData = readSheet("data/stocks.xlsx", id);

  if (stockData.length > 0) {
    return res.status(400).json({
      message: "Cannot delete category with existing stock"
    });
  }

  /* Remove category */
  const updatedCategories = categories.filter(c => c.id !== id);
  writeSheet("data/categories.xlsx", "categories", updatedCategories);

  /* Remove stock sheet */
  deleteSheet("data/stocks.xlsx", id);

  res.json({ message: "Category deleted successfully" });
});

module.exports = router;
