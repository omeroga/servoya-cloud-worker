// src/randomPromptEngine.js

/**
 * מנוע פרומפטים פשוט לפי קטגוריה
 */

const prompts = {
  general: [
    "Write a short motivational script about focus and determination.",
    "Create a 45-second script about the power of consistency.",
    "Generate a video narration about morning discipline and success."
  ],
  motivation: [
    "Write a short speech about believing in yourself.",
    "Generate a motivational message about never giving up.",
    "Create a story about turning failure into opportunity."
  ],
  success: [
    "Write an inspiring message about building long-term success.",
    "Create a 30-second video script about persistence and growth.",
    "Generate a quote-style narration about achieving goals."
  ]
};

/**
 * בוחר פרומפט רנדומלי מתוך הקטגוריה
 */
export async function getRandomPrompt(category = "general") {
  const options = prompts[category];
  if (!options) throw new Error(`category not found: ${category}`);
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
}
