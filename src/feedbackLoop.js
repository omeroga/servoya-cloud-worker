// src/feedbackLoop.js
// Responsible for learning from video performance and improving prompt generation

import { supabase } from "./supabaseClient.js";

/**
 * בוחר פרומפט עם משקל גבוה לפי ביצועים קודמים
 * (לדוגמה: CTR גבוה)
 * @param {string} categoryName
 * @returns {Promise<string|null>}
 */
export async function getWeightedPrompt(categoryName) {
  const { data, error } = await supabase
    .from("feedback_logs")
    .select("video_id, ctr, category")
    .eq("category", categoryName)
    .order("ctr", { ascending: false })
    .limit(10);

  if (error) {
    console.error("❌ FeedbackLoop query error:", error.message);
    return null;
  }

  if (!data || data.length === 0) {
    console.log("ℹ️ No feedback data found for category:", categoryName);
    return null;
  }

  // ניקח את ה־video_id עם CTR הגבוה ביותר ונחפש את הפרומפט שלו בטבלת videos
  const bestVideoId = data[0].video_id;
  const { data: videoData } = await supabase
    .from("videos")
    .select("prompt")
    .eq("id", bestVideoId)
    .single();

  return videoData?.prompt || null;
}
