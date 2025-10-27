// src/randomPromptEngine.js

/**
 * 🧠 Servoya Random Prompt Engine
 * יוצר וריאציות בלתי חוזרות של פרומפטים על בסיס קטגוריה, נושא, סגנון ורגש
 */

const templates = {
  motivation: [
    "Write a short motivational video script about [TOPIC], using a tone of [TONE].",
    "Create a powerful narration about [TOPIC], focusing on [STYLE].",
    "Generate a 45-second motivational message that inspires [EMOTION] about [TOPIC].",
    "Craft a speech about [TOPIC] that encourages people to [ACTION]."
  ],
  success: [
    "Write an inspiring short video about achieving [TOPIC] through [STYLE].",
    "Create a cinematic narration about [TOPIC] with a tone of [TONE].",
    "Generate a motivational reel about [TOPIC], designed to trigger [EMOTION]."
  ],
  general: [
    "Create a short, engaging message about [TOPIC] with [STYLE].",
    "Write a viral short-form video about [TOPIC], evoking [EMOTION].",
    "Generate a quick, catchy script about [TOPIC] using a [TONE] voice."
  ]
};

// נושאים אפשריים
const topics = [
  "discipline", "confidence", "resilience", "patience", "focus", "courage",
  "self-growth", "overcoming fear", "consistency", "success habits",
  "failure and recovery", "gratitude", "dream chasing", "mental toughness",
  "change and progress", "vision and purpose", "self-belief", "hard work"
];

// סגנונות / טונים / רגשות
const tones = [
  "cinematic", "emotional", "confident", "urgent", "inspiring", "introspective",
  "uplifting", "powerful", "empathetic", "bold"
];

const styles = [
  "storytelling", "poetic", "philosophical", "direct advice", "metaphorical",
  "real-life example", "dialogue style", "quote-based"
];

const emotions = [
  "hope", "determination", "strength", "peace", "motivation", "clarity",
  "faith", "fearlessness", "energy", "calmness"
];

const actions = [
  "take action", "believe in themselves", "keep going", "focus every day",
  "let go of fear", "embrace change", "trust the process", "never give up"
];

/**
 * בוחר אקראית ערכים מכל מערך ומרכיב פרומפט ייחודי בכל הרצה
 */
export async function getRandomPrompt(category = "general") {
  const group = templates[category] || templates.general;
  const base = group[Math.floor(Math.random() * group.length)];
  const prompt = base
    .replace("[TOPIC]", pick(topics))
    .replace("[TONE]", pick(tones))
    .replace("[STYLE]", pick(styles))
    .replace("[EMOTION]", pick(emotions))
    .replace("[ACTION]", pick(actions));
  return prompt;
}

/**
 * פונקציה פנימית לבחירת איבר אקראי
 */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
