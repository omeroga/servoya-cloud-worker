import express from 'express';
const app = express();

app.use(express.json());

// Homepage - בדיקה זריזה
app.get('/', (req, res) => {
  res.send('Servoya Cloud Worker is live!');
});

// Healthcheck
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// הפונקציה המשותפת ל-GET/POST produce
const handleProduce = (req, res) => {
  // כאן בהמשך נקרא ל-ai/video/publish שב-src
  res.status(200).json({
    ok: true,
    status: 'produce stub',
    note: 'GET/POST /produce works',
    time: new Date().toISOString()
  });
};

// בדיקות: זמני — מאפשר גם GET כדי שתראה בדפדפן
app.get('/produce', handleProduce);
// אמיתי: POST מהאוטומציה
app.post('/produce', handleProduce);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
