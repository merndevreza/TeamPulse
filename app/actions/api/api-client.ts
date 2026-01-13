"use server"; 
import { ApiRequestOptions, ApiResponse } from './lib/types';
import { forceRefreshToken, getValidAccessToken, verifyAdminRole } from './lib/auth-helpers';
import { handleApiError, handleNetworkError } from './lib/error-handlers';
import { env } from '@/lib/env.server';
import { logger } from '@/utils/logger';
import combinedSignal from './lib/abort-controller';

const baseUrl = env.API_BASE_URL;

 const makeAuthenticatedRequest = async (
  url: string,
  options: RequestInit,
  accessToken: string,
  timeout: number = 10000,
  parentSignal?: AbortSignal
): Promise<Response> => {
  const { signal, cleanup } = combinedSignal({ parent: parentSignal, timeoutMs: timeout });

  try {
    // Allow self-signed certificates in development
    if (process.env.NODE_ENV === 'development' && typeof process !== 'undefined') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
      },
      signal: signal,
    });

    cleanup();
    return response;
  } catch (error) {
    cleanup();
    throw error;
  }
};

// Main API request function
export const apiRequest = async <T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {
    cache: 'default'
  }
): Promise<ApiResponse<T>> => {
  try {
    // Extract options with defaults
    const {
      method = 'GET',
      body,
      requireAuth = true,
      timeout = 10000,
      headers = {},
      cache = 'default',
      parentSignal,
    } = options;

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      cache,
      next: { revalidate: options.revalidate, tags: options.tags }
    };

    let response: Response;

    if (requireAuth) {
      // Get valid access token (with automatic refresh if needed)
      const { token: accessToken, shouldClearAuth } = await getValidAccessToken();

      if (!accessToken || shouldClearAuth) { 
        if (typeof window !== 'undefined') {
          if (!accessToken) {
            console.log('[Logout] No access token found. Logging out user.');
          } else if (shouldClearAuth) {
            console.log('[Logout] Token validation failed or refresh required. Logging out user.');
          }
        }
        return {
          success: false,
          message: "Authentication required. Please log in again.",
          status: 401,
          statusText: "Unauthorized",
          shouldClearAuth: true,
        };
      }

      // Make authenticated request
      response = await makeAuthenticatedRequest(
        `${baseUrl}${endpoint}`,
        requestOptions,
        accessToken,
        timeout,
        parentSignal
      );

      // Handle 401 errors with token refresh retry
      if (response.status === 401) { 
        if (typeof window !== 'undefined') {
          console.log(`[401] Received 401 for ${method} ${endpoint}, attempting token refresh...`);
        }
        // Force refresh the token
        const { token: newAccessToken, shouldClearAuth: shouldClear } = await forceRefreshToken();
        if (newAccessToken && !shouldClear) {
          logger.info(`Token refreshed successfully, retrying ${method} ${endpoint}`);
          if (typeof window !== 'undefined') {
            console.log(`[401] Token refreshed successfully, retrying ${method} ${endpoint}`);
          }
          // Retry the request with the new token
          response = await makeAuthenticatedRequest(
            `${baseUrl}${endpoint}`,
            requestOptions,
            newAccessToken,
            timeout,
            parentSignal
          );
          if (response.status === 401) {
            if (typeof window !== 'undefined') {
              console.log(`[Logout] Retried request after token refresh but still received 401. Logging out user.`);
            }
            return {
              success: false,
              message: "Authentication required. Please log in again.",
              status: 401,
              statusText: "Unauthorized",
              shouldClearAuth: true,
            };
          } else {
            if (typeof window !== 'undefined') {
              console.log(`[401] Retried request after token refresh succeeded.`);
            }
          }
        } else {
          logger.error(`Token refresh failed for ${method} ${endpoint}`, undefined, { shouldClear });
          if (typeof window !== 'undefined') {
            console.log(`[Logout] Token refresh failed. Reason: ${shouldClear ? 'Refresh token invalid/expired/blacklisted' : 'Network/server error'}.`);
          }
          // Only clear auth if refresh explicitly indicates to do so
          if (shouldClear) {
            return {
              success: false,
              message: "Authentication required. Please log in again.",
              status: 401,
              statusText: "Unauthorized",
              shouldClearAuth: true,
            };
          } else {
            // Do NOT log out on network/server error, just return error
            return {
              success: false,
              message: "Temporary network/server error during token refresh. Please try again.",
              status: 503,
              statusText: "Service Unavailable",
              shouldClearAuth: false,
            };
          }
        }
      }
    } else {
      // Make public request
      const fullUrl = `${baseUrl}${endpoint}`;

      const { signal, cleanup } = combinedSignal({ parent: undefined, timeoutMs: timeout });
      try {
        // Allow self-signed certificates in development
        if (process.env.NODE_ENV === 'development' && typeof process !== 'undefined') {
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }

        const fetchOptions: RequestInit = {
          ...requestOptions,
          signal,
        };

        response = await fetch(fullUrl, fetchOptions);
        cleanup();
      } catch (error) {
        cleanup();
        throw error;
      }
    }

    // Handle error responses
    if (!response.ok) {
      if (typeof window !== 'undefined') {
        console.log(`[API Error] ${method} ${endpoint} failed with status ${response.status}: ${response.statusText}`);
      }
      return handleApiError<T>(response, requireAuth);
    }

    // Parse successful response if response is not of a DELETE request
    if (method === 'DELETE' && response.status === 204) {
      // No Content response for DELETE
      return {
        success: true,
        message: "Request completed successfully",
        status: response.status,
        statusText: response.statusText,
      };
    }

    const responseData: T = await response.json();
    
    return {
      success: true,
      message: "Request completed successfully",
      data: responseData,
      status: response.status,
      statusText: response.statusText,
    };

  } catch (error) {
    if (typeof window !== 'undefined') {
      console.log(`[Network Error] ${error instanceof Error ? error.message : String(error)}`);
    }
    return handleNetworkError<T>(error);
  }
};

