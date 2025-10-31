// 🧠 Servoya Feedback Loop v2 – Reinforcement Learning Layer

import { supabase } from "./supabaseClient.js";

// משקל יחסי לפי ביצועים
const CTR_WEIGHT = 0.5;
const WATCH_WEIGHT = 0.3;
const STATUS_WEIGHT = 0.2;

// ניתוח ביצועי פרומפטים
export async function updatePromptWeights() {
  console.log("📊 Updating prompt performance weights...");

  const { data, error } = await supabase
    .from("performance_logs")
    .select("prompt, ctr, duration_ms, status")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("❌ Failed to fetch performance logs:", error.message);
    return;
  }

  // יצירת מפה עם ממוצעי ביצועים לכל פרומפט
  const stats = {};
  data.forEach((item) => {
    const p = item.prompt;
    if (!stats[p]) stats[p] = { ctr: 0, watch: 0, count: 0, success: 0 };
    stats[p].ctr += item.ctr || 0;
    stats[p].watch += item.duration_ms || 0;
    stats[p].count += 1;
    if (item.status === "success") stats[p].success += 1;
  });

  // חישוב ציון לכל פרומפט
  for (const prompt in stats) {
    const avgCTR = stats[prompt].ctr / stats[prompt].count;
    const avgWatch = stats[prompt].watch / stats[prompt].count;
    const successRate = stats[prompt].success / stats[prompt].count;

    const weight =
      avgCTR * CTR_WEIGHT +
      (avgWatch * WATCH_WEIGHT) / 10000 +
      successRate * STATUS_WEIGHT;

    await supabase.from("prompts").update({ weight }).eq("text", prompt);

    console.log(`✅ Updated weight for "${prompt}" → ${weight.toFixed(3)}`);
  }

  console.log("🎯 Feedback weights updated successfully.");
}

// ✅ שליפה חכמה של פרומפט עם המשקל הגבוה ביותר
export async function getWeightedPrompt(category = null) {
  console.log("🎯 Fetching top-weighted prompt...");

  let query = supabase
    .from("prompts")
    .select("id, text, weight, category_id")
    .order("weight", { ascending: false })
    .limit(1);

  if (category) query = query.eq("category_id", category);

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    console.warn("⚠️ No weighted prompt found, falling back to random.");
    return null;
  }

  console.log(`✅ Selected prompt: "${data[0].text}" (weight: ${data[0].weight})`);
  return data[0].text;
}