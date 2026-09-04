import { describe, it, expect } from "vitest";
import { parseDuration, formatDuration } from "../src/parse-duration.js";

describe("parseDuration", () => {
  it("parses empty input and throws SyntaxError", () => {
    expect(() => parseDuration("")).toThrow(new SyntaxError("duration must not be empty"));
    expect(() => parseDuration("   ")).toThrow(new SyntaxError("duration must not be empty"));
  });

  it("parses simple units correctly", () => {
    expect(parseDuration("1ms")).toBe(1);
    expect(parseDuration("1s")).toBe(1000);
    expect(parseDuration("1m")).toBe(60000);
    expect(parseDuration("1h")).toBe(3600000);
    expect(parseDuration("1d")).toBe(86400000);
  });

  it("parses units with spaces between value and unit", () => {
    expect(parseDuration("5   ms")).toBe(5);
    expect(parseDuration("10 s")).toBe(10000);
  });

  it("parses decimal values correctly", () => {
    expect(parseDuration("1.5s")).toBe(1500);
    expect(parseDuration("0.5m")).toBe(30000);
    expect(parseDuration("0.001s")).toBe(1);
  });

  it("parses case insensitively", () => {
    expect(parseDuration("1MS")).toBe(1);
    expect(parseDuration("10S")).toBe(10000);
    expect(parseDuration("2.5M")).toBe(150000);
    expect(parseDuration("1H")).toBe(3600000);
    expect(parseDuration("1D")).toBe(86400000);
  });

  it("parses compound durations correctly", () => {
    expect(parseDuration("1h30m")).toBe(5400000);
    expect(parseDuration("2d12h30m15s500ms")).toBe(172800000 + 43200000 + 1800000 + 15000 + 500);
  });

  it("throws SyntaxError when no valid tokens are found", () => {
    expect(() => parseDuration("abc")).toThrow(new SyntaxError("unrecognized duration: abc"));
    expect(() => parseDuration("123")).toThrow(new SyntaxError("unrecognized duration: 123"));
    expect(() => parseDuration("ms")).toThrow(new SyntaxError("unrecognized duration: ms"));
  });

  it("ignores unrecognized trailing or extra content if at least one token is matched", () => {
    expect(parseDuration("1h unrecognized")).toBe(3600000);
    expect(parseDuration("unrecognized 1h")).toBe(3600000);
    expect(parseDuration("1h 2s random_text")).toBe(3602000);
  });
});

describe("formatDuration", () => {
  it("throws RangeError if negative", () => {
    expect(() => formatDuration(-1)).toThrow(new RangeError("duration must not be negative"));
    expect(() => formatDuration(-9999)).toThrow(new RangeError("duration must not be negative"));
  });

  it("returns 0ms for 0", () => {
    expect(formatDuration(0)).toBe("0ms");
  });

  it("formats single unit durations correctly", () => {
    expect(formatDuration(1)).toBe("1ms");
    expect(formatDuration(1000)).toBe("1s");
    expect(formatDuration(60000)).toBe("1m");
    expect(formatDuration(3600000)).toBe("1h");
    expect(formatDuration(86400000)).toBe("1d");
  });

  it("formats compound durations correctly", () => {
    expect(formatDuration(1001)).toBe("1s1ms");
    expect(formatDuration(61000)).toBe("1m1s");
    expect(formatDuration(3661001)).toBe("1h1m1s1ms");
    expect(formatDuration(90061001)).toBe("1d1h1m1s1ms");
  });

  it("skips zero-value mid-units during formatting", () => {
    expect(formatDuration(3600001)).toBe("1h1ms");
    expect(formatDuration(86400001)).toBe("1d1ms");
    expect(formatDuration(86400000 + 60000)).toBe("1d1m");
  });
});
