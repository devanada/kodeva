import { createClient } from '@sanity/client';

// Build-time client. The dataset is private (lead documents hold personal data), so the build authenticates with a
// read-only Viewer token. This module is only imported by server components that run during `next build`, so the token
// never reaches the browser bundle or the static output.
// SANITY_API_HOST only exists so tests can point the client at the local mock (`npm run mock:sanity`).
const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? 'production';
const apiHost = process.env.SANITY_API_HOST;

export function isCmsConfigured(): boolean {
  return Boolean(projectId);
}

export const sanityClient = createClient({
  projectId: projectId ?? 'unconfigured',
  dataset,
  apiVersion: '2025-02-19',
  token: process.env.SANITY_READ_TOKEN,
  // the CDN can lag a few seconds behind a publish, and the rebuild runs right after one
  useCdn: false,
  perspective: 'published',
  ...(apiHost ? { apiHost, useProjectHostname: false } : {}),
});
