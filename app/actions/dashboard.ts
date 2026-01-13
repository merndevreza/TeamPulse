"use server"

import { apiGet } from "./api/api-client";


export async function getDashboardDotGivenData() {
   try {   
      const result = await apiGet(`/api/dots/dots-given-dashboard/`);

      if (!result.success) {
         return result;
      }

      return {
         success: true,
         message: "Dashboard dots given data loaded successfully.",
         data: result.data,
         status: result.status,
         statusText: result.statusText,
      };

   } catch (error) {
      console.error('Unexpected error in getDashboardDotGivenData:', error);
      return {
         success: false,
         message: "An unexpected error occurred while loading dashboard dots given data.",
         status: 500,
         statusText: "Internal Server Error",
      };
   }
}
 
export async function getDashboardDotReceivedData() {
   try {
      const result = await apiGet(`/api/dots/dots-received-dashboard/`);

      if (!result.success) {
         return result;
      }

      return {
         success: true,
         message: "Dashboard dots received data loaded successfully.",
         data: result.data,
         status: result.status,
         statusText: result.statusText,
      };

   } catch (error) {
      console.error('Unexpected error in getDashboardDotReceivedData:', error);
      return {
         success: false,
         message: "An unexpected error occurred while loading dashboard dots received data.",
         status: 500,
         statusText: "Internal Server Error",
      };
   }
}
