import type { MetadataRoute } from 'next';

import { ROUTES } from '@/utils/constants/routes';
import { getAllPostSlugs } from '@/utils/services/cms';
import { getProducts } from '@/utils/services/products';

// required for a static export: the sitemap is written to out/sitemap.xml at build time
export const dynamic = 'force-static';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [ROUTES.home, ROUTES.products, ROUTES.blog].map((path) => ({ url: `${BASE_URL}${path}` }));
  const productRoutes = getProducts().map((product) => ({ url: `${BASE_URL}${ROUTES.products}/${product.slug}` }));
  const postRoutes = (await getAllPostSlugs()).map((slug) => ({ url: `${BASE_URL}${ROUTES.blog}/${slug}` }));

  return [...staticRoutes, ...productRoutes, ...postRoutes];
}

export default sitemap;
