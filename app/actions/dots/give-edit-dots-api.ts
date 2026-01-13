"use server";

import { revalidateUserDotsSummary, revalidateUserGivenDots } from "@/app/actions/revalidate";
import { ApiResponse } from "@/app/actions/api/lib/types";

// If you already have an api-client (e.g., apiPost/apiPut) that injects headers,
// you can swap these helpers in. Keeping fetch here to be self-contained.
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

type DotDetail = {
  label_id: number;
  dot_type_name: string; // "thumbs_up" | "ok" | "loop" etc.
};

export type GiveDotsPayload = {
  receiver_ids: number[];
  comment: string;
  details: DotDetail[];
};

export type EditGivenDotPayload = {
  comment: string;
  // details: DotDetail[];
};

/**
 * POST /api/dots/give-dots/
 * Revalidates "given dots" and "summary" on success.
 */
export async function giveDots(
  payload: GiveDotsPayload,
  token?: string
): Promise<ApiResponse<unknown>> {
  try {
    const res = await fetch(`${BASE_URL}/api/dots/give-dots/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      // Important for Server Actions in Next.js: don't cache mutations
      cache: "no-store",
    });

    const data = await safeJson(res);

    if (!res.ok) {
      return { success: false, data: null, message: data.error, status: res.status, statusText: res.statusText};
    }

    // Revalidate pages using these datasets
    await revalidateUserGivenDots();
    await revalidateUserDotsSummary();

    return { success: true, data, message: "", status: res.status, statusText: res.statusText };
  } catch (err) {
    console.error("giveDots error:", err);
    return { success: false, data: null, message: "Unexpected error giving dots.", status: 500, statusText: "Internal Server Error" };
  }
}

/**
 * PUT /api/dots/dots/:id/edit/
 * Revalidates "given dots" and "summary" on success.
 */
export async function editGivenDot(
  dotId: number,
  payload: EditGivenDotPayload,
  token?: string
): Promise<ApiResponse<unknown>> {
  try {
    const res = await fetch(`${BASE_URL}/api/dots/dots/${dotId}/edit/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
      const msg = await safeErrMsg(res);
      return { success: false, data: null, message: msg, status: res.status, statusText: res.statusText };
    }

    await revalidateUserGivenDots();
    await revalidateUserDotsSummary();

    const data = await safeJson(res);
    return { success: true, data, message: "", status: res.status, statusText: res.statusText };
  } catch (err) {
    console.error("editGivenDot error:", err);
    return { success: false, data: null, message: "Unexpected error updating dots.", status: 500, statusText: "Internal Server Error" };
  }
}

/** Helpers */
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function safeErrMsg(res: Response) {
  try {
    const data = await res.json();
    return data?.message || data?.detail || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}
