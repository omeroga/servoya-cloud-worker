// 🧠 Servoya Smart Alert Manager (v1.0)
// ניהול התראות חכם - עם סינון רעש, שמירה ב־Supabase, והגבלת שליחות

import { supabase } from "./supabaseClient.js";
import nodemailer from "nodemailer";

let lastAlertTimes = {};

const ALERT_COOLDOWN_MINUTES = 60; // לא תישלח אותה התראה פעמיים תוך שעה

// נשלחת רק כשיש אירוע חשוב באמת
export async function sendSmartAlert(type, message, details = {}) {
  const now = Date.now();
  const lastTime = lastAlertTimes[type] || 0;

  if (now - lastTime < ALERT_COOLDOWN_MINUTES * 60 * 1000) {
    console.log(`⏳ Skipping duplicate alert: ${type}`);
    return;
  }

  lastAlertTimes[type] = now;

  // רישום ב־Supabase
  await supabase.from("performance_logs").insert([
    {
      action: "ALERT",
      prompt: type,
      status: "error",
      created_at: new Date().toISOString(),
      duration_ms: 0,
      video_id: null,
      platform: "system",
      ctr: null,
      script: message,
      audio_url: null,
      video_url: null,
    },
  ]);

  console.log(`🚨 Logged alert to Supabase: ${type}`);

  // שליחת מייל רק לשגיאות קריטיות
  if (process.env.ALERT_EMAIL && process.env.ALERT_EMAIL_PASS) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ALERT_EMAIL,
        pass: process.env.ALERT_EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Servoya Alerts" <${process.env.ALERT_EMAIL}>`,
      to: process.env.ALERT_EMAIL,
      subject: `⚠️ Servoya Alert: ${type}`,
      text: `${message}\n\nDetails:\n${JSON.stringify(details, null, 2)}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`📧 Alert email sent: ${type}`);
    } catch (err) {
      console.error("❌ Failed to send alert email:", err.message);
    }
  }
}