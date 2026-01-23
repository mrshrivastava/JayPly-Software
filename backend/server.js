const express = require("express");
const cors = require("cors");
const authMiddleware = require("./middleware/auth");
const auth = require("./middleware/auth");

const app = express();
app.use(cors());
app.use(express.json());


app.use("/api/auth", require("./routes/auth"));
app.use("/api/stocks", authMiddleware, require("./routes/stocks"));
app.use("/api/transactions", authMiddleware, require("./routes/transactions"));
app.use("/api/categories",  require("./routes/categories"));
app.use("/api/download", authMiddleware, require("./routes/download"));




app.listen(5000, () => console.log("Backend running on port 5000"));