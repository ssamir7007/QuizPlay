import { summarizeNotesResponse } from "../server/summarizeNotes.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST to summarize notes." });
  }
  const result = await summarizeNotesResponse(req.body, process.env);
  res.setHeader("Cache-Control", "no-store");
  return res.status(result.status).json(await result.json());
}
