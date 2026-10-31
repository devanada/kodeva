import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { ROUTES } from '@/utils/constants/routes';
import { formatIdr } from '@/utils/functions/number';
import { getPromoPrice } from '@/utils/services/products';
import { IProduct } from '@/utils/services/products/types';

interface FeaturedProductsProps {
  products: IProduct[];
}

function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className='mx-auto max-w-5xl px-4 py-10'>
      <h2 className='mb-6 text-2xl font-semibold tracking-tight'>Produk unggulan</h2>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {products.map((product) => {
          const startingPlan = product.plans[0];

          return (
            <Card key={product.slug}>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>{product.tagline}</CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col gap-2'>
                {product.promo && <Badge className='w-fit'>Diskon {product.promo.discountPercent}%</Badge>}
                <p className='text-sm'>
                  Mulai dari{' '}
                  {product.promo ? (
                    <>
                      <span className='text-muted-foreground line-through'>{formatIdr(startingPlan.price)}</span>{' '}
                      <span className='font-semibold'>
                        {formatIdr(getPromoPrice(startingPlan.price, product.promo.discountPercent))}
                      </span>
                    </>
                  ) : (
                    <span className='font-semibold'>{formatIdr(startingPlan.price)}</span>
                  )}
                  /bulan
                </p>
              </CardContent>
              <CardFooter>
                <Link href={`${ROUTES.products}/${product.slug}`} className='text-primary text-sm font-medium'>
                  Lihat detail
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export { FeaturedProducts };
