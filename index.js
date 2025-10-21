import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

// === Environment variables ===
const PORT = process.env.PORT || 10000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// === Initialize clients ===
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// === Basic test route ===
app.get("/", (req, res) => {
  res.status(200).json({ status: "Servoya Cloud Worker running" });
});

// === Start server ===
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
