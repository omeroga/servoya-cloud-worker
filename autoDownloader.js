// 🧠 Servoya Auto Downloader + Google Drive Uploader (v4 Integrated + Health Layer + Health Logs)

import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";

import { supabase } from "./src/supabaseClient.js";
import { uploadToDrive } from "./googleDriveUploader.js";
import { sendSmartAlert } from "./src/SmartAlertManager.js";
import { logHealthEvent } from "./src/healthLogger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOWNLOAD_DIR = path.join(__dirname, "downloads");

if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

function log(level, message, data = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data
  };
  console.log(JSON.stringify(logEntry));
}

log("info", "AutoDownloader started");

// 🧩 general health check
async function healthCheck() {
  const details = {};
  try {
    const { error: supabaseError } = await supabase.from("videos").select("id").limit(1);
    if (supabaseError) throw new Error("Supabase connection failed");
    details.supabase = "ok";

    const credsPath = path.join(__dirname, "credentials.json");
    if (!fs.existsSync(credsPath)) throw new Error("Missing credentials.json file");
    details.drive = "ok";

    log("info", "Health check passed", details);

    await logHealthEvent({
      status: "ok",
      source: "auto-downloader",
      details
    });

    return true;
  } catch (err) {
    log("error", "Health check failed", { reason: err.message });

    await logHealthEvent({
      status: "error",
      source: "auto-downloader",
      severity: "error",
      error_message: err.message,
      details: { step: "healthCheck" }
    });

    await sendSmartAlert({
      subject: "Servoya: health check failed",
      text: `Health check failed: ${err.message}`,
      severity: "high"
    });

    return false;
  }
}

// download with fallback
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

    if (fallbackUrl && fs.existsSync(fallbackUrl)) {
      log("warn", "Using local fallback file", { fallbackUrl });
      await fs.promises.copyFile(fallbackUrl, outputPath);
      log("info", "Fallback file copied successfully");

      await logHealthEvent({
        status: "warn",
        source: "auto-downloader",
        severity: "warn",
        details: { action: "fallback_used", url, outputPath }
      });

      return true;
    }

    await logHealthEvent({
      status: "error",
      source: "auto-downloader",
      severity: "error",
      error_message: `Download failed: ${err.message}`,
      details: { url }
    });

    return false;
  }
}

// main video check
async function checkForNewVideos() {
  const healthy = await healthCheck();
  if (!healthy) {
    log("error", "Skipping cycle - health check failed");
    return;
  }

  log("info", "Checking for new videos...");

  const { data, error } = await supabase
    .from("videos")
    .select("id, video_url, created_at, status")
    .eq("status", "ready_for_download")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    log("error", "Supabase query failed", { error: error.message });
    await logHealthEvent({
      status: "error",
      source: "auto-downloader",
      severity: "error",
      error_message: error.message,
      details: { step: "select videos" }
    });
    return;
  }

  if (!data || data.length === 0) {
    log("info", "No videos ready for download");

    await logHealthEvent({
      status: "ok",
      source: "auto-downloader",
      details: { message: "no videos ready_for_download" }
    });

    return;
  }

  const latest = data[0];
  const fileName = `${latest.id}.mp4`;
  const outputPath = path.join(DOWNLOAD_DIR, fileName);
  const fallbackUrl = path.join(DOWNLOAD_DIR, "fallback.mp4");

  if (fs.existsSync(outputPath)) {
    log("warn", "Video already exists", { file: fileName });

    await logHealthEvent({
      status: "warn",
      source: "auto-downloader",
      severity: "low",
      details: { message: "video already exists", video_id: latest.id }
    });

    return;
  }

  const success = await downloadFile(latest.video_url, outputPath, fallbackUrl);
  if (!success) return;

  log("info", "Uploading to Google Drive", { file: fileName });
  const uploadResult = await uploadToDrive(outputPath);

  if (uploadResult?.webViewLink) {
    log("info", "Upload complete", { driveLink: uploadResult.webViewLink });

    await logHealthEvent({
      status: "ok",
      source: "auto-downloader",
      details: {
        message: "upload ok",
        video_id: latest.id,
        driveLink: uploadResult.webViewLink
      }
    });
  } else {
    log("error", "Upload failed or no link returned");

    await logHealthEvent({
      status: "error",
      source: "auto-downloader",
      severity: "error",
      error_message: "Upload failed or no link returned",
      details: { video_id: latest.id }
    });

    await sendSmartAlert({
      subject: "Servoya: Drive upload failed",
      text: `Upload failed for video ${latest.id}`,
      severity: "medium"
    });
  }
}

// HTTP health for Cloud Run
const app = express();
app.get("/health", (req, res) => res.send("OK"));
app.listen(8080, () => console.log("🩺 Healthcheck ready on port 8080"));

checkForNewVideos();
setInterval(checkForNewVideos, 30 * 60 * 1000);