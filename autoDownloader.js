// 🕐 Servoya Auto Downloader + Google Drive Uploader (v4)
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { supabase } from "./src/supabaseClient.js";
import { uploadToDrive } from "./googleDriveUploader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOWNLOAD_DIR = path.join(__dirname, "downloads");

// ודא שתיקיית ההורדות קיימת
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

console.log("🟢 AutoDownloader + Drive Uploader started...");

// הורדת קובץ עם fallback
async function downloadFile(url, outputPath, fallbackUrl = null) {
  try {
    console.log(`⬇️ Attempting to download: ${url}`);
    const res = await fetch(url, { timeout: 15000 });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const fileStream = fs.createWriteStream(outputPath);
    await new Promise((resolve, reject) => {
      res.body.pipe(fileStream);
      res.body.on("error", reject);
      fileStream.on("finish", resolve);
    });
    console.log(`✅ Saved: ${outputPath}`);
    return true;
  } catch (err) {
    console.warn(`⚠️ Download failed: ${err.message}`);
    if (fallbackUrl) {
      console.log(`🔁 Trying fallback: ${fallbackUrl}`);
      return downloadFile(fallbackUrl, outputPath);
    } else {
      console.log("❌ No fallback URL available.");
      return false;
    }
  }
}

// בדיקה להורדות חדשות
async function checkForNewVideos() {
  console.log("🔍 Checking for new videos...");

  const { data, error } = await supabase
    .from("videos")
    .select("id, video_url, created_at, status")
    .eq("status", "ready_for_download")
    .order("created_at", { ascending: false })
    .limit(1);

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

  // הורדה עם fallback
  const fallbackUrl = "https://filesamples.com/samples/video/mp4/sample_960x400_ocean.mp4";
  const downloaded = await downloadFile(latest.video_url, outputPath, fallbackUrl);

  // העלאה ל־Drive אם ההורדה הצליחה
  if (downloaded) {
    console.log("☁️ Uploading to Google Drive...");
    const result = await uploadToDrive(outputPath);
    if (result && result.webViewLink) {
      console.log(`✅ Uploaded successfully: ${result.webViewLink}`);

      // עדכון Supabase עם לינק ה-Drive
      await supabase
        .from("videos")
        .update({ drive_url: result.webViewLink, status: "uploaded_to_drive" })
        .eq("id", latest.id);
      console.log("📤 Supabase updated with Drive link.");
    }
  }

  console.log("✅ Cycle complete.\n");
}

// ריצה מיידית ואז כל 30 דקות
checkForNewVideos();
setInterval(checkForNewVideos, 30 * 60 * 1000);
