// ⚠️ Servoya Smart Alerts v2 – Intelligent Notification Layer

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const CRITICAL_EVENTS = [
  "Supabase connection failed",
  "Google Drive upload failed",
  "Cloud Scheduler inactive",
  "Download process crashed"
];

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ALERT_EMAIL_USER,
    pass: process.env.ALERT_EMAIL_PASS
  }
});

export async function sendSmartAlert(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = { level, message, timestamp, ...meta };

  // נרשום תמיד ללוג
  console.log(JSON.stringify(logEntry));

  // רק אם מדובר במקרה קריטי – נשלח מייל
  if (level === "critical" && CRITICAL_EVENTS.some(e => message.includes(e))) {
    try {
      await transporter.sendMail({
        from: `"Servoya Monitor" <${process.env.ALERT_EMAIL_USER}>`,
        to: "omer@servoya.com",
        subject: `🚨 [CRITICAL] ${message}`,
        text: `Time: ${timestamp}\n\n${JSON.stringify(meta, null, 2)}`
      });

      console.log("📧 Critical alert sent successfully.");
    } catch (err) {
      console.error("❌ Failed to send alert email:", err.message);
    }
  } else {
    console.log("ℹ️ Non-critical alert logged only.");
  }
}