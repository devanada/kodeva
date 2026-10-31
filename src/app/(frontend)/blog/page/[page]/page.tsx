import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getExtraBlogPages } from '@/utils/services/cms';

import { PostList } from '../../components/post-list';

// Only the pages that exist at build time (2..N) are generated; page 1 is /blog. A static export must generate at least
// one route, so when everything fits on page 1 (the normal case at launch) page 2 is generated anyway: it shows the empty
// state with a link back, and it is already kept out of search engines.
export async function generateStaticParams() {
  const pages = await getExtraBlogPages();

  return (pages.length > 0 ? pages : [2]).map((page) => ({ page: String(page) }));
}

export const metadata: Metadata = {
  title: 'Blog',
  robots: { index: false, follow: true },
};

async function BlogPaginatedPage({ params }: PageProps<'/blog/page/[page]'>) {
  const { page: rawPage } = await params;
  const page = Number(rawPage);

  if (!Number.isInteger(page) || page < 2) {
    notFound();
  }

  return (
    <main className='mx-auto w-full max-w-5xl flex-1 px-4 py-10'>
      <h1 className='mb-6 text-3xl font-bold tracking-tight'>Blog</h1>
      <PostList page={page} />
    </main>
  );
}

export default BlogPaginatedPage;
