import express from "express";
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Servoya Worker deployed successfully!");
});

// הקשב לפורט שהוקצה על ידי Cloud Run
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
});
