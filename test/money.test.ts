import { describe, expect, it } from "vitest";
import { fromCents, roundCents, toCents } from "../src/money.js";

// Deliberately partial: `allocate` is the interesting function in this module
// and has no test at all. Phase 2 of SREctl should pick it as a target.

describe("roundCents", () => {
  it("rounds to two decimal places", () => {
    expect(roundCents(1.005)).toBe(1.0);
    expect(roundCents(2.345)).toBe(2.35);
  });

  it("rejects a non-finite amount", () => {
    expect(() => roundCents(Number.NaN)).toThrow(RangeError);
    expect(() => roundCents(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe("toCents / fromCents", () => {
  it("round-trips a plain amount", () => {
    expect(fromCents(toCents(12.34))).toBe(12.34);
  });

  it("converts to integer cents", () => {
    expect(toCents(0.1 + 0.2)).toBe(30);
  });
});
