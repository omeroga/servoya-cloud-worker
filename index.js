// index.js
// === Servoya Cloud Worker - Stable Version ===

import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

// === Environment Variables ===
const PORT = process.env.PORT || 10000;
const SUPABASE_URL = process.env.SUPABASE_URL?.trim();
const SUPABASE_KEY = process.env.SUPABASE_KEY?.trim();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();

// === Validate Environment ===
if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY) {
  console.error("❌ Missing one or more environment variables:");
  console.error({ SUPABASE_URL, SUPABASE_KEY: !!SUPABASE_KEY, OPENAI_API_KEY: !!OPENAI_API_KEY });
  process.exit(1);
}

// === Initialize Clients ===
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// === Test Route ===
app.get("/", (req, res) => {
  res.status(200).json({ status: "✅ Servoya Cloud Worker running successfully" });
});

// === Server Start ===
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌍 Server running and listening on port ${PORT}`);
});
