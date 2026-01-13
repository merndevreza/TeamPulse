"use server"

import { cookies } from "next/headers"; 
import { z } from "zod";
import { LoginApiResponse, LoginData, LoginTokenResponse } from "./type";
import { apiPost } from "../api/api-client";
import { LoginInputSchema, LoginTokenResponseSchema } from "@/lib/schemas/auth";
import { extractRoleFromToken, ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE, isProduction } from "@/utils/token-cache";


export async function handleLogin(data: LoginData): Promise<LoginApiResponse> {
  try {
    const parseInput = LoginInputSchema.safeParse(data);
    if (!parseInput.success) {
      return {
        success: false,
        message: "Email and password are required and must be valid",
        status: 400,
        statusText: "Bad Request",
      };
    }

    // Public login call with longer timeout
    const result = await apiPost<LoginTokenResponse>('/api/user/login/', data, {
      requireAuth: false,
      timeout: 30000, // 30 seconds
      cache: 'no-store' // Disable caching for login
    });

    if (!result.success) {
      // Clear any existing cookies on login failure
      const cookieStore = await cookies();
      cookieStore.delete('accessToken');
      cookieStore.delete('refreshToken');

      let message = "Invalid email or password";
      if (result.status >= 500) {
        message = "Server error. Please try again later.";
      }

      return {
        success: false,
        message,
        status: result.status,
        statusText: result.statusText,
      };
    }

    const parsed = LoginTokenResponseSchema.safeParse(result.data);
    if (!parsed.success) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Login response schema mismatch:', z.treeifyError(parsed.error));
      }
      return {
        success: false,
        message: "Invalid response from server",
        status: 502,
        statusText: "Bad Gateway",
      };
    }

    const { access, refresh, message } = parsed.data;

    // Set secure cookies with proper error handling
    const cookieStore = await cookies();

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
      path: '/',
    };

    try {
      cookieStore.set('accessToken', access, {
        ...cookieOptions,
        maxAge: ACCESS_TOKEN_MAX_AGE,
      });

      cookieStore.set('refreshToken', refresh, {
        ...cookieOptions,
        maxAge: REFRESH_TOKEN_MAX_AGE,
      });

      // Use secure extractRoleFromToken function instead of jwtDecode
      const userRole = await extractRoleFromToken(access);

      return {
        success: true,
        message: message || "Login successful",
        data: {
          role: (userRole as 'admin' | 'user') || 'user',
        },
        status: result.status,
        statusText: result.statusText,
      };

    } catch (jwtError) {
      return {
        success: false,
        message: "Invalid token format received",
        status: 500,
        statusText: "Internal Server Error",
      };
    }
  } catch (error) {
    console.error("Login error:", error);

    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');

    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
      status: 500,
      statusText: "Internal Server Error",
    };
  }
}
