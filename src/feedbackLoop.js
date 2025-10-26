import { supabase } from "./supabaseClient.js";

/**
 * Feedback Loop – משקלול פרומפטים לפי ביצועים
 * מעלה סיכוי לפרומפטים עם CTR גבוה, מוריד חלשים
 */
export async function getWeightedPrompt(category = "general") {
  try {
    // שליפת הביצועים האחרונים לפי קטגוריה
    const { data: logs, error } = await supabase
      .from("performance_logs")
      .select("prompt, ctr")
      .gt("ctr", 0)
      .limit(100);

    if (error) throw error;

    // במידה ואין נתונים – חזור לפרומפט רנדומלי רגיל
    if (!logs || logs.length === 0) return null;

    // חישוב משקל יחסי לפי CTR
    const weighted = logs.map((log) => ({
      prompt: log.prompt,
      weight: Math.max(0.1, log.ctr / 100),
    }));

    // בחירה רנדומלית משוקללת
    const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const w of weighted) {
      rand -= w.weight;
      if (rand <= 0) return w.prompt;
    }

    return weighted[0].prompt; // fallback
  } catch (err) {
    console.error("❌ Feedback loop error:", err.message);
    return null;
  }
}
