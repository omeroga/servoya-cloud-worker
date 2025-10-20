// src/video.js
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateVideo({ script, title, hashtags }) {
  try {
    console.log("🎙️ Generating voice with OpenAI TTS...");

    // Create output path
    const outputPath = path.resolve(`./public/output_${Date.now()}.mp3`);

    // Generate audio
    const mp3 = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: script,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);

    console.log("✅ Audio file created:", outputPath);

    // Return mock video object (for now only audio)
    return {
      videoUrl: outputPath,
      thumbnailUrl: "https://example.com/temp-thumbnail.jpg",
    };
  } catch (error) {
    console.error("❌ Error generating video/audio:", error);
    throw error;
  }
}
