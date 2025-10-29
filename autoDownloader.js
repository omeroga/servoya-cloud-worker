// 🧠 Servoya Auto Downloader + Google Drive Uploader (v4 Integrated)
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import { supabase } from "./src/supabaseClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOWNLOAD_DIR = path.join(__dirname, "downloads");
const TOKEN_PATH = path.join(__dirname, "token.json");
const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");

// ודא שתיקיית ההורדות קיימת
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

// קריאת הרשאות Google Drive
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
const { client_secret, client_id } = credentials.installed;
const redirect_uri = "urn:ietf:wg:oauth:2.0:oob";

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
oAuth2Client.setCredentials(token);
const drive = google.drive({ version: "v3", auth: oAuth2Client });

console.log("🟢 AutoDownloader + DriveUploader started...");

// פונקציית הורדה עם fallback
async function downloadFile(url, outputPath, fallbackUrl = null) {
  try {
    console.log(`⬇️ Downloading: ${url}`);
    const res = await fetch(url, { timeout: 15000 });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const fileStream = fs.createWriteStream(outputPath);
    await new Promise((resolve, reject) => {
      res.body.pipe(fileStream);
      res.body.on("error", reject);
      fileStream.on("finish", resolve);
    });
    console.log(`✅ Saved: ${outputPath}`);
  } catch (err) {
    console.warn(`⚠️ Download failed: ${err.message}`);
    if (fallbackUrl) {
      console.log(`🟡 Using fallback video instead.`);
      await fs.promises.copyFile(fallbackUrl, outputPath);
    } else {
      console.log("❌ No fallback URL available.");
    }
  }
}

// פונקציה להעלאה ל־Google Drive
async function uploadToDrive(filePath) {
  try {
    console.log("☁️ Uploading to Google Drive...");
    const fileMetadata = { name: path.basename(filePath) };
    const media = { mimeType: "video/mp4", body: fs.createReadStream(filePath) };

    const res = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id, webViewLink",
    });

    console.log(`✅ Uploaded to Google Drive: ${res.data.webViewLink}`);
  } catch (err) {
    console.error("❌ Upload failed:", err.message);
  }
}

// בודק אם יש וידאו חדש ומבצע את כל התהליך
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
  const fileName = `${latest.id}.mp4`;
  const outputPath = path.join(DOWNLOAD_DIR, fileName);

  // URL גיבוי מקומית
  const fallbackUrl = path.join(DOWNLOAD_DIR, "fallback.mp4");

  if (fs.existsSync(outputPath)) {
    console.log("🟡 Already downloaded:", fileName);
    return;
  }

  await downloadFile(latest.video_url, outputPath, fallbackUrl);
  await uploadToDrive(outputPath);
  console.log("✅ Full cycle complete.");
}

// ריצה מיידית ואז כל 30 דקות
checkForNewVideos();
setInterval(checkForNewVideos, 30 * 60 * 1000);
