// 🎲 Servoya Random Prompt Engine v3 – Weighted Smart Selector
import { supabase } from "./supabaseClient.js";

export async function getRandomPrompt(category = null) {
  console.log("🎯 Selecting prompt (weighted)");

  // שליפת פרומפטים עם משקל
  let query = supabase
    .from("prompts")
    .select("id, text, category, weight")
    .limit(50);

  if (category) query = query.eq("category", category);

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    console.warn("⚠️ No prompts found, fallback to random.");
    return "Generate an engaging viral video about self-improvement.";
  }

  // ניקוי משקלים לא חוקיים
  const validPrompts = data.filter((p) => !isNaN(p.weight) && p.weight > 0);

  // אם אין משקלים תקפים, fallback לאקראי רגיל
  if (validPrompts.length === 0) {
    const random = data[Math.floor(Math.random() * data.length)];
    return random.text;
  }

  // חישוב משקל כולל
  const totalWeight = validPrompts.reduce((sum, p) => sum + p.weight, 0);

  // בחירה מבוססת הסתברות
  let rand = Math.random() * totalWeight;
  for (const prompt of validPrompts) {
    rand -= prompt.weight;
    if (rand <= 0) {
      console.log(`🧠 Selected weighted prompt: "${prompt.text}" (${prompt.weight.toFixed(2)})`);
      return prompt.text;
    }
  }

  // fallback אחרון
  return validPrompts[0].text;
}