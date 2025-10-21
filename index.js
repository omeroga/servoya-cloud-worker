// index.js
// === Servoya AI Automation System ===
// Full automation pipeline: content → video → publish

import express from "express";
import cors from "cors";
import { generateContent } from "./src/contentGenerator.js";
import { generateVideo } from "./src/video.js";
import { publishVideo } from "./src/publish.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Root route
app.get("/", (req, res) => {
  res.send("✅ Servoya AI Automation System is live and ready!");
});

// ✅ Test route (for Render/health check)
app.get("/test", (req, res) => {
  res.status(200).send("✅ Servoya worker active and connected");
});

// Main automation pipeline
app.post("/run", async (req, res) => {
  try {
    console.log("⚙️ Starting automation pipeline...");

    const topic = req.body.topic?.trim();
    if (!topic) {
      return res.status(400).json({
        error: "Missing or invalid 'topic' field in request body",
      });
    }

    console.log(`🧠 Generating content for topic: ${topic}`);
    const content = await generateContent(topic);
    console.log("🧩 Content generated:", content);

    console.log("🎥 Generating video...");
    const video = await generateVideo({
      script: content.script,
      title: content.title,
      hashtags: content.hashtags,
    });
    console.log("🎬 Video generated:", video);

    console.log("📢 Publishing video...");
    const publish = await publishVideo({
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      caption: `${content.title} #${content.hashtags.join(" #")}`,
    });

    console.log("🚀 Publish result:", publish);

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

// Cloud Run / Render required port
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌍 Server running on port ${PORT}`);
});
