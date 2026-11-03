import { shuffle } from "../services/deck.ts";
import {
  normalizeAnswer,
  type HangmanQuestion,
} from "../services/hangmanQuestions.ts";

type Hooks = {
  onRoundSolved?: (question: HangmanQuestion) => void;
  onRoundFailed?: (question: HangmanQuestion) => void;
  onGameOver?: () => void;
};
type Outcome = "solved" | "failed" | "skipped";
export class Hangman {
  readonly questions: HangmanQuestion[];
  readonly startingHearts: number;
  readonly hooks: Hooks;
  hearts = 0;
  score = 0;
  streak = 0;
  paused = false;
  over = false;
  lostHeart = false;
  round!: HangmanQuestion;
  outcome: Outcome | null = null;
  guessed = new Set<string>();
  history: { question: HangmanQuestion; outcome: Outcome }[] = [];
  private queue: HangmanQuestion[] = [];
  private missed = new Set<HangmanQuestion>();

  constructor(questions: HangmanQuestion[], hearts: number, hooks: Hooks = {}) {
    if (!questions.length) throw new Error("Hangman needs a question deck.");
    this.questions = questions;
    this.startingHearts = hearts;
    this.hooks = hooks;
  }
  start() {
    this.hearts = this.startingHearts;
    this.score = this.streak = 0;
    this.paused = this.over = false;
    this.history = [];
    this.queue = [];
    this.missed.clear();
    this.nextRound();
  }
  pause() {
    this.paused = true;
  }
  resume() {
    this.paused = false;
  }
  getScore() {
    return this.score;
  }
  get active() {
    return !this.paused && !this.over && !this.outcome;
  }
  get wrongLetters() {
    const answer = this.round.answer.toLowerCase();
    return [...this.guessed].filter((letter) => !answer.includes(letter));
  }
  get blanks() {
    return [...this.round.answer.toUpperCase()].map((c) =>
      /[A-Z]/.test(c) && !this.guessed.has(c.toLowerCase()) ? "_" : c,
    );
  }
  private nextRound() {
    if (!this.queue.length) {
      // Each cycle uses every question once. Revisit missed ones first in the next cycle.
      this.queue = shuffle(this.questions).sort(
        (a, b) => Number(this.missed.has(b)) - Number(this.missed.has(a)),
      );
      if (this.queue.length > 1 && this.queue[0] === this.round)
        [this.queue[0], this.queue[1]] = [this.queue[1], this.queue[0]];
    }
    this.round = this.queue.shift()!;
    this.guessed.clear();
    this.outcome = null;
    this.lostHeart = false;
  }
  continue() {
    if (this.paused || !this.outcome || this.over) return;
    this.nextRound();
  }
  guessLetter(input: string) {
    const letter = input.toLowerCase();
    if (!this.active || !/^[a-z]$/.test(letter) || this.guessed.has(letter))
      return;
    this.guessed.add(letter);
    if (!this.blanks.includes("_")) this.finish("solved");
    else if (this.wrongLetters.length === 6) this.finish("failed");
  }
  guessAnswer(input: string) {
    if (!this.active || !normalizeAnswer(input)) return;
    if (normalizeAnswer(input) === normalizeAnswer(this.round.answer))
      this.finish("solved");
    else {
      this.loseHeart();
      if (this.hearts === 0) this.finish("failed", true);
    }
  }
  skip() {
    if (this.active) this.finish("skipped");
  }
  private loseHeart() {
    this.hearts--;
    this.streak = 0;
    this.lostHeart = true;
  }
  private finish(outcome: Outcome, alreadyCharged = false) {
    this.outcome = outcome;
    this.history.push({ question: this.round, outcome });
    if (outcome === "solved") {
      if (!this.lostHeart) this.streak++;
      this.score +=
        100 +
        (6 - this.wrongLetters.length) * 10 +
        Math.min(5, this.streak) * 10;
      this.missed.delete(this.round);
      this.hooks.onRoundSolved?.(this.round);
    } else {
      if (!alreadyCharged) this.loseHeart();
      this.missed.add(this.round);
      this.hooks.onRoundFailed?.(this.round);
    }
    if (this.hearts === 0) {
      this.over = true;
      this.hooks.onGameOver?.();
    }
  }
}
