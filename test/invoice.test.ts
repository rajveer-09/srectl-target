import { describe, expect, it } from "vitest";
import { buildInvoice, type LineItem, splitInvoice, subtotalCents } from "../src/invoice.js";

describe("subtotalCents", () => {
  it("returns 0 for empty lines", () => {
    expect(subtotalCents([])).toBe(0);
  });

  it("calculates total cents for multiple line items", () => {
    const lines: LineItem[] = [
      { description: "Widget", unitPrice: 10.5, quantity: 2 },
      { description: "Gadget", unitPrice: 3.25, quantity: 4 },
    ];
    // 1050 * 2 + 325 * 4 = 2100 + 1300 = 3400
    expect(subtotalCents(lines)).toBe(3400);
  });
});

describe("buildInvoice", () => {
  it("rejects negative tax rate", () => {
    expect(() => buildInvoice([], -0.01)).toThrow(RangeError);
    expect(() => buildInvoice([], -0.01)).toThrow("taxRate must be between 0 and 1");
  });

  it("rejects tax rate greater than 1", () => {
    expect(() => buildInvoice([], 1.01)).toThrow(RangeError);
    expect(() => buildInvoice([], 1.01)).toThrow("taxRate must be between 0 and 1");
  });

  it("builds invoice with 0% tax rate", () => {
    const lines: LineItem[] = [
      { description: "Service", unitPrice: 50, quantity: 1 },
    ];
    const invoice = buildInvoice(lines, 0);

    expect(invoice).toEqual({
      subtotalCents: 5000,
      taxCents: 0,
      totalCents: 5000,
    });
  });

  it("builds invoice with 100% tax rate", () => {
    const lines: LineItem[] = [
      { description: "Service", unitPrice: 20, quantity: 1 },
    ];
    const invoice = buildInvoice(lines, 1);

    expect(invoice).toEqual({
      subtotalCents: 2000,
      taxCents: 2000,
      totalCents: 4000,
    });
  });

  it("calculates and rounds tax correctly", () => {
    const lines: LineItem[] = [
      { description: "Item A", unitPrice: 1.05, quantity: 1 },
    ];
    // subtotal = 105 cents, 105 * 0.10 = 10.5 -> rounds to 11
    const invoice = buildInvoice(lines, 0.1);

    expect(invoice).toEqual({
      subtotalCents: 105,
      taxCents: 11,
      totalCents: 116,
    });
  });
});

describe("splitInvoice", () => {
  it("splits invoice total evenly across payers", () => {
    const invoice = {
      subtotalCents: 1000,
      taxCents: 100,
      totalCents: 1100,
    };
    const split = splitInvoice(invoice, [1, 1]);

    expect(split).toEqual([550, 550]);
  });

  it("splits invoice total with remainder handling", () => {
    const invoice = {
      subtotalCents: 100,
      taxCents: 0,
      totalCents: 100,
    };
    const split = splitInvoice(invoice, [1, 1, 1]);

    expect(split).toEqual([34, 33, 33]);
    expect(split.reduce((a, b) => a + b, 0)).toBe(100);
  });
});
