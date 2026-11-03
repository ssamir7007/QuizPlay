import sample from "../data/questions.json";
import hangmanSample from "../data/hangmanSample.json";
import { validateHangmanQuestions, type HangmanQuestion } from "./hangmanQuestions";
export type { HangmanQuestion } from "./hangmanQuestions";

export async function generateHangmanQuestions(notesText: string): Promise<HangmanQuestion[]> {
  if (!notesText.trim()) throw new Error("Add study notes or choose the sample deck.");
  if (notesText === "Sample astronomy notes") return validateHangmanQuestions(hangmanSample);
  const response = await fetch("/api/generate-hangman", {
    method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({notesText}),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Could not prepare Hangman. Please retry.");
  const valid = validateHangmanQuestions(data);
  if (valid.length < 5) throw new Error("This deck needs five usable questions. Please retry.");
  return valid;
}
import { DEFAULT_QUESTION_COUNT, validCount, validateQuestions, type Question } from "./questions";
export type { Question } from "./questions";

// The server owns the Gemini credential. The sample deck works offline.
export async function generateQuiz(notesText: string, count = DEFAULT_QUESTION_COUNT): Promise<Question[]> {
  if (!validCount(count)) throw new Error("Choose between 1 and 50 questions.");
  if (!notesText.trim()) throw new Error("Add some notes to generate your quiz.");
  let result: unknown;
  if (notesText === "Sample astronomy notes") {
    result = structuredClone(sample.slice(0, count));
  } else {
    const response = await fetch("/api/generate-quiz", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({notesText, count}),
    });
    result = await response.json().catch(() => null);
    if (!response.ok) {
      const message = (result as {error?: string} | null)?.error;
      throw new Error(message || "Quiz generation failed. Please retry.");
    }
  }
  if (!validateQuestions(result)) throw new Error("The quiz has an invalid question. Please retry.");
  if (result.length !== count) throw new Error("The quiz did not contain the requested number of questions. Please retry.");
  return result;
}
