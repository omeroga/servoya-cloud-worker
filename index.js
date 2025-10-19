import express from "express";
import "./contentGenerator.js"; // מוסיף את מחולל התוכן

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Servoya Worker deployed successfully and Content Generator loaded!");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
});
