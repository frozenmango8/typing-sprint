import { describe, expect, it } from "vitest";
import { backspace, createSession, elapsedMs, openSession, tick, typeChar } from "../src/session";

describe("session", () => {
  it("starts the clock on the first character", () => {
    const session = openSession("words", 30, "ab");
    typeChar(session, "a", 1000);
    expect(session.startedAt).toBe(1000);
    expect(session.events).toEqual([{ expected: "a", ok: true, delayMs: 0, at: 1000 }]);
  });

  it("marks a miss and keeps going", () => {
    const session = openSession("words", 30, "ab");
    typeChar(session, "a", 1000);
    typeChar(session, "x", 1200);
    expect(session.events[1]).toMatchObject({ expected: "b", ok: false, delayMs: 200 });
  });

  it("undoes the last stroke", () => {
    const session = openSession("words", 30, "abc");
    typeChar(session, "a", 1000);
    typeChar(session, "b", 1300);
    backspace(session);
    expect(session.events).toHaveLength(1);
    expect(session.startedAt).toBe(1000);
    backspace(session);
    expect(session.startedAt).toBeNull();
  });

  it("stops at the sprint length", () => {
    const session = openSession("words", 15, "hello");
    typeChar(session, "h", 0);
    expect(tick(session, 14_999)).toBe(false);
    expect(tick(session, 15_000)).toBe(true);
    expect(session.finishedAt).toBe(15_000);
    typeChar(session, "e", 15_100);
    expect(session.events).toHaveLength(1);
    expect(elapsedMs(session, 20_000)).toBe(15_000);
  });

  it("ends early when the passage is finished", () => {
    const session = openSession("words", 30, "ab");
    typeChar(session, "a", 500);
    typeChar(session, "b", 900);
    expect(session.finishedAt).toBe(900);
    expect(elapsedMs(session, 9999)).toBe(400);
    backspace(session);
    expect(session.events).toHaveLength(2);
  });

  it("builds a word passage and a credited quote", () => {
    const words = createSession("words", 30);
    expect(words.text.split(" ")).toHaveLength(320);
    expect(words.credit).toBeNull();
    const quote = createSession("quotes", 15);
    expect(quote.seconds).toBe(15);
    expect(quote.credit).toContain(", ");
    expect(quote.text.length).toBeGreaterThan(30);
  });
});
