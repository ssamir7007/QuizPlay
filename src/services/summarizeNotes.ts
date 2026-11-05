// Choose representative passages across the document, keeping the author's wording.
export function summarizeNotes(notes: string): string[] {
  const seen = new Set<string>();
  const passages: string[] = [];
  for (const line of notes.split(/\r?\n/)) {
    const content = line.replace(/^\s*(?:#{1,6}\s+|[-*+]\s+|\d+[.)]\s+)/, "").trim();
    for (const sentence of content.split(/(?<=[.!?。！？])\s+/u)) {
      const text = sentence.replace(/\s+/g, " ").trim();
      const key = text.toLowerCase();
      if (text && !seen.has(key)) {
        passages.push(text);
        seen.add(key);
      }
    }
  }
  const count = Math.min(6, Math.ceil(Math.sqrt(passages.length)));
  const points: string[] = [];
  for (let i = 0; i < count; i++) {
    const section = passages.slice(Math.floor(i * passages.length / count), Math.floor((i + 1) * passages.length / count));
    const score = (line: string) => Math.min(line.length, 90) + (/[.!?:。！？]/u.test(line) ? 20 : 0);
    const point = section.reduce((best, next) => score(next) > score(best) ? next : best);
    const excerpt = point.slice(0, 320);
    points.push(point.length <= 320 ? point : (excerpt.replace(/\s+\S*$/, "") || excerpt) + "…");
  }
  return points;
}
