import Link from 'next/link';

import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import { ROUTES } from '@/utils/constants/routes';
import { getPosts } from '@/utils/services/cms';

import { PostCard } from '../post-card';

interface PostListProps {
  page: number;
}

function pageHref(page: number) {
  return page <= 1 ? ROUTES.blog : `${ROUTES.blog}/page/${page}`;
}

async function PostList({ page }: PostListProps) {
  const result = await getPosts(page);

  if (result.docs.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Belum ada artikel</EmptyTitle>
          <EmptyDescription>
            {page > 1 ? <Link href={ROUTES.blog}>Kembali ke halaman pertama</Link> : 'Artikel akan segera hadir.'}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {result.docs.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
      {result.totalPages > 1 && (
        <Pagination className='mt-8'>
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={pageHref(page - 1)} />
              </PaginationItem>
            )}
            <PaginationItem className='text-muted-foreground px-3 text-sm'>
              Halaman {result.page} dari {result.totalPages}
            </PaginationItem>
            {page < result.totalPages && (
              <PaginationItem>
                <PaginationNext href={pageHref(page + 1)} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}

export { PostList };
