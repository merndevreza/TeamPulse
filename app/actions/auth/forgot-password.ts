"use server"

import { forgotPasswordApiResponse, forgotPasswordData, forgotPasswordResponseData} from "./type";
import { apiPost } from "../api/api-client";


export async function handleForgotPassword(data: forgotPasswordData): Promise<forgotPasswordApiResponse> {
   try {
      if (!data.email) {
         return {
            success: false,
            message: "Email is required",
            status: 400,
            statusText: "Bad Request",
         };
      }

      // Make API call using the api client
      const result = await apiPost('/api/user/auth/forget-password/', data, { requireAuth: false }); 

      if (!result.success) {
         return {
            success: false,
            message: result.message || "Failed to send password reset email",
            status: result.status,
            statusText: result.statusText,
            shouldClearAuth: result.shouldClearAuth,
         };
      }

      // Extract message from nested data object if available
      const responseData = result.data as forgotPasswordResponseData | undefined;
      const successMessage = responseData?.message || result.message || "Password reset email sent";

      return {
         success: true,
         message: successMessage,
         data: responseData,
         status: result.status,
         statusText: result.statusText,
         shouldClearAuth: result.shouldClearAuth,
      };
   } catch (error) {
      console.error("Password reset error:", error); 

      return {
         success: false,
         message: "An unexpected error occurred. Please try again.",
         status: 500,
         statusText: "Internal Server Error",
      };
   }
}