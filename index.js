import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import fs from "fs";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch"; // ✅ נדרש ל־fetch בסביבת Node.js

// ✅ מודולים פנימיים
import { generateScript } from "./openaiGenerator.js";
import { textToSpeech } from "./ttsGenerator.js";
import { generateVideoWithPika } from "./pikaGenerator.js";
import { supabase } from "./src/supabaseClient.js";
import { getRandomPrompt } from "./src/randomPromptEngine.js";
import { isDuplicatePrompt } from "./src/duplicationGuard.js";
import { getWeightedPrompt } from "./src/feedbackLoop.js";

// ✅ לוג התחלה
console.log("🟢 Servoya Cloud Worker starting up...");

// ✅ הגדרות בסיסיות
const app = express();
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ✅ Rate limit
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// ✅ נתיב תיקייה זמנית
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_DIR = path.join(__dirname, "temp");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

// ✅ פונקציה למיזוג אודיו ווידאו
async function mergeAudioVideo(videoUrl, audioUrl) {
  try {
    console.log("🎬 Downloading video & audio for merge...");

    const videoPath = path.join(TEMP_DIR, "video.mp4");
    const audioPath = path.join(TEMP_DIR, "audio.mp3");
    const outputPath = path.join(TEMP_DIR, "final.mp4");

    const videoData = await fetch(videoUrl);
    const audioData = await fetch(audioUrl);

    fs.writeFileSync(videoPath, Buffer.from(await videoData.arrayBuffer()));
    fs.writeFileSync(audioPath, Buffer.from(await audioData.arrayBuffer()));

    const cmd = `ffmpeg -y -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a aac "${outputPath}"`;
    execSync(cmd, { stdio: "inherit" });

    console.log("✅ Merge complete:", outputPath);
    return outputPath;
  } catch (error) {
    console.error("❌ Merge failed:", error.message);
    throw error;
  }
}

// ✅ Health check
app.get("/healthz", (req, res) =>
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() })
);

// ✅ Config check
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

// ✅ POST בסיסי לבדיקה
app.post("/", (req, res) => {
  const { category } = req.body;
  if (!category) return res.status(400).json({ error: "Missing category" });
  res.status(200).json({ message: `POST received for category: ${category}` });
});

// ✅ יצירת תסריט, קול, וידאו ומיזוג
app.post("/generate", async (req, res) => {
  try {
    const { category } = req.body;
    let prompt = await getWeightedPrompt(category || "general");

    if (!prompt) {
      prompt = await getRandomPrompt(category || "general");
      console.log("🎯 Using random prompt:", prompt);
    } else {
      console.log("🔥 Using optimized prompt:", prompt);
    }

    const alreadyExists = await isDuplicatePrompt(prompt);
    const promptHash = crypto.randomBytes(16).toString("hex");

    if (alreadyExists) {
      console.warn("⚠️ Duplicate prompt detected, skipping generation.");
      return res.status(409).json({
        success: false,
        message: "Duplicate prompt detected - skipping generation",
      });
    }

    // ✅ יצירת תסריט
    const script = await generateScript(prompt);
    const audioUrl = await textToSpeech(script, "final_output.mp3");

    // ✅ יצירת וידאו
    let videoUrl = null;
    if (process.env.PIKA_API_KEY) {
      videoUrl = await generateVideoWithPika(script, audioUrl);
    } else {
      console.warn("⚠️ PIKA_API_KEY missing - skipped video generation");
    }

    // ✅ מיזוג אם יש שני קבצים
    let finalVideoPath = null;
    if (videoUrl && audioUrl) {
      finalVideoPath = await mergeAudioVideo(videoUrl, audioUrl);
    }

    // ✅ שמירה ב-Supabase
    const videoId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const { error } = await supabase
      .from("videos")
      .insert([
        {
          id: videoId,
          category: category || "general",
          prompt,
          script,
          audio_url: audioUrl,
          video_url: finalVideoPath || videoUrl || null,
          hash: promptHash,
          action: "generate",
          status: finalVideoPath
            ? "merged_video"
            : videoUrl
            ? "generated_video"
            : "generated_audio",
          created_at: createdAt,
        },
      ]);

    if (error) {
      console.error("❌ Error saving to Supabase:", error.message);
    } else {
      console.log("✅ Saved successfully to Supabase.");
    }

    res.status(200).json({
      success: true,
      video_id: videoId,
      status: finalVideoPath
        ? "merged_video"
        : videoUrl
        ? "generated_video"
        : "generated_audio",
      outputs: {
        audio_url: audioUrl,
        video_url: finalVideoPath || videoUrl || null,
      },
      created_at: createdAt,
    });
  } catch (err) {
    console.error("❌ Generate error:", err.message);
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
});

// ✅ נתיב ברירת מחדל
app.use((req, res) =>
  res.status(404).json({ error: "Route not found", path: req.originalUrl })
);

// ✅ הפעלה
const PORT = process.env.PORT || 8080;
console.log("✅ Express server initialization complete");
app.listen(PORT, () => {
  console.log(`✅ Servoya Cloud Worker fully operational on port ${PORT}`);
});
