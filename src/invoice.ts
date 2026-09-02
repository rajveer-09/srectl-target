import { allocate, toCents } from "./money.js";

export interface LineItem {
  description: string;
  unitPrice: number;
  quantity: number;
}

export interface Invoice {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
}

export function subtotalCents(lines: LineItem[]): number {
  return lines.reduce((sum, l) => sum + toCents(l.unitPrice) * l.quantity, 0);
}

export function buildInvoice(lines: LineItem[], taxRate: number): Invoice {
  if (taxRate < 0 || taxRate > 1) throw new RangeError("taxRate must be between 0 and 1");

  const subtotal = subtotalCents(lines);
  const tax = Math.round(subtotal * taxRate);

  return { subtotalCents: subtotal, taxCents: tax, totalCents: subtotal + tax };
}

/**
 * Splits an invoice total across payers by weight. Delegates the cent-exact
 * split to `allocate`, so a change to that function's remainder handling
 * changes the numbers this returns.
 */
export function splitInvoice(invoice: Invoice, weights: number[]): number[] {
  return allocate(invoice.totalCents, weights);
}
