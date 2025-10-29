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
const GENERATE_URL = process.env.GENERATE_URL || "https://servoya-cloud-worker-xxxxx-uc.a.run.app/generate";
const INTERVAL_MIN = 30; // דקות
const INTERVAL_MS = INTERVAL_MIN * 60 * 1000;

console.log("🟢 Servoya Scheduler started...");
console.log(`⏱ Interval: ${INTERVAL_MIN} minutes`);
console.log(`🎯 Generate endpoint: ${GENERATE_URL}`);

async function generate(category) {
  try {
    console.log(`🚀 Generating video for category: ${category}`);
    const response = await fetch(GENERATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
    console.log(`✅ Video generated [${category}] → ${data.video_id || "no-id"}`);
  } catch (err) {
    console.error(`❌ Error generating for ${category}:`, err.message);
  }
}

async function startScheduler() {
  let index = 0;

  while (true) {
    const category = CATEGORIES[index % CATEGORIES.length];
    await generate(category);

    index++;
    console.log(`⏸ Waiting ${INTERVAL_MIN} minutes...`);
    await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }
}

startScheduler();
