process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Promise Rejection:", reason);
  process.exit(1);
});

console.log("🧩 Starting Servoya Cloud Worker diagnostic mode...");

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { generateScript } from "./openaiGenerator.js";
import { textToSpeech } from "./ttsGenerator.js";
import { generateVideoWithPika } from "./src/pikaGenerator.js";
import { supabase } from "./src/supabaseClient.js";
import { getRandomPrompt } from "./src/randomPromptEngine.js";
import { isDuplicatePrompt, createPromptHash } from "./src/duplicationGuard.js";
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
    const { category } = req.body;

    // 🧠 שלב 1: בחירת פרומפט רנדומלי לפי קטגוריה
    const prompt = await getRandomPrompt(category || "general");
    console.log("🎯 Using random prompt:", prompt);

    // 🧩 שלב 2: בדיקת כפילות
    const promptHash = createPromptHash(prompt);
    const alreadyExists = await isDuplicatePrompt(prompt);
    if (alreadyExists) {
      console.warn("⚠️ Duplicate prompt detected, skipping generation.");
      return res.status(409).json({
        success: false,
        message: "Duplicate prompt detected - skipping generation",
      });
    }

    // 1️⃣ יצירת תסריט עם OpenAI
    const script = await generateScript(prompt);

    // 2️⃣ יצירת קול עם ElevenLabs
    const audioUrl = await textToSpeech(script, "final_output.mp3");

    // 3️⃣ יצירת וידאו עם Pika (אם יש מפתח)
    let videoUrl = null;
    if (process.env.PIKA_API_KEY) {
      videoUrl = await generateVideoWithPika(script, audioUrl);
    } else {
      console.warn("⚠️ PIKA_API_KEY missing - skipped video generation");
    }

    // 4️⃣ שמירה אוטומטית ל-Supabase
    const { error } = await supabase.from("videos").insert([
      {
        action: "generate",
        prompt,
        script,
        audio_url: audioUrl,
        video_url: videoUrl || null,
        duration_ms: null,
        hash: promptHash,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("❌ Error saving to Supabase:", error.message);
    } else {
      console.log("✅ Saved successfully to Supabase.");

      await supabase
        .from("videos")
        .update({ action: "pending_publish" })
        .eq("audio_url", audioUrl);
    }

    res.status(200).json({
      success: true,
      category: category || "general",
      prompt,
      script,
      audioUrl,
      video: videoUrl || "Skipped (missing PIKA_API_KEY)",
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
  console.log(`✅ Servoya Cloud Worker running and listening on port ${port}`);
});
