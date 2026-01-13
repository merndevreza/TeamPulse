"use server"

import { adminApiPatch } from "../api/api-client"; 

export async function updateUserByAdmin(formData: FormData, userId: string) {
   try { 
      const email = formData.get('email')?.toString().trim();
      const firstName = formData.get('first_name')?.toString().trim();
      const lastName = formData.get('last_name')?.toString().trim(); 
      const role = formData.get('role')?.toString(); 

      if (!email || !firstName || !role ) {
         return {
            success: false,
            message: "Email, First Name, and Role are required.",
            status: 400,
            statusText: "Bad Request",
         };
      }
      const updateData = {
         email,
         first_name: firstName,
         last_name: lastName || '', 
         role,
      };
      const result = await adminApiPatch(`/api/user/admin/users/${userId}/`, updateData);

      if (!result.success) {
         return result;
      }

      return {
         success: true,
         message: "User updated successfully.",
         data: result.data,
         status: result.status,
         statusText: result.statusText,
      };

   } catch (error) {
      console.error('Unexpected error in update user:', error);
      return {
         success: false,
         message: "An unexpected error occurred while updating user.",
         status: 500,
         statusText: "Internal Server Error",
      };
   }
}
