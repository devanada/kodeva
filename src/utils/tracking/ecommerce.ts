import { getRegularPrice, getUnitPrice } from '@/utils/services/cart';
import { ICartLine } from '@/utils/services/cart/types';
import { getProductBySlug } from '@/utils/services/products';
import { IProduct, PlanId } from '@/utils/services/products/types';

import { IEcommerceItem, IEcommercePayload } from './data-layer';

export function buildItem(product: IProduct, planId: PlanId, quantity: number): IEcommerceItem | null {
  const price = getUnitPrice(product, planId);
  const regular = getRegularPrice(product, planId);

  if (price === null || regular === null) {
    return null;
  }

  return {
    item_id: product.slug,
    item_name: product.name,
    item_category: product.category,
    item_variant: planId,
    price,
    quantity,
    ...(regular > price ? { discount: regular - price } : {}),
  };
}

export function buildPayload(items: IEcommerceItem[]): IEcommercePayload {
  return {
    currency: 'IDR',
    value: items.reduce((total, item) => total + item.price * item.quantity, 0),
    items,
  };
}

export function buildPayloadFromLines(lines: ICartLine[]): IEcommercePayload {
  const items = lines
    .map((line) => {
      const product = getProductBySlug(line.productSlug);

      return product ? buildItem(product, line.planId, line.quantity) : null;
    })
    .filter((item): item is IEcommerceItem => item !== null);

  return buildPayload(items);
}
