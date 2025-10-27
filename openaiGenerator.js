import OpenAI from "openai";
import { isDuplicatePrompt, createPromptHash } from "./src/duplicationGuard.js";
import { supabase } from "./src/supabaseClient.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * יוצר סקריפט חדש בעזרת OpenAI, רק אם לא נוצר פרומפט זהה בעבר.
 * @param {string} prompt - הטקסט המשמש ליצירת הסקריפט
 * @returns {Promise<string>} טקסט הסקריפט הסופי
 */
export async function generateScript(prompt) {
  try {
    console.log("🧠 Checking for duplicate prompt...");
    const isDuplicate = await isDuplicatePrompt(prompt);
    if (isDuplicate) {
      console.warn("⚠️ Duplicate prompt detected — skipping generation");
      return JSON.stringify({
        success: false,
        message: "Duplicate prompt detected - skipping generation"
      });
    }

    console.log("🚀 Generating new script...");
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional content scriptwriter for short motivational videos."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 300
    });

    const script = response.choices[0].message.content.trim();
    console.log("✅ Script generated successfully.");

    // --- יצירת hash ושמירה ב-Supabase ---
    const hash = createPromptHash(prompt);
    const { error } = await supabase
      .from("videos")
      .insert([
        { prompt, hash, status: "generated", created_at: new Date().toISOString() }
      ]);

    if (error) console.warn("⚠️ Failed to save hash in Supabase:", error.message);
    else console.log("✅ Prompt hash saved to Supabase");

    return JSON.stringify({
      success: true,
      script
    });

  } catch (error) {
    console.error("❌ OpenAI Generator Error:", error);
    return JSON.stringify({
      success: false,
      message: "Failed to generate script"
    });
  }
}
