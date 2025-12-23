import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Backend alive");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
