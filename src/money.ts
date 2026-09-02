/** Integer-cent money helpers. Floating point never touches a total. */

export function roundCents(amount: number): number {
  if (!Number.isFinite(amount)) throw new RangeError("amount must be finite");
  return Math.round(amount * 100) / 100;
}

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Splits `totalCents` across `ratios` without losing or inventing a cent.
 * Remainder goes to the largest shares first, which keeps the split stable
 * for equal ratios.
 */
export function allocate(totalCents: number, ratios: number[]): number[] {
  if (!Number.isInteger(totalCents)) throw new TypeError("totalCents must be an integer");
  if (ratios.length === 0) throw new RangeError("ratios must not be empty");
  if (ratios.some((r) => r < 0)) throw new RangeError("ratios must not be negative");

  const total = ratios.reduce((a, b) => a + b, 0);
  if (total === 0) throw new RangeError("ratios must not sum to zero");

  const shares = ratios.map((r) => Math.floor((totalCents * r) / total));
  let remainder = totalCents - shares.reduce((a, b) => a + b, 0);

  const order = ratios
    .map((r, i) => ({ r, i }))
    .sort((a, b) => b.r - a.r)
    .map((x) => x.i);

  let k = 0;
  while (remainder > 0) {
    const idx = order[k % order.length]!;
    shares[idx]! += 1;
    remainder -= 1;
    k += 1;
  }

  return shares;
}
