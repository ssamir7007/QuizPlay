import test from "node:test";
import assert from "node:assert/strict";
import { Hangman } from "../src/games/hangman.ts";
import { validateHangmanQuestions } from "../src/services/hangmanQuestions.ts";
import { generateHangmanResponse } from "../server/generateHangman.js";
import sample from "../src/data/hangmanSample.json" with { type: "json" };

const question = {
  question: "What phrase is hidden?",
  answer: "Bee-bop Duo",
  why: "An example.",
};
const start = (hearts = 3) => {
  const g = new Hangman([question], hearts);
  g.start();
  return g;
};
test("letters reveal every occurrence, preserve separators and ignore repeats", () => {
  const g = start();
  assert.equal(g.blanks.join(""), "___-___ ___");
  g.guessLetter("B");
  g.guessLetter("b");
  g.guessLetter("E");
  assert.equal(g.blanks.join(""), "BEE-B__ ___");
  g.guessLetter("x");
  g.guessLetter("X");
  assert.deepEqual(g.wrongLetters, ["x"]);
  for (const letter of "podu") g.guessLetter(letter);
  assert.equal(g.outcome, "solved");
  assert.equal(g.hearts, 3);
  assert.equal(g.getScore(), 100 + 50 + 10);
});
test("six wrong letters cost exactly one heart and the next figure starts empty", () => {
  const g = start();
  for (const letter of "acfgj") g.guessLetter(letter);
  assert.equal(g.hearts, 3);
  assert.equal(g.wrongLetters.length, 5);
  g.guessLetter("k");
  g.guessLetter("z");
  g.skip();
  assert.equal(g.outcome, "failed");
  assert.equal(g.hearts, 2);
  assert.equal(g.getScore(), 0);
  assert.equal(g.history.length, 1);
  g.continue();
  assert.equal(g.wrongLetters.length, 0);
  assert.equal(g.guessed.size, 0);
});
test("wrong whole guesses cost hearts without changing the figure; normalization accepts punctuation and spaces", () => {
  const g = start();
  g.guessLetter("x");
  g.guessAnswer("bad");
  assert.equal(g.hearts, 2);
  assert.equal(g.outcome, null);
  assert.equal(g.wrongLetters.length, 1);
  g.guessAnswer("  bEE  bop-duO! ");
  assert.equal(g.outcome, "solved");
  assert.equal(g.getScore(), 150);
});
test("skip and a final wrong whole guess count as misses; callbacks and losses occur only once", () => {
  let failed = 0,
    over = 0;
  const g = new Hangman([question], 2, {
    onRoundFailed: () => failed++,
    onGameOver: () => over++,
  });
  g.start();
  g.skip();
  assert.equal(g.hearts, 1);
  g.continue();
  g.guessAnswer("oops");
  g.guessAnswer("oops");
  g.continue();
  assert.equal(g.hearts, 0);
  assert.equal(g.over, true);
  assert.equal(failed, 2);
  assert.equal(over, 1);
  assert.equal(g.getScore(), 0);
  assert.deepEqual(
    g.history.map((entry) => entry.outcome),
    ["skipped", "failed"],
  );
});
test("clean streak bonus caps at 50; skips reset the streak", () => {
  const g = start();
  let total = 0;
  for (let i = 1; i <= 7; i++) {
    g.guessAnswer(question.answer);
    total += 160 + Math.min(i, 5) * 10;
    assert.equal(g.getScore(), total);
    g.continue();
  }
  g.skip();
  assert.equal(g.streak, 0);
  g.continue();
  g.guessAnswer(question.answer);
  assert.equal(g.getScore(), total + 170);
});
test("pause blocks guesses and skips until resumed", () => {
  const g = start();
  g.pause();
  g.guessLetter("b");
  g.guessAnswer("wrong");
  g.skip();
  assert.equal(g.guessed.size, 0);
  assert.equal(g.hearts, 3);
  assert.equal(g.outcome, null);
  g.resume();
  g.guessAnswer(question.answer);
  assert.equal(g.outcome, "solved");
});
test("cycles use each question once and missed questions return first next cycle", () => {
  const g = new Hangman(sample, 3);
  g.start();
  const first = g.round;
  g.skip();
  g.continue();
  for (let i = 1; i < sample.length; i++) {
    g.guessAnswer(g.round.answer);
    g.continue();
  }
  assert.equal(
    new Set(g.history.map((e) => e.question.question)).size,
    sample.length,
  );
  assert.equal(g.round, first);
});
test("validation filters invalid answers, leaks, duplicates and bad fields", () => {
  assert.equal(validateHangmanQuestions(sample).length, 15);
  for (const answer of [
    "an",
    "too many words here",
    "abcdefghijklmnopqrstu",
    "area51",
    "bad!",
    "-bad",
    "a--b",
  ])
    assert.equal(validateHangmanQuestions([{ ...question, answer }]).length, 0);
  const invalid = [
    null,
    { ...question, why: 3 },
    { ...question, source: false },
    { ...question, question: " " },
    { question: "How many planets exist?", answer: "planet" },
    { question: "Define light year.", answer: "light-year" },
  ];
  assert.deepEqual(validateHangmanQuestions([...invalid, question, question]), [
    question,
  ]);
  assert.deepEqual(validateHangmanQuestions({}), []);
});
const response = (items: unknown) =>
  Response.json({
    candidates: [{ content: { parts: [{ text: JSON.stringify(items) }] } }],
  });
test("Gemini retries once after filtering; returns usable questions only", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async (_url, init) => {
    assert.equal(init.headers["x-goog-api-key"], "fixture");
    return response(
      ++calls === 1 ? sample.slice(0, 4) : [null, ...sample.slice(0, 5)],
    );
  });
  const r = await generateHangmanResponse(
    { notesText: "Synthetic notes" },
    { GEMINI_API_KEY: "fixture" },
  );
  assert.equal(calls, 2);
  assert.equal(r.status, 200);
  assert.equal((await r.json()).length, 5);
});
test("two malformed results return a retryable error", async (t) => {
  const spy = t.mock.method(globalThis, "fetch", async () =>
    Response.json({ candidates: [] }),
  );
  const r = await generateHangmanResponse(
    { notesText: "Synthetic notes" },
    { AI_API_KEY: "fixture" },
  );
  assert.equal(r.status, 422);
  assert.equal(spy.mock.callCount(), 2);
  assert.match((await r.json()).error, /retry/i);
});
test("local no-key mode serves sample questions without network access", async (t) => {
  const spy = t.mock.method(globalThis, "fetch", async () => {
    throw Error("unexpected fetch");
  });
  const r = await generateHangmanResponse({ notesText: "Notes" }, {});
  assert.equal(r.status, 200);
  assert.equal(validateHangmanQuestions(await r.json()).length, 15);
  assert.equal(spy.mock.callCount(), 0);
});
