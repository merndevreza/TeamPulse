"use server";

import { UserForAdmin } from "@/app/actions/api/types";
import {
  adminApiDelete,
  adminApiGet,
  adminApiPatch,
} from "@/app/actions/api/api-client";
import { revalidateAdminRouteAllUsers, revalidateAllDots, revalidateAllUsers, revalidateUserDotsSummary, revalidateUserGivenDots, revalidateUserReceivedDots } from "@/app/actions/revalidate";
import { ApiResponse } from "../api/lib/types";

/**
 * GET: list users (admin)
 * Optional: pass a simple search param; expand as needed
 */
export async function fetchAdminUsers(params?: { search?: string }) {
  const qs = params?.search ? `?search=${encodeURIComponent(params.search)}` : "";
  const res = await adminApiGet<UserForAdmin[]>(`/api/user/admin/users/${qs}`);
  return res;
}

/**
 * PATCH: generic update for a user (admin)
 * Revalidates the admin users route on success.
 */
export async function updateAdminUser(
  userId: number,
  patch: Partial<Pick<UserForAdmin, "first_name" | "last_name" | "role" | "is_active" | "email">>
): Promise<ApiResponse<UserForAdmin>> {
  const res = await adminApiPatch<UserForAdmin>(`/api/user/admin/users/${userId}/`, patch);
  if (res.success) {
    await revalidateAdminRouteAllUsers();
    await revalidateAllUsers();
  }
  return res;
}

/**
 * Helper: set role=admin
 */
export async function makeUserAdmin(userId: number): Promise<ApiResponse<UserForAdmin>> {
  return updateAdminUser(userId, { role: "admin" as UserForAdmin["role"] });
}

/**
 * Helper: toggle active flag
 */
export async function setUserActive(
  userId: number,
  isActive: boolean
): Promise<ApiResponse<UserForAdmin>> {
  // Cast keeps TS happy with your domain type
  return updateAdminUser(userId, { is_active: isActive as UserForAdmin["is_active"] });
}

/**
 * Helper: update first/last name
 */
export async function updateAdminUserName(
  userId: number,
  first_name: string,
  last_name: string
): Promise<ApiResponse<UserForAdmin>> {
  return updateAdminUser(userId, { first_name, last_name });
}

export async function deleteAdminUser(userId: number): Promise<ApiResponse<unknown>> {
  const res = await adminApiDelete<unknown>(`/api/user/admin/users/${userId}/`);
  if (res.success) {
    await revalidateAdminRouteAllUsers();
    await revalidateAllUsers();
    await revalidateAllDots();
    await revalidateUserDotsSummary();
    await revalidateUserGivenDots();
    await revalidateUserReceivedDots();
  }
  return res;
}
