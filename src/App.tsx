import React, { useEffect, useState } from "react";
import { Lobby, type Settings } from "./components/Lobby";
import { Icon, Pad } from "./components/Art";
import { Editor } from "./components/Editor";
import { Run, type Format } from "./components/Run";
import { generateQuiz } from "./services/quizGenerator";
import { DEFAULT_QUESTION_COUNT, validCount, validateQuestions, type Question } from "./services/questions";
import "./style.css";
function read(key: string) {
  try {
    return JSON.parse(localStorage.getItem("quizplay." + key) || "null");
  } catch {
    return null;
  }
}
function useSaved<T>(key: string, initial: () => T) {
  const [v, set] = useState<T>(initial);
  useEffect(() => {
    try {
      localStorage.setItem("quizplay." + key, JSON.stringify(v));
    } catch {
      /* Storage can be disabled by the browser. */
    }
  }, [v, key]);
  return [v, set] as const;
}
function settings(): Settings {
  const s = read("settings");
  const bounded = (n: number, max: number, def: number) =>
    Number.isInteger(n) && n >= 1 && n <= max ? n : def;
  return {
    game: ["2048", "Tetris", "Snake"].includes(s?.game) ? s.game : "2048",
    hearts: bounded(s?.hearts, 9, 3),
    frequency: bounded(s?.frequency, 50, 5),
  };
}
export default function App() {
  const [page, go] = useState<"setup" | "deck" | "play">("setup"),
    [cfg, configure] = useSaved("settings", settings);
  const [error, fail] = useState(() => {
    const d = read("deck");
    return d !== null &&
      !(Array.isArray(d) && d.length === 0) &&
      !validateQuestions(d)
      ? "Your saved deck could not be read. Add notes to generate it again."
      : "";
  });
  const [deck, save] = useSaved<Question[]>("deck", () => {
      const d = read("deck");
      return validateQuestions(d) ? d : [];
    }),
    [dark, theme] = useSaved("dark", () => read("dark") === true),
    [format, setFormat] = useSaved<Format>("format", () =>
      read("format") === "Mixed practice"
        ? "Mixed practice"
        : "Multiple choice",
    );
  const [notes, write] = useState(""),
    [sourceNotes, setSourceNotes] = useState(""),
    [busy, loading] = useState(false);
  const [count, setCount] = useSaved("count", () => {
    const stored = read("count");
    return validCount(stored) ? stored : DEFAULT_QUESTION_COUNT;
  });
  const isSample = deck.length > 0 && deck.every(q => q.source?.startsWith("Sample astronomy notes ·"));
  const savedExcerpts = [...new Set(deck.map(q => q.source?.trim()).filter(Boolean))].join("\n\n");
  const deckSource = sourceNotes || (isSample ? "Sample astronomy notes" : savedExcerpts);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  async function generate(input: string) {
    if (busy) return;
    if (!input.trim() && deck.length) {
      go("deck");
      return;
    }
    loading(true);
    fail("");
    try {
      const result = await generateQuiz(input, count);
      if (!validateQuestions(result))
        throw Error("Invalid quiz data. Please retry.");
      save(result);
      setSourceNotes(input);
      write("");
      go("deck");
    } catch (e) {
      fail(
        e instanceof Error
          ? e.message
          : "Could not prepare your deck. Please retry.",
      );
    } finally {
      loading(false);
    }
  }
  return (
    <>
      <header>
        <div className="topbar">
          <div className="brand">
            <Pad />
            Quiz<span>Play</span>
          </div>
          <nav>
            {page !== "play" && (
              <>
                <button
                  className={page === "setup" ? "current" : ""}
                  disabled={busy}
                  onClick={() => go("setup")}
                >
                  <Icon name="game" />
                  Arcade
                </button>
                <button
                  className={page === "deck" ? "current" : ""}
                  disabled={busy}
                  onClick={() => go("deck")}
                >
                  <Icon name="deck" />
                  My deck
                </button>
              </>
            )}
            <button
              className="theme"
              aria-label={"Switch to " + (dark ? "light" : "dark") + " mode"}
              onClick={() => theme(!dark)}
            >
              <Icon name={dark ? "sun" : "moon"} />
            </button>
          </nav>
        </div>
      </header>
      <main>
        {page === "setup" ? (
          <Lobby
            settings={cfg}
            setSettings={configure}
            notes={notes}
            setNotes={write}
            deckSize={deck.length}
            count={count}
            setCount={setCount}
            onStart={() => generate(notes)}
            busy={busy}
            error={error}
            setError={fail}
            onReview={() => go("deck")}
          />
        ) : page === "deck" ? (
          <Editor
            count={count}
            setCount={setCount}
            busy={busy}
            generationError={error}
            hasSource={Boolean(notes.trim() || deckSource)}
            excerptsOnly={!notes.trim() && !sourceNotes && !isSample && Boolean(savedExcerpts)}
            regenerate={() => generate(notes.trim() ? notes : deckSource)}
            deck={deck}
            save={save}
            close={() => go("setup")}
            start={() => go("play")}
            format={format}
            setFormat={setFormat}
          />
        ) : (
          <Run
            settings={cfg}
            questions={deck}
            format={format}
            exit={() => go("setup")}
          />
        )}
      </main>
      <footer>
        <span>QUIZPLAY</span>
        <span>
          <i /> LOCAL SAVE ENABLED
        </span>
      </footer>
    </>
  );
}
