"use server";

import { extractRoleFromToken } from "@/utils/token-cache";
import { cookies } from "next/headers";
import { revalidateAllDots, revalidateAllUsers, revalidateUserDotsSummary, revalidateUserGivenDots, revalidateUserReceivedDots } from "../revalidate";
import { DotQuality } from "../api/types";

export async function updateDotQuality({
  dot_id,
  dot_quality,
}: {
  dot_id: number;
  dot_quality: DotQuality["dot_quality"];
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const role = await extractRoleFromToken(accessToken);
  const isAdmin = role === "admin";

  if (!isAdmin) {
    throw new Error(
      "Unauthorized: Admin access required to update dot quality."
    );
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dots/dots/${dot_id}/update-quality/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ dot_quality }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error:
          data.error ?? "Failed to update dot quality. Please try again later.",
      };
    }

    revalidateAllDots();
    revalidateUserGivenDots();
    revalidateUserReceivedDots();
    revalidateAllUsers();
    revalidateUserDotsSummary();
    return { success: true, data };
  } catch (error: unknown) {
    console.error("Error updating dot quality:", error);
    const message = "Error updating dot quality.";
    return { success: false, error: message };
  }
}
