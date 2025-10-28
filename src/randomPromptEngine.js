import { supabase } from "./supabaseClient.js";

/**
 * שולף פרומפט אקראי מהטבלה לפי קטגוריה.
 * אם לא מוצא — מחזיר אחד רנדומלי מכלל הטבלה.
 */
export async function getRandomPrompt(category = "Motivation") {
  try {
    console.log(`🎯 Fetching random prompt for category: ${category}`);

    // שליפת מזהה הקטגוריה
    const { data: catData, error: catError } = await supabase
      .from("categories")
      .select("id")
      .ilike("name", category) // לא תלוי אותיות גדולות/קטנות
      .single();

    if (catError) throw catError;

    const categoryId = catData?.id;
    if (!categoryId) {
      console.warn(`⚠️ Category not found: ${category}, selecting from all prompts`);
    }

    // שליפת פרומפט רנדומלי
    const { data, error } = await supabase
      .from("prompts")
      .select("template")
      .eq("is_active", true)
      .order("random()")
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!data || !data.template) {
      console.warn("⚠️ No prompts found at all in DB.");
      return null;
    }

    console.log("🎲 Selected random prompt:", data.template);
    return data.template;
  } catch (err) {
    console.error("❌ Error fetching random prompt:", err.message);
    return null;
  }
}
