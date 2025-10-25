import fetch from "node-fetch";

/**
 * הפונקציה תשלח בקשה ל־Pika API כדי לייצר וידאו
 * מקבלת טקסט, קול, ו־URL לאודיו שיצרנו קודם מ־ElevenLabs
 */
export async function generateVideoWithPika(scriptText, audioUrl) {
  try {
    const PIKA_API_KEY = process.env.PIKA_API_KEY;

    const response = await fetch("https://api.pika.art/v1/videos", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PIKA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "pika-1.5-turbo",
        prompt: `Create a cinematic motivational short video with the following narration: ${scriptText}`,
        audio_url: audioUrl,
        aspect_ratio: "9:16",
        duration: 30
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pika API failed: ${errorText}`);
    }

    const result = await response.json();
    console.log("🎬 Pika video generation response:", result);

    return result;
  } catch (err) {
    console.error("❌ Pika Generator Error:", err.message);
    throw new Error("Failed to generate video with Pika");
  }
}
