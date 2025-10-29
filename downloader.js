// 🧩 Servoya Downloader - Simple file fetcher
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const DOWNLOAD_DIR = "./downloads";
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

async function downloadFile(url, filename) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);
  const buffer = await res.arrayBuffer();
  const filePath = path.join(DOWNLOAD_DIR, filename);
  fs.writeFileSync(filePath, Buffer.from(buffer));
  console.log(`✅ Saved: ${filePath}`);
}

const TEST_URL = "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4";

downloadFile(TEST_URL, "test_video.mp4").catch(console.error);
