import React from "react";
import AboutNav from "@/components/About/AboutNav";
import { OtherUser } from "@/app/actions/api/types";
import Title from "@/components/Title";
import { apiGet } from "@/app/actions/api/api-client";
import UsersIcon from "@/components/CommonSVGs/UsersIcon";
import ChevronRightIcon from "@/components/CommonSVGs/ChevronRightIcon";

interface AboutOthersLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

// Prefer a function default export for async Server Components
export default async function Layout({
  children,
  params,
}: AboutOthersLayoutProps) {
  const { id } = await params;
  const allUsersFetch = await apiGet<OtherUser[]>("/api/user/all-users");

  const allUsers = allUsersFetch.data;

  if (!allUsers) {
    throw new Error("Failed to load user data");
  }

  const user = allUsers?.find((user) => user.id.toString() === id);

  return (
    <section className="desktop:pl-15 pl-[22px] pr-8 pt-0 desktop:pr-31 w-full max-sm:px-4 max-sm:pt-3.5 max-sm:pb-8">
      <div className="flex w-full gap-[90px] desktop:gap-[55px] items-center -mt-px desktop:mt-0">
        <div className="flex items-center gap-3 desktop:gap-4 -mt-0.5 pb-0.5">
          <UsersIcon className="w-[23px] desktop:w-[29px]"/>
          <ChevronRightIcon className="w-1.5" />
          <Title first_name={user?.first_name} last_name={user?.last_name} />
        </div>
        <AboutNav link={`/about-others/${id}/`} />
      </div>
      {children}
    </section>
  );
}
