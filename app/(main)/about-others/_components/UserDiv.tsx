import { OtherUser } from "@/app/actions/api/types";
import InitialsAvatar from "@/components/Avatar/InitialsAvatar";
import Link from "next/link";
import React from "react";

const UserDiv = ({
  id,
  user,
}: {
  id: number;
  user: OtherUser;
}) => {
  return (
    <div className="flex font-medium items-center max-sm:px-4 max-sm:h-10 w-full border-b border-light-grey-2">
      <div
        className="flex items-center h-10.5 desktop:h-[49px] w-full px-6 max-sm:px-0 max-sm:w-full max-sm:h-10">
        <Link href={`/about-others/${id}/summary`} className="inline-flex items-center gap-4.5 max-sm:gap-3">
          <InitialsAvatar firstName={user.first_name} lastName={user.last_name} />{" "}
          <p className="max-sm:text-[16px] text-[14px] text-dark-black">{user.first_name} {user.last_name}</p>
        </Link>
      </div>
      <div
        className="h-10 desktop:h-[49px] flex items-center justify-end desktop:justify-start pr-7 desktop:pr-0 w-[170px] desktop:mr-5.5 max-sm:h-10">
        <Link className="text-[14px] font-inter underline underline-offset-3 text-highlight-blue" href={`/about-others/${id}/summary`}
          prefetch={true}
        >
          See Details
        </Link>
      </div>
    </div>
  );
};

export default UserDiv;
