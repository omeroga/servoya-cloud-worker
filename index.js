import express from "express";
import { generateScript } from "./scriptGenerator.js";
import { textToSpeech } from "./ttsGenerator.js";

const app = express();
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Servoya Cloud Worker is running successfully!");
});

// Generate route
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).send("Missing prompt");
    console.log("🧠 Generating script...");
    const script = await generateScript(prompt);
    console.log("🎤 Generating audio...");
    const filePath = await textToSpeech(script, "final_output.mp3");
    res.json({ message: "✅ Success", script, filePath });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing request");
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
