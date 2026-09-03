/**
 * A token bucket, for smoothing bursty callers.
 *
 * Time is passed in rather than read from the clock, so a schedule is
 * reproducible in a test without faking timers.
 */
export interface BucketOptions {
  /** Maximum tokens the bucket can hold. */
  capacity: number;
  /** Tokens added per second. */
  refillPerSecond: number;
}

export interface BucketState {
  tokens: number;
  /** Epoch milliseconds of the last refill. */
  updatedAt: number;
}

export function createBucket(opts: BucketOptions, now: number): BucketState {
  if (opts.capacity <= 0) throw new RangeError("capacity must be positive");
  if (opts.refillPerSecond <= 0) throw new RangeError("refillPerSecond must be positive");
  return { tokens: opts.capacity, updatedAt: now };
}

/** Adds the tokens accrued since the last update. */
export function refill(state: BucketState, opts: BucketOptions, now: number): BucketState {
  const elapsedSeconds = Math.max(0, now - state.updatedAt) / 1000;
  const gained = elapsedSeconds * opts.refillPerSecond;
  return { tokens: state.tokens + gained, updatedAt: now };
}

/**
 * Attempts to spend `cost` tokens.
 *
 * Returns the new state and whether the call is allowed. A refused call does
 * not consume anything.
 */
export function consume(
  state: BucketState,
  opts: BucketOptions,
  cost: number,
  now: number,
): { state: BucketState; allowed: boolean } {
  const filled = refill(state, opts, now);
  if (filled.tokens < cost) return { state: filled, allowed: false };
  return { state: { tokens: filled.tokens - cost, updatedAt: now }, allowed: true };
}

/** Milliseconds until `cost` tokens are available. Zero when already allowed. */
export function retryAfterMs(
  state: BucketState,
  opts: BucketOptions,
  cost: number,
  now: number,
): number {
  const filled = refill(state, opts, now);
  if (filled.tokens >= cost) return 0;
  const deficit = cost - filled.tokens;
  return Math.ceil((deficit / opts.refillPerSecond) * 1000);
}
