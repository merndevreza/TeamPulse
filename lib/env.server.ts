// /lib/env.server.ts
import 'server-only';
import { z } from 'zod';

const serverSchema = z.object({
  API_BASE_URL: z.url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = serverSchema.parse({
  API_BASE_URL: process.env.API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
});
