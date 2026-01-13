export interface NotificationItem {
   id: number;
   message: string;
   is_read: boolean;
   giver_name: string;
   time_ago: string;
   dot_counts: {
      thumbs_up: number;
      ok: number;
      loop: number;
   }
}

export interface NotificationsResponse {
   unread_count: number;
   notifications: NotificationItem[];
}