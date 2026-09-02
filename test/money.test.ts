import { describe, expect, it } from "vitest";
import { allocate, fromCents, roundCents, toCents } from "../src/money.js";

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

describe("allocate", () => {
  it("requires totalCents to be an integer", () => {
    expect(() => allocate(10.5, [1, 2])).toThrow(TypeError);
    expect(() => allocate(10.5, [1, 2])).toThrow("totalCents must be an integer");
  });

  it("requires ratios to be non-empty", () => {
    expect(() => allocate(100, [])).toThrow(RangeError);
    expect(() => allocate(100, [])).toThrow("ratios must not be empty");
  });

  it("requires ratios to be non-negative", () => {
    expect(() => allocate(100, [1, -1])).toThrow(RangeError);
    expect(() => allocate(100, [1, -1])).toThrow("ratios must not be negative");
  });

  it("requires ratios to sum to greater than zero", () => {
    expect(() => allocate(100, [0, 0])).toThrow(RangeError);
    expect(() => allocate(100, [0, 0])).toThrow("ratios must not sum to zero");
  });

  it("allocates simple ratios with no remainder", () => {
    expect(allocate(100, [1, 1])).toEqual([50, 50]);
    expect(allocate(100, [1, 3])).toEqual([25, 75]);
  });

  it("allocates ratios with remainder distributed to largest shares first", () => {
    // 100 split 1:1:1 is 33.333 each, remainder of 1 cent.
    // Since ratios are equal, the original order is preserved.
    expect(allocate(100, [1, 1, 1])).toEqual([34, 33, 33]);

    // 100 split 1:2:3 -> total = 6. shares = [16, 33, 50] (sum 99), remainder of 1 cent.
    // Order of ratio sizes: index 2 (ratio 3), then 1 (ratio 2), then 0 (ratio 1).
    // Remainder 1 cent goes to index 2.
    expect(allocate(100, [1, 2, 3])).toEqual([16, 33, 51]);
  });

  it("handles negative totalCents correctly", () => {
    // -100 split 1:1:1 -> initial shares = [-34, -34, -34], sum = -102.
    // remainder = -100 - (-102) = 2.
    // remainder distributed to index 0, 1.
    expect(allocate(-100, [1, 1, 1])).toEqual([-33, -33, -34]);
  });

  it("allocates to zero ratios", () => {
    expect(allocate(100, [0, 1])).toEqual([0, 100]);
    expect(allocate(100, [1, 0])).toEqual([100, 0]);
  });

  it("handles zero totalCents", () => {
    expect(allocate(0, [1, 2])).toEqual([0, 0]);
  });

  it("handles large ratios", () => {
    expect(allocate(100, [1000000, 2000000])).toEqual([33, 67]);
  });
});
