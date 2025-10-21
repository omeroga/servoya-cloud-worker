// src/supabaseClient.js
// Centralized Supabase client setup

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL?.trim();
const SUPABASE_KEY = process.env.SUPABASE_KEY?.trim();

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing Supabase environment variables:");
  console.error("SUPABASE_URL:", !!SUPABASE_URL, "SUPABASE_KEY:", !!SUPABASE_KEY);
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
