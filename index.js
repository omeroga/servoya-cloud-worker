// index.js
import express from "express";
const app = express();

// Middleware בסיסי
app.use(express.json());

// בדיקה שהשרת חי
app.get("/", (req, res) => {
  res.send("✅ Servoya Worker is running successfully!");
});

// האזנה לפורט שסופק על ידי Cloud Run
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
