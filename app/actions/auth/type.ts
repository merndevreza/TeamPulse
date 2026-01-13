
export type LoginData = {
  email: string;
  password: string;
};

export type LoginResponseData = {
  role: 'admin' | 'user';
};

export type LoginApiResponse = {
  success: boolean;
  message: string;
  data?: LoginResponseData;
  status: number;
  statusText: string;
};

export type LoginTokenResponse = {
  access: string;
  refresh: string;
  message?: string;
};

export type LogoutApiResponse = {
  success: boolean;
  message: string;
  status: number;
  statusText: string;
};

// Forgot password data
export type forgotPasswordData = {
  email: string;
};

export type forgotPasswordResponseData = {
  message?: string;
  [key: string]: unknown;
};

export type forgotPasswordApiResponse = {
  success: boolean;
  message: string;
  status: number;
  statusText: string;
  data?: forgotPasswordResponseData;
  shouldClearAuth?: boolean;
};

// Refresh token types
export interface RefreshTokenResponse {
  access: string;
  refresh?: string;
  message?: string;
}

export interface RefreshTokenResult {
  success: boolean;
  accessToken?: string;
  message?: string;
  shouldClearAuth?: boolean;
}
 
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

export interface NotificationsData {
   unread_count: number;
   notifications: NotificationItem[];
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data?: NotificationsData | unknown;
  status: number;
  statusText: string;
}

export interface MarkNotificationsReadData {
  message: string;
  marked_count: number;
}

export interface MarkNotificationsReadResponse {
  success: boolean;
  message: string;
  data?: MarkNotificationsReadData;
  status: number;
  statusText: string;
} 