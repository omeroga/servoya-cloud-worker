import { supabase } from "./supabaseClient.js";

export async function getRandomPrompt(category = "Motivation") {
  try {
    console.log(`🎯 Fetching random prompt for category: ${category}`);

    // שליפת מזהה הקטגוריה
    const { data: catData, error: catError } = await supabase
      .from("categories")
      .select("id, name")
      .ilike("name", category)
      .maybeSingle();

    console.log("🧩 Category data:", catData);

    if (catError) throw catError;

    const categoryId = catData?.id;
    if (!categoryId) {
      console.warn(`⚠️ Category not found for '${category}', will select any active prompt.`);
    }

    // שליפת פרומפט רנדומלי לפי category_id (אם קיים)
    const query = supabase
      .from("prompts")
      .select("template, category_id, is_active")
      .eq("is_active", true)
      .order("random()")
      .limit(1);

    if (categoryId) query.eq("category_id", categoryId);

    const { data, error } = await query;

    console.log("🧠 Prompt query result:", data);

    if (error) throw error;
    if (!data || data.length === 0) {
      console.warn("⚠️ No prompts found at all in DB.");
      return null;
    }

    console.log("🎲 Selected random prompt:", data[0].template);
    return data[0].template;
  } catch (err) {
    console.error("❌ Error fetching random prompt:", err.message);
    return null;
  }
}
