import React, { useEffect, useReducer, useState } from "react";
import { Hangman } from "../games/hangman";
import {
  normalizeAnswer,
  type HangmanQuestion,
} from "../services/hangmanQuestions";

const alphabet = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
const parts = [
  <circle cx="90" cy="35" r="11" />,
  <path d="M90 46v36" />,
  <path d="M90 52L72 68" />,
  <path d="M90 52l18 16" />,
  <path d="M90 82l-17 26" />,
  <path d="M90 82l17 26" />,
];
export function Figure({ wrong }: { wrong: number }) {
  return (
    <svg
      className="hm-figure"
      viewBox="0 0 138 126"
      role="img"
      aria-label={`Hangman figure: ${wrong} of 6 parts`}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      >
        <path opacity=".55" d="M8 116h54M30 116V8h60v16M30 30L52 8" />
        {parts.slice(0, wrong).map((part, i) => (
          <g key={i}>{part}</g>
        ))}
      </g>
    </svg>
  );
}

export function HangmanRun({
  questions,
  hearts,
  exit,
}: {
  questions: HangmanQuestion[];
  hearts: number;
  exit: () => void;
}) {
  const [game] = useState(() => {
    const engine = new Hangman(questions, hearts);
    engine.start();
    return engine;
  });
  const [, update] = useReducer((n) => n + 1, 0);
  const [answerOpen, openAnswer] = useState(false);
  const [typed, type] = useState("");
  const [notice, notify] = useState("");
  const [results, showResults] = useState(false);
  const wrong = game.wrongLetters;
  function letter(key: string) {
    game.guessLetter(key);
    notify("");
    update();
  }
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        !game.active ||
        answerOpen ||
        results ||
        e.ctrlKey ||
        e.altKey ||
        e.metaKey ||
        e.isComposing ||
        e.repeat ||
        (e.target instanceof Element &&
          e.target.closest("input, textarea, select, [contenteditable=true]"))
      )
        return;
      if (/^[a-z]$/i.test(e.key)) {
        e.preventDefault();
        game.guessLetter(e.key);
        notify("");
        update();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [game, answerOpen, results]);

  if (results) {
    const solved = game.history.filter(
      (entry) => entry.outcome === "solved",
    ).length;
    const missed = game.history.filter((entry) => entry.outcome !== "solved");
    return (
      <section className="panel result">
        <div className="eyebrow">HANGMAN · RUN COMPLETE</div>
        <h1>Game over.</h1>
        <div className="metrics">
          {[
            [game.getScore(), "Score"],
            [solved + " / " + game.history.length, "Questions solved"],
            [
              game.history.length
                ? Math.round((solved / game.history.length) * 100) + "%"
                : "—",
              "Accuracy",
            ],
          ].map(([v, label]) => (
            <div key={label}>
              <strong>{v}</strong>
              <small>{label}</small>
            </div>
          ))}
        </div>
        <h2>Missed questions</h2>
        {missed.length ? (
          missed.map(({ question: q }, i) => (
            <article key={i}>
              <b>{q.question}</b>
              <p>
                {q.answer}
                {q.why && " · " + q.why}
              </p>
              <small>{q.source || "No source provided."}</small>
            </article>
          ))
        ) : (
          <p>No missed questions.</p>
        )}
        <button className="primary" onClick={exit}>
          Back to arcade
        </button>
      </section>
    );
  }

  return (
    <section className="panel playpanel hangman">
      <div className="playhead">
        <div>
          <div className="eyebrow">NOW PLAYING</div>
          <h2>Hangman</h2>
        </div>
        {!game.outcome && (
          <button
            className="plain"
            onClick={() => {
              game.paused ? game.resume() : game.pause();
              update();
            }}
          >
            {game.paused ? "Resume" : "Pause"}
          </button>
        )}
      </div>
      <div className="hud">
        <span>
          Score <b>{game.score}</b>
        </span>
        <span>
          Round <b>{game.history.length + (game.outcome ? 0 : 1)}</b>
        </span>
        <span aria-label={game.hearts + " hearts"}>
          ♥ <b>{game.hearts}</b>
        </span>
      </div>
      <small>
        Wrong letters build the hangman. Finish the figure or guess the answer
        wrong and you lose a heart.
      </small>
      {game.paused ? (
        <div className="hm-pause">
          <h2>Game paused</h2>
          <button className="plain" onClick={() => showResults(true)}>
            End run
          </button>
        </div>
      ) : (
        <>
          <div className="hm-clue">
            <Figure wrong={wrong.length} />
            <div>
              <div className="eyebrow">SPELL THE ANSWER</div>
              <h2>{game.round.question}</h2>
            </div>
          </div>
          <div
            className="hm-blanks"
            aria-label={
              "Answer: " + game.blanks.join(" ").replaceAll("_", "blank")
            }
          >
            {game.blanks
              .join("")
              .split(" ")
              .map((word, i) => (
                <span key={i}>{word}</span>
              ))}
          </div>
          <div aria-live="polite" className="hm-tries">
            {6 - wrong.length} wrong guesses remaining · Wrong letters:{" "}
            {wrong.join(", ").toUpperCase() || "none"}
          </div>
          {game.outcome ? (
            <div
              role="status"
              className={
                "feedback " + (game.outcome === "solved" ? "right" : "wrong")
              }
            >
              <b>
                {game.outcome === "solved"
                  ? "Solved!"
                  : game.outcome === "skipped"
                    ? "Question skipped."
                    : "Round missed."}
              </b>
              <p>
                <strong>{game.round.answer}</strong>
              </p>
              <p>
                {game.round.why ||
                  game.round.source ||
                  "This term answers the question above."}
              </p>
              <button
                className="primary"
                onClick={() => {
                  if (game.over) showResults(true);
                  else game.continue();
                  notify("");
                  update();
                }}
              >
                {game.over ? "View results" : "Next question"}
              </button>
            </div>
          ) : (
            <>
              <div className="hm-keyboard" aria-label="Letter keyboard">
                {alphabet.map((c) => {
                  const used = game.guessed.has(c.toLowerCase());
                  const hit = used && !wrong.includes(c.toLowerCase());
                  const status = !used ? "" : hit ? "correct" : "wrong";
                  return (
                    <button
                      key={c}
                      disabled={used || answerOpen}
                      aria-label={status ? c + ", " + status : c}
                      className={used ? (hit ? "right" : "wrong") : ""}
                      onClick={() => letter(c)}
                    >
                      {c}
                      {used && <sup>{hit ? "✓" : "×"}</sup>}
                    </button>
                  );
                })}
              </div>
              <p aria-live="polite">{notice}</p>
              {answerOpen ? (
                <form
                  className="hm-answer"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!normalizeAnswer(typed)) return;
                    game.guessAnswer(typed);
                    if (!game.outcome)
                      notify(
                        "Incorrect answer. One heart lost. Keep guessing.",
                      );
                    type("");
                    openAnswer(false);
                    update();
                  }}
                >
                  <label>
                    Whole answer
                    <input
                      autoFocus
                      autoComplete="off"
                      value={typed}
                      onChange={(e) => type(e.target.value)}
                    />
                  </label>
                  <button
                    className="primary"
                    disabled={!normalizeAnswer(typed)}
                  >
                    Submit answer
                  </button>
                  <button
                    type="button"
                    className="plain"
                    onClick={() => {
                      type("");
                      openAnswer(false);
                    }}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="hm-actions">
                  <button className="primary" onClick={() => openAnswer(true)}>
                    Guess the answer
                  </button>
                  <button
                    className="plain"
                    onClick={() => {
                      game.skip();
                      notify("");
                      update();
                    }}
                  >
                    Skip question (−1 ♥)
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
