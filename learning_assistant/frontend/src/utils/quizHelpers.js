/**
 
 * @param {Object} quiz - The raw quiz object from the API
 * @returns {Array} List of question objects
 */
export const getQuizQuestions = (quiz) => {
  if (!quiz) return [];

  // 1. If questions array exists and has items, use it
  if (Array.isArray(quiz.questions) && quiz.questions.length > 0) {
    return quiz.questions;
  }

  // 2. Fallback to questions_json (array or JSON string)
  if (quiz.questions_json) {
    if (Array.isArray(quiz.questions_json)) {
      return quiz.questions_json;
    }
    if (typeof quiz.questions_json === "string") {
      try {
        return JSON.parse(quiz.questions_json);
      } catch (e) {
        console.error("Failed to parse questions_json string:", e);
        return [];
      }
    }
  }

  return [];
};
