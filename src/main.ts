import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "./style.css";
import { accuracy, summarizeKeys, tally, wpm } from "./metrics";
import {
  backspace,
  caret,
  createSession,
  elapsedMs,
  showingError,
  tick,
  typeChar,
  type Mode,
  type Seconds,
} from "./session";
import { bestWpm, loadRuns, saveRun } from "./storage";
import { paintPassage, renderPassage, renderResult, renderStats, setPressed } from "./view";

const mount = document.querySelector<HTMLElement>("#app");
if (!mount) throw new Error("missing #app");
const root: HTMLElement = mount;

root.innerHTML = `
  <header>
    <h1>sprint</h1>
    <div class="settings">
      <div class="group" role="group" aria-label="Duration">
        <button type="button" data-seconds="15">15</button>
        <button type="button" data-seconds="30">30</button>
        <button type="button" data-seconds="60">60</button>
      </div>
      <div class="group" role="group" aria-label="Passage">
        <button type="button" data-mode="words">words</button>
        <button type="button" data-mode="quotes">quotes</button>
      </div>
    </div>
  </header>
  <section id="live">
    <p class="stats">
      <span><b id="time">30.0</b>s</span>
      <span><b id="wpm">–</b> wpm</span>
      <span><b id="acc">–</b>%</span>
    </p>
    <p id="passage" class="passage"></p>
    <p id="credit" class="credit" hidden></p>
  </section>
  <section id="result" hidden></section>
  <p class="hint">tab restarts · 1 2 3 time · \\ mode</p>
`;

const live = need<HTMLElement>("#live");
const result = need<HTMLElement>("#result");
const passage = need<HTMLElement>("#passage");
const credit = need<HTMLElement>("#credit");
const timeEl = need<HTMLElement>("#time");
const wpmEl = need<HTMLElement>("#wpm");
const accEl = need<HTMLElement>("#acc");

let session = createSession("words", 30);
let runs = loadRuns();
let saved = false;

showLive();

root.addEventListener("click", (event) => {
  const button = event.target instanceof Element ? event.target.closest("button") : null;
  if (!button) return;
  const seconds = button.dataset.seconds;
  const mode = button.dataset.mode;
  if (seconds === "15" || seconds === "30" || seconds === "60") chooseDuration(Number(seconds) as Seconds);
  else if (mode === "words" || mode === "quotes") chooseMode(mode);
});

window.addEventListener("keydown", onKey);
window.setInterval(() => {
  const now = performance.now();
  if (tick(session, now)) showResult();
  else if (session.startedAt != null && session.finishedAt == null) sync(now);
}, 100);

function onKey(event: KeyboardEvent): void {
  if (event.metaKey || event.ctrlKey || event.altKey || event.isComposing) return;

  // Tab restarts. Focus would otherwise walk the buttons and skip the sprint.
  if (event.key === "Tab") {
    event.preventDefault();
    if (!event.repeat) restart();
    return;
  }

  const onButton = event.target instanceof Element && event.target.closest("button");
  if (onButton && (event.key === " " || event.key === "Enter")) return;

  const finished = session.finishedAt != null;
  const running = session.startedAt != null && !finished;

  if (event.key === "Backspace") {
    if (finished) return;
    event.preventDefault();
    backspace(session);
    sync();
    return;
  }

  if (event.key.length !== 1) return;

  const next = session.text[caret(session)] ?? "";
  // Digits and backslash are not part of the passages, so they can be shortcuts
  // until the clock is running. Letters cannot; a passage may start with one.
  const shortcut = event.key === "1" || event.key === "2" || event.key === "3" || event.key === "\\";
  const sameLetter = event.key === next;
  if (!finished && (running || !shortcut || sameLetter)) {
    event.preventDefault();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    const now = performance.now();
    typeChar(session, event.key, now);
    sync(now);
    if (session.finishedAt != null) showResult();
    return;
  }

  if (event.key === "1") chooseDuration(15);
  else if (event.key === "2") chooseDuration(30);
  else if (event.key === "3") chooseDuration(60);
  else if (event.key === "\\") chooseMode(session.mode === "words" ? "quotes" : "words");
}

function sync(now = performance.now()): void {
  paintPassage(passage, caret(session), showingError(session));
  renderStats(timeEl, wpmEl, accEl, session, now);
}

function showLive(): void {
  result.hidden = true;
  result.replaceChildren();
  live.hidden = false;
  passage.classList.toggle("quote", session.mode === "quotes");
  renderPassage(passage, session.text);
  credit.textContent = session.credit ? `— ${session.credit}` : "";
  credit.hidden = session.credit == null;
  renderStats(timeEl, wpmEl, accEl, session, performance.now());
  setPressed(root, session.seconds, session.mode);
}

function showResult(): void {
  if (session.finishedAt == null) return;
  if (!saved) {
    const counts = tally(session.events);
    const ms = elapsedMs(session, session.finishedAt);
    const speed = wpm(counts.correct, ms);
    const percent = accuracy(counts.correct, counts.incorrect);
    const prior = bestWpm(runs, session.mode, session.seconds);
    runs = saveRun({
      at: Date.now(),
      mode: session.mode,
      seconds: session.seconds,
      wpm: speed,
      accuracy: percent,
    });
    saved = true;
    const best = bestWpm(runs, session.mode, session.seconds);
    const early = caret(session) >= session.text.length && ms + 50 < session.seconds * 1000;
    const matching = runs.filter((run) => run.mode === session.mode && run.seconds === session.seconds);
    renderResult(result, {
      wpm: speed,
      accuracy: percent,
      note: noteFor(prior, speed, best, early, ms),
      stats: summarizeKeys(session.events),
      history: matching.slice(-20).map((run) => run.wpm),
      caption: `${session.seconds}s ${session.mode}`,
    });
  }
  live.hidden = true;
  result.hidden = false;
}

function noteFor(prior: number | null, speed: number, best: number | null, early: boolean, ms: number): string {
  const parts: string[] = [];
  if (prior != null && speed > prior) parts.push("new best");
  else if (best != null) parts.push(`best ${best}`);
  if (early) parts.push(`${(ms / 1000).toFixed(1)}s`);
  return parts.join(" · ");
}

function restart(): void {
  saved = false;
  session = createSession(session.mode, session.seconds);
  showLive();
}

function chooseDuration(seconds: Seconds): void {
  session.seconds = seconds;
  restart();
}

function chooseMode(mode: Mode): void {
  session.mode = mode;
  restart();
}

function need<T extends Element>(selector: string): T {
  const node = root.querySelector<T>(selector);
  if (!node) throw new Error(`missing ${selector}`);
  return node;
}
