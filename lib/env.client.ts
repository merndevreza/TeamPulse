// /lib/env.client.ts
import 'client-only';
import { z } from 'zod';

const clientSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.url(),
});

export const env = clientSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});
