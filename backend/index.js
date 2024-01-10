const connectToMongo = require("./db");
const express = require("express");
const app = express();
const port = 5001;

app.use(express.json());
// Available routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.get("/", (req, res) => {
  res.send("Hello Gaganjot Hans!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

connectToMongo();

