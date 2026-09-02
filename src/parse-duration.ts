const UNITS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
};

const TOKEN = /(\d+(?:\.\d+)?)\s*(ms|s|m|h|d)/gi;

/**
 * Parses a compound duration string into milliseconds.
 *
 *   parseDuration("1h30m")  // 5400000
 *   parseDuration("250ms")  // 250
 */
export function parseDuration(input: string): number {
  const trimmed = input.trim();
  if (trimmed === "") throw new SyntaxError("duration must not be empty");

  let total = 0;
  let matched = 0;

  for (const m of trimmed.matchAll(TOKEN)) {
    const value = Number(m[1]);
    const unit = m[2]!.toLowerCase();
    total += value * UNITS[unit]!;
    matched += m[0].length;
  }

  if (matched === 0) throw new SyntaxError(`unrecognized duration: ${input}`);
  return total;
}

export function formatDuration(ms: number): string {
  if (ms < 0) throw new RangeError("duration must not be negative");
  if (ms === 0) return "0ms";

  const parts: string[] = [];
  let rest = ms;
  for (const [unit, size] of [
    ["w", UNITS.w!],
    ["d", UNITS.d!],
    ["h", UNITS.h!],
    ["m", UNITS.m!],
    ["s", UNITS.s!],
    ["ms", UNITS.ms!],
  ] as const) {
    const n = Math.floor(rest / size);
    if (n > 0) {
      parts.push(`${n}${unit}`);
      rest -= n * size;
    }
  }
  return parts.join("");
}
