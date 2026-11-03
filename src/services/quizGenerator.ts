/**
 * CONNECT YOUR AI API HERE.
 * Replace the mock delay and fixture with a POST to /api/generate-quiz.
 * Make the provider call in server/generateQuiz.js. The API key belongs on the backend.
 */
import mock from "../data/questions.json";
import { validateQuestions, type Question } from "./questions";
export type { Question } from "./questions";
export async function generateQuiz(notesText: string): Promise<Question[]> {
  if (!notesText.trim())
    throw new Error("Add some notes to generate your quiz.");
  await new Promise((resolve) => setTimeout(resolve, 500));
  const result: unknown = structuredClone(mock);
  if (!validateQuestions(result))
    throw new Error("The quiz has an invalid question. Please try again.");
  return result;
}
