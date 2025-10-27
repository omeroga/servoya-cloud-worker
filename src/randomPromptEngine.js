// src/randomPromptEngine.js
// Responsible for generating unique random prompts from Supabase tables

import { supabase } from "./supabaseClient.js";

/**
 * שולף פרומפט אקראי מתוך קטגוריה ספציפית (לפי שם)
 * @param {string} categoryName - שם הקטגוריה (למשל 'fitness' או 'beauty')
 */
export async function getRandomPrompt(categoryName) {
  // שליפת ה-ID של הקטגוריה לפי השם
  const { data: categoryData, error: catError } = await supabase
    .from("categories")
    .select("id")
    .eq("name", categoryName)
    .single();

  if (catError || !categoryData)
    throw new Error(`Category not found: ${categoryName}`);

  const categoryId = categoryData.id;

  // שליפת פרומפטים ששייכים לקטגוריה הזו
  const { data, error } = await supabase
    .from("prompts")
    .select("template, category_id")
    .eq("category_id", categoryId);

  if (error) throw new Error(`Supabase error: ${error.message}`);
  if (!data || data.length === 0)
    throw new Error(`No prompts found for category: ${categoryName}`);

  // בחירת פרומפט אקראי
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex].template;
}
