import sample from "../data/questions.json";
import { validateQuestions, type Question } from "./questions";
export type { Question } from "./questions";

// The server owns the Gemini credential. The sample deck works offline.
export async function generateQuiz(notesText: string): Promise<Question[]> {
  if (!notesText.trim()) throw new Error("Add some notes to generate your quiz.");
  let result: unknown;
  if (notesText === "Sample astronomy notes") {
    result = structuredClone(sample);
  } else {
    const response = await fetch("/api/generate-quiz", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({notesText}),
    });
    result = await response.json().catch(() => null);
    if (!response.ok) {
      const message = (result as {error?: string} | null)?.error;
      throw new Error(message || "Quiz generation failed. Please retry.");
    }
  }
  if (!validateQuestions(result)) throw new Error("The quiz has an invalid question. Please retry.");
  return result;
}
