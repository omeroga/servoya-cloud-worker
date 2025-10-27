// src/feedbackLoop.js
// Analyzes video performance data and biases prompt selection toward high-performing topics

import { supabase } from "./supabaseClient.js";

/**
 * בוחר פרומפט משופר לפי CTR גבוה וסטטוס 'published'
 * אם אין מספיק נתונים, מחזיר null כדי להשתמש במנוע הרנדומלי
 */
export async function getWeightedPrompt(categoryName) {
  try {
    const { data, error } = await supabase
      .from("videos")
      .select("prompt, ctr")
      .eq("status", "published")
      .order("ctr", { ascending: false })
      .limit(10);

    if (error) {
      console.error("❌ Error fetching performance data:", error.message);
      return null;
    }

    if (!data || data.length === 0) {
      console.log("⚠️ Not enough performance data. Using random prompt instead.");
      return null;
    }

    // מקצה סיכוי גבוה יותר לפרומפטים עם CTR גבוה
    const weighted = data.flatMap((item) =>
      Array(Math.ceil(item.ctr * 10) || 1).fill(item.prompt)
    );

    const randomIndex = Math.floor(Math.random() * weighted.length);
    return weighted[randomIndex];
  } catch (err) {
    console.error("❌ Feedback loop error:", err.message);
    return null;
  }
}
