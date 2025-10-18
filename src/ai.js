export async function generateScript(prompt) {
  // שלב 2 יתחבר ל-API אמיתי (Claude, ChatGPT, וכו')
  return {
    caption: `Auto: ${prompt}`,
    visuals: [`shot: ${prompt.slice(0, 30)}...`]
  };
}
