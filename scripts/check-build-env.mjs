// Runs before `next build` (see the "build" script). On Cloudflare Pages it stops a build that is missing a variable the
// site needs, instead of letting the build "succeed" into a half-working site:
//  - NEXT_PUBLIC_* values are read at build time and inlined; if they are missing at build, setting them later in the
//    dashboard changes nothing until the next build, and the page quietly ships without a captcha or with localhost URLs
//  - a private Sanity dataset answers an anonymous query with an empty result (HTTP 200), so a missing read token ships an
//    empty site instead of failing
// It only enforces on Cloudflare Pages (CF_PAGES is set there) or when ENFORCE_BUILD_ENV=1, so local builds, tests against
// the mock CMS and a fresh checkout still build with fallback content.
import { existsSync } from 'node:fs';

const enforce = process.env.CF_PAGES === '1' || process.env.ENFORCE_BUILD_ENV === '1';

if (!enforce) {
  process.exit(0);
}

for (const file of ['.env.production', '.env']) {
  if (existsSync(file)) {
    process.loadEnvFile(file);
  }
}

const errors = [];
const warnings = [];
const where = 'Cloudflare dashboard > Workers & Pages > your project > Settings > Variables and secrets > Production';

if (!process.env.SANITY_PROJECT_ID) {
  errors.push('SANITY_PROJECT_ID is missing. Without it the site builds with the built-in fallback content.');
}

if (!process.env.SANITY_READ_TOKEN) {
  errors.push(
    'SANITY_READ_TOKEN is missing. The dataset is private, so Sanity would answer the build with an empty result and the site would ship with no articles.',
  );
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

if (!/^https:\/\/[^/]+/.test(siteUrl) || /localhost|127\.0\.0\.1/.test(siteUrl)) {
  errors.push(
    `NEXT_PUBLIC_SITE_URL must be the public https URL (got "${siteUrl || 'unset'}"). Canonical links, Open Graph tags and the sitemap would point at localhost.`,
  );
}

const turnstileKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

if (!turnstileKey) {
  errors.push(
    'NEXT_PUBLIC_TURNSTILE_SITE_KEY is missing. The captcha would not render and nobody could submit the lead form.',
  );
} else if (turnstileKey.startsWith('1x000000')) {
  warnings.push('NEXT_PUBLIC_TURNSTILE_SITE_KEY is the public test key: the captcha accepts anything.');
}

if (process.env.SANITY_API_HOST) {
  errors.push('SANITY_API_HOST is set: that points the build at a local mock. Remove it from the build variables.');
}

warnings.forEach((message) => console.warn(`warning: ${message}`));

if (errors.length > 0) {
  console.error('\nBuild stopped: required variables are missing.\n');
  errors.forEach((message) => console.error(`  - ${message}`));
  console.error(`\nAdd them under: ${where}`);
  console.error('Then retry the deployment: NEXT_PUBLIC_* values only take effect at build time.\n');
  process.exit(1);
}

console.log('Build environment checks passed.');
