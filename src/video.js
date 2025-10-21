import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// === Supabase client setup ===
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function generateVideo({ script, title, hashtags }) {
  try {
    console.log("🎙️ Generating voice with OpenAI TTS...");

    // Ensure "public" folder exists
    const publicDir = path.resolve("./public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Create output path
    const outputPath = path.join(publicDir, `output_${Date.now()}.mp3`);

    // Generate audio
    const mp3 = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: script,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);

    console.log("✅ Audio file created:", outputPath);

    // === Save job info to Supabase ===
    const { error } = await supabase.from("jobs").insert([
      {
        status: "done",
        result_json: { videoUrl: outputPath, title, hashtags },
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("❌ Error saving to Supabase:", error);
    } else {
      console.log("💾 Job saved to Supabase!");
    }

    // Return video object
    return {
      videoUrl: outputPath,
      thumbnailUrl: "https://example.com/temp-thumbnail.jpg",
    };
  } catch (error) {
    console.error("❌ Error generating video/audio:", error);
    throw error;
  }
}
