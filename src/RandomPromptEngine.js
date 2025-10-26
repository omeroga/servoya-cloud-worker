// src/randomPromptEngine.js
// Responsible for generating unique random prompts from Supabase templates

import { supabase } from "./supabaseClient.js";

/**
 * שולף פרומפט אקראי מתוך קטגוריה ספציפית
 * @param {string} categoryName - שם הקטגוריה (למשל 'fitness' או 'beauty')
 */
export async function getRandomPrompt(categoryName) {
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("name", categoryName)
    .single();

  if (!category) throw new Error(`Category not found: ${categoryName}`);

  const { data: prompts } = await supabase
    .from("prompts")
    .select("template")
    .eq("category_id", category.id);

  if (!prompts || prompts.length === 0)
    throw new Error(`No prompts found for ${categoryName}`);

  // בוחר תבנית אקראית
  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex].template;
}
