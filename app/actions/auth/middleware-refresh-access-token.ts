import { refreshTokenCore, RefreshTokenResult } from './refresh-access-token';

export type { RefreshTokenResult };

// This function is specifically for middleware use - it doesn't set cookies
// It delegates to refreshTokenCore which contains the core refresh logic
export async function refreshTokenForMiddleware(refreshToken: string): Promise<RefreshTokenResult> {
   return refreshTokenCore(refreshToken);
}