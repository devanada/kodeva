import type { MetadataRoute } from 'next';

import { ROUTES } from '@/utils/constants/routes';
import { SITE_URL } from '@/utils/constants/site';
import { getAllPostSlugs } from '@/utils/services/cms';
import { getProducts } from '@/utils/services/products';

// required for a static export: the sitemap is written to out/sitemap.xml at build time
export const dynamic = 'force-static';

async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // the home route is '/', so it is the bare origin: appending it to the base would give `https://host//`
  const staticRoutes = [ROUTES.products, ROUTES.blog].map((path) => ({ url: `${SITE_URL}${path}` }));
  const productRoutes = getProducts().map((product) => ({ url: `${SITE_URL}${ROUTES.products}/${product.slug}` }));
  const postRoutes = (await getAllPostSlugs()).map((slug) => ({ url: `${SITE_URL}${ROUTES.blog}/${slug}` }));

  return [{ url: `${SITE_URL}/` }, ...staticRoutes, ...productRoutes, ...postRoutes];
}

export default sitemap;
