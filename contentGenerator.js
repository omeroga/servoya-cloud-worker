import OpenAI from "openai";
import express from "express";

const app = express();
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("✅ Servoya Content Generator is live!");
});

app.post("/generate", async (req, res) => {
  try {
    const { topic, language } = req.body;

    const prompt = `כתוב פוסט קצר ומניע לפעולה בנושא "${topic}" בשפה ${language}. 
    הפוסט צריך להתאים לפרסום ברשת חברתית.`

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0].message.content;
    res.json({ success: true, content: text });
  } catch (error) {
    console.error("❌ Error generating content:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
