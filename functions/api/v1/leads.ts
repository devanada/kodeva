import { LeadSchema } from '../../../src/utils/apis/v2/leads/types';
import { logError } from '../../../src/utils/functions/log-error';
import { isRateLimited } from '../../../src/utils/services/rate-limit';
import { verifyTurnstile } from '../../../src/utils/services/turnstile';
import { type Env, apiResponse, getClientIp } from '../../_lib/http';

interface Context {
  request: Request;
  env: Env;
}

// POST /api/v1/leads. Runs as a Pages Function (a Worker): the work is a zod parse, one Turnstile call and one write to
// Sanity, and waiting on those fetches is not CPU time, so it stays well inside the Free plan's 10 ms.
export async function onRequestPost({ request, env }: Context): Promise<Response> {
  try {
    const ip = getClientIp(request);

    if (isRateLimited(`leads:${ip}`)) {
      return apiResponse(429, null, 'Terlalu banyak percobaan, coba lagi sebentar lagi');
    }

    const body = (await request.json().catch(() => null)) as { website?: unknown } | null;

    // a filled honeypot gets a normal-looking success so bots learn nothing, but nothing is stored
    if (body && typeof body.website === 'string' && body.website !== '') {
      return apiResponse(201, {});
    }

    const parsed = LeadSchema.safeParse(body);

    if (!parsed.success) {
      return apiResponse(400, null, parsed.error.issues[0]?.message ?? 'Data tidak valid');
    }

    if (!(await verifyTurnstile(parsed.data.turnstileToken, env.TURNSTILE_SECRET_KEY, ip))) {
      return apiResponse(400, null, 'Verifikasi gagal, silakan coba lagi');
    }

    const { name, email, whatsapp, utm, landingPath } = parsed.data;
    const base = env.SANITY_API_HOST ?? `https://${env.SANITY_PROJECT_ID}.api.sanity.io`;
    const response = await fetch(`${base}/v2025-02-19/data/mutate/${env.SANITY_DATASET}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${env.SANITY_WRITE_TOKEN}` },
      body: JSON.stringify({
        mutations: [
          {
            create: {
              _type: 'lead',
              name,
              email: email || undefined,
              whatsapp: whatsapp || undefined,
              utm,
              landingPath,
              createdAt: new Date().toISOString(),
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Sanity mutate responded ${response.status}: ${await response.text()}`);
    }

    return apiResponse(201, {});
  } catch (error) {
    logError('POST /api/v1/leads', error);

    return apiResponse(500, null, 'Terjadi kesalahan, silakan coba lagi');
  }
}
