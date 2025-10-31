// src/healthLogger.js
import { supabase } from "./supabaseClient.js";

export async function logHealthEvent(payload = {}) {
  try {
    const { data, error } = await supabase
      .from("health_logs")
      .insert([
        {
          status: payload.status || "ok",
          source: payload.source || "auto-downloader",
          details: payload.details ? JSON.stringify(payload.details) : null,
          error_message: payload.error_message || null,
          severity: payload.severity || "info"
        }
      ]);

    if (error) {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "error",
          message: "health_logs insert failed",
          error: error.message
        })
      );
    }
  } catch (err) {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        message: "health_logs exception",
        error: err.message
      })
    );
  }
}