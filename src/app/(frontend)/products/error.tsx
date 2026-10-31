'use client';

import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';

interface ProductsErrorProps {
  reset: () => void;
}

function ProductsError({ reset }: ProductsErrorProps) {
  return (
    <main className='mx-auto w-full max-w-5xl flex-1 px-4 py-10'>
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Produk gagal dimuat</EmptyTitle>
          <EmptyDescription>Terjadi kesalahan saat memuat halaman ini.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={reset}>Coba lagi</Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}

export default ProductsError;
