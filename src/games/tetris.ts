import { Game, empty } from "./core.ts";
const shapes = [
  [[1, 1, 1, 1]],
  [
    [2, 2],
    [2, 2],
  ],
  [
    [0, 3, 0],
    [3, 3, 3],
  ],
  [
    [4, 0, 0],
    [4, 4, 4],
  ],
  [
    [0, 0, 5],
    [5, 5, 5],
  ],
  [
    [0, 6, 6],
    [6, 6, 0],
  ],
  [
    [7, 7, 0],
    [0, 7, 7],
  ],
];
export function collides(
  board: number[][],
  shape: number[][],
  x: number,
  y: number,
) {
  return shape.some((r, i) =>
    r.some(
      (v, j) =>
        v &&
        (x + j < 0 ||
          x + j >= 10 ||
          y + i >= 20 ||
          (y + i >= 0 && board[y + i][x + j] !== 0)),
    ),
  );
}
export function clearLines(board: number[][]) {
  const kept = board.filter((r) => r.includes(0)),
    lines = board.length - kept.length;
  return { lines, board: [...empty(lines, 10), ...kept] };
}
export class Tetris extends Game {
  shape: number[][] = [];
  x = 3;
  y = 0;
  lines = 0;
  bag: number[] = [];
  next() {
    if (!this.bag.length) {
      this.bag = [0, 1, 2, 3, 4, 5, 6];
    }
    const id = this.bag.splice(
      Math.floor(Math.random() * this.bag.length),
      1,
    )[0];
    this.shape = shapes[id];
    this.y = 0;
    this.x = Math.floor((10 - this.shape[0].length) / 2);
  }
  start() {
    this.score = 0;
    this.lines = 0;
    this.bag = [];
    this.board = empty(20, 10);
    this.next();
    this.resume();
    this.hooks.onChange();
  }
  resume() {
    super.resume();
    clearInterval(this.timer);
    this.timer = setInterval(
      () => this.input("ArrowDown"),
      Math.max(120, 780 - 35 * Math.floor(this.lines / 4)),
    );
  }
  getBoard() {
    const b = this.board.map((r) => r.slice());
    this.shape.forEach((r, i) =>
      r.forEach((v, j) => {
        if (v) b[this.y + i][this.x + j] = v;
      }),
    );
    return b;
  }
  input(key: string) {
    if (this.paused) return;
    if (key === "ArrowLeft" || key === "ArrowRight") {
      const x = this.x + (key === "ArrowLeft" ? -1 : 1);
      if (!collides(this.board, this.shape, x, this.y)) this.x = x;
    } else if (key === "ArrowUp") {
      const rot = this.shape[0].map((_, j) =>
        this.shape.map((r) => r[j]).reverse(),
      );
      for (const dx of [0, -1, 1, -2, 2])
        if (!collides(this.board, rot, this.x + dx, this.y)) {
          this.shape = rot;
          this.x += dx;
          break;
        }
    } else if (key === "ArrowDown" || key === " ") {
      if (key === " ")
        while (!collides(this.board, this.shape, this.x, this.y + 1)) {
          this.y++;
          this.score += 2;
        }
      if (!collides(this.board, this.shape, this.x, this.y + 1)) this.y++;
      else {
        const cleared = clearLines(this.getBoard());
        this.board = cleared.board;
        this.lines += cleared.lines;
        this.score += [0, 100, 300, 500, 800][cleared.lines];
        this.next();
        this.hooks.onMove();
        if (collides(this.board, this.shape, this.x, this.y)) this.end();
        else if (!this.paused) this.resume();
      }
    } else return;
    this.hooks.onChange();
  }
}
