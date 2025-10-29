// 🧠 Servoya Downloader - pulls latest video from Supabase and saves locally
import { supabase } from "./src/supabaseClient.js";
import fs from "fs";
import fetch from "node-fetch";

// נתיב שמירה מקומית
const SAVE_DIR = "./downloads";
if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR);

async function downloadLatestVideo() {
  console.log("📦 Checking Supabase for latest video...");

  const { data, error } = await supabase
    .from("videos")
    .select("id, video_url, category, created_at")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("❌ Supabase error:", error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log("⚠️ No videos found in database.");
    return;
  }

  const video = data[0];
  if (!video.video_url) {
    console.log("⚠️ No video_url found for latest record.");
    return;
  }

  console.log(`🎬 Downloading: ${video.video_url}`);

  const res = await fetch(video.video_url);
  if (!res.ok) {
    console.error("❌ Download failed:", res.statusText);
    return;
  }

  const filePath = `${SAVE_DIR}/${video.id}.mp4`;
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(buffer));

  console.log(`✅ Saved as: ${filePath}`);
}

// הפעלה מיידית
downloadLatestVideo();
