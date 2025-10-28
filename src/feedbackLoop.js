import { supabase } from "./supabaseClient.js";

/**
 * בוחר פרומפט רנדומלי מטבלת prompts בהתאם לקטגוריה.
 * אם לא נמצאו תוצאות, מחזיר null.
 */
export async function getRandomPrompt(category = "general") {
  try {
    const { data, error } = await supabase
      .from("prompts")
      .select("template")
      .eq("is_active", true)
      .limit(1)
      .order("random()");

    if (error) throw error;

    if (!data || data.length === 0) {
      console.warn(`⚠️ No prompts found for category: ${category}`);
      return null;
    }

    console.log("🎲 Selected random prompt:", data[0].template);
    return data[0].template;
  } catch (err) {
    console.error("❌ Error fetching random prompt:", err.message);
    return null;
  }
}
