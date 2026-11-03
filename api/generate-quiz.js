import { generateQuizResponse } from "../server/generateQuiz.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Use POST to generate a quiz." });
  }
  const result = await generateQuizResponse(request.body, process.env);
  response.setHeader("Cache-Control", "no-store");
  return response.status(result.status).json(await result.json());
}
