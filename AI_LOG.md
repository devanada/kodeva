# AI usage log

## 1. Tools used and for what

| Tool | Used for |
| --- | --- |
| **Claude Code** (desktop app, Claude Sonnet 5.5) | Almost all of the code: scaffolding, the cart and quota logic, the CMS integration, the Cloudflare Pages Functions, unit tests, the deploy checks, debugging production problems, and writing the docs |
| Claude's web search and fetch (inside Claude Code) | Reading Cloudflare's limits page and the OpenNext Cloudflare adapter's issue tracker while choosing the hosting setup |
| Claude in Chrome / the built-in browser (inside Claude Code) | Driving the running site: the cart quota flow, checkout, the tracking events, the mobile layout check |
| Lighthouse CLI, Wrangler, Sanity CLI | Not AI. Measurement, local Workers runtime and Studio build |
| [ISI: any other AI tool you used, for example ChatGPT, Copilot or Cursor, and for which part. Write "none" if none.] | |

## 2. The prompts that helped most

**a. Choosing the stack before writing code** (the first prompt, with the brief PDF attached)

> "This is out of context from existing environment, I want you to analyze this pdf and give me suggestion about it, is it
> good that we tackle all the requirements using only next.js or anything?"

Why it helped: it made the AI read the whole brief and answer the question I actually had, whether Next.js alone is enough.
It said no (a CMS and storage for leads are needed) and listed the traps hidden in the brief: the promo quota shared by
all plans of a product, tracking events that must not repeat on re-render, UTM that must survive page changes, the
Malaysia/Singapore hint, and share previews. I used that list as a checklist for the whole project.

**b. Changing course instead of tuning**

> "just want to use free plan, find another solution to tackle this issue"

Why it helped: the first version could not run on Cloudflare's free plan. Rather than keep trying settings, this prompt
made the AI check the real limits, say plainly that the Payload admin could not fit in 10 ms of CPU, and propose a
different architecture (static site, hosted CMS, two tiny Functions). I picked the option; the AI did the migration.

**c. Debugging from evidence, with a screenshot**

> "investigate lead form, cause i got Selesaikan verifikasi terlebih dahulu" (with a screenshot of the form)

Why it helped: instead of guessing, the AI read the deployed JavaScript, found that the captcha site key had not been built
in (`process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""` was still unresolved), saw from the sitemap that the site URL was
also missing, and then fixed the cause (see mistake 3 below).

## 3. Where the AI was wrong, and how I caught it

**1. It stated a wrong hosting limit as fact.** While explaining why the deploy could not use the Workers Free plan, it said
the Free plan caps a Worker at 3 MB compressed and that our 7.8 MiB upload was over it, so a paid plan was needed. That was
out of date. Found when I asked for another solution and it fetched Cloudflare's limits page before proposing one: there is
no compressed limit, only 64 MiB uncompressed. Verified with `wrangler deploy --dry-run` (34,069 KiB, about 33 MiB, uploaded) and the docs. The
real blocker was CPU time (10 ms), not size. The README no longer claims the size limit.

**2. It shipped an architecture that passed every local check and failed in production.** Payload CMS ran inside a
Cloudflare Worker (through OpenNext). Everything worked on the local Workers runtime: pages, admin, lead insert, orders.
But the local runtime does not enforce Cloudflare's limits, and the live `/admin/login` returned error 1102, "Worker
exceeded CPU time limit". Found from the error I got on the deployed site and confirmed with `wrangler tail`. Measured the
cause: the first admin request takes about 1.2 s and later ones about 0.17 s, against 10 ms on the Free plan. The fix was
not a setting but a redesign: a static export on Cloudflare Pages, Sanity as the CMS, and two small Functions. Verified by
a Lighthouse run on the deployed site (100), the Functions on the local Workers runtime, and a build from CMS-shaped data.

**3. A build "succeeded" into a broken site, and its own safety check did not cover the case.** The first Pages build had
none of the `NEXT_PUBLIC_*` variables, which are baked in at build time, so there was no captcha (the form only said
"Selesaikan verifikasi terlebih dahulu") and the sitemap pointed at `localhost`. The AI had written a pre-flight check, but
it only ran on `npm run deploy`, not on Cloudflare's build. Found by inspecting the live JavaScript bundle. Fixed with
`scripts/check-build-env.mjs` (it stops a Pages build and lists what is missing), a visible "Formulir belum aktif" message
when no site key exists, and tests for both states. Verified in five scenarios, including the exact case that happened,
and by confirming the key now appears as a literal in the built bundle.

