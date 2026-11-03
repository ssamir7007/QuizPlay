import { Game, empty } from "./core.ts";
export function merge(line: number[]) {
  const values = line.filter(Boolean),
    result: number[] = [];
  let score = 0;
  for (let i = 0; i < values.length; i++) {
    let v = values[i];
    if (v === values[i + 1]) {
      v *= 2;
      score += v;
      i++;
    }
    result.push(v);
  }
  return {
    line: result.concat(Array(line.length - result.length).fill(0)),
    score,
  };
}
export class Tiles extends Game {
  spawn() {
    const free = this.board.flatMap((r, y) =>
      r.flatMap((v, x) => (v ? [] : [[x, y]])),
    );
    if (free.length) {
      const [x, y] = free[Math.floor(Math.random() * free.length)];
      this.board[y][x] = Math.random() < 0.9 ? 2 : 4;
    }
  }
  start() {
    this.score = 0;
    this.board = empty(4, 4);
    this.spawn();
    this.spawn();
    this.resume();
    this.hooks.onChange();
  }
  input(key: string) {
    if (
      this.paused ||
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)
    )
      return;
    const vertical = ["ArrowUp", "ArrowDown"].includes(key),
      reverse = ["ArrowRight", "ArrowDown"].includes(key);
    const before = JSON.stringify(this.board);
    for (let i = 0; i < 4; i++) {
      const line = vertical
        ? this.board.map((r) => r[i])
        : this.board[i].slice();
      const m = merge(reverse ? line.reverse() : line);
      this.score += m.score;
      const out = reverse ? m.line.reverse() : m.line;
      out.forEach((v, j) => {
        if (vertical) this.board[j][i] = v;
        else this.board[i][j] = v;
      });
    }
    if (before === JSON.stringify(this.board)) return;
    this.spawn();
    this.hooks.onChange();
    this.hooks.onMove();
    if (
      this.board.every((r, y) =>
        r.every((v, x) => v && v !== r[x + 1] && v !== this.board[y + 1]?.[x]),
      )
    )
      this.end();
  }
}
