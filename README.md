# QuizPlay

Turn study sessions into short puzzle runs. Upload TXT, Markdown, a text-based PDF, or a Word document (.doc or .docx), paste notes, or choose the sample deck. Document text is extracted in your browser. Starting a session sends that text to Gemini through the backend. The sample astronomy deck works offline.

## Run locally

Use Node.js 24 and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The development server includes the Express API. For a production build, run `npm run build` followed by `npm start`, then open http://localhost:3000. Run the unit tests with `npm test`.

## Playing

Choose 1–50 questions on setup or in **My deck**. The default is 12. **Regenerate deck** replaces the current questions only after the requested number is ready. If the notes are too short, lower the count or add more material.

Choose 1–50 moves between questions and 1–9 hearts. Start a session, review or edit the deck, then select **Play now**. The default quiz format is multiple choice. **Mixed practice** also offers true/false and typed answers using the same validated question data.

- **2048** uses arrows or swipes. Only board-changing moves count.
- **Tetris** uses arrows to move, Up to rotate, and Space to hard drop. Each locked piece counts.
- **Snake** uses arrows to steer. Each forward step counts. On-screen controls are available for every game.

Quiz breaks pause all game timers. Missed questions return after up to two intervening prompts. Settings, theme, format, and the editable deck persist in localStorage. Refreshing starts a new run. End a run from the pause menu to see scores and missed-question sources.

## Connecting the AI API

Set AI_API_KEY in the private Site runtime secrets for hosted play. For local development, copy .env.example to .env, fill in AI_API_KEY, and start Vite with `node --env-file=.env node_modules/vite/bin/vite.js`. For local production use `node --env-file=.env server/index.js` after building.

The browser calls POST /api/generate-quiz. The shared handler in server/generateQuiz.js sends the notes to Gemini, requests structured JSON and validates the question array. Set GEMINI_MODEL to override gemini-flash-latest. The sample deck bypasses the API.

## Hangman

Choose Hangman on the setup screen to spell answers from your notes. Each wrong letter draws one of six parts. Completing the figure, skipping, or submitting an incorrect whole answer costs one shared heart. A wrong whole answer leaves the figure unchanged and the round continues while hearts remain. Spaces and hyphens are revealed automatically. After each round, read the answer and explanation before continuing.

A solve earns 100 points plus 10 per unused part. Consecutive solves without a lost heart add 10 per round, up to 50 bonus points. A failed or skipped round earns zero and resets the streak. At zero hearts the run ends with accuracy and missed-question sources.

`POST /api/generate-hangman` accepts `{ notesText }` and requests about 15 short answers from Gemini. It retries an invalid deck once and needs at least five usable questions. It accepts the server secret `GEMINI_API_KEY` or the existing `AI_API_KEY`. With no key, local play uses the sample astronomy questions. Hangman saves its deck separately in localStorage. Game selection is available on the setup screen.

## Project layout

- `src/components/` — setup, game view, deck editor, and arcade artwork
- `src/games/` — independent engines sharing start, pause, resume, input, onMove, and getScore
- `src/services/` — quiz generator, validation, PDF extraction, and repeat scheduling
- `src/data/` — shared mock deck
- `server/` — local API and serverless adapter
- `tests/` — logic tests using the Node test runner


