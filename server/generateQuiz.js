import questions from "../src/data/questions.json" with { type: "json" };
// POST /api/generate-quiz: replace the fixture here with a backend-only provider call.
export async function generateQuizResponse(body, env) {
  if (typeof body?.notesText !== "string" || !body.notesText.trim()) {
    return Response.json({ error: "Add some notes first." }, { status: 400 });
  }
  // TODO: Use env.AI_API_KEY here and validate the provider response.
  return Response.json(questions);
}
