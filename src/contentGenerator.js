// src/contentGenerator.js
// ESM module. Generates post script + metadata using OpenAI.
// Requires env: OPENAI_API_KEY

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY env var");
}

/**
 * Generate content for a short video post.
 * @param {Object} opts
 * @param {string} opts.niche - e.g., "finance for beginners"
 * @param {string} opts.product - short product name for affiliate link context
 * @param {string} [opts.tone="energetic"] - tone of voice
 * @param {number} [opts.durationSec=45] - target script length
 * @returns {Promise<{title:string, script:string, description:string, hashtags:string[]}>}
 */
export async function generateContent({
  niche,
  product,
  tone = "energetic",
  durationSec = 45,
}) {
  const prompt = `
You are a top-tier social video scriptwriter.
Goal: write a ${durationSec}-second script (≈ 120–150 words) for a vertical video.
Niche: ${niche}
Featured offer: ${product}
Tone: ${tone}

Rules:
- Hook in the first sentence.
- 3–4 concise tips or beats.
- Clear call-to-action to check the link in bio/description (no promises of guaranteed income).
- No medical/financial/legal claims. Keep it helpful and ethical.
- Return strict JSON with keys: title, script, description, hashtags (array of 6–10 short items, no # symbol).

Output ONLY the JSON.
  `.trim();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You write concise, viral short-video scripts and return clean JSON only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    // Fallback: try to extract JSON block if model added extra text
    const match = text?.match(/\{[\s\S]*\}$/);
    if (!match) throw new Error("Failed to parse JSON from model response");
    parsed = JSON.parse(match[0]);
  }

  // Basic normalization
  const hashtags = (parsed.hashtags || [])
    .map(h => String(h).replace(/^#/, "").trim())
    .filter(Boolean);

  return {
    title: String(parsed.title || "").trim(),
    script: String(parsed.script || "").trim(),
    description: String(parsed.description || "").trim(),
    hashtags,
  };
}
