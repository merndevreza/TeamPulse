"use server"

import { adminApiPost } from "../api/api-client"; 

export async function registerUserByAdmin(formData: FormData) {
   try { 
      const email = formData.get('email')?.toString().trim();
      const firstName = formData.get('first_name')?.toString().trim();
      const lastName = formData.get('last_name')?.toString().trim();
      const password = formData.get('password')?.toString();
      const confirmPassword = formData.get('confirm_password')?.toString();
      const role = formData.get('role')?.toString(); 

      if (!email || !firstName || !password || !confirmPassword) {
         return {
            success: false,
            message: "Email, First Name, Password, and Confirm Password are required.",
            status: 400,
            statusText: "Bad Request",
         };
      }
      const updateData = {
         email,
         first_name: firstName,
         last_name: lastName || '',
         password,
         confirm_password: confirmPassword,
         role,
      };
      // Make API call using the admin-only function (includes admin verification)
      const result = await adminApiPost('/api/user/admin/users/create/', updateData);

      if (!result.success) {
         return result;
      }

      return {
         success: true,
         message: "New member added successfully.",
         data: result.data,
         status: result.status,
         statusText: result.statusText,
      };

   } catch (error) {
      console.error('Unexpected error in register new member:', error);
      return {
         success: false,
         message: "An unexpected error occurred while adding new member.",
         status: 500,
         statusText: "Internal Server Error",
      };
   }
}
