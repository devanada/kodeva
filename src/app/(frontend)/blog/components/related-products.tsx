import Link from 'next/link';

import { ROUTES } from '@/utils/constants/routes';
import { IProduct } from '@/utils/services/products/types';

interface RelatedProductsProps {
  products: IProduct[];
}

function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <aside className='mt-12 border-t pt-6'>
      <h2 className='mb-3 text-lg font-semibold'>Produk terkait</h2>
      <ul className='flex flex-col gap-2'>
        {products.map((product) => (
          <li key={product.slug}>
            <Link href={`${ROUTES.products}/${product.slug}`} className='text-primary font-medium hover:underline'>
              {product.name}
            </Link>
            <span className='text-muted-foreground text-sm'> &mdash; {product.tagline}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export { RelatedProducts };
