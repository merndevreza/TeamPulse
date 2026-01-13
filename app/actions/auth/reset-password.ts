"use server"

import { apiPost } from "../api/api-client";
import { validatePasswordStrength } from "@/utils/passwordValidation";

export async function resetPassword(formData: FormData, token: string | null, email: string | null) {
   try {
      if (!token || !email) {
         return {
            success: false,
            message: "Invalid password reset link. Please request a new one.",
            status: 400,
            statusText: "Bad Request",
         };
      } 
      const new_password = formData.get('new_password')?.toString();
      const confirm_password = formData.get('confirm_password')?.toString();

      if (!new_password || !confirm_password) {
         return {
            success: false,
            message: "All password fields are required.",
            status: 400,
            statusText: "Bad Request",
         };
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(new_password);
      if (!passwordValidation.isValid) {
         return {
            success: false,
            message: passwordValidation.errors[0], // Return the first error
            status: 400,
            statusText: "Bad Request",
         };
      }

      // Validate password confirmation
      if (new_password !== confirm_password) {
         return {
            success: false,
            message: "New passwords do not match.",
            status: 400,
            statusText: "Bad Request",
         };
      } 

      // Prepare request data
      const updateData: Record<string, string> = {
         new_password,
         confirm_password,
         token,
         email
      };

      // Make API call using the functional approach
      const result = await apiPost('/api/user/auth/reset-password/', updateData, { requireAuth: false });  

      if (!result.success) {
         return result;
      }

      return {
         success: true,
         message: "Password reset successfully.",
         data: result.data,
         status: result.status,
         statusText: result.statusText,
      };

   } catch (error) {
      console.error('Unexpected error in resetPassword:', error);
      return {
         success: false,
         message: "An unexpected error occurred while resetting your password.",
         status: 500,
         statusText: "Internal Server Error",
      };
   }
}
