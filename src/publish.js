// src/publish.js
// Handles automated publishing of generated videos to social platforms (mock version)

import fs from "fs/promises";
import { supabase } from "./supabaseClient.js";

/**
 * 🔹 Mock publish function — later will connect to TikTok/YouTube/Instagram APIs.
 * @param {Object} opts
 * @param {string} opts.videoUrl - URL of generated video
 * @param {string} opts.thumbnailUrl - URL of video thumbnail
 * @param {string} opts.caption - text caption with hashtags
 * @returns {Promise<{status:string, platform:string, postUrl:string}>}
 */
export async function publishVideo({ videoUrl, thumbnailUrl, caption }) {
  console.log("🚀 Publishing video...");
  await new Promise((resolve) => setTimeout(resolve, 1500)); // simulate upload delay

  // --- mock upload result ---
  const result = {
    status: "success",
    platform: "TikTok",
    postUrl: "https://example.com/mock-post",
  };

  // אחרי הצלחה — עדכון סטטוס בבסיס הנתונים
  try {
    const { error } = await supabase
      .from("videos")
      .update({ action: "published" })
      .eq("video_url", videoUrl);

    if (error) throw error;
    console.log(`✅ Video marked as published: ${videoUrl}`);

    // שליחת webhook ל-Make (הפצה אוטומטית)
    try {
      await fetch("https://hook.us2.make.com/hwg41t1pfjq3vvzthvxqf3p2als3wkbj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl,
          thumbnailUrl,
          caption,
          platform: result.platform,
          timestamp: new Date().toISOString(),
        }),
      });
      console.log("📤 Sent video data to Make webhook.");
    } catch (err) {
      console.error("❌ Failed to send webhook:", err.message);
    }

  } catch (err) {
    console.error("❌ Failed to update Supabase status:", err.message);
  }

  return result;
}

/**
 * 🔹 סימון וידאו כמוכן לפרסום (pre-stage)
 * @param {string} videoId
 */
export async function markVideoForPublish(videoId) {
  try {
    const { error } = await supabase
      .from("videos")
      .update({ action: "pending_publish" })
      .eq("id", videoId);

    if (error) throw error;
    console.log(`✅ Video ${videoId} marked as pending_publish`);
  } catch (err) {
    console.error("❌ Failed to mark video:", err.message);
  }
}
