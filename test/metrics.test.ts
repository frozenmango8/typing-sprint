import { describe, expect, it } from "vitest";
import {
  accuracy,
  keyId,
  missedKeys,
  slowestKeys,
  summarizeKeys,
  wpm,
} from "../src/metrics";

describe("wpm", () => {
  it("treats five characters as one word", () => {
    expect(wpm(50, 60_000)).toBe(10);
  });

  it("is zero before any time has passed", () => {
    expect(wpm(20, 0)).toBe(0);
  });

  it("is zero when nothing was correct", () => {
    expect(wpm(0, 60_000)).toBe(0);
  });

  it("rounds to the nearest whole number", () => {
    expect(wpm(23, 60_000)).toBe(5);
    expect(wpm(22, 60_000)).toBe(4);
    expect(wpm(25, 30_000)).toBe(10);
  });
});

describe("accuracy", () => {
  it("is 100 when nothing has been typed", () => {
    expect(accuracy(0, 0)).toBe(100);
  });

  it("is correct characters over everything typed", () => {
    expect(accuracy(8, 2)).toBe(80);
    expect(accuracy(0, 4)).toBe(0);
    expect(accuracy(2, 1)).toBe(67);
  });
});

describe("keys", () => {
  it("folds letters onto the US QWERTY key", () => {
    expect(keyId("A")).toBe("a");
    expect(keyId("?")).toBe("/");
    expect(keyId(":")).toBe(";");
    expect(keyId(" ")).toBe(" ");
    expect(keyId(",")).toBe(",");
  });

  it("averages only the correct presses", () => {
    const stats = summarizeKeys([
      { expected: "a", ok: true, delayMs: 100 },
      { expected: "A", ok: true, delayMs: 300 },
      { expected: "a", ok: false, delayMs: 50 },
      { expected: "b", ok: true, delayMs: 1000 },
    ]);
    expect(stats.find((stat) => stat.key === "a")).toMatchObject({
      hits: 2,
      misses: 1,
      avgDelayMs: 200,
    });
  });

  it("lists slow keys only after two correct hits", () => {
    const stats = summarizeKeys([
      { expected: "a", ok: true, delayMs: 500 },
      { expected: "a", ok: true, delayMs: 500 },
      { expected: "b", ok: true, delayMs: 900 },
      { expected: "c", ok: true, delayMs: 100 },
      { expected: "c", ok: true, delayMs: 100 },
    ]);
    expect(slowestKeys(stats).map((stat) => stat.key)).toEqual(["a", "c"]);
  });

  it("ranks missed keys by how often they were missed", () => {
    const stats = summarizeKeys([
      { expected: "e", ok: false, delayMs: 10 },
      { expected: "e", ok: false, delayMs: 10 },
      { expected: "e", ok: true, delayMs: 10 },
      { expected: "s", ok: false, delayMs: 10 },
    ]);
    expect(missedKeys(stats).map((stat) => stat.key)).toEqual(["e", "s"]);
  });
});
