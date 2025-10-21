// === Debug: Check Environment Variables ===
console.log("🔍 Checking environment variables:");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL || "❌ Missing");
console.log("SUPABASE_KEY:", process.env.SUPABASE_KEY ? "✅ Loaded" : "❌ Missing");
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✅ Loaded" : "❌ Missing");
console.log("PORT:", process.env.PORT || "❌ Missing");
console.log("=========================================\n");

// === App Imports ===
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

// === Initialize Clients ===
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// === Basic Test Route ===
app.get("/", (req, res) => {
  res.send("✅ Servoya Cloud Worker is running");
});

// === Start Server ===
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
