import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Merge video and audio into one MP4 file using FFmpeg
 * @param {string} videoUrl - URL of the video file
 * @param {string} audioUrl - URL of the audio file
 * @param {string} outputPath - Path for the merged output file
 * @returns {Promise<string>} - Path of merged file
 */
export async function mergeVideoAudio(videoUrl, audioUrl, outputPath = "./output/merged.mp4") {
  try {
    // הורדת הקבצים הזמניים
    const videoFile = "./temp_video.mp4";
    const audioFile = "./temp_audio.mp3";

    const videoData = await fetch(videoUrl);
    const audioData = await fetch(audioUrl);

    fs.writeFileSync(videoFile, Buffer.from(await videoData.arrayBuffer()));
    fs.writeFileSync(audioFile, Buffer.from(await audioData.arrayBuffer()));

    // מיזוג עם FFmpeg
    await execAsync(`ffmpeg -i ${videoFile} -i ${audioFile} -c:v copy -c:a aac -strict experimental ${outputPath}`);

    console.log("✅ Merge complete:", outputPath);

    // ניקוי קבצים זמניים
    fs.unlinkSync(videoFile);
    fs.unlinkSync(audioFile);

    return outputPath;
  } catch (error) {
    console.error("❌ Merge failed:", error);
    throw error;
  }
}
