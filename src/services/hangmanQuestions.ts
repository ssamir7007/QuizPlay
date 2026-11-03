export type HangmanQuestion = {
  question: string;
  answer: string;
  why?: string;
  source?: string;
};

export function normalizeAnswer(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}

export function validateHangmanQuestions(input: unknown): HangmanQuestion[] {
  if (!Array.isArray(input)) return [];
  const seenQuestions = new Set<string>();
  const seenAnswers = new Set<string>();
  return input.filter((item): item is HangmanQuestion => {
    if (
      !item ||
      typeof item.question !== "string" ||
      typeof item.answer !== "string"
    )
      return false;
    const { question, answer, why, source } = item;
    if (!question.trim() || !/^[a-z]+(?:[ -][a-z]+){0,2}$/i.test(answer))
      return false;
    if (/^(?:is|are|was|were|do|does|did|has|have|can|could|would|should|will)\b/i.test(question.trim()))
      return false;
    const term = normalizeAnswer(answer);
    if (term.length < 3 || term.length > 20 || ["yes", "no"].includes(term))
      return false;
    if ([why, source].some((v) => v !== undefined && typeof v !== "string"))
      return false;
    const words = answer.toLowerCase().split(/[ -]/).join("[\\s-]*");
    // Reject leaked answers including common plural and possessive forms.
    if (new RegExp("\\b" + words + "(?:s|es|'s)?\\b", "i").test(question))
      return false;
    const key = question.trim().toLowerCase();
    if (seenQuestions.has(key) || seenAnswers.has(term)) return false;
    seenQuestions.add(key);
    seenAnswers.add(term);
    return true;
  });
}
