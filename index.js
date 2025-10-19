import express from "express";
import routes from "./contentGenerator.js";

const app = express();
app.use(express.json());

// ברירת מחדל – דף בדיקה
app.get("/", (req, res) => {
  res.send("✅ Servoya Worker deployed successfully!");
});

// רישום הראוטים של השלב הזה (/produce ו-/publish)
app.use(routes);

// Cloud Run מחייב האזנה לפורט שנמצא במשתנה הסביבה PORT
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
});
