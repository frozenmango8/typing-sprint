import type { KeyEvent } from "./metrics";
import { pickQuote } from "./quotes";
import { makeWords } from "./words";

export type Mode = "words" | "quotes";
export type Seconds = 15 | 30 | 60;

export const DURATIONS: Seconds[] = [15, 30, 60];

export type Stroke = KeyEvent & { at: number };

export type Session = {
  mode: Mode;
  seconds: Seconds;
  text: string;
  credit: string | null;
  events: Stroke[];
  startedAt: number | null;
  finishedAt: number | null;
};

const WORD_COUNT = 320;

export function createSession(mode: Mode, seconds: Seconds): Session {
  if (mode === "quotes") {
    const quote = pickQuote();
    return openSession(mode, seconds, quote.text, `${quote.author}, ${quote.work}`);
  }
  return openSession(mode, seconds, makeWords(WORD_COUNT));
}

export function openSession(
  mode: Mode,
  seconds: Seconds,
  text: string,
  credit: string | null = null,
): Session {
  return {
    mode,
    seconds,
    text,
    credit,
    events: [],
    startedAt: null,
    finishedAt: null,
  };
}

export function caret(session: Session): number {
  let n = 0;
  for (const event of session.events) if (event.ok) n += 1;
  return n;
}

export function showingError(session: Session): boolean {
  const last = session.events[session.events.length - 1];
  return !!last && !last.ok;
}

export function elapsedMs(session: Session, now: number): number {
  if (session.startedAt == null) return 0;
  const end = session.finishedAt ?? now;
  return Math.max(0, end - session.startedAt);
}

function expire(session: Session, now: number): boolean {
  if (session.finishedAt != null) return true;
  if (session.startedAt == null) return false;
  if (now - session.startedAt < session.seconds * 1000) return false;
  session.finishedAt = session.startedAt + session.seconds * 1000;
  return true;
}

export function tick(session: Session, now: number): boolean {
  if (session.finishedAt != null) return false;
  return expire(session, now);
}

export function typeChar(session: Session, ch: string, now: number): void {
  if (ch.length !== 1) return;
  if (session.finishedAt != null) return;
  if (expire(session, now)) return;
  const index = caret(session);
  if (index >= session.text.length) return;
  if (session.startedAt == null) session.startedAt = now;
  const expected = session.text[index];
  const ok = ch === expected;
  // A correct press is timed from the previous correct one, so the misses in
  // between count as time spent on that key.
  let since = session.startedAt;
  if (ok) {
    for (let i = session.events.length - 1; i >= 0; i--) {
      if (session.events[i].ok) {
        since = session.events[i].at;
        break;
      }
    }
  } else if (session.events.length) {
    since = session.events[session.events.length - 1].at;
  }
  session.events.push({
    expected,
    ok,
    delayMs: Math.max(0, now - since),
    at: now,
  });
  if (ok && caret(session) >= session.text.length) session.finishedAt = now;
}

export function backspace(session: Session): void {
  if (session.finishedAt != null) return;
  session.events.pop();
  if (session.events.length === 0) session.startedAt = null;
}
