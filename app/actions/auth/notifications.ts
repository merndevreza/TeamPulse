"use server"

import { apiGet, apiPost } from "../api/api-client";
import { NotificationsResponse, MarkNotificationsReadResponse, MarkNotificationsReadData } from "./type";

export async function getNotifications(): Promise<NotificationsResponse> {
   try {
      const result = await apiGet(`/api/user/notifications/`);

      if (!result.success) {
         return result;
      }

      return {
         success: true,
         message: "Notifications fetched successfully.",
         data: result.data,
         status: result.status,
         statusText: result.statusText,
      };

   } catch (error) {
      console.error('[notifications] Unexpected error:', error);

      return {
         success: false,
         message: "An unexpected error occurred while fetching notifications.",
         status: 500,
         statusText: "Internal Server Error",
      };
   }
}

export async function markedNotificationsRead(): Promise<MarkNotificationsReadResponse> {
   try {
      const result = await apiPost(`/api/user/notifications/mark-all-read/`);

      if (!result.success) {
         return {
            success: false,
            message: result.message,
            status: result.status,
            statusText: result.statusText,
         };
      }

      return {
         success: true,
         message: "Notifications marked as read successfully.",
         data: result.data as MarkNotificationsReadData,
         status: result.status,
         statusText: result.statusText,
      };

   } catch (error) {
      console.error('[notifications] Unexpected error:', error);

      return {
         success: false,
         message: "An unexpected error occurred while updating notifications.",
         status: 500,
         statusText: "Internal Server Error",
      };
   }
}
