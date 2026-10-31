import type { NextConfig } from 'next';

// The public site is a static export (`out/`) served by Cloudflare Pages: static assets are free and unlimited and never
// run a Worker, so the Free plan's 10 ms CPU limit does not apply to page views. CMS content is fetched at build time;
// publishing in Sanity triggers a rebuild through a deploy hook (see README, "Caching and revalidation").
const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: {
    // `next export` has no image server, so images are resized by the Sanity CDN through a custom loader
    loader: 'custom',
    loaderFile: './src/utils/functions/sanity-image-loader.ts',
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
