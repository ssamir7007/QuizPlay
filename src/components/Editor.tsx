import React, { useState } from "react";
import { type Question, validateQuestions } from "../services/questions";
import type { Format } from "./Run";
export function Editor({
  deck,
  save,
  start,
  close,
  format,
  setFormat,
}: {
  deck: Question[];
  save: (q: Question[]) => void;
  start: () => void;
  close: () => void;
  format: Format;
  setFormat: (s: Format) => void;
}) {
  const [idx, edit] = useState(-1),
    [draft, set] = useState<Question | null>(null),
    [error, err] = useState("");
  return (
    <section className="panel editor">
      <div className="playhead">
        <div>
          <div className="eyebrow">DECK LIBRARY</div>
          <h2>
            My deck <small>({deck.length})</small>
          </h2>
        </div>
        <button className="plain" onClick={close}>
          Back to setup
        </button>
      </div>
      {!deck.length ? (
        <p>
          Add study notes or select the sample deck on the setup screen to
          create your first quiz.
        </p>
      ) : (
        <>
          <p>
            Review your questions before you play.
          </p>
          <label>
            Question format{" "}
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as Format)}
            >
              <option>Multiple choice</option>
              <option>Mixed practice</option>
            </select>
          </label>
          <small>
            Mixed practice rotates multiple choice, true/false, and
            fill-in-the-blank prompts.
          </small>
          <button className="primary" disabled={idx >= 0} onClick={start}>
            Play now →
          </button>
        </>
      )}
      {deck.map((q, i) => (
        <article key={i}>
          {idx === i && draft ? (
            <>
              <label>
                Question
                <input
                  value={draft.q}
                  onChange={(e) => set({ ...draft, q: e.target.value })}
                />
              </label>
              {draft.options.map((opt, j) => (
                <label key={j}>
                  Option {j + 1}
                  <input
                    value={opt}
                    onChange={(e) => {
                      const options = [...draft.options] as Question["options"];
                      options[j] = e.target.value;
                      set({ ...draft, options });
                    }}
                  />
                </label>
              ))}
              <label>
                Correct option
                <select
                  value={draft.answer}
                  onChange={(e) =>
                    set({
                      ...draft,
                      answer: Number(e.target.value) as Question["answer"],
                    })
                  }
                >
                  {draft.options.map((_, j) => (
                    <option key={j} value={j}>
                      {j + 1}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Explanation
                <textarea
                  value={draft.why}
                  onChange={(e) => set({ ...draft, why: e.target.value })}
                />
              </label>
              <label>
                Source
                <input
                  value={draft.source || ""}
                  onChange={(e) => set({ ...draft, source: e.target.value })}
                />
              </label>
              {error && <p role="alert">{error}</p>}
              <button
                className="plain"
                onClick={() => {
                  if (!validateQuestions([draft])) {
                    err(
                      "Complete the question, four options, and explanation.",
                    );
                    return;
                  }
                  save(deck.map((old, n) => (n === i ? draft : old)));
                  edit(-1);
                }}
              >
                Save changes
              </button>{" "}
              <button className="plain" onClick={() => edit(-1)}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <strong>
                {i + 1}. {q.q}
              </strong>
              <small>Answer · {q.options[q.answer]}</small>
              <div>
                <button
                  className="link"
                  onClick={() => {
                    edit(i);
                    set(structuredClone(q));
                    err("");
                  }}
                >
                  Edit
                </button>
                <button
                  className="link"
                  onClick={() => {
                    edit(-1);
                    save(deck.filter((_, n) => i !== n));
                  }}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </article>
      ))}
    </section>
  );
}

