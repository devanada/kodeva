import { IApiResponse } from '@/utils/types/api';

import { LeadInput } from './types';

export async function createLead(input: LeadInput): Promise<IApiResponse<{ id?: string } | null>> {
  const response = await fetch('/api/v1/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  return response.json();
}
