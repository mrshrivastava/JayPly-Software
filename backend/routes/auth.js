const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { readSheet } = require("../utils/excel");

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = readSheet("data/users.xlsx", "users");

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ username }, "SECRET_KEY", { expiresIn: "1d" });
  res.json({ token });
});

module.exports = router;