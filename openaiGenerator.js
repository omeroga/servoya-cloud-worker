import OpenAI from "openai";
import { isDuplicatePrompt } from "./src/duplicationGuard.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ עוטף כל קריאה ל־OpenAI במגבלת זמן פנימית של 25 שניות
function withTimeout(promise, ms = 25000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("⏱️ OpenAI timeout exceeded")), ms)),
  ]);
}

export async function generateScript(prompt) {
  try {
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      console.warn("⚠️ Empty or invalid prompt, using fallback text.");
      return "Stay focused. Your goals won’t achieve themselves.";
    }

    const isDuplicate = await isDuplicatePrompt(prompt);
    if (isDuplicate) {
      console.warn("⚠️ Duplicate prompt detected — skipping generation");
      return "Duplicate prompt detected - skipped.";
    }

    console.log("🚀 Generating new script (timeout 25s)...");
    const response = await withTimeout(
      client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional content scriptwriter for short motivational videos.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 300,
      }),
      25000
    );

    const script = response.choices?.[0]?.message?.content?.trim() || "";
    if (!script) {
      console.warn("⚠️ Empty response from OpenAI, using fallback.");
      return "No matter how slow you go, you’re still lapping everyone who’s sitting still.";
    }

    console.log("✅ Script generated successfully.");
    return script;
  } catch (error) {
    console.error("❌ OpenAI Generator Error:", error.message);
    return "Failure is temporary, but quitting lasts forever.";
  }
}
