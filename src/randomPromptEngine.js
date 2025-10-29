import { supabase } from "./supabaseClient.js";

/**
 * 🎯 בוחר פרומפט רנדומלי – עם תמיכה במשקלים וקטגוריות
 * 1. שולף קטגוריה רנדומלית מתוך טבלת categories
 *    (עדיפות לפי weight אם מוגדר)
 * 2. בוחר פרומפט פעיל מאותה קטגוריה (או כללי אם אין)
 * 3. מחזיר את כל הנתונים: id, template, category_id, name
 */
export async function getRandomPrompt() {
  try {
    // 1️⃣ שליפת קטגוריות
    const { data: categories, error: catErr } = await supabase
      .from("categories")
      .select("id, name, weight")
      .eq("is_active", true)
      .limit(50);

    if (catErr) {
      console.error("❌ Error fetching categories:", catErr.message);
      return null;
    }

    if (!categories || categories.length === 0) {
      console.warn("⚠️ No active categories found.");
      return null;
    }

    // 2️⃣ בחירת קטגוריה רנדומלית לפי weight
    const weighted = categories.flatMap((cat) =>
      Array(cat.weight || 1).fill(cat)
    );
    const category = weighted[Math.floor(Math.random() * weighted.length)];

    console.log(`🎯 Selected category: ${category.name}`);

    // 3️⃣ שליפת פרומפטים פעילים לאותה קטגוריה
    const { data: prompts, error: pErr } = await supabase
      .from("prompts")
      .select("id, template, category_id, is_active")
      .eq("is_active", true)
      .eq("category_id", category.id)
      .limit(100);

    if (pErr) {
      console.error("❌ Error fetching prompts:", pErr.message);
      return null;
    }

    if (!prompts || prompts.length === 0) {
      console.warn(`⚠️ No prompts found for category ${category.name}`);
      return null;
    }

    // 4️⃣ בחירת פרומפט אקראי
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];

    console.log("🎲 Selected random prompt:", prompt.template);

    return {
      id: prompt.id,
      template: prompt.template,
      category_id: category.id,
      category_name: category.name,
    };
  } catch (err) {
    console.error("❌ getRandomPrompt fatal error:", err.message);
    return null;
  }
}
