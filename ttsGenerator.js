import fs from "fs";
import fetch from "node-fetch";

export async function textToSpeech(text, fileName = "output.mp3") {
  try {
    const voiceId = "Rachel"; // אפשר לשנות לקול אחר מאוחר יותר
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const outputPath = `/tmp/${fileName}`;

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
    return outputPath;

  } catch (err) {
    console.error("❌ ElevenLabs Error:", err);
    throw new Error("Failed to generate audio");
  }
}
