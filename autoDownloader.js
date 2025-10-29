// 🕐 Servoya Auto Downloader (v2)
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { supabase } from "./src/supabaseClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOWNLOAD_DIR = path.join(__dirname, "downloads");

// ודא שתיקיית ההורדות קיימת
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

console.log("🟢 AutoDownloader started...");

async function downloadFile(url, outputPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);
  const fileStream = fs.createWriteStream(outputPath);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
  console.log(`✅ Saved: ${outputPath}`);
}

// פונקציה שבודקת אם יש וידאו חדש שמוכן להורדה
async function checkForNewVideos() {
  console.log("🔍 Checking for new videos...");

  const { data, error } = await supabase
    .from("videos")
    .select("id, video_url, created_at, status")
    .eq("status", "ready_for_download")
    .order("created_at", { ascending: false })
    .limit(1);

  console.log("DEBUG:", data, error); // ✅ שורת בקרה חשובה

  if (error) {
    console.error("❌ Supabase query error:", error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log("⚠️ No videos ready for download.");
    return;
  }

  const latest = data[0];
  if (!latest.video_url) {
    console.log("⚠️ Latest video has no URL.");
    return;
  }

  const fileName = `${latest.id}.mp4`;
  const outputPath = path.join(DOWNLOAD_DIR, fileName);

  if (fs.existsSync(outputPath)) {
    console.log("🟡 Already downloaded:", fileName);
    return;
  }

  await downloadFile(latest.video_url, outputPath);
  console.log("✅ Download complete:", fileName);
}

// ריצה מיידית ואז כל 30 דקות
checkForNewVideos();
setInterval(checkForNewVideos, 30 * 60 * 1000);
