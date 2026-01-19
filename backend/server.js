const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", require("./routes/auth"));
app.use("/stocks", require("./routes/stocks"));
app.use("/transactions", require("./routes/transactions"));

app.listen(5000, () => console.log("Backend running on port 5000"));