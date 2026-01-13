"use server";
import { ApiResponse } from './types';
import { extractRoleFromToken } from '@/utils/token-cache';
import { refreshTokenCore, RefreshTokenResult } from '../../auth/refresh-access-token';
import { validateAndCacheToken } from '@/utils/token-cache';

// Token refresh synchronization for 401 retry scenarios
const refreshLock = new Map<string, Promise<RefreshTokenResult>>();

const getCookies = async () => {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get('accessToken')?.value,
    refreshToken: cookieStore.get('refreshToken')?.value,
  };
};

// Check if the current user has admin role (server-side only)
export const verifyAdminRole = async (): Promise<ApiResponse<null>> => {
  try {
    const { accessToken } = await getCookies();
    const role = await extractRoleFromToken(accessToken);

    if (role === 'admin') {
      return {
        success: true,
        message: "Admin role verified successfully.",
        status: 200,
        statusText: "OK",
      };
    } else {
      return {
        success: false,
        message: "Access denied. Admin role required.",
        status: 403,
        statusText: "Forbidden",
      };
    }
  } catch (error) {
    console.error('Error verifying admin role:', error);
    return {
      success: false,
      message: "An error occurred while verifying permissions.",
      status: 500,
      statusText: "Internal Server Error",
    };
  }
};

// Token refresh function (read-only - does not set cookies)
// Cookies are handled by the middleware for subsequent requests
const refreshTokenHandler = async (refreshToken: string) => {
  // Check if there's already a refresh in progress for this token
  const existingRefresh = refreshLock.get(refreshToken);
  if (existingRefresh) {
    console.log("Token refresh already in progress, waiting for result...");
    return existingRefresh;
  }

  // Create new refresh promise using refreshTokenCore (no cookie modification)
  const refreshPromise = refreshTokenCore(refreshToken);
  
  // Store the promise to prevent concurrent refreshes
  refreshLock.set(refreshToken, refreshPromise);
  
  try {
    const result = await refreshPromise;
    return result;
  } finally {
    // Always clean up the lock after completion
    refreshLock.delete(refreshToken);
  }
};

// Get valid access token - relies on middleware for token refresh
// Server Components cannot modify cookies, so we trust the middleware has already
// refreshed tokens if needed. We only return what's in the cookies.
export const getValidAccessToken = async (): Promise<{ token: string | null; shouldClearAuth: boolean }> => {
  const { accessToken, refreshToken } = await getCookies();

  // No tokens available
  if (!accessToken && !refreshToken) {
    return { token: null, shouldClearAuth: true };
  }

  // Check if access token is valid using cached validation
  if (accessToken) {
    const tokenValidation = await validateAndCacheToken(accessToken);

    if (tokenValidation.isValid) {
      // Token is valid - trust middleware has handled any near-expiry refresh
      return { token: accessToken, shouldClearAuth: false };
    }
  }

  // Access token is invalid/expired - this shouldn't happen if middleware is working
  // but if it does, indicate auth failure without trying to refresh
  // (Server Components cannot set cookies, so refreshing here would be futile)
  if (refreshToken) {
    const refreshValidation = await validateAndCacheToken(refreshToken);
    if (refreshValidation.isValid) {
      // Refresh token is valid but access token isn't - middleware should have handled this
      // Don't clear auth, let the next request go through middleware to refresh
      console.log("Access token invalid but refresh token valid - middleware should refresh on next request");
      return { token: null, shouldClearAuth: false };
    }
  }

  // Both tokens invalid/expired
  return { token: null, shouldClearAuth: true };
};

// Force refresh token (for 401 retry scenarios)
export const forceRefreshToken = async (): Promise<{ token: string | null; shouldClearAuth: boolean }> => {
  const { refreshToken } = await getCookies();

  if (!refreshToken) {
    return { token: null, shouldClearAuth: true };
  }

  try {
    const refreshResult = await refreshTokenHandler(refreshToken);

    if (refreshResult.success && refreshResult.accessToken) {
      return { token: refreshResult.accessToken, shouldClearAuth: false };
    }

    return { token: null, shouldClearAuth: refreshResult.shouldClearAuth || false };
  } catch (error) {
    console.error("Force token refresh error:", error);
    // Don't clear auth on network/unexpected errors
    return { token: null, shouldClearAuth: false };
  }
};
