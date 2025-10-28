import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import fs from "fs";
import { execSync } from "child_process";

// ✅ טעינת מודולים פנימיים
import { generateScript } from "./openaiGenerator.js";
import { textToSpeech } from "./ttsGenerator.js";
import { generateVideoWithPika } from "./src/pikaGenerator.js";
import { supabase } from "./src/supabaseClient.js";
import { getRandomPrompt } from "./src/randomPromptEngine.js";
import { isDuplicatePrompt } from "./src/duplicationGuard.js";
import { getWeightedPrompt } from "./src/feedbackLoop.js";

const app = express();
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ✅ Rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// ✅ פונקציה למיזוג אודיו ווידאו (FFmpeg)
async function mergeAudioVideo(videoPath, audioPath, outputPath) {
  try {
    if (!fs.existsSync(videoPath) || !fs.existsSync(audioPath)) {
      throw new Error("Missing input files for merge.");
    }

    const cmd = `ffmpeg -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a aac -strict experimental "${outputPath}" -y`;
    execSync(cmd, { stdio: "inherit" });
    console.log("✅ Video and audio merged successfully:", outputPath);
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

    // יצירת תסריט
    const script = await generateScript(prompt);
    const audioUrl = await textToSpeech(script, "final_output.mp3");

    // יצירת וידאו
    let videoUrl = null;
    if (process.env.PIKA_API_KEY) {
      videoUrl = await generateVideoWithPika(script, audioUrl);
    } else {
      console.warn("⚠️ PIKA_API_KEY missing - skipped video generation");
    }

    // מיזוג אודיו ווידאו (אם קיימים שניהם)
    let finalVideoPath = null;
    if (videoUrl && audioUrl) {
      finalVideoPath = await mergeAudioVideo("temp/video.mp4", "temp/audio.mp3", "temp/final.mp4");
    }

    // ✅ שמירה ב-Supabase
    const videoId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const { error } = await supabase.from("videos").insert([{
      id: videoId,
      category: category || "general",
      prompt,
      script,
      audio_url: audioUrl,
      video_url: finalVideoPath || videoUrl || null,
      hash: promptHash,
      action: "generate",
      status: finalVideoPath ? "merged_video" : videoUrl ? "generated_video" : "generated_audio",
      created_at: createdAt
    }]);

    if (error) console.error("❌ Error saving to Supabase:", error.message);
    else console.log("✅ Saved successfully to Supabase.");

    res.status(200).json({
      success: true,
      video_id: videoId,
      status: finalVideoPath ? "merged_video" : videoUrl ? "generated_video" : "generated_audio",
      category: category || "general",
      prompt,
      script,
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
app.listen(PORT, () => {
  console.log(`✅ Servoya Cloud Worker running on port ${PORT}`);
});
