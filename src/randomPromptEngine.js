import { supabase } from "./supabaseClient.js";

/**
 * בוחר פרומפט רנדומלי מטבלת prompts לפי קטגוריה, בלי תלות באותיות גדולות/קטנות.
 * אם לא מוצא קטגוריה מתאימה, בוחר פרומפט רנדומלי מכלל הטבלה.
 */
export async function getRandomPrompt(category = "Motivation") {
  try {
    console.log(`🎯 Fetching random prompt for category: ${category}`);

    // שליפת מזהה הקטגוריה, מתעלם מהבדלי אותיות
    const { data: catData, error: catError } = await supabase
      .from("categories")
      .select("id, name")
      .ilike("name", category)
      .maybeSingle();

    if (catError) throw catError;

    const categoryId = catData?.id;
    if (!categoryId) {
      console.warn(`⚠️ Category not found for '${category}', selecting any active prompt.`);
    }

    // שליפת פרומפט לפי קטגוריה (אם נמצאה)
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
