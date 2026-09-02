import { describe, expect, it } from "vitest";
import { slugify, truncateSlug } from "../src/slug.js";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips diacritics", () => {
    expect(slugify("Crème Brûlée")).toBe("creme-brulee");
  });

  it("collapses runs of punctuation into a single hyphen", () => {
    expect(slugify("a -- b__c!!!d")).toBe("a-b-c-d");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  ...trim me...  ")).toBe("trim-me");
  });

  it("returns an empty string when nothing survives", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("truncateSlug", () => {
  it("leaves a short slug alone", () => {
    expect(truncateSlug("short", 10)).toBe("short");
  });

  it("cuts to the maximum length", () => {
    expect(truncateSlug("abcdefghij", 4)).toBe("abcd");
  });

  it("does not leave a trailing hyphen after cutting", () => {
    expect(truncateSlug("ab-cdef", 3)).toBe("ab");
  });

  it("rejects a non-positive maximum", () => {
    expect(() => truncateSlug("abc", 0)).toThrow(RangeError);
  });
});
