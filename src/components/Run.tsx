import React, { useEffect, useRef, useState } from "react";
import type { Game } from "../games/core";
import { Tiles } from "../games/2048";
import { Tetris } from "../games/tetris";
import { Snake } from "../games/snake";
import { Deck } from "../services/deck";
import type { Question } from "../services/questions";
import type { Settings } from "./Lobby";
import { Icon } from "./Art";
export type Format = "Multiple choice" | "Mixed practice";
type Prompt = {
  question: Question;
  kind: "choice" | "boolean" | "blank";
  claim: number;
};
export function Run({
  settings: s,
  questions,
  format,
  exit,
}: {
  settings: Settings;
  questions: Question[];
  format: Format;
  exit: () => void;
}) {
  const engine = useRef<Game | null>(null),
    deck = useRef<Deck | null>(null),
    count = useRef(0),
    pendingEnd = useRef(false),
    quizActive = useRef(false),
    turn = useRef(0),
    touch = useRef([0, 0]);
  const [, render] = useState(0),
    [life, hearts] = useState(s.hearts),
    [prompt, ask] = useState<Prompt | null>(null),
    [feedback, mark] = useState<{ right: boolean; pick: string } | null>(null),
    [typed, type] = useState(""),
    [over, end] = useState(false),
    [paused, pause] = useState(false),
    [log, record] = useState<{ q: Question; right: boolean }[]>([]);
  useEffect(() => {
    deck.current = new Deck(questions);
    const g = new { "2048": Tiles, Tetris, Snake }[s.game]({
      onChange: () => render((n) => n + 1),
      onEnd: () => {
        pendingEnd.current = true;
        if (!quizActive.current) end(true);
      },
      onMove: () => {
        count.current++;
        if (count.current % s.frequency === 0) {
          g.pause();
          quizActive.current = true;
          const q = deck.current!.draw();
          const kind =
            format === "Mixed practice"
              ? (["choice", "boolean", "blank"] as const)[turn.current++ % 3]
              : "choice";
          ask({
            question: q,
            kind,
            claim: Math.random() < 0.5 ? q.answer : (q.answer + 1) % 4,
          });
          mark(null);
          type("");
        }
      },
    });
    engine.current = g;
    g.start();
    function key(e: KeyboardEvent) {
      if (
        !g.paused &&
        ["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " "].includes(e.key)
      ) {
        e.preventDefault();
        g.input(e.key);
      }
    }
    const hide = () => {
      if (document.hidden && !g.paused) {
        g.pause();
        pause(true);
      }
    };
    document.addEventListener("keydown", key);
    document.addEventListener("visibilitychange", hide);
    return () => {
      g.pause();
      document.removeEventListener("keydown", key);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [s, questions, format]);
  const g = engine.current,
    board = g?.getBoard() ?? [],
    score = g?.getScore() ?? 0;
  function answer(right: boolean, pick: string) {
    if (!prompt || feedback) return;
    mark({ right, pick });
    record([...log, { q: prompt.question, right }]);
    if (!right) {
      hearts(life - 1);
      deck.current!.missed(prompt.question);
    }
  }
  function next() {
    ask(null);
    quizActive.current = false;
    if (!life || pendingEnd.current) end(true);
    else g?.resume();
  }
  if (over) {
    const missed = log.filter((a) => !a.right);
    return (
      <section className="result panel">
        <div className="eyebrow">RUN COMPLETE</div>
        <h1>Game over.</h1>
        <div className="metrics">
          {[
            [score, "Score"],
            [log.length, "Answered"],
            [
              log.length
                ? Math.round(
                    ((log.length - missed.length) * 100) / log.length,
                  ) + "%"
                : "—",
              "Accuracy",
            ],
          ].map(([n, t]) => (
            <div key={t}>
              <strong>{n}</strong>
              <small>{t}</small>
            </div>
          ))}
        </div>
        <h2>Missed questions</h2>
        {missed.length ? (
          missed.map(({ q }, i) => (
            <article key={i}>
              <b>{q.q}</b>
              <p>
                {q.options[q.answer]} · {q.why}
              </p>
              <small>{q.source || "No source provided."}</small>
            </article>
          ))
        ) : (
          <p>No missed questions this run.</p>
        )}
        <button className="primary" onClick={exit}>
          Back to arcade
        </button>
      </section>
    );
  }
  const q = prompt?.question;
  return (
    <section className="playpanel panel">
      <div className="playhead">
        <div>
          <div className="eyebrow">NOW PLAYING</div>
          <h2>{s.game}</h2>
        </div>
        <button
          className="plain"
          disabled={!!prompt || paused}
          onClick={() => {
            g?.pause();
            pause(true);
          }}
        >
          Pause
        </button>
      </div>
      <div className="hud">
        <span>
          Score <b>{score}</b>
        </span>
        <span>
          Quiz in <b>{s.frequency - (count.current % s.frequency)}</b>
        </span>
        <span>
          ♥ <b>{life}</b>
        </span>
      </div>
      <div
        className={"board b" + s.game}
        style={{
          gridTemplateColumns: "repeat(" + (board[0]?.length || 4) + ",1fr)",
        }}
        onTouchStart={(e) =>
          (touch.current = [e.touches[0].clientX, e.touches[0].clientY])
        }
        onTouchEnd={(e) => {
          const x = e.changedTouches[0].clientX - touch.current[0],
            y = e.changedTouches[0].clientY - touch.current[1];
          if (Math.max(Math.abs(x), Math.abs(y)) > 20)
            g?.input(
              Math.abs(x) > Math.abs(y)
                ? x < 0
                  ? "ArrowLeft"
                  : "ArrowRight"
                : y < 0
                  ? "ArrowUp"
                  : "ArrowDown",
            );
        }}
      >
        {board.flatMap((row, y) =>
          row.map((v, x) => (
            <div
              key={y * row.length + x}
              className={
                "cell v" +
                (s.game === "2048" && v ? Math.min(7, Math.log2(v)) : v)
              }
            >
              {s.game === "2048" && v ? v : ""}
            </div>
          )),
        )}
      </div>
      <div className="controls">
        {[
          ["←", "ArrowLeft"],
          [s.game === "Tetris" ? "↻" : "↑", "ArrowUp"],
          ["↓", "ArrowDown"],
          ["→", "ArrowRight"],
          ...(s.game === "Tetris" ? [["Drop", " "]] : []),
        ].map(([l, k]) => (
          <button
            aria-label={
              k === " "
                ? "Hard drop"
                : k === "ArrowUp" && s.game === "Tetris"
                  ? "Rotate"
                  : k
            }
            key={k}
            onClick={() => g?.input(k)}
          >
            {l}
          </button>
        ))}
      </div>
      <small className="instructions">
        {s.game === "2048"
          ? "Swipe or use the arrows to merge matching tiles."
          : s.game === "Tetris"
            ? "Arrows to move · Up to rotate · Space to hard drop"
            : "Use the arrows to collect food and avoid the walls."}
      </small>
      {paused && (
        <div className="overlay">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Game paused"
            className="dialog"
          >
            <div className="eyebrow">TIME OUT</div>
            <h2>Game paused</h2>
            <button
              autoFocus
              className="primary"
              onClick={() => {
                pause(false);
                g?.resume();
              }}
            >
              Resume game
            </button>{" "}
            <button
              className="plain"
              onClick={() => {
                pause(false);
                end(true);
              }}
            >
              End run
            </button>
          </div>
        </div>
      )}
      {prompt && q && (
        <div className="overlay">
          <div
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Quiz break"
          >
            <div className="eyebrow">QUIZ BREAK &nbsp; / &nbsp; {life} ♥</div>
            <h2>{q.q}</h2>
            {prompt.kind === "boolean" && (
              <p>
                Proposed answer: <b>{q.options[prompt.claim]}</b>. True or
                false?
              </p>
            )}
            {prompt.kind === "blank" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (typed.trim())
                    answer(
                      typed.trim().toLowerCase() ===
                        q.options[q.answer].trim().toLowerCase(),
                      typed,
                    );
                }}
              >
                <label>
                  Fill in the answer
                  <input
                    autoFocus
                    value={typed}
                    disabled={!!feedback}
                    onChange={(e) => type(e.target.value)}
                  />
                </label>
                <button
                  className="plain"
                  disabled={!!feedback || !typed.trim()}
                >
                  Check answer
                </button>
              </form>
            ) : (
              (prompt.kind === "boolean" ? ["True", "False"] : q.options).map(
                (opt, i) => {
                  const right =
                    prompt.kind === "boolean"
                      ? (i === 0) === (prompt.claim === q.answer)
                      : i === q.answer;
                  return (
                    <button
                      autoFocus={i === 0}
                      disabled={!!feedback}
                      className={
                        "option " +
                        (feedback
                          ? right
                            ? "right"
                            : feedback.pick === opt
                              ? "wrong"
                              : ""
                          : "")
                      }
                      key={i}
                      onClick={() => answer(right, opt)}
                    >
                      <code>{String.fromCharCode(65 + i)}</code>
                      {opt}
                    </button>
                  );
                },
              )
            )}
            {feedback && (
              <div
                role="status"
                className={"feedback " + (feedback.right ? "right" : "wrong")}
              >
                <b>{feedback.right ? "Correct!" : "One heart lost."}</b>
                <p>
                  {!feedback.right && (
                    <>Correct answer: {q.options[q.answer]}. </>
                  )}
                  {q.why}
                </p>
                <button autoFocus className="primary" onClick={next}>
                  {!life || pendingEnd.current
                    ? "View results"
                    : "Continue playing"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
