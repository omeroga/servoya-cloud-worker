import crypto from "crypto";
import { supabase } from "./supabaseClient.js";

/**
 * יוצר hash ייחודי מכל prompt כדי לבדוק כפילויות
 * @param {string} prompt
 * @returns {string}
 */
export function createPromptHash(prompt) {
  return crypto.createHash("sha256").update(prompt).digest("hex");
}

/**
 * בודק אם prompt זהה כבר קיים במסד הנתונים
 * @param {string} prompt
 * @returns {Promise<boolean>}
 */
export async function isDuplicatePrompt(prompt) {
  try {
    const hash = createPromptHash(prompt);
    const { data, error } = await supabase
      .from("videos")
      .select("id")
      .eq("hash", hash)
      .limit(1);

    if (error) {
      console.error("❌ Error checking duplicate prompt:", error.message);
      return false;
    }

    return data && data.length > 0;
  } catch (err) {
    console.error("❌ DuplicationGuard error:", err.message);
    return false;
  }
}
