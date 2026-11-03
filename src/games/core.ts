export type GameName = "2048" | "Tetris" | "Snake";
export type Hooks = {
  onMove: () => void;
  onChange: () => void;
  onEnd: () => void;
};
export abstract class Game {
  board: number[][] = [];
  score = 0;
  paused = true;
  timer: ReturnType<typeof setInterval> | undefined;
  hooks: Hooks;
  constructor(hooks: Hooks) {
    this.hooks = hooks;
  }
  abstract start(): void;
  abstract input(key: string): void;
  pause() {
    this.paused = true;
    clearInterval(this.timer);
  }
  resume() {
    this.paused = false;
  }
  getScore() {
    return this.score;
  }
  getBoard() {
    return this.board;
  }
  end() {
    this.pause();
    this.hooks.onEnd();
  }
}
export const empty = (height: number, width: number): number[][] =>
  Array.from({ length: height }, () => Array(width).fill(0));
