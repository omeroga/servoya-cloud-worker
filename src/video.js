// src/video.js
// Generates short video using external AI service (e.g., Pika / Runway / Synthesia)

import fetch from "node-fetch";

/**
 * Generate a short video from script text.
 * @param {Object} opts
 * @param {string} opts.script - the full spoken script
 * @param {string} opts.title - video title for metadata
 * @param {string[]} [opts.hashtags] - optional hashtags for metadata
 * @returns {Promise<{videoUrl:string, thumbnailUrl:string}>}
 */
export async function generateVideo({ script, title, hashtags = [] }) {
  // --- placeholder logic for now ---
  // Later this will call external API (Pika, Runway, etc.)
  // For now, return mock URLs for testing.
  console.log("🎬 Generating video from script...");
  await new Promise(r => setTimeout(r, 2000)); // simulate delay

  return {
    videoUrl: "https://example.com/fake-video.mp4",
    thumbnailUrl: "https://example.com/fake-thumbnail.jpg",
  };
}
