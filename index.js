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
    
    // TODO: Add your generateScript and textToSpeech imports
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

const port = process.env.PORT || 8080;

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Servoya Cloud Worker successfully running on port ${port}`);
});
