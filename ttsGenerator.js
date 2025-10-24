import fs from "fs";
import fetch from "node-fetch";

export async function textToSpeech(text, fileName = "output.mp3") {
  try {
    const voiceId = "EXAVITQu4vr4xnSDxMaL"; // ✅ ID אמיתי מ-ElevenLabs (Rachel)
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const outputPath = `/tmp/${fileName}`; // Cloud Run כותב רק בתיקיית tmp

    if (!apiKey) {
      throw new Error("Missing ELEVENLABS_API_KEY environment variable");
    }

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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TTS request failed (${response.status}): ${errorText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
    console.log("🎤 Audio file created successfully:", outputPath);

    return outputPath;

  } catch (err) {
    console.error("❌ ElevenLabs Error:", err.message);
    throw new Error("Failed to generate audio");
  }
}
