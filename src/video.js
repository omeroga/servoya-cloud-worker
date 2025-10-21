// src/video.js
// Handles video generation, storage, and metadata saving

import fs from "fs/promises";
import path from "path";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// === Initialize OpenAI ===
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY?.trim(),
});

// === Initialize Supabase ===
const supabase = createClient(
  process.env.SUPABASE_URL?.trim(),
  process.env.SUPABASE_KEY?.trim()
);

/**
 * Generates a short AI-based video and saves metadata to Supabase
 * @param {string} prompt - Description for the AI video
 * @returns {Promise<{videoUrl:string, thumbnailUrl:string, prompt:string}>}
 */
export async function generateVideo(prompt) {
  console.log("🎬 Generating video for prompt:", prompt);

  // Simulate generation delay (mock, can be replaced with real AI video API)
  await new Promise(resolve => setTimeout(resolve, 2000));

  const videoUrl = `https://example.com/videos/${Date.now()}.mp4`;
  const thumbnailUrl = `https://example.com/thumbnails/${Date.now()}.jpg`;

  // Save video metadata in Supabase
  const { data, error } = await supabase.from("videos").insert([
    { prompt, video_url: videoUrl, thumbnail_url: thumbnailUrl, created_at: new Date().toISOString() },
  ]);

  if (error) {
    console.error("❌ Error saving video metadata:", error);
    throw error;
  }

  console.log("✅ Video metadata saved successfully");
  return { videoUrl, thumbnailUrl, prompt };
}
