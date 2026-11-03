export function geminiKey(env) {
  return env.GEMINI_API_KEY || env.AI_API_KEY;
}

export async function requestQuestions(
  env,
  notes,
  instruction,
  schema,
  timeout = 180000,
) {
  const model = env.GEMINI_MODEL || "gemini-flash-latest";
  const endpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    encodeURIComponent(model) +
    ":generateContent";
  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": geminiKey(env),
    },
    signal: AbortSignal.timeout(timeout),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: instruction }] },
      contents: [{ role: "user", parts: [{ text: notes }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    }),
  });
}

export async function readQuestions(response) {
  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return JSON.parse(
    parts
      .filter((part) => !part.thought)
      .map((part) => part.text || "")
      .join(""),
  );
}
