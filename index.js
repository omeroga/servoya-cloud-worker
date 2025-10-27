import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import crypto from "crypto";

// 🧠 פונקציות נטענות רק אחרי שהשרת מוכן
import("./openaiGenerator.js").then(({ generateScript }) => global.generateScript = generateScript);
import("./ttsGenerator.js").then(({ textToSpeech }) => global.textToSpeech = textToSpeech);
import("./src/pikaGenerator.js").then(({ generateVideoWithPika }) => global.generateVideoWithPika = generateVideoWithPika);
import("./src/supabaseClient.js").then(({ supabase }) => global.supabase = supabase);
import("./src/randomPromptEngine.js").then(({ getRandomPrompt }) => global.getRandomPrompt = getRandomPrompt);
import("./src/duplicationGuard.js").then(({ isDuplicatePrompt }) => global.isDuplicatePrompt = isDuplicatePrompt);
import("./src/feedbackLoop.js").then(({ getWeightedPrompt }) => global.getWeightedPrompt = getWeightedPrompt);

const app = express();
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ✅ הגבלת קצב
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// ✅ בדיקות
app.get("/healthz", (req, res) => res.status(200).json({ status: "ok", timestamp: new Date().toISOString() }));
app.get("/", (req, res) => res.status(200).json({ status: "Servoya Cloud Worker is running", ts: new Date().toISOString() }));

// ✅ נתיב ברירת מחדל
app.use((req, res) => res.status(404).json({ error: "Route not found", path: req.originalUrl }));

// ✅ הפעלה ל־Cloud Run
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Servoya Cloud Worker running on port ${PORT}`);
});
