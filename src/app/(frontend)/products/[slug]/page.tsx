import { Suspense } from 'react';

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Skeleton } from '@/components/ui/skeleton';

import { CATEGORY_LABELS } from '@/utils/constants/products';
import { ROUTES } from '@/utils/constants/routes';
import { DEFAULT_OG_IMAGE } from '@/utils/constants/site';
import { getProductBySlug, getProducts } from '@/utils/services/products';

import { FeatureScreenshots } from './components/feature-screenshots';
import { ProductPurchase } from './components/product-purchase';

// the catalog is a fixed JSON file, so every other slug is a real 404
export const dynamicParams = false;

export function generateStaticParams() {
  return getProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<'/products/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: 'Produk tidak ditemukan' };
  }

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `${ROUTES.products}/${product.slug}` },
    openGraph: {
      type: 'website',
      title: product.name,
      description: product.description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

async function ProductContent({ params }: Pick<PageProps<'/products/[slug]'>, 'params'>) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    category: CATEGORY_LABELS[product.category],
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'IDR',
      lowPrice: Math.min(...product.plans.map((plan) => plan.price)),
      highPrice: Math.max(...product.plans.map((plan) => plan.price)),
      offerCount: product.plans.length,
    },
  };

  return (
    <article className='mx-auto w-full max-w-3xl flex-1 px-4 py-10'>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href={ROUTES.products} className='text-muted-foreground text-sm hover:underline'>
        &larr; Semua produk
      </Link>
      <p className='text-primary mt-4 text-xs font-medium uppercase'>{CATEGORY_LABELS[product.category]}</p>
      <h1 className='mt-1 text-3xl font-bold tracking-tight'>{product.name}</h1>
      <p className='text-muted-foreground mt-2 mb-8'>{product.description}</p>
      <ProductPurchase product={product} />
      <FeatureScreenshots productName={product.name} features={product.features} />
    </article>
  );
}

function ProductPage(props: PageProps<'/products/[slug]'>) {
  return (
    <main className='flex flex-1 flex-col'>
      <Suspense fallback={<Skeleton className='mx-auto my-10 h-96 w-full max-w-3xl' />}>
        <ProductContent params={props.params} />
      </Suspense>
    </main>
  );
}

export default ProductPage;
