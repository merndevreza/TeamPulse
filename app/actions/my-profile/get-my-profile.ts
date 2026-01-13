"use server"

import { apiGet } from "../api/api-client";
import { GetProfileApiResponse, UserProfile } from "./types";

export async function getMyProfile(): Promise<GetProfileApiResponse> {
  try {
    const result = await apiGet<UserProfile>('/api/user/profile/');
    
    if (!result.success) {
      return result;
    } 
    
    return {
      success: true,
      message: "Profile loaded successfully",
      data: result.data,
      status: result.status,
      statusText: result.statusText,
    };

  } catch (error) {
    console.error('Unexpected error in getMyProfile:', error);
    return {
      success: false,
      message: "An unexpected error occurred while loading your profile.",
      status: 500,
      statusText: "Internal Server Error",
    };
  }
}
