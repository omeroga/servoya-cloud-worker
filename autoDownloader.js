// 🧠 Servoya Auto Downloader + Google Drive Uploader (v4 Integrated)

import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { supabase } from "./src/supabaseClient.js";
import { uploadToDrive } from "./googleDriveUploader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOWNLOAD_DIR = path.join(__dirname, "downloads");

// יצירת תיקייה אם לא קיימת
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

// פונקציה ללוגים חכמים בפורמט JSON
function log(level, message, data = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data,
  };
  console.log(JSON.stringify(logEntry));
}

log("info", "AutoDownloader started");

// פונקציה להורדה עם fallback
async function downloadFile(url, outputPath, fallbackUrl = null) {
  try {
    log("info", "Download started", { url });

    const res = await fetch(url, { timeout: 15000 });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const fileStream = fs.createWriteStream(outputPath);
    await new Promise((resolve, reject) => {
      res.body.pipe(fileStream);
      res.body.on("error", reject);
      fileStream.on("finish", resolve);
    });

    log("info", "Download completed", { path: outputPath });
    return true;
  } catch (err) {
    log("error", "Download failed", { error: err.message });
    if (fallbackUrl) {
      log("warn", "Trying fallback download", { fallbackUrl });
      return downloadFile(fallbackUrl, outputPath);
    }
    return false;
  }
}

// פונקציה לבדיקה והעלאה
async function checkForNewVideos() {
  log("info", "Checking for new videos...");

  const { data, error } = await supabase
    .from("videos")
    .select("id, video_url, created_at, status")
    .eq("status", "ready_for_download")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    log("error", "Supabase query failed", { error: error.message });
    return;
  }

  if (!data || data.length === 0) {
    log("info", "No videos ready for download");
    return;
  }

  const latest = data[0];
  const fileName = `${latest.id}.mp4`;
  const outputPath = path.join(DOWNLOAD_DIR, fileName);
  const fallbackUrl = "downloads/fallback.mp4";

  if (fs.existsSync(outputPath)) {
    log("warn", "Video already exists", { file: fileName });
    return;
  }

  const success = await downloadFile(latest.video_url, outputPath, fallbackUrl);
  if (!success) {
    log("error", "Download failed completely", { videoId: latest.id });
    return;
  }

  log("info", "Uploading to Google Drive", { file: fileName });
  const uploadResult = await uploadToDrive(outputPath);
  if (uploadResult?.webViewLink) {
    log("info", "Upload complete", { driveLink: uploadResult.webViewLink });
  } else {
    log("error", "Upload failed or no link returned");
  }
}

// ריצה מיידית ואז כל 30 דקות
checkForNewVideos();
setInterval(checkForNewVideos, 30 * 60 * 1000);