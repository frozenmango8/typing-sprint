import type { Mode, Seconds } from "./session";

export type Run = {
  at: number;
  mode: Mode;
  seconds: Seconds;
  wpm: number;
  accuracy: number;
};

const KEY = "typing-sprint";
const LIMIT = 200;

function isRun(value: unknown): value is Run {
  if (!value || typeof value !== "object") return false;
  const run = value as Record<string, unknown>;
  return (
    typeof run.at === "number" &&
    (run.mode === "words" || run.mode === "quotes") &&
    (run.seconds === 15 || run.seconds === 30 || run.seconds === 60) &&
    typeof run.wpm === "number" &&
    Number.isFinite(run.wpm) &&
    typeof run.accuracy === "number" &&
    Number.isFinite(run.accuracy)
  );
}

export function loadRuns(): Run[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRun).slice(-LIMIT);
  } catch {
    // Private mode, or a value this page didn't write.
    return [];
  }
}

export function saveRun(run: Run): Run[] {
  const runs = [...loadRuns(), run].slice(-LIMIT);
  try {
    localStorage.setItem(KEY, JSON.stringify(runs));
  } catch {
    // Quota or private mode. The result is still on screen.
  }
  return runs;
}

export function bestWpm(runs: Run[], mode: Mode, seconds: Seconds): number | null {
  let best: number | null = null;
  for (const run of runs) {
    if (run.mode !== mode || run.seconds !== seconds) continue;
    if (best == null || run.wpm > best) best = run.wpm;
  }
  return best;
}
