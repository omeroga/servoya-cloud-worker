// === index.js === Servoya Cloud Worker - Stable Version ===
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// healthcheck
app.get("/", (req, res) => {
  res.json({ ok: true, service: "servoya-worker", ts: Date.now() });
});

// TODO: add your routes here

app.listen(PORT, () => {
  console.log(`servoya-worker listening on ${PORT}`);
});
