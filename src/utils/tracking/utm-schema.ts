import { z } from 'zod';

import { UTM_KEYS } from './utm';

export const UtmSchema = z.object(Object.fromEntries(UTM_KEYS.map((key) => [key, z.string().max(100).optional()])));
