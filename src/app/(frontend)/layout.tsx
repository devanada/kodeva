import type { Metadata } from 'next';
import { Figtree, Geist, Geist_Mono } from 'next/font/google';

import { cn } from '@/lib/utils';

import { DEFAULT_OG_IMAGE, SITE_URL } from '@/utils/constants/site';
import { Providers } from '@/utils/providers';
import { TrackingProvider } from '@/utils/tracking/tracking-provider';

import { SiteFooter } from './components/site-footer';
import { SiteHeader } from './components/site-header';
import './globals.css';

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Kodeva', template: '%s | Kodeva' },
  description: 'Software kasir dan HR & payroll untuk UMKM.',
  openGraph: { siteName: 'Kodeva', locale: 'id_ID', type: 'website', images: [DEFAULT_OG_IMAGE] },
  twitter: { card: 'summary_large_image', images: [DEFAULT_OG_IMAGE.url] },
};

function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang='id'
      className={cn('h-full', 'antialiased', geistSans.variable, geistMono.variable, 'font-sans', figtree.variable)}
    >
      <body className='min-h-full flex flex-col'>
        <Providers>
          <SiteHeader />
          {children}
          <SiteFooter />
        </Providers>
        <TrackingProvider />
      </body>
    </html>
  );
}

export default RootLayout;
