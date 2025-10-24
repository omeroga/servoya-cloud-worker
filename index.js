import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { generateScript } from "./openaiGenerator.js";

const app = express();

// ✅ FIX: Add trust proxy for Cloud Run
app.set('trust proxy', 1);

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Test route
app.get("/", (req, res) => {
  console.log("✅ Health check received");
  res.json({ 
    status: "Servoya Cloud Worker is running!",
    timestamp: new Date().toISOString()
  });
});

// Generate route
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    console.log("🧠 Generating script for:", prompt.substring(0, 50));
    
    const script = await generateScript(prompt);
    const filePath = "test.mp3"; // Replace with actual function
    
    res.json({ 
      success: true,
      script,
      filePath,
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    console.error("❌ Generate error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---- Config self-check route (doesn't expose secrets) ----
app.get("/config", (req, res) => {
  const present = (k) => (process.env[k] ? "Loaded" : "Missing");
  res.json({
    NODE_ENV: present("NODE_ENV"),
    SUPABASE_URL: present("SUPABASE_URL"),
    SUPABASE_KEY: present("SUPABASE_KEY"),
    OPENAI_API_KEY: present("OPENAI_API_KEY"),
    ELEVENLABS_API_KEY: present("ELEVENLABS_API_KEY"),
    timestamp: new Date().toISOString()
  });
});

const port = Number(process.env.PORT) || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Servoya Cloud Worker successfully running on port ${port}`);
});