**4. It would have broken the launch with an empty blog.** A static export refuses an empty `generateStaticParams`, so the
build would fail with zero articles, or with six or fewer (the normal state at launch for the page-2 route). Found by my own
check of building with no CMS configured, before anything was deployed. Fixed with hidden placeholder routes that are kept
out of search engines. Verified by building with no CMS, with the mock CMS (7 articles) and with the real project.

**5. A plan that would have exposed personal data.** The first CMS design used a public Sanity dataset. The lead documents
(names, emails, WhatsApp numbers) live in the same dataset, so anyone with the project id could have queried them. Found
while writing the deploy docs. Fixed with a private dataset and a read-only token used only while building. Verified that
the token appears nowhere in the built site, and that an anonymous query to a private dataset silently returns an empty
result (HTTP 200) while a wrong token returns 401. That second fact is why the build now also refuses to run without the
token: otherwise a missing token would publish an empty blog without any error.

**6. It claimed a measurement it had not made.** After the first mobile check the AI wrote in the README that the primary
buttons and the quantity steppers were 44 px. Only the steppers were. The first pass flagged anything under 40 px, so 40 px
buttons passed unnoticed. Found when the same check was rerun with a strict 44 px threshold, after the other fixes: the large
buttons, the header cart icon and the text inputs were 40, 40 and 36 px. Fixed by making the large button size 44 px (the site
uses it for every primary action) and the input element 44 px, and pagination links 44 px. Verified by measuring again on six
pages in a 375 px browser (nothing under 44 px) and by a hit test showing that tapping the middle of a landing card reaches
its link.

**7. The share-preview fix looked done and was not.** The AI added a share image using Next.js's file convention and a build
that succeeded. Checking the built HTML page by page showed most pages (the product pages, and articles without a cover) had
no `og:image` at all: a page that defines its own `openGraph` replaces the parent's including the image, and moving the file
next to the layout only fixed some pages. Switched to one image at a fixed URL that every such page sets explicitly. Verified
by reading the generated HTML of ten page types for an absolute `og:image`, and by keeping the file at 40 KB because
WhatsApp skips large images (the first render was 409 KB). The lesson, in both cases, was to measure the output instead of
trusting that a successful build means the result is right.

## 4. The part where the AI helped most, and the edge cases I tested

**The promo quota across plans** (`src/utils/services/cart`). The brief says the quota limit applies to the total licenses of
a product in the cart, not to each line. The AI wrote it as pure functions (`addToLines`, `setLineQuantity`,
`sanitizeLines`, `validateLines`) shared by the browser and the server, and I checked these cases, 19 unit tests plus the
real flow:

- Basic 30 plus Pro 15 leaves 5 of a quota of 50, because the pool is shared by all plans.
- Adding more than what is left adds only what fits (partial add), and adds nothing once the quota is used up.
- Changing the quantity of one line is limited by what the other plans of the same product already hold.
- A quantity can never go below 1 by decrement, and zero, negative and fractional quantities are rejected or floored.
- A cart restored from `localStorage` that was tampered with (500 Basic plus 500 Pro) is trimmed back to the quota, and
  unknown products or plans and non-numeric quantities are dropped.
- The server recomputes everything from the catalog: it ignores a client-supplied price, and rejects 30 Basic plus 30 Pro
  with "Kuota Kodeva Kasir hanya tersisa 50 lisensi", plus duplicate lines and unknown products.
- In the browser: 40 Basic plus 10 Pro reaches exactly 50 and the button becomes "Kuota habis"; the cart survives a reload;
  lowering one plan frees room for the other.

One of my test steps was wrong rather than the code: a script that clicked "+" 39 times in a row moved the quantity by one,
because React had not re-rendered between synchronous clicks. I redid it with a pause between clicks.

## 5. What I wrote myself without AI, and why

[ISI: the parts you wrote or decided yourself without AI, and why you chose to. Be specific and honest, for example which
files or decisions, and the reason (to understand it, because it was faster, because it was a judgement call). If you wrote
nothing without AI, say that. This section has to be your own words.]

## Process notes

- The project went through two architectures. Payload on Cloudflare Workers came first and was rebuilt as a static site with
  Sanity when it proved impossible on the Workers Free plan (mistake 2).
- The repository history was created at the end, grouped by feature area, because no intermediate states were saved. It
  reads as a feature-by-feature history, not a chronological one, and a few intermediate commits do not build on their own.
  Changes made after that are committed one iteration at a time.
- Next.js in this repository is a version with breaking changes (the project's `AGENTS.md` says so). The AI was told to read
  the local docs, and it did for caching and revalidation instead of relying on memory, which is how the Cache Components and
  ISR trade-offs were checked.
- Secrets: no keys or tokens are in the repository. The Sanity project id in `wrangler.jsonc` and the Turnstile site key are
  public by design. The read token, write token and Turnstile secret live only in the Cloudflare dashboard and in
  git-ignored local files.
