import { supabase } from "./supabaseClient.js";

/**
 * בוחר פרומפט משוקלל בהתאם לקטגוריה, לפי המשקל של כל prompt בטבלת prompts_library.
 * אם אין תוצאות, מחזיר null.
 */
export async function getWeightedPrompt(category = "general") {
  try {
    const { data, error } = await supabase
      .from("prompts_library")
      .select("prompt, weight")
      .eq("category", category);

    if (error) throw error;

    if (!data || data.length === 0) {
      console.warn(`⚠️ No prompts found for category: ${category}`);
      return null;
    }

    // בחירה משוקללת לפי weight
    const totalWeight = data.reduce((sum, p) => sum + (p.weight || 1), 0);
    let random = Math.random() * totalWeight;

    for (const p of data) {
      random -= p.weight || 1;
      if (random <= 0) {
        console.log(`🎯 Selected weighted prompt for '${category}':`, p.prompt);
        return p.prompt;
      }
    }

    // fallback
    return data[0].prompt;
  } catch (err) {
    console.error("❌ Error fetching weighted prompt:", err.message);
    return null;
  }
}
