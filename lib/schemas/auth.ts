// at top of the file:
import { z } from 'zod';

// Input validation (ensures email format + non-empty password)
export const LoginInputSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

// Response validation (what the API should return)
export const LoginTokenResponseSchema = z.object({
  access: z.string().min(1),
  refresh: z.string().min(1),
  message: z.string().optional(),
});
