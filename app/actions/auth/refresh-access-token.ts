"use server"

import { cookies } from "next/headers";
import { jwtDecode } from 'jwt-decode';
import { invalidateTokenCache, ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE, isProduction } from '@/utils/token-cache';

export interface RefreshTokenResponse {
   access: string;
   refresh: string;
}

export interface RefreshTokenResult {
   success: boolean;
   accessToken?: string;
   refreshToken?: string;
   message?: string;
   shouldClearAuth?: boolean;  // Indicates if auth should be completely cleared
}

interface DecodedToken {
   email?: string;
   exp?: number;
   iat?: number;
   jti?: string;
   role?: string;
   token_type?: string;
   user_id?: string; // Note: user_id is a string in the actual token
   [key: string]: unknown;
}

/**
 * Core token refresh logic - returns new tokens without setting cookies.
 * Use this for Server Components/API calls where cookies cannot be modified.
 * The middleware handles cookie updates for the browser.
 */
export async function refreshTokenCore(refreshToken: string): Promise<RefreshTokenResult> {
   try {
      // Validate refresh token before making API call
      try {
         const decodedRefresh = jwtDecode<DecodedToken>(refreshToken);
         const currentTime = Math.floor(Date.now() / 1000);

         if (decodedRefresh.exp && decodedRefresh.exp <= currentTime) { 
            return {
               success: false,
               message: "Refresh token expired",
               shouldClearAuth: true
            };
         }
      } catch (decodeError) {
         console.error("Invalid refresh token format:", decodeError);
         return {
            success: false,
            message: "Invalid refresh token",
            shouldClearAuth: true
         };
      }

      const apiBaseUrl = process.env.API_BASE_URL;
      if (!apiBaseUrl) {
         console.error("API_BASE_URL environment variable is not set");
         return {
            success: false,
            message: "Configuration error"
         };
      }

      // Make API call with timeout and proper error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
         const response = await fetch(`${apiBaseUrl}/api/user/token/refresh/`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh: refreshToken }),
            signal: controller.signal
         });

         clearTimeout(timeoutId); 

         if (!response.ok) {
            const errorText = await response.text();
            console.error("Refresh token API failed:", response.status, errorText);

            // Parse error response to get more details
            let errorDetails;
            try {
               errorDetails = JSON.parse(errorText);
            } catch {
               errorDetails = { detail: errorText };
            }

            // Handle specific error cases
            if (response.status === 401 || response.status === 403) {
               // Check for blacklisted token specifically
               const isBlacklisted = errorDetails?.detail?.includes('blacklisted') ||
                  errorDetails?.code === 'token_not_valid';

               if (isBlacklisted) {
                  console.error("Refresh token is blacklisted");
               }

               return {
                  success: false,
                  message: isBlacklisted ? "Session expired. Please log in again." : "Refresh token invalid or expired",
                  shouldClearAuth: true
               };
            }

            if (response.status >= 500) {
               return {
                  success: false,
                  message: "Server error during token refresh"
               };
            }

            return {
               success: false,
               message: `Token refresh failed: ${response.status}`
            };
         }

         const result: RefreshTokenResponse = await response.json();
         const newAccessToken = result.access; 
         const newRefreshToken = result.refresh; 

         if (!newAccessToken || !newRefreshToken) {
            console.error("No access or refresh token in response");
            return {
               success: false,
               message: "Invalid refresh response",
               shouldClearAuth: true
            };
         }

         // Invalidate old token cache since we have new tokens
         invalidateTokenCache();

         return {
            success: true,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            message: "Token refreshed successfully"
         };

      } catch (fetchError) {
         clearTimeout(timeoutId);

         if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            console.error("Refresh token request timed out");
            return {
               success: false,
               message: "Request timeout"
            };
         }

         console.error("Network error during token refresh:", fetchError);
         return {
            success: false,
            message: "Network error"
         };
      }

   } catch (error) {
      console.error("Unexpected error refreshing access token:", error);
      return {
         success: false,
         message: "Unexpected error occurred"
      };
   }
}

/**
 * Full token refresh with cookie setting - ONLY use in Server Actions or Route Handlers.
 * For Server Components, use refreshTokenCore instead.
 */
export async function getAccessTokenByRefreshToken(): Promise<RefreshTokenResult> {
   try {
      const cookieStore = await cookies();
      const refreshToken = cookieStore.get('refreshToken')?.value; 

      if (!refreshToken) { 
         return {
            success: false,
            message: "No refresh token available",
            shouldClearAuth: true
         };
      }

      // Use core refresh logic
      const result = await refreshTokenCore(refreshToken);

      // Only set cookies if refresh was successful
      if (result.success && result.accessToken && result.refreshToken) {
         const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict' as const,
            path: '/',
         };

         cookieStore.set('accessToken', result.accessToken, {
            ...cookieOptions,
            maxAge: ACCESS_TOKEN_MAX_AGE,
         }); 

         cookieStore.set('refreshToken', result.refreshToken, {
            ...cookieOptions,
            maxAge: REFRESH_TOKEN_MAX_AGE,
         });
      }

      return result;

   } catch (error) {
      console.error("Unexpected error refreshing access token:", error);
      return {
         success: false,
         message: "Unexpected error occurred"
      };
   }
}
