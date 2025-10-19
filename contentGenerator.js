import OpenAI from "openai";
import express from "express";

const app = express();
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint ליצירת תוכן אוטומטי
app.post("/generate", async (req, res) => {
  try {
    const { topic, language } = req.body;

    const prompt = `כתוב פוסט קצר, מושך ובעל ערך בנושא "${topic}" בשפה ${language}. 
    התוכן צריך להיות מתאים לרשת חברתית ולהניע לפעולה.`

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0].message.content;
    res.json({ success: true, content: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Content generator running on port ${PORT}`));
