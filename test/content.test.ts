import { describe, expect, it } from "vitest";
import { pickQuote, quotes } from "../src/quotes";
import { makeWords, words } from "../src/words";

describe("content", () => {
  it("keeps the word list lowercase and unique", () => {
    expect(new Set(words).size).toBe(words.length);
    for (const word of words) expect(word).toMatch(/^[a-z]+$/);
  });

  it("builds a passage without repeating a word twice in a row", () => {
    const list = makeWords(40, () => 0).split(" ");
    expect(list).toHaveLength(40);
    expect(list[0]).not.toBe(list[1]);
  });

  it("quotes are attributed and typeable", () => {
    expect(quotes.length).toBeGreaterThan(15);
    for (const quote of quotes) {
      expect(quote.author.length).toBeGreaterThan(0);
      expect(quote.work.length).toBeGreaterThan(0);
      expect(quote.text.length).toBeGreaterThan(30);
      expect(quote.text).toMatch(/^[\x20-\x7e]+$/);
    }
  });

  it("does not hand back the same quote twice", () => {
    const first = pickQuote(() => 0);
    const second = pickQuote(() => 0);
    expect(second.text).not.toBe(first.text);
  });
});
