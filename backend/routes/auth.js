const router = require("express").Router();
const jwt = require("jsonwebtoken");
const {writeSheet, readSheet } = require("../utils/excel");

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = readSheet("data/users.xlsx", "users");

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ username }, "Jayply234", { expiresIn: "1d" });
  res.json({ token });
});

router.put("/update-credentials", (req, res) => {
  const { oldPassword, newUsername, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const users = readSheet("data/users.xlsx", "users");

  // assuming single-user system
  const user = users[0];

  if (user.password !== oldPassword) {
    return res.status(401).json({ message: "Old password is incorrect" });
  }

  if (newUsername) {
    user.username = newUsername;
  }

  user.password = newPassword;

  writeSheet("data/users.xlsx", "users", users);

  res.json({ message: "Credentials updated successfully" });
});


module.exports = router;