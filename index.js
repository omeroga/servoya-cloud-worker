import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { generateScript } from "./openaiGenerator.js";
import { textToSpeech } from "./ttsGenerator.js";
import { generateVideoWithPika } from "./src/pikaGenerator.js";

const app = express();

// ✅ נדרש ב־Cloud Run
app.set("trust proxy", 1);

// ✅ Middleware בסיסי
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ✅ הגבלת קצב
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// ✅ בדיקת חיבור ראשונית
app.get("/", (req, res) => {
  res.status(200).json({
    status: "✅ Servoya Cloud Worker is running!",
    timestamp: new Date().toISOString(),
  });
});

// ✅ ראוט מרכזי - מייצר טקסט, קול ווידאו
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    console.log("🧠 Generating script for:", prompt.substring(0, 60));

    // 1️⃣ יצירת תסריט עם OpenAI
    const script = await generateScript(prompt);

    // 2️⃣ יצירת קול עם ElevenLabs
    const audioUrl = await textToSpeech(script, "final_output.mp3");

    // 3️⃣ יצירת וידאו עם Pika (אם יש מפתח)
    let videoResult = null;
    if (process.env.PIKA_API_KEY) {
      videoResult = await generateVideoWithPika(script, audioUrl);
    } else {
      console.warn("⚠️ PIKA_API_KEY missing - skipped video generation");
    }

    res.status(200).json({
      success: true,
      script,
      audioUrl,
      video: videoResult || "Skipped (missing PIKA_API_KEY)",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Generate error:", err.message);
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
});

// ✅ מסלול בדיקה לקונפיגורציה
app.get("/config", (req, res) => {
  const present = (k) => (process.env[k] ? "Loaded" : "Missing");
  res.status(200).json({
    NODE_ENV: present("NODE_ENV"),
    SUPABASE_URL: present("SUPABASE_URL"),
    SUPABASE_KEY: present("SUPABASE_KEY"),
    OPENAI_API_KEY: present("OPENAI_API_KEY"),
    ELEVENLABS_API_KEY: present("ELEVENLABS_API_KEY"),
    PIKA_API_KEY: present("PIKA_API_KEY"),
    timestamp: new Date().toISOString(),
  });
});

// ✅ הפעלה ל־Cloud Run
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Servoya Cloud Worker running on port ${port}`);
});
