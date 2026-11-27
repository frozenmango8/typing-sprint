export type KeyEvent = {
  expected: string;
  ok: boolean;
  delayMs: number;
};

// Five characters is one word, the usual typing-test convention.
export function wpm(correctChars: number, elapsedMs: number): number {
  if (correctChars <= 0 || elapsedMs <= 0) return 0;
  return Math.round(correctChars / 5 / (elapsedMs / 60_000));
}

export function accuracy(correct: number, incorrect: number): number {
  const total = correct + incorrect;
  if (total <= 0) return 100;
  return Math.round((correct / total) * 100);
}

export function tally(events: { ok: boolean }[]): { correct: number; incorrect: number } {
  let correct = 0;
  for (const event of events) if (event.ok) correct += 1;
  return { correct, incorrect: events.length - correct };
}

// Shifted characters belong to the US QWERTY key that types them.
const SHIFTED: Record<string, string> = {
  "~": "`",
  "!": "1",
  "@": "2",
  "#": "3",
  "$": "4",
  "%": "5",
  "^": "6",
  "&": "7",
  "*": "8",
  "(": "9",
  ")": "0",
  "_": "-",
  "+": "=",
  "{": "[",
  "}": "]",
  ":": ";",
  '"': "'",
  "<": ",",
  ">": ".",
  "?": "/",
  "|": "\\",
};

export function keyId(ch: string): string {
  if (ch >= "A" && ch <= "Z") return ch.toLowerCase();
  if (ch >= "a" && ch <= "z") return ch;
  return SHIFTED[ch] ?? ch;
}

export type KeyStat = {
  key: string;
  hits: number;
  misses: number;
  avgDelayMs: number;
};

export function summarizeKeys(events: KeyEvent[]): KeyStat[] {
  const map = new Map<string, { hits: number; misses: number; delay: number }>();
  for (const event of events) {
    const key = keyId(event.expected);
    let row = map.get(key);
    if (!row) {
      row = { hits: 0, misses: 0, delay: 0 };
      map.set(key, row);
    }
    if (event.ok) {
      row.hits += 1;
      row.delay += event.delayMs;
    } else {
      row.misses += 1;
    }
  }
  const stats: KeyStat[] = [];
  for (const [key, row] of map) {
    stats.push({
      key,
      hits: row.hits,
      misses: row.misses,
      avgDelayMs: row.hits ? row.delay / row.hits : 0,
    });
  }
  return stats;
}

export function slowestKeys(stats: KeyStat[], limit = 3): KeyStat[] {
  return stats
    .filter((stat) => stat.hits >= 2)
    .sort((a, b) => b.avgDelayMs - a.avgDelayMs)
    .slice(0, limit);
}

export function missedKeys(stats: KeyStat[], limit = 3): KeyStat[] {
  return stats
    .filter((stat) => stat.misses > 0)
    .sort((a, b) => b.misses - a.misses)
    .slice(0, limit);
}
