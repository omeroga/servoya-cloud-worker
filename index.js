import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { generateScript } from "./scriptGenerator.js";
import { textToSpeech } from "./ttsGenerator.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Routes
app.get("/", (req, res) => {
  res.json({ 
    status: "Servoya Cloud Worker is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

app.post("/generate", async (req, res) => {
  try {
    const { prompt, options } = req.body;
    
    // Input validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ 
        error: "Prompt must be a non-empty string",
        code: "INVALID_PROMPT"
      });
    }
    
    if (prompt.length > 2000) {
      return res.status(400).json({
        error: "Prompt too long (max 2000 characters)",
        code: "PROMPT_TOO_LONG"
      });
    }

    console.log("🧠 Generating script for prompt:", prompt.substring(0, 100) + "...");
    
    const script = await generateScript(prompt);
    const filePath = await textToSpeech(script, "final_output.mp3");
    
    res.json({ 
      success: true,
      script,
      filePath,
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    console.error("Generate endpoint error:", err);
    
    // Specific error handling
    if (err.message?.includes("API") || err.message?.includes("key")) {
      return res.status(401).json({ 
        error: "API configuration error",
        code: "API_ERROR"
      });
    }
    
    res.status(500).json({ 
      error: "Internal server error",
      code: "INTERNAL_ERROR"
    });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Servoya Cloud Worker running on port ${port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
