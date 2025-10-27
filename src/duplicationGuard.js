// src/duplicationGuard.js
import * as crypto from "node:crypto";
import { supabase } from "./supabaseClient.js";

/**
 * Checks whether a prompt was already generated before
 * Returns true only if a valid duplicate is found
 */
export async function isDuplicatePrompt(promptText) {
  try {
    // מניעת בדיקות שווא על פרומפט ריק או קצר מדי
    if (!promptText || promptText.trim().length < 10) {
      console.warn("⚠️ Skipping duplicate check - prompt too short or missing");
      return false;
    }

    const hash = crypto.createHash("sha256").update(promptText.trim()).digest("hex");

    const { data, error } = await supabase
      .from("videos")
      .select("id")
      .eq("hash", hash)
      .limit(1);

    if (error) {
      console.error("❌ Supabase Duplication Check Error:", error.message);
      return false;
    }

    const isDuplicate = Array.isArray(data) && data.length > 0;
    if (isDuplicate) console.log("⚠️ Duplicate prompt found, skipping...");
    else console.log("✅ New unique prompt detected.");

    return isDuplicate;
  } catch (err) {
    console.error("❌ DuplicationGuard runtime error:", err.message);
    return false;
  }
}

/**
 * Creates hash for a new prompt
 */
export function createPromptHash(promptText) {
  return crypto.createHash("sha256").update(promptText.trim()).digest("hex");
}
