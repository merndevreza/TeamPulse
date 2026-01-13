import { apiGet } from "@/app/actions/api/api-client";
import { UserDotsSummary } from "@/app/actions/api/types";
import DotAttributes from "@/components/About/summary/DotAttributes";
import DotSentiments from "@/components/About/summary/DotSentiments";
import TopSummary from "@/components/About/summary/TopSummary";
import React from "react";

export const dynamic = 'force-dynamic';

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const userDotsSummary = await apiGet<UserDotsSummary>(`/api/dots/users/${id}/summary`);

  if (!userDotsSummary.data) {
    throw new Error("Failed to load dot data");
  }

  return (
    <div className="pt-2 desktop:pt-4 pb-8 flex flex-col gap-5 desktop:gap-6 max-sm:pt-2">
      <TopSummary userDotsSummary={userDotsSummary.data} />
      <DotSentiments
        userDotsSummary={userDotsSummary.data}
      />
      <DotAttributes userDotsSummary={userDotsSummary.data} />
    </div>
  );
};

export default page;
