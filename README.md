# QuizPlay

Turn study sessions into short puzzle runs. Upload TXT, Markdown, or a text-based PDF, paste notes, or choose the sample deck. The demo always generates the same 12 astronomy questions. Notes and PDF parsing stay in the browser.

## Run locally

Use Node.js 24 and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The development server includes the Express API. For a production build, run `npm run build` followed by `npm start`, then open http://localhost:3000. Run the unit tests with `npm test`.

## Playing

Choose 1–50 moves between questions and 1–9 hearts. Start a session, review or edit the deck, then select **Play now**. The default quiz format is multiple choice. **Mixed practice** also offers true/false and typed answers using the same validated question data.

- **2048** uses arrows or swipes. Only board-changing moves count.
- **Tetris** uses arrows to move, Up to rotate, and Space to hard drop. Each locked piece counts.
- **Snake** uses arrows to steer. Each forward step counts. On-screen controls are available for every game.

Quiz breaks pause all game timers. Missed questions return after up to two intervening prompts. Settings, theme, format, and the editable deck persist in localStorage. Refreshing starts a new run. End a run from the pause menu to see scores and missed-question sources.

## Connecting the AI API

1. Copy `.env.example` to `.env` and set the blank `AI_API_KEY=` value when ready. Load this file into your **server** environment (for example, `node --env-file=.env server/index.js` after building). Configure the secret in the hosting environment for a deployed backend.
2. Edit `server/generateQuiz.js`, the shared handler for **POST /api/generate-quiz**. Replace its fixture return with your provider call using `env.AI_API_KEY`. The Express adapter lives in `server/api.js`; the private preview uses `server/worker.js`.
3. Edit `src/services/quizGenerator.ts`. Replace the mock delay and fixture with a JSON POST containing `{ notesText }` to that route. Check the HTTP status, parse the response, and keep the existing `validateQuestions(result)` check. Throw a helpful error to trigger the setup screen’s retry action.
4. Return a nonempty array matching the exported `Question` type in `src/services/questions.ts`. Each question has a prompt, four options, a zero-based correct index, an explanation, and optional source text. Supply an excerpt from the student’s notes as the source. Keep provider keys out of browser code and Vite-prefixed variables.

## Project layout

- `src/components/` — setup, game view, deck editor, and arcade artwork
- `src/games/` — independent engines sharing start, pause, resume, input, onMove, and getScore
- `src/services/` — quiz generator, validation, PDF extraction, and repeat scheduling
- `src/data/` — shared mock deck
- `server/` — local API and serverless adapter
- `tests/` — logic tests using the Node test runner

