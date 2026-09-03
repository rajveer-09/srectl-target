import { parseDuration } from "./parse-duration.js";

export interface BackoffOptions {
  /** Duration string, e.g. "200ms". */
  base: string;
  attempts: number;
  factor?: number;
  /** Duration string; caps any single delay. */
  max?: string;
  /** Fraction of each delay to randomise, 0..1. */
  jitter?: number;
}

/**
 * Produces the delay schedule for an exponential backoff, in milliseconds.
 * Deterministic — jitter is the caller's business.
 */
export function backoffSchedule(opts: BackoffOptions): number[] {
  const { attempts, factor = 2 } = opts;
  if (attempts < 0) throw new RangeError("attempts must not be negative");
  if (factor <= 1) throw new RangeError("factor must be greater than 1");

  const base = parseDuration(opts.base);
  const max = opts.max ? parseDuration(opts.max) : Number.POSITIVE_INFINITY;

  const jitter = opts.jitter ?? 0;

  const out: number[] = [];
  for (let i = 0; i < attempts; i += 1) {
    const capped = Math.min(Math.round(base * factor ** i), max);
    out.push(Math.round(capped * (1 + Math.random() * jitter)));
  }
  return out;
}

export function totalBackoff(opts: BackoffOptions): number {
  return backoffSchedule(opts).reduce((a, b) => a + b, 0);
}
