"use server"

import { cookies } from "next/headers";
import { LogoutApiResponse } from "./type";
import { apiPost } from "../api/api-client";

interface LogoutResponse {
  message?: string;
}

export async function handleLogout(): Promise<LogoutApiResponse> {
   const cookieStore = await cookies();
   const accessToken = cookieStore.get('accessToken')?.value;
   const refreshToken = cookieStore.get('refreshToken')?.value;

   // Always clear cookies first for faster perceived logout
   cookieStore.delete('accessToken');
   cookieStore.delete('refreshToken');

   // If no tokens, we're already logged out
   if (!accessToken && !refreshToken) {
      return {
         success: true,
         message: "Logged out successfully",
         status: 200,
         statusText: "OK",
      };
   }

   // Fire and forget: notify backend to blacklist token
   // Don't await - user is already logged out locally
   const logoutData = refreshToken ? { refresh: refreshToken } : {};
   void apiPost<LogoutResponse>('/api/user/logout/', logoutData, {
      requireAuth: false,
      headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
      timeout: 5000,
   }).catch((error) => {
      console.error('[Logout] Backend token blacklist failed:', error);
   });

   return {
      success: true,
      message: "Logged out successfully",
      status: 200,
      statusText: "OK",
   };
}
