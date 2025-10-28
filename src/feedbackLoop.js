import { supabase } from "./supabaseClient.js";

/**
 * בוחר פרומפט משוקלל בהתאם לקטגוריה, לפי המשקל של כל prompt בטבלת prompts.
 * אם אין תוצאות, מחזיר null.
 */
export async function getWeightedPrompt(category = "general") {
  try {
    const { data, error } = await supabase
      .from("prompts")
      .select("template, weight")
      .eq("category_id", category)
      .eq("is_active", true);

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
        console.log(`🎯 Selected weighted prompt for '${category}':`, p.template);
        return p.template;
      }
    }

    // fallback
    return data[0].template;
  } catch (err) {
    console.error("❌ Error fetching weighted prompt:", err.message);
    return null;
  }
}
