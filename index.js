import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

const app = express();

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
    // ... rest of your code
    
  } catch (err) {
    console.error("❌ Generate error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const port = process.env.PORT || 8080;

// Important: Add detailed startup logging
console.log("🚀 Starting Servoya Cloud Worker...");
console.log("📍 Port:", port);
console.log("🔑 Environment variables loaded:", {
  hasOpenAI: !!process.env.OPENAI_API_KEY,
  hasElevenLabs: !!process.env.ELEVENLABS_API_KEY,
  hasSupabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_KEY)
});

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Servoya Cloud Worker successfully running on port ${port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
