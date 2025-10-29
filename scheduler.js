// 🕐 Servoya Scheduler - Automatic Video Generator
import fetch from "node-fetch";

const CATEGORIES = [
  "Beauty & Skincare",
  "Finance & Side Hustles",
  "Relationships & Psychology",
  "Self-Improvement",
  "Smart Gadgets",
];

// ⚙️ CONFIGURATION
const GENERATE_URL = "https://servoya-cloud-worker-107577272837.us-central1.run.app/generate";
const INTERVAL_MIN = 30; // דקות בין הפעלות
const INTERVAL_MS = INTERVAL_MIN * 60 * 1000;

console.log("🟢 Servoya Scheduler started...");
console.log(`⏱ Interval: ${INTERVAL_MIN} minutes`);
console.log(`🎯 Generate endpoint: ${GENERATE_URL}`);

// ⚙️ פונקציית יצירת וידאו לפי קטגוריה
async function generate(category) {
  try {
    console.log(`🚀 Generating video for category: ${category}`);
    const res = await fetch(GENERATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error(`❌ HTTP ${res.status}: ${text.slice(0, 100)}...`);
      return;
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error(`⚠️ Invalid JSON response for ${category}: ${text.slice(0, 120)}...`);
      return;
    }

    if (!data.success) {
      console.error(`⚠️ Generation failed for ${category}: ${data.message || "unknown error"}`);
      return;
    }

    console.log(`✅ [${category}] → ${data.video_id || "no-id"} | ${data.status}`);
  } catch (err) {
    console.error(`💥 Network or logic error for ${category}:`, err.message);
  }
}

// ⚙️ הפעלת הסקריפט בלולאה מחזורית
async function startScheduler() {
  let index = 0;
  while (true) {
    const category = CATEGORIES[index % CATEGORIES.length];
    await generate(category);
    index++;
    console.log(`⏸ Waiting ${INTERVAL_MIN} minutes...\n`);
    await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
  }
}

startScheduler();
