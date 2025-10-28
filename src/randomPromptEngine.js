import { supabase } from "./supabaseClient.js";

export async function getRandomPrompt(category = "general") {
  try {
    console.log("🎯 Fetching random prompt from DB...");

    // שליפת category_id לפי שם
    const { data: catData } = await supabase
      .from("categories")
      .select("id")
      .eq("name", category)
      .single();

    const categoryId = catData?.id;

    const { data, error } = await supabase
      .from("prompts")
      .select("template")
      .eq("is_active", true)
      .eq("category_id", categoryId)
      .order("random()")
      .limit(1);

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
