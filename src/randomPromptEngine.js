// src/randomPromptEngine.js
// Responsible for generating unique random prompts from Supabase templates

import { supabase } from "./supabaseClient.js";

/**
 * שולף פרומפט אקראי מתוך קטגוריה ספציפית
 * @param {string} categoryName - שם הקטגוריה (למשל 'fitness' או 'beauty')
 */
export async function getRandomPrompt(categoryName) {
  const { data, error } = await supabase
    .from("prompt_library")
    .select("prompt, weight")
    .eq("category", categoryName);

  if (error) throw new Error(`Supabase error: ${error.message}`);
  if (!data || data.length === 0)
    throw new Error(`Category not found: ${categoryName}`);

  // בחירת פרומפט אקראי עם משקל שווה
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex].prompt;
}
