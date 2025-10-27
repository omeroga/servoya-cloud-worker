// src/feedbackLoop.js
// Responsible for biasing future prompt generation toward high-performing scripts

import { supabase } from "./supabaseClient.js";

/**
 * בוחר פרומפט מתוך קטגוריה לפי ביצועים קודמים (CTR ממוצע)
 * @param {string} categoryName
 * @returns {Promise<string|null>}
 */
export async function getWeightedPrompt(categoryName) {
  try {
    // שליפה של כל הפרומפטים והביצועים מהטבלה videos
    const { data, error } = await supabase
      .from("videos")
      .select("prompt, ctr")
      .not("ctr", "is", null)
      .gt("ctr", 0)
      .limit(100);

    if (error) {
      console.error("❌ Supabase fetch error in feedback loop:", error.message);
      return null;
    }

    if (!data || data.length === 0) {
      console.warn("⚠️ No performance data found — fallback to random prompt");
      return null;
    }

    // חישוב משקל לכל פרומפט על סמך CTR
    const weightedList = data.flatMap((item) => {
      const weight = Math.max(1, Math.round(item.ctr * 10)); // לדוגמה CTR 0.3 = משקל 3
      return Array(weight).fill(item.prompt);
    });

    // בחירה אקראית לפי משקל
    const randomIndex = Math.floor(Math.random() * weightedList.length);
    const selectedPrompt = weightedList[randomIndex];

    console.log("📊 Feedback loop selected prompt:", selectedPrompt);
    return selectedPrompt;
  } catch (err) {
    console.error("❌ Feedback loop error:", err.message);
    return null;
  }
}
