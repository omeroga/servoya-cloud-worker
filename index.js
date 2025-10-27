import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import crypto from "crypto";

// 🧩 טעינה בטוחה של מודולים כבדים
let generateScript, textToSpeech, generateVideoWithPika, supabase;
let getRandomPrompt, isDuplicatePrompt, getWeightedPrompt;

(async () => {
  try {
    ({ generateScript } = await import("./openaiGenerator.js"));
    ({ textToSpeech } = await import("./ttsGenerator.js"));
    ({ generateVideoWithPika } = await import("./src/pikaGenerator.js"));
    ({ supabase } = await import("./src/supabaseClient.js"));
    ({ getRandomPrompt } = await import("./src/randomPromptEngine.js"));
    ({ isDuplicatePrompt } = await import("./src/duplicationGuard.js"));
    ({ getWeightedPrompt } = await import("./src/feedbackLoop.js"));
    console.log("✅ Modules loaded successfully");
  } catch (err) {
    console.error("❌ Failed loading modules:", err.message);
  }
})();

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

// ✅ Healthcheck
app.get("/healthz", (req, res) =>
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() })
);

// ✅ Root test
app.get("/", (req, res) =>
  res.status(200).json({
    status: "✅ Servoya Cloud Worker is running!",
    timestamp: new Date().toISOString(),
  })
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

// ✅ POST root test
app.post("/", (req, res) => {
  const { category } = req.body;
  if (!category)
    return res.status(400).json({ error: "Missing category" });
  res
    .status(200)
    .json({ message: `POST received successfully for category: ${category}` });
});

// ✅ Generate route
app.post("/generate", async (req, res) => {
  try {
    if (!generateScript || !textToSpeech) {
      throw new Error("Modules not yet loaded");
    }

    const { category } = req.body;
    let prompt = (await getWeightedPrompt?.(category)) || null;

    if (!prompt) {
      prompt = await getRandomPrompt?.(category || "general");
      console.log("🎯 Using random prompt:", prompt);
    } else {
      console.log("🔥 Using optimized prompt:", prompt);
    }

    const alreadyExists = await isDuplicatePrompt?.(prompt);
    const promptHash = crypto.randomBytes(16).toString("hex");

    if (alreadyExists) {
      console.warn("⚠️ Duplicate prompt detected, skipping generation.");
      return res
        .status(409)
        .json({ success: false, message: "Duplicate prompt detected" });
    }

    const script = await generateScript(prompt);
    const audioUrl = await textToSpeech(script, "final_output.mp3");

    let videoUrl = null;
    if (process.env.PIKA_API_KEY && generateVideoWithPika) {
      videoUrl = await generateVideoWithPika(script, audioUrl);
    } else {
      console.warn("⚠️ PIKA_API_KEY missing - skipping video generation");
    }

    const { error } = await supabase
      ?.from("videos")
      .insert([
        {
          action: "generate",
          prompt,
          script,
          audio_url: audioUrl,
          video_url: videoUrl || null,
          hash: promptHash,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) console.error("❌ Supabase insert error:", error.message);

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
    res.status(500).json({ error: err.message });
  }
});

// ✅ Fallback route
app.use((req, res) =>
  res.status(404).json({ error: "Route not found", path: req.originalUrl })
);

// ✅ Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`✅ Servoya Cloud Worker running on port ${PORT}`)
);
