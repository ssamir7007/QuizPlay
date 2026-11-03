import files from "virtual:quizplay-assets";
import { generateQuizResponse } from "./generateQuiz.js";
import { generateHangmanResponse } from "./generateHangman.js";
export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === "/api/generate-quiz" || path === "/api/generate-hangman") {
      if (request.method !== "POST")
        return new Response("Use POST", {
          status: 405,
          headers: { Allow: "POST" },
        });
      let body;
      try {
        body = await request.json();
      } catch {
        return Response.json({ error: "Expected JSON." }, { status: 400 });
      }
      return path === "/api/generate-hangman" ? generateHangmanResponse(body, env) : generateQuizResponse(body, env);
    }
    const file = files[path === "/" ? "/index.html" : path];
    if (!Array.isArray(file))
      return new Response("Page not found", { status: 404 });
    return new Response(file[1], { headers: { "Content-Type": file[0] } });
  },
};
