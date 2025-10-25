import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { generateScript } from "./openaiGenerator.js";
import { textToSpeech } from "./ttsGenerator.js";
import { generateVideoWithPika } from "./src/pikaGenerator.js"; // ✅ חדש

const app = express();

// ✅ נדרש ב־Cloud Run
app.set("trust proxy", 1);

// ✅ Middleware בסיסי
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ✅ הגבלת קצב (Rate Limiting)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// ✅ Health check route
app.get("/", (req, res) => {
  console.log("✅ Health check received");
  res.status(200).json({
    status: "Servoya Cloud Worker is running!",
    timestamp: new Date().toISOString(),
  });
});

// ✅ Main route - Generate script + voice + video
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    console.log("🧠 Generating script for:", prompt.substring(0, 50));

    // שלב 1 - יצירת טקסט
    const script = await generateScript(prompt);

    // שלב 2 - יצירת קול
    const audioUrl = await textToSpeech(script, "final_output.mp3");

    // שלב 3 - יצירת וידאו (Pika)
    const videoResult = await generateVideoWithPika(script, audioUrl);
    console.log("🎬 Video created via Pika:", videoResult);

    // תשובה סופית
    res.status(200).json({
      success: true,
      script,
      filePath: audioUrl,
      video: videoResult,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Generate error:", err.message);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// ✅ Config test route
app.get("/config", (req, res) => {
  const present = (k) => (process.env[k] ? "Loaded" : "Missing");
  res.status(200).json({
    NODE_ENV: present("NODE_ENV"),
    SUPABASE_URL: present("SUPABASE_URL"),
    SUPABASE_KEY: present("SUPABASE_KEY"),
    OPENAI_API_KEY: present("OPENAI_API_KEY"),
    ELEVENLABS_API_KEY: present("ELEVENLABS_API_KEY"),
    PIKA_API_KEY: present("PIKA_API_KEY"), // ✅ חדש
    timestamp: new Date().toISOString(),
  });
});

// ✅ יציאה נקייה ל־Cloud Run
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Servoya Cloud Worker running on port ${port}`);
});
