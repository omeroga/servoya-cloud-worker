import fs from "fs";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function textToSpeech(text, fileName = "final_output.mp3") {
  try {
    const voiceId = "Rachel"; // אפשר לשנות קול מאוחר יותר
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const outputPath = `/tmp/${fileName}`;

    // שלב 1 - יצירת האודיו
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.4, similarity_boost: 0.7 }
      })
    });

    if (!response.ok) throw new Error(`TTS failed: ${response.statusText}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
    console.log("🎤 Audio file created:", outputPath);

    // שלב 2 - העלאה ל-Supabase
    const { data, error } = await supabase.storage
      .from("servoya-audio")
      .upload(fileName, buffer, {
        contentType: "audio/mpeg",
        upsert: true
      });

    if (error) throw error;

    // שלב 3 - הפקת URL ציבורי
    const {
