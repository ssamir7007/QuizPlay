import React, { useRef, useState } from "react";
import { ArcadeArt, GameArt, Icon } from "./Art";
import { readNotes } from "../services/readNotes";
import type { GameName } from "../games/core";
export type Settings = { game: GameName; frequency: number; hearts: number };
type Props = {
  settings: Settings;
  setSettings: (s: Settings) => void;
  notes: string;
  setNotes: (s: string) => void;
  deckSize: number;
  onStart: () => void;
  busy: boolean;
  error: string;
  setError: (s: string) => void;
  onReview: () => void;
};
export function Lobby(p: Props) {
  const [tab, tabTo] = useState<"file" | "text">("file"),
    [filename, fileTo] = useState(""),
    [drag, dragTo] = useState(false),
    [reading, readingTo] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  async function load(f?: File) {
    if (!f || reading) return;
    readingTo(true);
    p.setError("");
    try {
      const text = await readNotes(f);
      if (!text.trim())
        throw Error("No readable text found. Try pasting your notes.");
      p.setNotes(text);
      fileTo(f.name);
    } catch (e) {
      p.setError(e instanceof Error ? e.message : "Could not read this file.");
    } finally {
      readingTo(false);
      if (file.current) file.current.value = "";
    }
  }
  const counter = (
    key: "frequency" | "hearts",
    label: string,
    help: string,
    max: number,
  ) => (
    <div className="counter">
      <div>
        <strong>{label}</strong>
        <small>{help}</small>
      </div>
      <div className="stepper">
        <button
          aria-label={"Decrease " + label}
          disabled={p.settings[key] <= 1}
          onClick={() =>
            p.setSettings({ ...p.settings, [key]: p.settings[key] - 1 })
          }
        >
          −
        </button>
        <output>{p.settings[key]}</output>
        <button
          aria-label={"Increase " + label}
          disabled={p.settings[key] >= max}
          onClick={() =>
            p.setSettings({ ...p.settings, [key]: p.settings[key] + 1 })
          }
        >
          +
        </button>
      </div>
    </div>
  );
  return (
    <>
      <section className="hero">
        <div className="heroCopy">
          <div className="eyebrow status">
            <i /> SYSTEM ONLINE
          </div>
          <h1>
            Study <em>arcade.</em>
          </h1>
          <p>Your notes become questions. Your moves keep you in the game.</p>
        </div>
        <ArcadeArt />
      </section>
      <div className="sectionlabel">
        <span className="pixelplus">✦</span> SESSION SETUP <i />
      </div>
      <div className="setup">
        <section className="panel notes">
          <div className="panelhead">
            <span className="badge lavender">
              <Icon name="deck" size={22} />
            </span>
            <div>
              <div className="eyebrow">STEP 01</div>
              <h2>Study material</h2>
            </div>
          </div>
          <p className="subtitle">Add the notes you want to practice.</p>
          <div className="tabs">
            <button
              className={tab === "file" ? "active" : ""}
              onClick={() => tabTo("file")}
            >
              <Icon name="upload" size={15} />
              Upload file
            </button>
            <button
              className={tab === "text" ? "active" : ""}
              onClick={() => tabTo("text")}
            >
              <Icon name="text" size={15} />
              Paste text
            </button>
          </div>
          {tab === "file" ? (
            <button
              disabled={reading || p.busy}
              className={"drop " + (drag ? "drag" : "")}
              onDragOver={(e) => {
                e.preventDefault();
                dragTo(true);
              }}
              onDragLeave={() => dragTo(false)}
              onDrop={(e) => {
                e.preventDefault();
                dragTo(false);
                void load(e.dataTransfer.files[0]);
              }}
              onClick={() => file.current?.click()}
            >
              <span className="uploadicon">
                <Icon name="upload" size={25} />
              </span>
              <strong>
                {reading
                  ? "Reading notes…"
                  : filename || "Drop your notes here"}
              </strong>
              <span>
                {filename ? (
                  "Click to choose another file"
                ) : (
                  <>
                    or <u>browse files</u>
                  </>
                )}
              </span>
              <small>TXT &nbsp;·&nbsp; MD &nbsp;·&nbsp; PDF</small>
            </button>
          ) : (
            <textarea
              aria-label="Study notes"
              className="notestext"
              placeholder="Paste your study notes here…"
              value={p.notes}
              onChange={(e) => {
                p.setNotes(e.target.value);
                fileTo("");
              }}
            />
          )}
          <input
            type="file"
            accept=".txt,.md,.pdf"
            hidden
            ref={file}
            onChange={(e) => void load(e.target.files?.[0])}
          />
          <div className="sample">
            <span className="sample-icon">
              <Icon name="bolt" />
            </span>
            <div>
              <strong>
                {p.deckSize ? "Saved question deck" : "Just exploring?"}
              </strong>
              <small>
                {p.deckSize
                  ? p.deckSize + " questions ready to play"
                  : "Try a round with the sample deck."}
              </small>
            </div>
            <button
              aria-label={p.deckSize ? "Review deck" : "Use sample deck"}
              onClick={
                p.deckSize
                  ? p.onReview
                  : () => {
                      p.setNotes("Sample astronomy notes");
                      fileTo("Sample astronomy notes");
                      tabTo("file");
                      p.setError("");
                    }
              }
            >
              <Icon name="arrow" />
            </button>
          </div>
        </section>
        <section className="panel">
          <div className="panelhead">
            <span className="badge mint">
              <Icon name="sliders" size={22} />
            </span>
            <div>
              <div className="eyebrow">STEP 02</div>
              <h2>Game settings</h2>
            </div>
          </div>
          <p className="subtitle">Pick your puzzle and set the challenge.</p>
          <div className="eyebrow gamelabel">SELECT GAME</div>
          <div className="choices">
            {(["2048", "Tetris", "Snake"] as GameName[]).map((g) => (
              <button
                aria-pressed={p.settings.game === g}
                className={
                  "choice " + (p.settings.game === g ? "selected" : "")
                }
                onClick={() => p.setSettings({ ...p.settings, game: g })}
                key={g}
              >
                <b className="radio" />
                <GameArt name={g} />
                <strong>{g}</strong>
              </button>
            ))}
          </div>
          {counter(
            "frequency",
            "Quiz frequency",
            "Moves between questions",
            50,
          )}
          {counter("hearts", "Starting hearts", "Chances per run", 9)}
        </section>
      </div>
      {p.error && (
        <div role="alert" className="error">
          {p.error}{" "}
          <button
            onClick={
              p.notes.trim() || p.deckSize
                ? p.onStart
                : () =>
                    tab === "file"
                      ? file.current?.click()
                      : document.querySelector("textarea")?.focus()
            }
          >
            Retry
          </button>
        </div>
      )}
      <div className="launch">
        <div>
          <div className="eyebrow">SESSION PREVIEW</div>
          <div className="summary">
            <span>
              <Icon name="game" />
              {p.settings.game}
            </span>
            <span>
              <Icon name="bolt" />
              Every {p.settings.frequency}{" "}
              {p.settings.frequency === 1 ? "move" : "moves"}
            </span>
            <span>
              <Icon name="heart" />
              {p.settings.hearts} {p.settings.hearts === 1 ? "heart" : "hearts"}
            </span>
          </div>
        </div>
        <button
          className="primary"
          disabled={p.busy || reading}
          onClick={p.onStart}
        >
          <Icon name="play" size={16} />
          {p.busy ? "Preparing deck…" : "Start session"}
          <Icon name="arrow" size={17} />
        </button>
      </div>
    </>
  );
}
