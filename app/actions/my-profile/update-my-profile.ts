"use server"

import { apiPatch } from "../api/api-client";
import { UpdateProfileApiResponse, UserProfile } from "./types";

export async function updateMyProfile(formData: FormData): Promise<UpdateProfileApiResponse> {
  try {
    // Validate form data
    const firstName = formData.get('first_name')?.toString().trim();
    const lastName = formData.get('last_name')?.toString().trim();

    if (!firstName && !lastName) {
      return {
        success: false,
        message: "At least one field must be provided for update.",
        status: 400,
        statusText: "Bad Request",
      };
    }

    if (firstName && (firstName.length < 1 || firstName.length > 30)) {
      return {
        success: false,
        message: "First name must be between 1 and 30 characters.",
        status: 400,
        statusText: "Bad Request",
      };
    }

    if (lastName && (lastName.length < 1 || lastName.length > 30)) {
      return {
        success: false,
        message: "Last name must be between 1 and 30 characters.",
        status: 400,
        statusText: "Bad Request",
      };
    }

    // Prepare request data
    const updateData: Record<string, string> = {};
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;

    // Make API call using the functional approach
    const result = await apiPatch<UserProfile>('/api/user/profile/', updateData);

    if (!result.success) {
      return result;
    }   
    
    return {
      success: true,
      message: "Profile updated successfully.",
      data: result.data,
      status: result.status,
      statusText: result.statusText,
    };

  } catch (error) {
    console.error('Unexpected error in updateMyProfile:', error);
    return {
      success: false,
      message: "An unexpected error occurred while updating your profile.",
      status: 500,
      statusText: "Internal Server Error",
    };
  }
}
