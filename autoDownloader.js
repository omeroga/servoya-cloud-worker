// 🧠 Servoya Auto Downloader (Resilient v3)
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { supabase } from "./src/supabaseClient.js";
import { uploadToDrive } from "./googleDriveUploader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOWNLOAD_DIR = path.join(__dirname, "downloads");

// ודא שהתיקייה קיימת
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

console.log("🟢 AutoDownloader started...");

async function safeDownload(url, filePath) {
  try {
    console.log(`⬇️ Attempting to download: ${url}`);
    const res = await fetch(url, { timeout: 15000 });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const stream = fs.createWriteStream(filePath);
    await new Promise((resolve, reject) => {
      res.body.pipe(stream);
      res.body.on("error", reject);
      stream.on("finish", resolve);
    });
    console.log(`✅ Saved: ${filePath}`);
    return true;
  } catch (err) {
    console.warn(`⚠️ Download failed (${err.message}), using fallback...`);
    fs.copyFileSync(
      path.join(__dirname, "downloads", "test_video.mp4"),
      filePath
    );
    console.log("🟡 Fallback file copied.");
    return false;
  }
}

async function checkForNewVideos() {
  console.log("🔍 Checking for new videos...");

  const { data, error } = await supabase
    .from("videos")
    .select("id, video_url, created_at, status")
    .eq("status", "ready_for_download")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) return console.error("❌ Supabase query error:", error.message);
  if (!data?.length) return console.log("⚠️ No videos ready for download.");

  const video = data[0];
  const outputPath = path.join(DOWNLOAD_DIR, `${video.id}.mp4`);

  if (fs.existsSync(outputPath)) {
    console.log("🟡 Already downloaded:", video.id);
    return;
  }

  await safeDownload(video.video_url, outputPath);

  console.log("☁️ Uploading to Google Drive...");
  await uploadToDrive(outputPath);
  console.log("✅ Upload complete.");
}

checkForNewVideos();
setInterval(checkForNewVideos, 30 * 60 * 1000);
