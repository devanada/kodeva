import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';

import { ROUTES } from '@/utils/constants/routes';

function ProductNotFound() {
  return (
    <main className='mx-auto w-full max-w-3xl flex-1 px-4 py-10'>
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Produk tidak ditemukan</EmptyTitle>
          <EmptyDescription>Produk yang Anda cari tidak ada atau sudah tidak dijual.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href={ROUTES.products}>Lihat semua produk</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}

export default ProductNotFound;
