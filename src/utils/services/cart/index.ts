import { getProductBySlug, getPromoPrice } from '../products';
import { IProduct, PlanId } from '../products/types';
import { ICartIssue, ICartLine, ICartTotals } from './types';

// sanity cap for products without a promo quota
export const MAX_LICENSES_PER_LINE = 100;

export function lineKey(line: Pick<ICartLine, 'productSlug' | 'planId'>): string {
  return `${line.productSlug}:${line.planId}`;
}

// The promo quota belongs to the product, not to a plan, so every plan of a product draws from the same pool.
export function getLicenseTotal(lines: ICartLine[], productSlug: string): number {
  return lines.reduce((total, line) => (line.productSlug === productSlug ? total + line.quantity : total), 0);
}

// How many more licenses can be added to the cart for this product. `excluding` leaves one line out of the count,
// which is what changing that line's own quantity needs.
export function getRemainingQuota(
  product: IProduct,
  lines: ICartLine[],
  excluding?: Pick<ICartLine, 'productSlug' | 'planId'>,
): number {
  const cap = product.promo?.quota ?? MAX_LICENSES_PER_LINE;
  const others = lines.filter((line) => !excluding || lineKey(line) !== lineKey(excluding));

  return Math.max(0, cap - getLicenseTotal(others, product.slug));
}

export function getUnitPrice(product: IProduct, planId: PlanId): number | null {
  const plan = product.plans.find((item) => item.id === planId);

  if (!plan) {
    return null;
  }

  return product.promo ? getPromoPrice(plan.price, product.promo.discountPercent) : plan.price;
}

export function getRegularPrice(product: IProduct, planId: PlanId): number | null {
  return product.plans.find((item) => item.id === planId)?.price ?? null;
}

export function getCartTotals(lines: ICartLine[]): ICartTotals {
  return lines.reduce<ICartTotals>(
    (totals, line) => {
      const product = getProductBySlug(line.productSlug);
      const unit = product ? getUnitPrice(product, line.planId) : null;
      const regular = product ? getRegularPrice(product, line.planId) : null;

      if (unit === null || regular === null) {
        return totals;
      }

      return {
        original: totals.original + regular * line.quantity,
        subtotal: totals.subtotal + unit * line.quantity,
        savings: totals.savings + (regular - unit) * line.quantity,
        licenses: totals.licenses + line.quantity,
      };
    },
    { original: 0, subtotal: 0, savings: 0, licenses: 0 },
  );
}

// Adds `quantity` to the cart without ever crossing the product's quota. `added` is what actually went in.
export function addToLines(
  lines: ICartLine[],
  product: IProduct,
  planId: PlanId,
  quantity: number,
): { lines: ICartLine[]; added: number } {
  const wanted = Math.max(0, Math.floor(quantity));
  const added = Math.min(wanted, getRemainingQuota(product, lines));

  if (added === 0) {
    return { lines, added: 0 };
  }

  const key = lineKey({ productSlug: product.slug, planId });
  const exists = lines.some((line) => lineKey(line) === key);
  const next = exists
    ? lines.map((line) => (lineKey(line) === key ? { ...line, quantity: line.quantity + added } : line))
    : [...lines, { productSlug: product.slug, planId, quantity: added }];

  return { lines: next, added };
}

// Sets one line's quantity, clamped to [1, remaining for the product]. The quota is shared across the plans of
// the product, so licenses held by the other plans reduce the room.
export function setLineQuantity(
  lines: ICartLine[],
  target: Pick<ICartLine, 'productSlug' | 'planId'>,
  quantity: number,
) {
  const product = getProductBySlug(target.productSlug);

  if (!product) {
    return lines;
  }

  const max = getRemainingQuota(product, lines, target);
  const next = Math.min(Math.max(1, Math.floor(quantity)), Math.max(1, max));

  return lines.map((line) => (lineKey(line) === lineKey(target) ? { ...line, quantity: next } : line));
}

export function removeLine(lines: ICartLine[], target: Pick<ICartLine, 'productSlug' | 'planId'>) {
  return lines.filter((line) => lineKey(line) !== lineKey(target));
}

// Cleans a cart that came from storage: drops unknown products/plans and trims quantities that no longer fit the
// quota (the catalog or quota may have changed since the cart was saved).
export function sanitizeLines(lines: unknown): ICartLine[] {
  if (!Array.isArray(lines)) {
    return [];
  }

  return lines.reduce<ICartLine[]>((clean, raw) => {
    const product = getProductBySlug(raw?.productSlug);
    const planId = raw?.planId as PlanId;
    const quantity = Math.floor(Number(raw?.quantity));

    if (!product || !product.plans.some((plan) => plan.id === planId) || !Number.isFinite(quantity) || quantity < 1) {
      return clean;
    }

    return addToLines(clean, product, planId, quantity).lines;
  }, []);
}

// Server-side check of a submitted cart. It never trusts client totals or quantities.
export function validateLines(lines: ICartLine[]): ICartIssue[] {
  const issues: ICartIssue[] = [];
  const seen = new Set<string>();

  lines.forEach((line) => {
    const product = getProductBySlug(line.productSlug);

    if (!product) {
      issues.push({ productSlug: line.productSlug, message: 'Produk tidak ditemukan' });

      return;
    }

    if (!product.plans.some((plan) => plan.id === line.planId)) {
      issues.push({ productSlug: line.productSlug, planId: line.planId, message: 'Paket tidak tersedia' });
    }

    if (seen.has(lineKey(line))) {
      issues.push({ productSlug: line.productSlug, planId: line.planId, message: 'Item duplikat di keranjang' });
    }

    seen.add(lineKey(line));
  });

  const slugs = Array.from(new Set(lines.map((line) => line.productSlug)));

  slugs.forEach((slug) => {
    const product = getProductBySlug(slug);
    const cap = product?.promo?.quota ?? MAX_LICENSES_PER_LINE;

    if (product && getLicenseTotal(lines, slug) > cap) {
      issues.push({ productSlug: slug, message: `Kuota ${product.name} hanya tersisa ${cap} lisensi` });
    }
  });

  return issues;
}
