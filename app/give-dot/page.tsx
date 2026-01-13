import React from "react";
import { cookies } from "next/headers";
import { DotCategory, OtherUser } from "../actions/api/types";
import Wrapper from "@/components/DotActions/Wrapper";
import { apiGet } from "../actions/api/api-client";

export const dynamic = 'force-dynamic';

export default async function Page() {
  const token = (await cookies()).get("accessToken")?.value;

  // Kick off both requests in parallel
  const usersPromiseFetched = apiGet<OtherUser[]>("/api/user/all-users", {
    tags: ["users:all"],
    cache: "no-store",
  });

  const dotsPromiseFetched = apiGet<DotCategory[]>("/api/dots/categories-with-labels", {
    tags: ["dots:all"],
    cache: "no-store",
  });

  // Await both together
  const [allUsers, allDots] = await Promise.all([usersPromiseFetched, dotsPromiseFetched]);

  if (!allUsers.data || !allDots.data) {
    throw new Error("Failed to load dot data");
  }

  return (
    <section className="pb-[20vh] bg-background-grey">
      <Wrapper
        token={token!}
        allUsers={allUsers.data}
        allDots={allDots.data}
        dotId=""
        type="give"
      />
    </section>
  );
}
