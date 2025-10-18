import express from 'express';
import { generateScript } from './src/ai.js';
import { renderVideo } from './src/video.js';
import { publishVideo } from './src/publish.js';

const app = express();
app.use(express.json());

// דף בדיקה ראשי
app.get('/', (req, res) => {
  res.send('✅ Servoya Cloud Worker is live!');
});

// בדיקת בריאות
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// נקודת בדיקה ראשונה לייצור תוכן
app.post('/produce', async (req, res) => {
  const prompts = [
    "TikTok 15s: beauty routine morning",
    "Spanish: skincare tips viral",
  ];

  const results = [];
  for (const prompt of prompts) {
    const script = await generateScript(prompt);
    const video = await renderVideo(script);
    const publish = await publishVideo(video, script.caption, 'https://amzn.to/example');
    results.push({ prompt, publish });
  }

  res.json({ status: 'ok', count: results.length, results });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
