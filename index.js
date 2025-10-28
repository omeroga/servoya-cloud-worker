import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import fs from "fs";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

// ✅ מודולים פנימיים
import { generateScript } from "./openaiGenerator.js";
import { textToSpeech } from "./ttsGenerator.js";
import { generateVideoWithPika } from "./pikaGenerator.js";
import { supabase } from "./src/supabaseClient.js";
import { getRandomPrompt } from "./src/randomPromptEngine.js";
import { isDuplicatePrompt } from "./src/duplicationGuard.js";
import { getWeightedPrompt } from "./src/feedbackLoop.js";

// ✅ התחלה
console.log("🟢 Servoya Cloud Worker starting...");

const app = express();

// ───────────────────────────────────────────────────────────
// 🔒 ENDPOINTS לבריאות - בראש, לפני כל מידלוור, בלי תלות בכלום
// ───────────────────────────────────────────────────────────
app.get("/healthz", (req, res) => {
  res.status(200).send("ok");
});
app.head("/healthz", (req, res) => {
  res.status(200).end();
});
// גם /health לטובת בדיקות חיצוניות שונות
app.get("/health", (req, res) => {
  res.status(200).send("ok");
});
// וגם root כ-fallback בריאות (למנוע 404 בפרובים חיצוניים)
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", route: "/", ts: new Date().toISOString() });
});

// ───────────────────────────────────────────────────────────
// ✅ מידלוורים (אחרי בריאות)
// ───────────────────────────────────────────────────────────
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ✅ Rate Limit - דלג על בריאות
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/healthz" || req.path === "/health" || req.path === "/",
});
app.use(limiter);

// ✅ תיקיית TEMP
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_DIR = path.join(__dirname, "temp");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

// ✅ Config check (לבדיקות מהירות)
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

// ✅ פונקציה למיזוג וידאו ואודיו
async function mergeAudioVideo(videoUrl, audioUrl) {
  try {
    const videoPath = path.join(TEMP_DIR, "video.mp4");
    const audioPath = path.join(TEMP_DIR, "audio.mp3");
    const outputPath = path.join(TEMP_DIR, "final.mp4");

    const videoData = await fetch(videoUrl);
    const audioData = await fetch(audioUrl);

    fs.writeFileSync(videoPath, Buffer.from(await videoData.arrayBuffer()));
    fs.writeFileSync(audioPath, Buffer.from(await audioData.arrayBuffer()));

    // שמירת וידאו ללא Re-encode + אודיו AAC תקני ליוטיוב
    const cmd = `ffmpeg -y -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a aac -movflags +faststart "${outputPath}"`;
    execSync(cmd, { stdio: "inherit" });

    return outputPath;
  } catch (error) {
    console.error("❌ Merge failed:", error.message);
    throw error;
  }
}

// ✅ יצירת תוכן
app.post("/generate", async (req, res) => {
  try {
    const { category } = req.body;
    let prompt = await getWeightedPrompt(category || "general");
    if (!prompt) prompt = await getRandomPrompt(category || "general");

    const alreadyExists = await isDuplicatePrompt(prompt);
    if (alreadyExists) {
      return res.status(409).json({ success: false, message: "Duplicate prompt detected" });
    }

    const script = await generateScript(prompt);
    const audioUrl = await textToSpeech(script, "final_output.mp3");
    const videoUrl = process.env.PIKA_API_KEY ? await generateVideoWithPika(script, audioUrl) : null;

    let finalVideoPath = null;
    if (videoUrl && audioUrl) {
      finalVideoPath = await mergeAudioVideo(videoUrl, audioUrl);
    }

    const videoId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const { error } = await supabase.from("videos").insert([{
      id: videoId,
      category: category || "general",
      prompt,
      script,
      audio_url: audioUrl,
      video_url: finalVideoPath || videoUrl || null,
      status: finalVideoPath ? "merged_video" : videoUrl ? "generated_video" : "generated_audio",
      created_at: createdAt,
    }]);

    if (error) console.error("❌ Error saving:", error.message);

    res.status(200).json({
      success: true,
      video_id: videoId,
      status: finalVideoPath ? "merged_video" : videoUrl ? "generated_video" : "generated_audio",
      outputs: { audio_url: audioUrl, video_url: finalVideoPath || videoUrl || null },
      created_at: createdAt,
    });
  } catch (err) {
    console.error("❌ Generate error:", err.message);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// ✅ ברירת מחדל
app.use((req, res) => res.status(404).json({ error: "Route not found", path: req.originalUrl }));

// ✅ הפעלה
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Servoya Cloud Worker running on port ${PORT}`);
});
