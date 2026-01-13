export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string; 
  dots_given?: number;
  dots_received?: number;
}

export interface GetProfileApiResponse {
  success: boolean;
  message: string;
  data?: UserProfile;
  status: number;
  statusText: string;
}

export interface UpdateProfileApiResponse {
  success: boolean;
  message: string;
  data?: UserProfile;
  status: number;
  statusText: string;
  shouldClearAuth?: boolean;  // Indicates if auth should be completely cleared
} 