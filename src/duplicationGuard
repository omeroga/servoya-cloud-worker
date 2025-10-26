// src/duplicationGuard.js
import * as crypto from "node:crypto";
import { supabase } from "./supabaseClient.js";

/**
 * בודק אם פרומפט זהה כבר נוצר בעבר
 * ומחזיר true אם יש כפילות
 */
export async function isDuplicatePrompt(promptText) {
  try {
    const hash = crypto.createHash("sha256").update(promptText).digest("hex");

    const { data, error } = await supabase
      .from("videos")
      .select("id")
      .eq("hash", hash)
      .limit(1);

    if (error) {
      console.error("❌ Supabase Duplication Check Error:", error.message);
      return false;
    }

    return data && data.length > 0;
  } catch (err) {
    console.error("❌ DuplicationGuard runtime error:", err.message);
    return false;
  }
}

/**
 * יוצר hash לפרומפט חדש
 */
export function createPromptHash(promptText) {
  return crypto.createHash("sha256").update(promptText).digest("hex");
}
