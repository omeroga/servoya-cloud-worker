import { supabase } from "./supabaseClient.js";

/**
 * שולף פרומפט רנדומלי ע"י:
 * 1) מציאת category_id לפי שם קטגוריה (lowercase)
 * 2) שליפת עד 100 פרומפטים פעילים לקטגוריה
 * 3) בחירת פרומפט אקראי בצד השרת (JS) – יציב ומהיר
 */
export async function getRandomPrompt(category = "general") {
  try {
    const catName = String(category || "general").toLowerCase();

    // 1) קבלת category_id
    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .select("id, name")
      .eq("name", catName)
      .maybeSingle();

    if (catErr) {
      console.error("❌ categories query error:", catErr.message);
      return null;
    }

    const categoryId = cat?.id || null;

    // 2) שליפת פרומפטים פעילים לקטגוריה (או לכללי אם אין קטגוריה)
    let query = supabase
      .from("prompts")
      .select("template, is_active, category_id")
      .eq("is_active", true)
      .limit(100); // תקרה בטוחה

    if (categoryId) query = query.eq("category_id", categoryId);

    const { data: prompts, error: pErr } = await query;

    if (pErr) {
      console.error("❌ prompts query error:", pErr.message);
      return null;
    }

    if (!prompts || prompts.length === 0) {
      console.warn(`⚠️ No active prompts found for category '${catName}'.`);
      return null;
    }

    // 3) בחירת פרומפט אקראי בצד השרת
    const pick = prompts[Math.floor(Math.random() * prompts.length)];
    const template = pick?.template?.trim();
    if (!template) {
      console.warn("⚠️ Selected prompt had empty template. Returning null.");
      return null;
    }

    console.log("🎲 Selected random prompt:", template);
    return template;
  } catch (err) {
    console.error("❌ getRandomPrompt fatal error:", err.message);
    return null;
  }
}
