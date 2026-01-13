import { apiGet } from "@/app/actions/api/api-client";
import { DotCategory, GivenDotDetailed } from "@/app/actions/api/types";
import GivenAttributes from "@/components/About/dots/GivenAttributes";
import { extractRoleFromToken, getUserIdFromToken } from "@/utils/token-cache";
import { cookies } from "next/headers";
import React from "react";
import EditUndoPopup from "@/app/edit-dot/_components/EditUndoPopup";
import PaginationControls from "@/components/PaginationControls";
import BackToTopBtn from "@/components/BackToTopBtn";

function getPageFromSearch(sp?: string) {
  const n = Number(sp);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export const dynamic = 'force-dynamic';

const page = async ({ searchParams }: { searchParams: Promise<{ page?: string }> }) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const id = await getUserIdFromToken(accessToken);
  const role = await extractRoleFromToken(accessToken);
  const isAdmin = role === "admin";

  if (!id) {
    throw new Error("User ID unavailable");
  }

  const resolvedSearchParams = await searchParams;
  const pageNumber = getPageFromSearch(resolvedSearchParams.page);

  const givenDotsDetailedPromise = apiGet<GivenDotDetailed>(`/api/dots/users/${id}/given/paginated/?page=${pageNumber}&page_size=10`);

  const dotsPromise = apiGet<DotCategory[]>("/api/dots/categories-with-labels");

  const [givenDotsDetailed, allDots] = await Promise.all([
    givenDotsDetailedPromise,
    dotsPromise,
  ]);

  if (!givenDotsDetailed.data?.results || !allDots.data) {
    throw new Error("Failed to load dot data");
  }

  return (
    <div className="relative pr-2 desktop:pr-0 pb-16 desktop:pb-14">
      {givenDotsDetailed.data.results.length > 0 && (
        <>
          <PaginationControls
            containerClassName="absolute -top-[107px] desktop:top-[-117px] right-[48px]"
            curr={pageNumber}
            total={Math.ceil(givenDotsDetailed.data.count / 10)}
            isTopPagination={true}
          />
        </>
      )}
      <GivenAttributes
        givenDotsDetailed={givenDotsDetailed.data}
        allDots={allDots.data}
        isAdmin={isAdmin}
      />
      {givenDotsDetailed.data.results.length > 0 && (
        <>
          <PaginationControls
            curr={pageNumber}
            total={Math.ceil(givenDotsDetailed.data.count / 10)}
            containerClassName="max-sm:justify-center max-sm:mx-auto pr-1.5 max-sm:mt-0 max-sm:pb-4"
          />
          <BackToTopBtn />
        </>
      )}
      <EditUndoPopup />
    </div>
  );
};

export default page;
