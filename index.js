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

console.log("🟢 Servoya Cloud Worker starting...");

const app = express();

// ───────────────────────────────────────────────────────────
// ✅ HEALTH ENDPOINTS - מגיבים לכל סוג בקשה (HEAD/GET/HTTP2 וכו')
// ───────────────────────────────────────────────────────────
app.all(["/", "/health", "/healthz"], (req, res) => {
  res.status(200).json({
    status: "ok",
    method: req.method,
    path: req.path,
    ts: new Date().toISOString(),
  });
});

// ───────────────────────────────────────────────────────────
// ✅ MIDDLEWARES
// ───────────────────────────────────────────────────────────
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ✅ Rate limit (דלג על בריאות)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => ["/", "/health", "/healthz"].includes(req.path),
});
app.use(limiter);

// ✅ TEMP FOLDER
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_DIR = path.join(__dirname, "temp");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

// ✅ CONFIG CHECK
app.get("/config", (req, res) => {
  const check = (key) => (process.env[key] ? "Loaded" : "Missing");
  res.json({
    NODE_ENV: check("NODE_ENV"),
    SUPABASE_URL: check("SUPABASE_URL"),
    SUPABASE_KEY: check("SUPABASE_KEY"),
    OPENAI_API_KEY: check("OPENAI_API_KEY"),
    ELEVENLABS_API_KEY: check("ELEVENLABS_API_KEY"),
    PIKA_API_KEY: check("PIKA_API_KEY"),
    timestamp: new Date().toISOString(),
  });
});

// ✅ MERGE AUDIO + VIDEO
async function mergeAudioVideo(videoUrl, audioUrl) {
  try {
    const videoPath = path.join(TEMP_DIR, "video.mp4");
    const audioPath = path.join(TEMP_DIR, "audio.mp3");
    const outputPath = path.join(TEMP_DIR, "final.mp4");

    const videoData = await fetch(videoUrl);
    const audioData = await fetch(audioUrl);

    fs.writeFileSync(videoPath, Buffer.from(await videoData.arrayBuffer()));
    fs.writeFileSync(audioPath, Buffer.from(await audioData.arrayBuffer()));

    const cmd = `ffmpeg -y -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a aac -movflags +faststart "${outputPath}"`;
    execSync(cmd, { stdio: "inherit" });

    return outputPath;
  } catch (error) {
    console.error("❌ Merge failed:", error.message);
    throw error;
  }
}

// ✅ GENERATE
app.post("/generate", async (req, res) => {
  try {
    const { category } = req.body;
    let prompt = (await getWeightedPrompt(category)) || (await getRandomPrompt(category));
    if (!prompt) return res.status(400).json({ error: "No prompt found" });

    if (await isDuplicatePrompt(prompt)) {
      return res.status(409).json({ success: false, message: "Duplicate prompt detected" });
    }

    const script = await generateScript(prompt);
    const audioUrl = await textToSpeech(script, "final_output.mp3");
    const videoUrl = process.env.PIKA_API_KEY ? await generateVideoWithPika(script, audioUrl) : null;
    const finalVideoPath = videoUrl && audioUrl ? await mergeAudioVideo(videoUrl, audioUrl) : null;

    const videoId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const { error } = await supabase.from("videos").insert([
      {
        id: videoId,
        category: category || "general",
        prompt,
        script,
        audio_url: audioUrl,
        video_url: finalVideoPath || videoUrl,
        status: finalVideoPath ? "merged_video" : videoUrl ? "generated_video" : "generated_audio",
        created_at: createdAt,
      },
    ]);

    if (error) console.error("❌ Supabase insert error:", error.message);

    res.json({
      success: true,
      video_id: videoId,
      status: finalVideoPath ? "merged_video" : videoUrl ? "generated_video" : "generated_audio",
      outputs: { audio_url: audioUrl, video_url: finalVideoPath || videoUrl },
      created_at: createdAt,
    });
  } catch (err) {
    console.error("❌ Generate error:", err.message);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// ✅ FALLBACK 404
app.use((req, res) => res.status(404).json({ error: "Route not found", path: req.originalUrl }));

// ✅ SERVER START
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Servoya Cloud Worker running on port ${PORT}`));
