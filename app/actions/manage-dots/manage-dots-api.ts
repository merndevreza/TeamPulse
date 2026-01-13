"use server";

import type {
  DotCategory as DotCategoryType,
  DotLabel as DotLabelType,
} from "@/app/actions/api/types";
import type { ApiResponse } from "@/app/actions/api/lib/types";
import {
  adminApiPost,
  adminApiPatch,
  adminApiDelete,
  // adminApiGet, // (optional) keep if you later add a GET wrapper
} from "@/app/actions/api/api-client";
import {
  revalidateAllDots,
  revalidateUserDotsSummary,
  revalidateUserGivenDots,
  revalidateUserReceivedDots,
} from "@/app/actions/revalidate";

/**
 * CATEGORY
 */
export async function createDotCategory(
  name: string
): Promise<ApiResponse<DotCategoryType>> {
  const res = await adminApiPost<DotCategoryType>(
    "/api/dots/admin/categories/",
    { name }
  );
  if (res.success) {
    await revalidateAllDots();
    await revalidateUserDotsSummary();
    await revalidateUserGivenDots();
    await revalidateUserReceivedDots();
  }
  return res;
}

export async function updateDotCategory(
  categoryId: number,
  patch: Partial<Pick<DotCategoryType, "name">>
): Promise<ApiResponse<DotCategoryType>> {
  const res = await adminApiPatch<DotCategoryType>(
    `/api/dots/admin/categories/${categoryId}/`,
    patch
  );
  if (res.success) {
    await revalidateAllDots();
    await revalidateUserDotsSummary();
    await revalidateUserGivenDots();
    await revalidateUserReceivedDots();
  }
  return res;
}

export async function deleteDotCategory(
  categoryId: number
): Promise<ApiResponse<unknown>> {
  // Handle 204 No Content (empty response) gracefully
  try {
    const res = await adminApiDelete<unknown>(
      `/api/dots/admin/categories/${categoryId}/`
    );
    if (res.success) {
      await revalidateAllDots();
      await revalidateUserDotsSummary();
      await revalidateUserGivenDots();
      await revalidateUserReceivedDots();
    }
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isEmptyBodyParseError =
      err instanceof SyntaxError ||
      msg.includes("Unexpected end of JSON input");
    if (isEmptyBodyParseError) {
      await revalidateAllDots();
      return { success: true } as ApiResponse<unknown>;
    }
    // Return a structured error instead of throwing to avoid unhandled rejections
    return { success: false, message: msg } as ApiResponse<unknown>;
  }
}

/**
 * LABEL
 */
export async function createDotLabel(
  categoryId: number,
  label: string
): Promise<ApiResponse<DotLabelType>> {
  const payload = { category: categoryId, label };
  const res = await adminApiPost<DotLabelType>(
    "/api/dots/admin/labels/",
    payload
  );
  if (res.success) {
    await revalidateAllDots();
    await revalidateUserDotsSummary();
    await revalidateUserGivenDots();
    await revalidateUserReceivedDots();
  }
  return res;
}

export async function updateDotLabel(
  labelId: number,
  patch: Partial<Pick<DotLabelType, "label">> & { category?: number }
): Promise<ApiResponse<DotLabelType>> {
  const res = await adminApiPatch<DotLabelType>(
    `/api/dots/admin/labels/${labelId}/`,
    patch
  );
  if (res.success) {
    await revalidateAllDots();
    await revalidateUserDotsSummary();
    await revalidateUserGivenDots();
    await revalidateUserReceivedDots();
  }
  return res;
}

export async function deleteDotLabel(
  labelId: number
): Promise<ApiResponse<unknown>> {
  // Handle 204 No Content (empty response) gracefully
  try {
    const res = await adminApiDelete<unknown>(
      `/api/dots/admin/labels/${labelId}/`
    );
    if (res.success) {
      await revalidateAllDots();
      await revalidateUserDotsSummary();
      await revalidateUserGivenDots();
      await revalidateUserReceivedDots();
    }
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isEmptyBodyParseError =
      err instanceof SyntaxError ||
      msg.includes("Unexpected end of JSON input");
    if (isEmptyBodyParseError) {
      await revalidateAllDots();
      await revalidateUserDotsSummary();
      await revalidateUserGivenDots();
      await revalidateUserReceivedDots();
      return { success: true } as ApiResponse<unknown>;
    }
    // Return a structured error instead of throwing to avoid unhandled rejections
    return { success: false, message: msg } as ApiResponse<unknown>;
  }
}
