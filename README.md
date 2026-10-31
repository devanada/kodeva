# Kodeva

Landing campaign, blog, and mini marketplace for the fictional Kodeva brand (technical skill test). Runs entirely on the
Cloudflare **Free** plan plus Sanity's free plan.

## Stack

- Next.js 16 (App Router) + TypeScript as a **static export**, served by Cloudflare Pages
- Sanity (hosted CMS + hosted Studio) for the landing page, articles, testimonials, FAQs and leads
- Cloudflare Pages Functions (`functions/`) for the two server endpoints: `POST /api/v1/leads` and `POST /api/v1/orders`
- shadcn/ui (radix-maia) + Tailwind v4, react-hook-form + zod through the `components/form-field` wrappers
- zustand (cart), Vitest (tests), Cloudflare Turnstile (lead form spam protection)

## Why this architecture

The first version ran Payload CMS inside a Cloudflare Worker. That cannot run on the Free plan: Workers Free allows
10 ms of CPU per request, while the Payload admin needs about 1 s to start and 0.2 s per request (measured locally), and
it failed in production with `Worker exceeded CPU time limit` (error 1102). Instead:

- Pages are plain static files. Requests to static assets are free, unlimited and never run a Worker, so the CPU limit does
  not apply to page views, and Lighthouse is not at the mercy of cold starts.
- The CMS is a hosted service, so nothing heavy runs on Cloudflare.
- The only code that runs on a Worker is two tiny Functions (a zod parse, one Turnstile call, one write to Sanity), which
  fit in 10 ms because waiting on `fetch` is not CPU time.

The Payload version is preserved outside the repo in `E:\WORK\kodeva-payload-backup` (git history does not have it
because nothing was committed).

## Run locally

```bash
cp .env.example .env
npm install
npm run mock:sanity            # terminal 1: local stand-in for the Sanity API (fixtures, 7 articles)
SANITY_PROJECT_ID=mock SANITY_API_HOST=http://localhost:4010 npm run dev   # terminal 2
```

Or point it at your own Sanity project by filling `SANITY_PROJECT_ID`, `SANITY_DATASET` and `SANITY_READ_TOKEN` in `.env`.
Without `SANITY_PROJECT_ID` the site still builds and shows its built-in fallback copy.

To exercise the Functions too (leads, orders) build the static site and serve it with workerd:

```bash
cp .dev.vars.example .dev.vars   # then add SANITY_API_HOST=http://localhost:4010 and SANITY_PROJECT_ID=mock for the mock
SANITY_PROJECT_ID=mock SANITY_API_HOST=http://localhost:4010 npm run build
npm run preview                  # static files + Functions on http://localhost:8788
```

## Scripts

| Script                       | Purpose                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `npm run build`              | Static export to `out/` (fetches CMS content at build time)                   |
| `npm run preview`            | Serve `out/` with the Functions on workerd (`wrangler pages dev`)             |
| `npm run deploy`             | Pre-flight check, build, and `wrangler pages deploy` (manual deploys)         |
| `npm run seed`               | Write demo content to Sanity (idempotent, needs `SANITY_WRITE_TOKEN`)         |
| `npm run mock:sanity`        | Local mock of the Sanity API for tests                                        |
| `npm run studio:dev/deploy`  | Run or publish the Sanity Studio (`studio/`)                                  |
| `npm run typescript/lint/test` | Typecheck, lint, Vitest                                                     |

## Structure

```
src/
  app/(frontend)/   public site: layout, landing, blog, marketplace (feature folders own their components/)
  components/       ui/ (shadcn) and form-field/ (react-hook-form wrappers)
  utils/            constants, hooks, providers, services (cms, cart, products), tracking, shared types
functions/          Cloudflare Pages Functions: api/v1/leads.ts, api/v1/orders.ts
studio/             Sanity Studio (separate package): schemas for landing page, posts, testimonials, FAQs, leads
scripts/            deploy pre-flight check, Sanity seed, mock Sanity API
```

Marketplace products come from `src/utils/services/products/products.json`; articles and the landing page reference them
by slug, and the Studio offers only the slugs that exist.

## Caching and revalidation

There is no runtime cache to invalidate: CMS content is read **at build time** and baked into the HTML. Publishing in
Sanity fires a webhook to a Cloudflare Pages **deploy hook**, which starts a rebuild; the new site goes live when it
finishes. No manual deploy is needed.

- **Consequence:** an edit appears after the rebuild, roughly 1 to 2 minutes, not instantly. Rebuilds triggered close
  together are queued, and a failed build leaves the previous site live.
- **Drafts:** the build reads the `published` perspective only, so a draft is invisible until someone presses Publish.
- **Failure on purpose:** if `SANITY_PROJECT_ID` is set and a query fails, the build fails instead of shipping an empty
  site. Only a checkout with no project id (local, tests) falls back to the built-in copy.
