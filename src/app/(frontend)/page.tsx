import type { Metadata } from 'next';

import { LANDING_FALLBACK } from '@/utils/constants/landing-fallback';
import { DEFAULT_OG_IMAGE } from '@/utils/constants/site';
import { getLandingPage } from '@/utils/services/cms';
import { getProductsBySlugs } from '@/utils/services/products';

import { FaqSection } from './components/landing/faq';
import { FeaturedProducts } from './components/landing/featured-products';
import { Hero } from './components/landing/hero';
import { LeadSection } from './components/landing/lead-section';
import { Testimonials } from './components/landing/testimonials';

export const metadata: Metadata = {
  title: 'Promo Akhir Tahun',
  description: 'Aplikasi kasir dan HR & payroll untuk UMKM dengan diskon akhir tahun.',
  openGraph: { title: 'Promo Akhir Tahun Kodeva', type: 'website', images: [DEFAULT_OG_IMAGE] },
};

// Static page: the CMS content is read once at build time and the HTML is served as a plain file.
async function HomePage() {
  const landing = await getLandingPage();
  const featuredSlugs = landing?.featuredProducts ?? [];
  const products = getProductsBySlugs(
    featuredSlugs.length > 0 ? featuredSlugs : [...LANDING_FALLBACK.featuredProducts],
  );

  return (
    <main className='flex-1'>
      <Hero
        title={landing?.hero?.title || LANDING_FALLBACK.hero.title}
        subtitle={landing?.hero?.subtitle || LANDING_FALLBACK.hero.subtitle}
        ctaLabel={landing?.hero?.ctaLabel || LANDING_FALLBACK.hero.ctaLabel}
        image={landing?.hero?.image}
      />
      <FeaturedProducts products={products} />
      <Testimonials testimonials={landing?.testimonials ?? []} />
      <FaqSection faqs={landing?.faqs ?? []} />
      <LeadSection />
    </main>
  );
}

export default HomePage;
