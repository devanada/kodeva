import { describe, expect, it } from 'vitest';

import { getProductBySlug } from '../products';
import {
  addToLines,
  getCartTotals,
  getLicenseTotal,
  getRemainingQuota,
  getUnitPrice,
  removeLine,
  sanitizeLines,
  setLineQuantity,
  validateLines,
} from './index';
import { ICartLine } from './types';

// kodeva-kasir: promo quota 50, 30% off, basic 99.000 / pro 199.000
const kasir = getProductBySlug('kodeva-kasir')!;
// kodeva-inventori: no promo
const inventori = getProductBySlug('kodeva-inventori')!;

describe('quota shared across plans', () => {
  it('counts licenses of all plans of a product together', () => {
    const lines: ICartLine[] = [
      { productSlug: 'kodeva-kasir', planId: 'basic', quantity: 30 },
      { productSlug: 'kodeva-kasir', planId: 'pro', quantity: 15 },
    ];

    expect(getLicenseTotal(lines, 'kodeva-kasir')).toBe(45);
    expect(getRemainingQuota(kasir, lines)).toBe(5);
  });

  it('caps an add so the product total never passes the quota, even across different plans', () => {
    const first = addToLines([], kasir, 'basic', 40);
    const second = addToLines(first.lines, kasir, 'pro', 20);

    expect(first.added).toBe(40);
    expect(second.added).toBe(10);
    expect(getLicenseTotal(second.lines, 'kodeva-kasir')).toBe(50);
  });

  it('adds nothing once the quota is used up', () => {
    const full = addToLines([], kasir, 'basic', 50);
    const more = addToLines(full.lines, kasir, 'business', 1);

    expect(more.added).toBe(0);
    expect(more.lines).toEqual(full.lines);
  });

  it('merges an add into the existing line of the same plan', () => {
    const { lines } = addToLines(addToLines([], kasir, 'basic', 5).lines, kasir, 'basic', 3);

    expect(lines).toEqual([{ productSlug: 'kodeva-kasir', planId: 'basic', quantity: 8 }]);
  });

  it('limits a quantity change by the licenses held in the other plans', () => {
    const lines: ICartLine[] = [
      { productSlug: 'kodeva-kasir', planId: 'basic', quantity: 30 },
      { productSlug: 'kodeva-kasir', planId: 'pro', quantity: 10 },
    ];
    const next = setLineQuantity(lines, { productSlug: 'kodeva-kasir', planId: 'pro' }, 999);

    expect(next.find((line) => line.planId === 'pro')?.quantity).toBe(20);
    expect(getLicenseTotal(next, 'kodeva-kasir')).toBe(50);
  });

  it('never drops a line below one license when changing quantity', () => {
    const lines: ICartLine[] = [{ productSlug: 'kodeva-kasir', planId: 'basic', quantity: 3 }];

    expect(setLineQuantity(lines, { productSlug: 'kodeva-kasir', planId: 'basic' }, 0)[0].quantity).toBe(1);
    expect(setLineQuantity(lines, { productSlug: 'kodeva-kasir', planId: 'basic' }, -4)[0].quantity).toBe(1);
  });

  it('ignores fractional and non-positive quantities when adding', () => {
    expect(addToLines([], kasir, 'basic', 0).added).toBe(0);
    expect(addToLines([], kasir, 'basic', -2).added).toBe(0);
    expect(addToLines([], kasir, 'basic', 2.9).added).toBe(2);
  });

  it('caps a product without a promo at the per-line sanity limit', () => {
    expect(addToLines([], inventori, 'basic', 1000).added).toBe(100);
  });
});

describe('pricing and totals', () => {
  it('applies the promo discount to the unit price', () => {
    expect(getUnitPrice(kasir, 'basic')).toBe(69300);
    expect(getUnitPrice(inventori, 'basic')).toBe(59000);
  });

  it('returns null for an unknown plan', () => {
    expect(getUnitPrice(kasir, 'enterprise' as never)).toBeNull();
  });

  it('computes subtotal, original and savings across lines', () => {
    const totals = getCartTotals([
      { productSlug: 'kodeva-kasir', planId: 'basic', quantity: 2 },
      { productSlug: 'kodeva-inventori', planId: 'basic', quantity: 1 },
    ]);

    expect(totals.original).toBe(99000 * 2 + 59000);
    expect(totals.subtotal).toBe(69300 * 2 + 59000);
    expect(totals.savings).toBe(totals.original - totals.subtotal);
    expect(totals.licenses).toBe(3);
  });

  it('skips lines whose product no longer exists', () => {
    expect(getCartTotals([{ productSlug: 'gone', planId: 'basic', quantity: 5 }]).subtotal).toBe(0);
  });

  it('removes a line', () => {
    const lines: ICartLine[] = [
      { productSlug: 'kodeva-kasir', planId: 'basic', quantity: 1 },
      { productSlug: 'kodeva-kasir', planId: 'pro', quantity: 1 },
    ];

    expect(removeLine(lines, { productSlug: 'kodeva-kasir', planId: 'basic' })).toEqual([lines[1]]);
  });
});

describe('sanitizeLines (cart restored from storage)', () => {
  it('drops unknown products, unknown plans and bad quantities', () => {
    const result = sanitizeLines([
      { productSlug: 'gone', planId: 'basic', quantity: 1 },
      { productSlug: 'kodeva-kasir', planId: 'enterprise', quantity: 1 },
      { productSlug: 'kodeva-kasir', planId: 'basic', quantity: 'abc' },
      { productSlug: 'kodeva-kasir', planId: 'basic', quantity: 0 },
      { productSlug: 'kodeva-kasir', planId: 'pro', quantity: 2 },
    ]);

    expect(result).toEqual([{ productSlug: 'kodeva-kasir', planId: 'pro', quantity: 2 }]);
  });

  it('trims a tampered cart back to the quota', () => {
    const result = sanitizeLines([
      { productSlug: 'kodeva-kasir', planId: 'basic', quantity: 500 },
      { productSlug: 'kodeva-kasir', planId: 'pro', quantity: 500 },
    ]);

    expect(getLicenseTotal(result, 'kodeva-kasir')).toBe(50);
  });

  it('returns an empty cart for non-array input', () => {
    expect(sanitizeLines(null)).toEqual([]);
    expect(sanitizeLines('nope')).toEqual([]);
  });
});

describe('validateLines (server side)', () => {
  it('accepts a cart within quota', () => {
    expect(validateLines([{ productSlug: 'kodeva-kasir', planId: 'basic', quantity: 50 }])).toEqual([]);
  });

  it('rejects a product total over quota spread across plans', () => {
    const issues = validateLines([
      { productSlug: 'kodeva-kasir', planId: 'basic', quantity: 30 },
      { productSlug: 'kodeva-kasir', planId: 'pro', quantity: 30 },
    ]);

    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('Kuota');
  });

  it('rejects unknown products, unknown plans and duplicate lines', () => {
    const issues = validateLines([
      { productSlug: 'gone', planId: 'basic', quantity: 1 },
      { productSlug: 'kodeva-kasir', planId: 'enterprise' as never, quantity: 1 },
      { productSlug: 'kodeva-inventori', planId: 'basic', quantity: 1 },
      { productSlug: 'kodeva-inventori', planId: 'basic', quantity: 1 },
    ]);

    expect(issues.map((issue) => issue.message)).toEqual([
      'Produk tidak ditemukan',
      'Paket tidak tersedia',
      'Item duplikat di keranjang',
    ]);
  });
});