- **Privacy:** the dataset must be private because lead documents contain personal data. The build authenticates with a
  read-only Viewer token (`SANITY_READ_TOKEN`) that is only read while building (verified: it is not in `out/`).

## Marketing

- **Tracking:** `src/utils/tracking/data-layer.ts` pushes GA4-style events to `window.dataLayer`: `cta_click` (landing CTA),
  `view_item`, `add_to_cart`, `begin_checkout`, each with an `ecommerce` object and the campaign source/medium/name. GTM
  loads after interaction when `NEXT_PUBLIC_GTM_ID` is set.
- **UTM:** `captureUtm` stores UTM parameters on landing (last-touch, `localStorage`); the lead form and the order payload
  send them, so attribution survives navigation.
- **Lead form:** zod schema shared by the form and the Function, honeypot, Cloudflare Turnstile, and an in-memory rate limit
  (per Worker instance; use Cloudflare's rate limiting rules or KV for something stricter). Leads are created as `lead`
  documents in Sanity, so marketing reads them in the Studio, with the UTM that brought them.
- **SEO:** a static `sitemap.xml` (landing, products, articles), per-page metadata and canonical URLs, Open Graph tags,
  JSON-LD for articles and products.

## Marketplace

Frontend-only; the order endpoint is a mock.

- **Catalog** (`/products`): all cards are in the HTML; the category filter only hides cards.
- **Detail** (`/products/[slug]`): the plan picker changes the price, promo shows a strikethrough regular price and the
  remaining quota (promo quota minus what is already in the cart).
- **Quota rule:** the promo quota belongs to the product, so Basic, Pro and Business draw from one pool. The pure functions in
  `src/utils/services/cart` enforce it on add, on quantity change, when restoring a saved cart, and again on the server
  (`validateLines`), and are covered by tests.
- **Cart:** zustand with `persist` (localStorage), restored after mount and sanitized against the catalog; the header cart
  button with a badge is on every page.
- **Checkout** (`/checkout`): react-hook-form + zod, order summary, then `POST /api/v1/orders`, which ignores client prices,
  recomputes totals, re-checks quota and returns paid (201) or declined (402). A demo select picks the outcome.
- **States:** loading (cart hydration skeleton, submit spinner), empty (cart, checkout, filter), error (failed payment with
  retry, network error), not found (a real 404 from `404.html`).

### Connecting the marketplace to a real backend

- **Endpoints:** `GET /products`, `POST /carts/validate` (quota and price check), `POST /orders` (creates a pending order and a
  payment intent), `POST /webhooks/payment`, `GET /orders/:id`.
- **Payment flow:** the server creates the order from the cart and recomputes every price; the client never sends amounts. The
  gateway calls the webhook, which verifies the signature, is idempotent on the gateway event id, and moves the order
  `pending -> paid | failed | expired`. The redirect page only reads order status; it never marks anything paid.
- **Accurate quota:** reserve licenses in a transaction when the order is created (`UPDATE promo SET remaining = remaining - n
  WHERE remaining >= n`), with a reservation expiry; release on failure or expiry and consume on `paid`. The per-product pool
  mirrors the rule already implemented in `cart/index.ts`. (On Cloudflare this is a D1 transaction or a Durable Object per
  product, since D1 alone has no row locks.)
- **License delivery:** after the verified `paid` webhook, generate the license keys in the same transaction as the status
  change, then email them through a queue (retries, idempotent), and show them in the account/order page.

## Deploy (Cloudflare Pages + Sanity)

Everything below is free. Do the steps in order; each command is meant to be run from the repo root unless it says otherwise.

**1. Sanity project (once)**

1. Create a project at [sanity.io/manage](https://www.sanity.io/manage) and note the **project id**.
2. Make the dataset private (it will contain leads): `cd studio && npx sanity login && npx sanity dataset visibility set production private`.
3. Under API > Tokens create two tokens: **Viewer** (read-only, for the build: `SANITY_READ_TOKEN`) and **Editor**
   (for the lead Function and the seed: `SANITY_WRITE_TOKEN`).
4. Publish the Studio (marketing signs in here): copy `studio/.env.example` to `studio/.env` and fill in
   `SANITY_STUDIO_PROJECT_ID` (the same project id) and `SANITY_STUDIO_HOST` (a unique name), then run
   `npm run studio:deploy` from the root. Invite your editors and the reviewer in the project's Members page.

   The project id therefore lives in four places, and it is the same value in all of them: `SANITY_PROJECT_ID` in
   `.env.production` (and the Pages build environment) for the site build, `SANITY_PROJECT_ID` in `wrangler.jsonc` for the lead
   Function, and `SANITY_STUDIO_PROJECT_ID` in `studio/.env` for the Studio. The Studio's name differs because Sanity only
   exposes `SANITY_STUDIO_*` variables to the Studio bundle. `npm run deploy` checks that the first two match.
5. Optional demo content: `SANITY_PROJECT_ID=... SANITY_WRITE_TOKEN=... npm run seed`.

**2. Configure the repo**

- `wrangler.jsonc`: replace `REPLACE_WITH_SANITY_PROJECT_ID` with your project id.
- Create `.env.production` (git-ignored) with `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_READ_TOKEN`,
  `NEXT_PUBLIC_SITE_URL` (your `https://<name>.pages.dev` or custom domain), `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and optionally
  `NEXT_PUBLIC_GTM_ID`. `npm run deploy` runs `scripts/check-deploy.mjs` first and stops on a placeholder, a missing
  token or a localhost site URL.

**3. Create the Pages project with git (recommended, enables automatic rebuilds)**

1. Push the repo to GitHub or GitLab.
2. Cloudflare dashboard > Workers & Pages > Create > Pages > Connect to git.
3. Build command `npm run build`, output directory `out`, root directory empty, and Node 24 (`.node-version`).
4. Environment variables (production): `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_READ_TOKEN`, `NEXT_PUBLIC_SITE_URL`,
   `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_GTM_ID`. These are the build-time values; Pages encrypts the token. `NEXT_PUBLIC_*` values are inlined into the
   pages while building, so adding or changing one only takes effect on the next build. `npm run build` runs
   `scripts/check-build-env.mjs`, which on Cloudflare Pages stops the build and lists what is missing (a missing site key
   would otherwise ship a lead form with no captcha, and a missing read token an empty blog). It does nothing locally.
5. Settings > Variables and secrets: add the Function secrets `SANITY_WRITE_TOKEN` and `TURNSTILE_SECRET_KEY`. (`SANITY_PROJECT_ID`
   and `SANITY_DATASET` come from `wrangler.jsonc`.)
6. Settings > Builds > **Deploy hooks**: create one for the production branch and copy its URL.

**4. Sanity webhook (automatic rebuilds)**

In sanity.io/manage > API > Webhooks: create a webhook with the deploy hook URL, method POST, trigger on Create, Update and
Delete, filter `_type in ["post", "landingPage", "testimonial", "faq", "category"]`, and drafts **off** (so only publishing
rebuilds). Skip `lead`, otherwise every lead form submission would trigger a build.

**5. Manual deploy instead (no git, no automatic rebuilds)**

```bash
npx wrangler login
npx wrangler pages project create kodeva --production-branch main
npx wrangler pages secret put SANITY_WRITE_TOKEN --project-name kodeva
npx wrangler pages secret put TURNSTILE_SECRET_KEY --project-name kodeva
npm run deploy
```

A direct-upload project cannot be connected to git later, and it has no deploy hook, so content changes need `npm run deploy`.

**6. After the first deploy**

- Open `/`, `/blog`, `/products`, an article, and submit the lead form once (the lead appears under Lead in the Studio).
- Edit the landing title in the Studio and Publish; the site should update after the rebuild.
- Run Lighthouse (mobile) on the deployed URL for the README screenshot.
- The previous Payload deployment can be removed in the dashboard: the `kodeva` Worker, the `kodeva` D1 database, and the
  `kodeva-media` and `kodeva-cache` R2 buckets.

## Status

Done: static export, Sanity-backed landing page and blog (list with pagination, article with Portable Text, SEO metadata,
JSON-LD, related products), lead and order Functions, UTM capture, CTA and ecommerce tracking, marketplace (catalog, detail,
cart, quota, checkout), Studio schemas, seed script, deploy pre-flight, 34 unit tests.

Lighthouse (mobile, performance, landing page, static output served by `wrangler pages dev`, fallback-free mock CMS content,
no images): **100**. FCP 1.3 s, LCP 1.3 s, TBT 30 ms, CLS 0. Reports are in `lighthouse/`. It is a localhost run: re-run it
against the deployed URL, with a real hero image, for the submission screenshot.

Verified here (mock Sanity API, workerd via `wrangler pages dev`): the static build from CMS-shaped data (7 articles,
page 2 of the blog, products, sitemap with 16 URLs, 404.html), every route returns the right status (unknown article,
product and `/blog/page/3` are real 404s), the lead Function validates, applies the honeypot and writes a correctly shaped
`lead` document, the order Function enforces the quota across plans and returns paid and declined, the seed script writes 13
documents with correct references and is idempotent by construction (`createIfNotExists`), the Studio typechecks and builds,
the pre-flight check fails and passes as designed, and the read token does not appear anywhere in `out/`.

Not verified (needs your accounts): a real Sanity project (GROQ queries against real data, the private dataset with the
Viewer token, the Studio in the browser, the webhook), a real Cloudflare Pages deploy and its deploy hook, and the Functions'
CPU time on the Free plan. The Functions are small (parse, one fetch, one write) and should be well under 10 ms, but the
only way to confirm is `wrangler pages deployment tail` after a deploy. If `/api/v1/leads` ever answers with error 1102, the
cheapest fix is to drop `libphonenumber-js` from that Function and validate the phone number with a simple regex.

Not done: mobile layout review by eye, and the Functions' rate limit is per Worker instance only.
