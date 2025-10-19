import { Router } from "express";
import OpenAI from "openai";

const router = Router();

// ניצור לקוח OpenAI רק אם יש מפתח בסביבה
const openaiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_APIKEY || "";
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

// POST /produce  — מייצר רעיון/טקסט קצר לתוכן
router.post("/produce", async (req, res) => {
  try {
    const { topic = "affiliate marketing ideas", style = "short social post" } = req.body || {};

    let idea = `Draft about "${topic}" (${style}).`;
    if (openai) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You write concise, high-converting social posts." },
          { role: "user", content: `Give me one punchy ${style} about: ${topic}.` },
        ],
        temperature: 0.8,
        max_tokens: 160,
      });
      idea = completion.choices?.[0]?.message?.content?.trim() || idea;
    }

    res.status(200).json({
      ok: true,
      status: "produced",
      topic,
      output: idea,
      time: new Date().toISOString(),
      usedOpenAI: Boolean(openai),
    });
  } catch (err) {
    console.error("produce error:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// POST /publish  — סטאב בשלב זה (נוסיף אינטגרציות בהמשך)
router.post("/publish", async (req, res) => {
  res.status(200).json({
    ok: true,
    status: "publish stub",
    note: "Publish will post to platforms in step 3.",
    time: new Date().toISOString(),
  });
});

export default router;
