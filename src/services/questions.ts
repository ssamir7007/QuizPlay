export type Question = {
  q: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  why: string;
  source?: string;
};
const nonempty = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;
export function validateQuestions(value: unknown): value is Question[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (row) =>
        row &&
        nonempty(row.q) &&
        nonempty(row.why) &&
        Array.isArray(row.options) &&
        row.options.length === 4 &&
        row.options.every(nonempty) &&
        Number.isInteger(row.answer) &&
        row.answer >= 0 &&
        row.answer < 4 &&
        (row.source === undefined || typeof row.source === "string"),
    )
  );
}
export const MAX_QUESTIONS = 50;
export const DEFAULT_QUESTION_COUNT = 12;
export function validCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= MAX_QUESTIONS;
}
