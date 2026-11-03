import { Game, empty } from "./core.ts";
export class Snake extends Game {
  body: number[][] = [];
  dir = [1, 0];
  pending = [1, 0];
  food = 0;
  spawn() {
    const free = Array.from({ length: 144 }, (_, i) => i).filter(
      (i) => !this.body.some(([x, y]) => x + y * 12 === i),
    );
    this.food = free[Math.floor(Math.random() * free.length)] ?? -1;
  }
  start() {
    this.body = [
      [4, 6],
      [3, 6],
      [2, 6],
    ];
    this.dir = [1, 0];
    this.pending = [1, 0];
    this.score = 0;
    this.spawn();
    this.resume();
    this.hooks.onChange();
  }
  resume() {
    super.resume();
    clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), 420);
  }
  getBoard() {
    const b = empty(12, 12);
    this.body.forEach(([x, y], i) => (b[y][x] = i ? 2 : 6));
    if (this.food >= 0) b[Math.floor(this.food / 12)][this.food % 12] = 5;
    return b;
  }
  input(k: string) {
    if (this.paused) return;
    const d: Record<string, number[]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    if (d[k] && (d[k][0] !== -this.dir[0] || d[k][1] !== -this.dir[1]))
      this.pending = d[k];
  }
  tick() {
    if (this.paused) return;
    this.dir = this.pending;
    const x = this.body[0][0] + this.dir[0],
      y = this.body[0][1] + this.dir[1],
      eat = x + y * 12 === this.food;
    if (
      x < 0 ||
      x >= 12 ||
      y < 0 ||
      y >= 12 ||
      (eat ? this.body : this.body.slice(0, -1)).some(
        (p) => p[0] === x && p[1] === y,
      )
    ) {
      this.end();
      return;
    }
    this.body.unshift([x, y]);
    if (eat) {
      this.score += 10;
      this.spawn();
    } else this.body.pop();
    this.hooks.onMove();
    this.hooks.onChange();
    if (this.food < 0) this.end();
  }
}
