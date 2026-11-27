import { accuracy, missedKeys, slowestKeys, tally, wpm, type KeyStat } from "./metrics";
import { elapsedMs, type Mode, type Seconds, type Session } from "./session";

const WPM_AFTER = 400;

const ROWS = [
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
];

export function renderPassage(el: HTMLElement, text: string): void {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < text.length; i++) {
    const span = document.createElement("span");
    span.textContent = text[i];
    span.className = i === 0 ? "pending current" : "pending";
    frag.append(span);
  }
  el.replaceChildren(frag);
}

export function paintPassage(el: HTMLElement, cursor: number, wrong: boolean): void {
  const spans = el.children;
  for (let i = 0; i < spans.length; i++) {
    const span = spans[i] as HTMLElement;
    let name = "pending";
    if (i < cursor) name = "";
    else if (i === cursor) name = wrong ? "bad current" : "pending current";
    if (span.className !== name) span.className = name;
  }
  const current = el.querySelector(".current");
  if (current instanceof HTMLElement) el.scrollTop = current.offsetTop;
}

export function renderStats(
  time: HTMLElement,
  wpmNode: HTMLElement,
  accNode: HTMLElement,
  session: Session,
  now: number,
): void {
  const remain = Math.max(0, session.seconds * 1000 - elapsedMs(session, now));
  time.textContent = (remain / 1000).toFixed(1);
  if (session.startedAt == null) {
    wpmNode.textContent = "–";
    accNode.textContent = "–";
    return;
  }
  const counts = tally(session.events);
  const ms = elapsedMs(session, now);
  accNode.textContent = String(accuracy(counts.correct, counts.incorrect));
  wpmNode.textContent = ms < WPM_AFTER ? "–" : String(wpm(counts.correct, ms));
}

export function setPressed(root: ParentNode, seconds: Seconds, mode: Mode): void {
  for (const button of root.querySelectorAll<HTMLButtonElement>("[data-seconds]")) {
    button.setAttribute("aria-pressed", String(button.dataset.seconds === String(seconds)));
  }
  for (const button of root.querySelectorAll<HTMLButtonElement>("[data-mode]")) {
    button.setAttribute("aria-pressed", String(button.dataset.mode === mode));
  }
}

export type ResultModel = {
  wpm: number;
  accuracy: number;
  note: string;
  stats: KeyStat[];
  history: number[];
  caption: string;
};

export function renderResult(root: HTMLElement, model: ResultModel): void {
  const slow = slowestKeys(model.stats);
  const missed = missedKeys(model.stats);
  const score = el("p", "score");
  const number = el("b", undefined, String(model.wpm));
  score.append(number, " wpm");
  const block = document.createDocumentFragment();
  block.append(score, el("p", "accuracy", `${model.accuracy}%`));
  if (model.note) block.append(el("p", "note", model.note));

  if (slow.length || missed.length) {
    const findings = el("div", "findings");
    if (slow.length) findings.append(keyLine("slow", slow.map((stat) => stat.key)));
    if (missed.length) findings.append(keyLine("missed", missed.map((stat) => stat.key)));
    block.append(findings);
  }

  block.append(board(model.stats, new Set(slow.map((stat) => stat.key))));
  const chartLine = chart(model.history);
  if (chartLine) {
    const wrap = el("div", "chart");
    wrap.append(chartLine);
    block.append(wrap, el("p", "caption", model.caption));
  }
  root.replaceChildren(block);
}

function keyLine(label: string, keys: string[]): HTMLParagraphElement {
  const line = el("p", "keyline");
  line.append(el("span", "label", label));
  for (const key of keys) line.append(el("span", undefined, key === " " ? "space" : key));
  return line;
}

function board(stats: KeyStat[], slow: Set<string>): HTMLElement {
  const byKey = new Map(stats.map((stat) => [stat.key, stat]));
  let maxMiss = 0;
  for (const stat of stats) maxMiss = Math.max(maxMiss, stat.misses);
  const wrap = el("div", "board");
  wrap.setAttribute("aria-hidden", "true");
  ROWS.forEach((row, index) => {
    const line = el("div", `row row-${index}`);
    for (const key of row) line.append(keycap(key, byKey.get(key), maxMiss, slow.has(key)));
    wrap.append(line);
  });
  const space = el("div", "row row-space");
  space.append(keycap(" ", byKey.get(" "), maxMiss, slow.has(" "), true));
  wrap.append(space);

  const legend = el("p", "legend");
  legend.append(
    el("span", "swatch miss"),
    "missed",
    el("span", "swatch slow"),
    "slow",
  );
  wrap.append(legend);
  return wrap;
}

function keycap(
  key: string,
  stat: KeyStat | undefined,
  maxMiss: number,
  slow: boolean,
  space = false,
): HTMLElement {
  const node = el("span", space ? "key space" : "key", space ? "" : key);
  if (slow) node.classList.add("slow");
  if (stat && stat.misses > 0 && maxMiss > 0) {
    const t = stat.misses / maxMiss;
    node.style.background = heat(t);
    node.style.borderColor = "transparent";
    node.style.color = t > 0.6 ? "#f4f0e8" : "#24231f";
  } else if (stat && stat.hits > 0) {
    node.classList.add("used");
  }
  if (stat && (stat.hits || stat.misses)) {
    const bits: string[] = [];
    if (stat.misses) bits.push(`${stat.misses} missed`);
    if (stat.hits) bits.push(`${Math.round(stat.avgDelayMs)} ms`);
    node.title = bits.join(", ");
  }
  return node;
}

function heat(t: number): string {
  const from = [231, 210, 200];
  const to = [140, 62, 52];
  const n = Math.min(1, Math.max(0, t));
  const channels = from.map((channel, i) => Math.round(channel + (to[i] - channel) * n));
  return `rgb(${channels[0]} ${channels[1]} ${channels[2]})`;
}

function chart(values: number[]): SVGSVGElement | null {
  if (values.length === 0) return null;
  const width = 320;
  const height = 64;
  const pad = 6;
  const peak = Math.max(40, ...values);
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("role", "img");
  const label =
    values.length === 1
      ? `${values[0]} wpm`
      : `wpm over the last ${values.length} runs, from ${values[0]} to ${values[values.length - 1]}`;
  svg.setAttribute("aria-label", label);

  const bottom = height - pad;
  const coords = values.map((value, index) => {
    const x = values.length === 1 ? pad : pad + (index / (values.length - 1)) * (width - pad * 2);
    const y = bottom - (value / peak) * (height - pad * 2);
    return { x, y, value };
  });

  const base = document.createElementNS(ns, "line");
  base.setAttribute("x1", "0");
  base.setAttribute("x2", String(width));
  base.setAttribute("y1", String(bottom));
  base.setAttribute("y2", String(bottom));
  base.setAttribute("stroke", "#cfc8ba");
  svg.append(base);

  if (coords.length > 1) {
    const line = document.createElementNS(ns, "polyline");
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", "currentColor");
    line.setAttribute("stroke-width", "1.5");
    line.setAttribute("points", coords.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" "));
    svg.append(line);
  }

  for (const point of coords) {
    const dot = document.createElementNS(ns, "circle");
    dot.setAttribute("cx", point.x.toFixed(1));
    dot.setAttribute("cy", point.y.toFixed(1));
    dot.setAttribute("r", "2.3");
    dot.setAttribute("fill", "currentColor");
    const title = document.createElementNS(ns, "title");
    title.textContent = `${point.value} wpm`;
    dot.append(title);
    svg.append(dot);
  }
  return svg;
}

function el<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[T] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
