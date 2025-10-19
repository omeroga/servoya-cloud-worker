// index.js
// === Servoya Lead Machine Core Runner ===
// Runs full content → video → publish automation

import express from "express";
import { generateContent } from "./src/contentGenerator.js";
import { generateVideo } from "./src/video.js";
import { publishVideo } from "./src/publish.js";

const app = express();
app.use(express.json());

// Root test route
app.get("/", (req, res) => {
  res.send("✅ Servoya AI Automation System is live and ready!");
});

// Run generation route
app.post("/run", async (req, res) => {
  try {
    console.log("⚙️ Starting automation pipeline...");

    const topic = req.body.topic || "beauty trends 2025";
    const content = await generateContent(topic);
    console.log("🧠 Content generated:", content);

    const video = await generateVideo({
      script: content.script,
      title: content.title,
      hashtags: content.hashtags,
    });
    console.log("🎬 Video generated:", video);

    const publish = await publishVideo({
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      caption: `${content.title} #${content.hashtags.join(" #")}`,
    });
    console.log("🚀 Published:", publish);

    res.json({
      status: "success",
      topic,
      content,
      video,
      publish,
    });
  } catch (err) {
    console.error("❌ Pipeline failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// Cloud Run required port
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌍 Server running on port ${PORT}`);
});
