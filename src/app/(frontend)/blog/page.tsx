import type { Metadata } from 'next';

import { PostList } from './components/post-list';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Tips dan panduan mengelola usaha dengan aplikasi kasir dan HR & payroll.',
  alternates: { canonical: '/blog' },
};

function BlogPage() {
  return (
    <main className='mx-auto w-full max-w-5xl flex-1 px-4 py-10'>
      <h1 className='mb-6 text-3xl font-bold tracking-tight'>Blog</h1>
      <PostList page={1} />
    </main>
  );
}

export default BlogPage;
