import { IApiResponse } from '@/utils/types/api';

import { IOrderResult, OrderInput } from './types';

export async function createOrder(input: OrderInput): Promise<IApiResponse<IOrderResult | null>> {
  const response = await fetch('/api/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  return response.json();
}
