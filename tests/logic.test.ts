import test from "node:test";
import assert from "node:assert/strict";
import { merge } from "../src/games/2048.ts";
import { clearLines, collides } from "../src/games/tetris.ts";
import { empty } from "../src/games/core.ts";
import { validateQuestions } from "../src/services/questions.ts";
test("merge each pair once and count points", () => {
  assert.deepEqual(merge([2, 2, 2, 2]), { line: [4, 4, 0, 0], score: 8 });
  assert.deepEqual(merge([2, 0, 2, 4]), { line: [4, 4, 0, 0], score: 4 });
});
test("clear two rows, keeping other cells in order", () => {
  const b = empty(20, 10);
  b[19].fill(1);
  b[18].fill(2);
  b[17][3] = 4;
  const result = clearLines(b);
  assert.equal(result.lines, 2);
  assert.equal(result.board[19][3], 4);
  assert.equal(result.board.length, 20);
});
test("pieces collide with walls, floor and occupied cells", () => {
  const b = empty(20, 10);
  b[19][4] = 2;
  for (const [x, y] of [
    [-1, 0],
    [10, 0],
    [4, 19],
    [3, 20],
  ])
    assert.equal(collides(b, [[1]], x, y), true);
  assert.equal(collides(b, [[1]], 4, 18), false);
});
test("validate question fields and reject malformed decks", () => {
  const q = {
    q: "Question?",
    options: ["a", "b", "c", "d"],
    answer: 0,
    why: "Because.",
  };
  assert.ok(validateQuestions([q]));
  for (const data of [
    [],
    null,
    [{ ...q, answer: 4 }],
    [{ ...q, options: ["a"] }],
    [{ ...q, source: 4 }],
    [{ ...q, why: " " }],
  ])
    assert.equal(validateQuestions(data), false);
});
