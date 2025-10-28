import { supabase } from "./supabaseClient.js";

/**
 * בוחר פרומפט רנדומלי מתוך טבלת prompts לפי קטגוריה (אם קיימת).
 * אם אין תוצאות לקטגוריה, בוחר רנדומלי כללי.
 */
export async function getRandomPrompt(category = "general") {
  try {
    let query = supabase
      .from("prompts")
      .select("template")
      .eq("is_active", true);

    // אם קיימת קטגוריה, נוסיף סינון לפי category_id
    if (category && category !== "general") {
      const { data: cat, error: catErr } = await supabase
        .from("categories")
        .select("id")
        .eq("name", category)
        .single();

      if (!catErr && cat) {
        query = query.eq("category_id", cat.id);
      } else {
        console.warn(`⚠️ Category '${category}' not found, falling back to general.`);
      }
    }

    const { data, error } = await query.order("random()").limit(1);

    if (error) throw error;
    if (!data || data.length === 0) {
      console.warn(`⚠️ No prompts found for category: ${category}`);
      return null;
    }

    console.log(`🎲 Selected random prompt for '${category}':`, data[0].template);
    return data[0].template;
  } catch (err) {
    console.error("❌ Error fetching random prompt:", err.message);
    return null;
  }
}
