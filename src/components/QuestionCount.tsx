import { MAX_QUESTIONS } from "../services/questions";

export type CountProps = { count: number; setCount: (value: number) => void };

export function QuestionCount({ count, setCount }: CountProps) {
  return (
    <label className="question-count">
      Number of questions
      <select value={count} onChange={event => setCount(Number(event.target.value))}>
        {Array.from({ length: MAX_QUESTIONS }, (_, i) => (
          <option key={i} value={i + 1}>{i + 1}</option>
        ))}
      </select>
    </label>
  );
}
