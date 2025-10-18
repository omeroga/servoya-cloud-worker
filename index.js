import express from 'express';
const app = express();

app.get('/', (req, res) => {
  res.send('Servoya Cloud Worker is live!');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
