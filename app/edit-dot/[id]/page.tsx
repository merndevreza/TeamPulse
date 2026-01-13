// app/edit-dot/[id]/page.tsx
import React from "react";
import { cookies } from "next/headers";
import { DotCategory, DotDetailedResult } from "@/app/actions/api/types";
import Wrapper from "@/components/DotActions/Wrapper";
import { getUserIdFromToken } from "@/utils/token-cache";
import { apiGet } from "@/app/actions/api/api-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function Page({ params }: PageProps) {
  const { id: dotId } = await params;

  const token = (await cookies()).get("accessToken")?.value;

  const allDotsPromise = apiGet<DotCategory[]>("/api/dots/categories-with-labels", {
    tags: ["dots:all"],
    cache: "no-store",
  });

  const userId = await getUserIdFromToken(token);

  const detailedGivenDotsPromise = apiGet<DotDetailedResult[] | null>(`/api/dots/users/${userId}/given`, {
    tags: ["user:dots_given"],
    cache: "no-store",
  });

  const [allDots, detailedGivenDots] = await Promise.all([
    allDotsPromise,
    detailedGivenDotsPromise,
  ]);

  if (!allDots.data || !detailedGivenDots.data) {
    throw new Error("Failed to load dot data");
  }

  return (
    <Wrapper
      dotId={dotId}
      token={token as string}
      allDots={allDots.data}
      type="edit"
      detailedGivenDots={detailedGivenDots.data}
    />
  );
}
