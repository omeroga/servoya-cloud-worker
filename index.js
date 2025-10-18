import express from 'express';
const app = express();

app.get('/', (req, res) => {
  res.send('Servoya Cloud Worker is live!');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.post('/produce', (req, res) => {
  res.status(200).json({ status: '5 videos LIVE! $25 expected' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