// Convenience functions for common HTTP methods

export const apiGet = async <T = unknown>(
  endpoint: string,
  options: Omit<ApiRequestOptions, 'method'> = {
    cache: 'default'
  }
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, { ...options, method: 'GET' });
};

export const apiPost = async <T = unknown>(
  endpoint: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {
    cache: 'default'
  }
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, { ...options, method: 'POST', body });
};

export const apiPatch = async <T = unknown>(
  endpoint: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {
    cache: 'default'
  }
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, { ...options, method: 'PATCH', body });
};

export const apiPut = async <T = unknown>(
  endpoint: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {
    cache: 'default'
  }
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, { ...options, method: 'PUT', body });
};

export const apiDelete = async <T = unknown>(
  endpoint: string,
  options: Omit<ApiRequestOptions, 'method'> = {
    cache: 'default'
  }
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
};

// Admin-only convenience functions (server-side only)

export const adminApiGet = async <T = unknown>(
  endpoint: string,
  options: Omit<ApiRequestOptions, 'method'> = {
    cache: 'default'
  }
): Promise<ApiResponse<T>> => {
  const adminCheck = await verifyAdminRole();
  if (!adminCheck.success) {
    return adminCheck as ApiResponse<T>;
  }
  return apiRequest<T>(endpoint, { ...options, method: 'GET' });
};

export const adminApiPost = async <T = unknown>(
  endpoint: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {
    cache: 'default'
  }
): Promise<ApiResponse<T>> => {
  const adminCheck = await verifyAdminRole();
  if (!adminCheck.success) {
    return adminCheck as ApiResponse<T>;
  }
  return apiRequest<T>(endpoint, { ...options, method: 'POST', body });
};

export const adminApiPatch = async <T = unknown>(
  endpoint: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {
    cache: 'default'
  }
): Promise<ApiResponse<T>> => {
  const adminCheck = await verifyAdminRole();
  if (!adminCheck.success) {
    return adminCheck as ApiResponse<T>;
  }
  return apiRequest<T>(endpoint, { ...options, method: 'PATCH', body });
};

export const adminApiPut = async <T = unknown>(
  endpoint: string, 
  body?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {
    cache: 'default'
  }
): Promise<ApiResponse<T>> => {
  const adminCheck = await verifyAdminRole();
  if (!adminCheck.success) {
    return adminCheck as ApiResponse<T>;
  }
  return apiRequest<T>(endpoint, { ...options, method: 'PUT', body });
};

export const adminApiDelete = async <T = unknown>(
  endpoint: string,
  options: Omit<ApiRequestOptions, 'method'> = {
    cache: 'default'
  }
): Promise<ApiResponse<T>> => {
  const adminCheck = await verifyAdminRole();
  if (!adminCheck.success) {
    return adminCheck as ApiResponse<T>;
  }
  return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
};