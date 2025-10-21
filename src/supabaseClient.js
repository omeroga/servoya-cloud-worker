import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://gpeijpqhpswggkbhnwqq.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwZWlqcHFocHN3Z2drYmhud3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODQ2MjIsImV4cCI6MjA3NjU2MDYyMn0.AHR1jQAQ1jA8NKc6LSoGybJJQ0w2c3jpVRJdC_BKC04";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
