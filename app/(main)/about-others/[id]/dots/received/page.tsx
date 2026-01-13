import { apiGet } from "@/app/actions/api/api-client";
import { DotCategory, ReceivedDotDetailed } from "@/app/actions/api/types";
import ReceivedAttributes from "@/components/About/dots/ReceivedAttributes";
import BackToTopBtn from "@/components/BackToTopBtn";
import PaginationControls from "@/components/PaginationControls";
import { extractRoleFromToken } from "@/utils/token-cache";
import { cookies } from "next/headers";
import React from "react";

function getPageFromSearch(sp?: string) {
  const n = Number(sp);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export const dynamic = 'force-dynamic';

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) => {
  const { id } = await params;
  const { page } = await searchParams;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const role = await extractRoleFromToken(accessToken);
  const isAdmin = role === "admin";
  const pageNumber = getPageFromSearch(page);

  const receivedDotsDetailedPromise = apiGet<ReceivedDotDetailed>(`/api/dots/users/${id}/received/paginated/?page=${pageNumber}&page_size=10`);

  const dotsPromise = apiGet<DotCategory[]>("/api/dots/categories-with-labels");

  const [receivedDotsDetailed, allDots] = await Promise.all([
    receivedDotsDetailedPromise,
    dotsPromise,
  ]);

  if (!receivedDotsDetailed.data?.results || !allDots.data) {
    throw new Error("Failed to load dot data");
  }

  return (
    <div className="relative pr-2 desktop:pr-0 pb-16 desktop:pb-14">
      {receivedDotsDetailed.data.results.length > 0 && (
        <>
          <PaginationControls
            containerClassName="absolute -top-[107px] desktop:top-[-117px] right-[48px]"
            curr={pageNumber}
            total={Math.ceil(receivedDotsDetailed.data.count / 10)}
            isTopPagination={true}
          />
        </>
      )}
      <ReceivedAttributes
        receivedDotsDetailed={receivedDotsDetailed.data}
        allDots={allDots.data}
        isAdmin={isAdmin}
      />
      {receivedDotsDetailed.data.results.length > 0 && (
        <>
          <PaginationControls
            curr={pageNumber}
            total={Math.ceil(receivedDotsDetailed.data.count / 10)}
            containerClassName="max-sm:justify-center max-sm:mx-auto pr-1.5 max-sm:mt-0 max-sm:pb-4"
          />
          <BackToTopBtn />
        </>
      )}
    </div>
  );
};

export default page;
