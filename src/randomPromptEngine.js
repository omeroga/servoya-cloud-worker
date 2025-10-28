import { supabase } from "./supabaseClient.js";

/**
 * בוחר פרומפט רנדומלי מטבלת prompts לפי קטגוריה.
 * מתואם לגרסה שבה כל הקטגוריות ב־Supabase הן lowercase.
 */
export async function getRandomPrompt(category = "general") {
  try {
    console.log(`🎯 Fetching random prompt for category: ${category}`);

    // שליפת מזהה הקטגוריה (מותאם לאותיות קטנות)
    const { data: catData, error: catError } = await supabase
      .from("categories")
      .select("id")
      .eq("name", category)
      .maybeSingle();

    if (catError) throw catError;

    const categoryId = catData?.id;
    if (!categoryId) {
      console.warn(`⚠️ Category '${category}' not found, selecting any active prompt.`);
    }

    // שליפת פרומפט לפי קטגוריה אם קיימת, אחרת רנדומלי כללי
    let query = supabase
      .from("prompts")
      .select("template")
      .eq("is_active", true)
      .order("random()")
      .limit(1);

    if (categoryId) query = query.eq("category_id", categoryId);

    const { data, error } = await query;
    if (error) throw error;

    if (!data || data.length === 0) {
      console.warn("⚠️ No prompts found for this category.");
      return null;
    }

    console.log("🎲 Selected random prompt:", data[0].template);
    return data[0].template;
  } catch (err) {
    console.error("❌ Error fetching random prompt:", err.message);
    return null;
  }
}
