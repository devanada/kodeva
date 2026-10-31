import { isCmsConfigured, sanityClient } from './client';
import type { ICmsLanding, ICmsPost, IPostsPage } from './types';

export const POSTS_PER_PAGE = 6;

const IMAGE = `{
  "url": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "alt": coalesce(alt, "")
}`;

const POST_SUMMARY = `{
  _id, title, "slug": slug.current, excerpt, publishedAt, _createdAt, _updatedAt,
  "cover": cover${IMAGE},
  "category": category->{ title, "slug": slug.current }
}`;

const LANDING_QUERY = `*[_id == "landingPage"][0]{
  "hero": hero{ title, subtitle, ctaLabel, "image": image${IMAGE} },
  "featuredProducts": coalesce(featuredProducts, []),
  "testimonials": coalesce(testimonials[]->{ _id, name, role, business, quote }, []),
  "faqs": coalesce(faqs[]->{ _id, question, answer, order } | order(order asc), [])
}`;

const POSTS_QUERY = `{
  "total": count(*[_type == "post" && defined(slug.current)]),
  "items": *[_type == "post" && defined(slug.current)] | order(publishedAt desc, _createdAt desc) [$from...$to]${POST_SUMMARY}
}`;

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  ...${POST_SUMMARY},
  "relatedProducts": coalesce(relatedProducts, []),
  body[]{ ..., _type == "image" => { ..., "url": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height } }
}`;

const SLUGS_QUERY = `*[_type == "post" && defined(slug.current)].slug.current`;

// The build runs several workers that ask for the same documents; one request per query and process is enough.
const memo = new Map<string, Promise<unknown>>();

function fetchOnce<T>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  const key = `${query}|${JSON.stringify(params)}`;

  if (!memo.has(key)) {
    memo.set(key, sanityClient.fetch<T>(query, params));
  }

  return memo.get(key) as Promise<T>;
}

let warnedUnconfigured = false;

// Without SANITY_PROJECT_ID (a fresh checkout, tests) the site builds with its built-in fallback content. With it set, a
// failing query throws and fails the build: shipping an empty site over a good one because the CMS hiccuped is worse.
function cmsReady(): boolean {
  if (isCmsConfigured()) {
    return true;
  }

  if (!warnedUnconfigured) {
    warnedUnconfigured = true;
    console.warn('[cms] SANITY_PROJECT_ID is not set: building with the built-in fallback content');
  }

  return false;
}

export async function getLandingPage(): Promise<ICmsLanding | null> {
  if (!cmsReady()) {
    return null;
  }

  return fetchOnce<ICmsLanding | null>(LANDING_QUERY);
}

export async function getPosts(page: number): Promise<IPostsPage> {
  const empty: IPostsPage = { docs: [], page, totalPages: 0, totalDocs: 0 };

  if (!cmsReady()) {
    return empty;
  }

  const from = (page - 1) * POSTS_PER_PAGE;
  const result = await fetchOnce<{ total: number; items: IPostsPage['docs'] }>(POSTS_QUERY, {
    from,
    to: from + POSTS_PER_PAGE,
  });

  return {
    docs: result.items,
    page,
    totalPages: Math.ceil(result.total / POSTS_PER_PAGE),
    totalDocs: result.total,
  };
}

export async function getPostBySlug(slug: string): Promise<ICmsPost | null> {
  if (!cmsReady()) {
    return null;
  }

  return fetchOnce<ICmsPost | null>(POST_QUERY, { slug });
}

export async function getAllPostSlugs(): Promise<string[]> {
  if (!cmsReady()) {
    return [];
  }

  return fetchOnce<string[]>(SLUGS_QUERY);
}

// pages 2..N of the blog list, for generateStaticParams
export async function getExtraBlogPages(): Promise<number[]> {
  const { totalPages } = await getPosts(1);

  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => index + 2);
}
