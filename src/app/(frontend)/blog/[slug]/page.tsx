import { PortableText } from '@portabletext/react';

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ROUTES } from '@/utils/constants/routes';
import { getAllPostSlugs, getPostBySlug } from '@/utils/services/cms';
import { getProductsBySlugs } from '@/utils/services/products';

import { RelatedProducts } from '../components/related-products';

// A static export must generate at least one route, so a site with no articles yet gets this placeholder, which renders
// the not-found page and is kept out of search engines. Every real article is generated at build time; any other slug is
// a real 404 on Cloudflare Pages.
const NO_POSTS_PLACEHOLDER = '_none';

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();

  return (slugs.length > 0 ? slugs : [NO_POSTS_PLACEHOLDER]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: 'Artikel tidak ditemukan', robots: { index: false, follow: false } };
  }

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `${ROUTES.blog}/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt ?? undefined,
      publishedTime: post.publishedAt ?? undefined,
      images: post.cover?.url ? [{ url: post.cover.url, alt: post.cover.alt }] : undefined,
    },
  };
}

interface IBodyImage {
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
}

async function PostPage({ params }: PageProps<'/blog/[slug]'>) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { cover, category } = post;
  const products = getProductsBySlugs(post.relatedProducts);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.publishedAt ?? post._createdAt,
    dateModified: post._updatedAt,
    image: cover?.url ? [cover.url] : undefined,
  };

  return (
    <main className='flex flex-1 flex-col'>
      <article className='mx-auto w-full max-w-3xl flex-1 px-4 py-10'>
        <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Link href={ROUTES.blog} className='text-muted-foreground text-sm hover:underline'>
          &larr; Semua artikel
        </Link>
        {category && <p className='text-primary mt-4 text-xs font-medium uppercase'>{category.title}</p>}
        <h1 className='mt-2 mb-6 text-3xl font-bold tracking-tight md:text-4xl'>{post.title}</h1>
        {cover?.url && (
          <Image
            src={cover.url}
            alt={cover.alt}
            width={cover.width || 1200}
            height={cover.height || 630}
            sizes='(min-width: 768px) 768px, 100vw'
            priority
            className='mb-8 h-auto w-full rounded-2xl'
          />
        )}
        <div className='prose prose-neutral max-w-none'>
          <PortableText
            value={post.body ?? []}
            components={{
              types: {
                image: ({ value }: { value: IBodyImage }) =>
                  value.url ? (
                    <Image
                      src={value.url}
                      alt={value.alt ?? ''}
                      width={value.width || 1200}
                      height={value.height || 630}
                      sizes='(min-width: 768px) 768px, 100vw'
                      className='h-auto w-full rounded-xl'
                    />
                  ) : null,
              },
            }}
          />
        </div>
        <RelatedProducts products={products} />
      </article>
    </main>
  );
}

export default PostPage;
