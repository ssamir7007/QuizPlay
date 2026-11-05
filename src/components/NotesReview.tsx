import React, { useEffect, useRef, useState } from "react";

export function NotesReview({ notes }: { notes: string }) {
  const [points, setPoints] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);

  async function generate() {
    if (active.current || points.length) return;
    const controller = new AbortController();
    active.current = controller;
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/summarize-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notesText: notes }),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw Error(data?.error || "Your study summary could not be generated.");
      if (!Array.isArray(data) || !data.length || !data.every(p => typeof p === "string" && p.trim()))
        throw Error("The summary was incomplete. Please retry.");
      setPoints(data);
    } catch (cause) {
      if (!controller.signal.aborted)
        setError(cause instanceof Error ? cause.message : "Could not load your summary.");
    } finally {
      active.current = null;
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  return <details className="notes-review" onToggle={event => {
    if (event.currentTarget.open && !error) void generate();
  }}>
    <summary>Review notes summary</summary>
    {loading && <p className="review-status" role="status">Preparing your study summary…</p>}
    {error && <p className="review-status" role="alert">{error} <button onClick={generate}>Retry</button></p>}
    {points.length > 0 && <ul>{points.map((point, index) => <li key={index}>{point}</li>)}</ul>}
  </details>;
}
