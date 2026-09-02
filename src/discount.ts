import { toCents } from "./money.js";

/** Percentage discount applied to an integer-cent amount. */
export function applyDiscount(cents: number, rate: number): number {
  return Math.round(cents * (1 - rate));
}

export function discountFromPrice(price: number, rate: number): number {
  return applyDiscount(toCents(price), rate);
}
