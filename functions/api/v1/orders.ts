import { type IOrderResult, OrderSchema } from '../../../src/utils/apis/v2/orders/types';
import { logError } from '../../../src/utils/functions/log-error';
import { getCartTotals, validateLines } from '../../../src/utils/services/cart';
import { isRateLimited } from '../../../src/utils/services/rate-limit';
import { type Env, apiResponse, getClientIp } from '../../_lib/http';

interface Context {
  request: Request;
  env: Env;
}

// POST /api/v1/orders. Mock order endpoint: there is no payment gateway or database in this exercise. It still behaves
// like the real one would at the edges: it validates the payload, ignores client prices (totals are recomputed from the
// catalog), re-checks the promo quota on the server and only then "charges".
export async function onRequestPost({ request }: Context): Promise<Response> {
  try {
    if (isRateLimited(`orders:${getClientIp(request)}`, 10)) {
      return apiResponse(429, null, 'Terlalu banyak percobaan, coba lagi sebentar lagi');
    }

    const parsed = OrderSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
      return apiResponse(400, null, parsed.error.issues[0]?.message ?? 'Data pesanan tidak valid');
    }

    const { customer, lines, utm, simulate } = parsed.data;
    const issues = validateLines(lines);

    if (issues.length > 0) {
      return apiResponse(400, null, issues[0].message);
    }

    // stands in for the round trip to a payment gateway
    await new Promise((resolve) => setTimeout(resolve, 700));

    if (simulate === 'failure') {
      return apiResponse(402, null, 'Pembayaran ditolak oleh bank (simulasi). Silakan coba lagi.');
    }

    const result: IOrderResult = {
      orderId: `KDV-${Date.now().toString(36).toUpperCase()}`,
      status: 'paid',
      customer,
      lines,
      totals: getCartTotals(lines),
      utm: utm ?? {},
      paidAt: new Date().toISOString(),
    };

    return apiResponse(201, result);
  } catch (error) {
    logError('POST /api/v1/orders', error);

    return apiResponse(500, null, 'Terjadi kesalahan, silakan coba lagi');
  }
}
