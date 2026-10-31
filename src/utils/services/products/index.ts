import catalog from './products.json';
import { IProduct } from './types';

const PRODUCTS = catalog as IProduct[];

export function getProducts(): IProduct[] {
  return PRODUCTS;
}

export function getProductBySlug(slug: string): IProduct | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

// keeps the CMS order and silently drops slugs that no longer exist in the catalog
export function getProductsBySlugs(slugs: string[]): IProduct[] {
  return slugs.map((slug) => getProductBySlug(slug)).filter((product): product is IProduct => Boolean(product));
}

export function getPromoPrice(price: number, discountPercent: number): number {
  return Math.round(price * (1 - discountPercent / 100));
}
