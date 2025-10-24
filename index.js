import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { generateScript } from "./openaiGenerator.js";

const app = express();

// ✅ נדרש ב־Cloud Run
app.set("trust proxy", true);

// ✅ Middleware בסיסי
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ✅ הגבלת קצב (Rate Limiting)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// ✅ ברירת מחדל - בדיקת בריאות
app.get("/", (req, res) => {
  console.log("✅ Health check received");
  res.status(200).json({
    status: "Servoya Cloud Worker is running!",
    timestamp: new Date().toISOString(),
  });
});

// ✅ נקודת generate
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    console.log("🧠 Generating script for:", prompt.substring(0, 50));

    const script = await generateScript(prompt);
    const filePath = "test.mp3"; // placeholder

    res.status(200).json({
      success: true,
      script,
      filePath,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Generate error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ בדיקת טעינת משתנים
app.get("/config", (req, res) => {
  const present = (k) => (process.env[k] ? "Loaded" : "Missing");
  res.status(200).json({
    NODE_ENV: present("NODE_ENV"),
    SUPABASE_URL: present("SUPABASE_URL"),
    SUPABASE_KEY: present("SUPABASE_KEY"),
    OPENAI_API_KEY: present("OPENAI_API_KEY"),
    ELEVENLABS_API_KEY: present("ELEVENLABS_API_KEY"),
    timestamp: new Date().toISOString(),
  });
});

// ✅ שינוי קריטי: בלי "0.0.0.0"
const port = Number(process.env.PORT) || 8080;
app.listen(port, () => {
  console.log(`✅ Servoya Cloud Worker listening on port ${port}`);
});
