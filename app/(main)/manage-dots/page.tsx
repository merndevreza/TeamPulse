import React from "react";
import { DotCategory } from "@/app/actions/api/types";
import DotsContainer from "./_components/DotsContainer";
import { cookies } from "next/headers";
import { adminApiGet } from "@/app/actions/api/api-client";
import ManageDotsSVG from "@/lib/SVGS/ManageDotsIcon";

export const dynamic = 'force-dynamic';

const page = async () => {
  const dotsFetched = await adminApiGet<DotCategory[]>(`/api/dots/categories-with-labels`, {
    tags: ["dots:all"],
    cache: "no-store",
  });
  const token = (await cookies()).get("accessToken")?.value;
  const dots = dotsFetched.data;

  if (!dots) {
    throw new Error("Failed to load dot data");
  }

  return (
    <section className="pl-[22px] desktop:pl-[50px] pr-[33px] desktop:pr-[105px] pb-11 w-full max-sm:pt-4 pt-0 max-sm:px-0 -mt-[3px]">
      <div className="border-b border-light-grey-2 max-sm:border-b-0 w-full">
        <div className="-ml-1 flex gap-3.5 desktop:gap-[15px] items-center w-full pb-2 desktop:pb-3 max-sm:pl-6 max-sm:pb-0 ">
          <ManageDotsSVG />
          <h1 className="text-[23px] desktop:text-[28px] text-dark-black">Manage Dots</h1>
        </div>
      </div>
      <DotsContainer dots={dots} token={token} />
    </section>
  );
};

export default page;
