import type { IApiResponse } from '../../src/utils/types/api';

// Bindings of the Pages project: `vars` in wrangler.jsonc and secrets set with `wrangler pages secret put`.
export interface Env {
  TURNSTILE_SECRET_KEY: string;
  SANITY_PROJECT_ID: string;
  SANITY_DATASET: string;
  // an Editor token, only used to create `lead` documents
  SANITY_WRITE_TOKEN: string;
  // tests only: points the Sanity calls at the local mock (`npm run mock:sanity`)
  SANITY_API_HOST?: string;
}

const STATUS_TEXT: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  400: 'Bad Request',
  402: 'Payment Required',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
};

// same envelope the browser code already expects: { metadata: { status_code, status, timestamp, error? }, data }
export function apiResponse<T>(statusCode: number, data: T, error?: string): Response {
  const body: IApiResponse<T> = {
    metadata: {
      status_code: statusCode,
      status: STATUS_TEXT[statusCode] ?? 'Unknown',
      timestamp: new Date().toISOString(),
      ...(error ? { error } : {}),
    },
    data,
  };

  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}
