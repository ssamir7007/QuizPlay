import type { Question } from "./questions";
export function shuffle<T>(input: T[]): T[] {
  const out = input.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
export class Deck {
  all: Question[];
  queue: Question[];
  constructor(questions: Question[]) {
    this.all = questions;
    this.queue = shuffle(questions);
  }
  draw() {
    if (!this.queue.length) this.queue = shuffle(this.all);
    return this.queue.shift()!;
  }
  missed(q: Question) {
    if (!this.queue.length) this.queue = shuffle(this.all);
    this.queue = this.queue.filter((item) => item !== q);
    this.queue.splice(Math.min(2, this.queue.length), 0, q);
  }
}
