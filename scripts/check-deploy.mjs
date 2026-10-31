// Runs before `npm run deploy` (npm's "predeploy" hook). It stops the mistakes that would otherwise ship a broken site:
//  - no Sanity project id at build time: the site would silently build with its built-in fallback content
//  - a placeholder project id, or a build id that differs from the one the Functions use for leads
//  - NEXT_PUBLIC_SITE_URL missing or localhost: canonical links, Open Graph tags and the sitemap would point at localhost
//    (NEXT_PUBLIC_* values are inlined at build time)
import { existsSync, readFileSync } from 'node:fs';

for (const file of ['.env.production', '.env']) {
  if (existsSync(file)) {
    process.loadEnvFile(file);
  }
}

const errors = [];
const warnings = [];

// wrangler.jsonc has only whole-line comments, so a line-based strip is safe (and keeps "https://" in strings intact)
const wrangler = JSON.parse(
  readFileSync('wrangler.jsonc', 'utf8')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/,(\s*[}\]])/g, '$1'),
);

const functionsProjectId = wrangler.vars?.SANITY_PROJECT_ID ?? '';
const buildProjectId = process.env.SANITY_PROJECT_ID ?? '';

if (!functionsProjectId || functionsProjectId.startsWith('REPLACE_')) {
  errors.push(
    'wrangler.jsonc: vars.SANITY_PROJECT_ID is still a placeholder. Use the project id from sanity.io/manage.',
  );
}

if (!buildProjectId) {
  errors.push(
    'SANITY_PROJECT_ID is not set for the build (.env.production or the environment). Without it the site builds with fallback content.',
  );
} else if (functionsProjectId && buildProjectId !== functionsProjectId) {
  errors.push(
    `SANITY_PROJECT_ID differs between the build (${buildProjectId}) and wrangler.jsonc (${functionsProjectId}): articles and leads would use different projects.`,
  );
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

if (!/^https:\/\/[^/]+/.test(siteUrl) || /localhost|127\.0\.0\.1/.test(siteUrl)) {
  errors.push(
    `NEXT_PUBLIC_SITE_URL must be your public https URL at build time (got "${siteUrl || 'unset'}"). Set it in .env.production.`,
  );
}

if (!process.env.SANITY_READ_TOKEN) {
  errors.push(
    'SANITY_READ_TOKEN is not set. The dataset must be private (lead documents contain personal data), so the build needs a read-only Viewer token (sanity.io/manage > API > Tokens).',
  );
}

if (process.env.SANITY_API_HOST) {
  errors.push('SANITY_API_HOST is set: that points the build at a local mock. Unset it before deploying.');
}

const turnstileKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

if (!turnstileKey || turnstileKey.startsWith('1x000000')) {
  warnings.push(
    'NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset or the public test key: the lead form captcha will accept anything.',
  );
}

if (!process.env.CLOUDFLARE_API_TOKEN) {
  warnings.push('CLOUDFLARE_API_TOKEN is not set. That is fine if you ran `wrangler login`; CI needs the token.');
}

warnings.forEach((message) => console.warn(`warning: ${message}`));

if (errors.length > 0) {
  errors.forEach((message) => console.error(`error: ${message}`));
  process.exit(1);
}

console.log('Deploy pre-flight checks passed.');
