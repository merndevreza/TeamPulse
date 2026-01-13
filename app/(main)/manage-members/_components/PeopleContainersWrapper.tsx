"use client";
import React from "react";
import PeopleContainer from "./PeopleContainer";
import { UserForAdmin } from "@/app/actions/api/types";
import { UsersSearchAdmin } from "@/components/Search/Search";
import Link from "next/link";
import PlusSVG from "@/lib/SVGS/PlusSVG";

type Props = {
  allUsers: UserForAdmin[];
  activeUsers: UserForAdmin[];
  inactiveUsers: UserForAdmin[];
  token?: string;
};

const PeopleContainersWrapper = ({
  allUsers,
  activeUsers,
  inactiveUsers,
  token,
}: Props) => {
  const [results, setResults] = React.useState<UserForAdmin[]>(allUsers);

  // Filter active and inactive users based on search results
  const filteredActiveUsers = React.useMemo(() => {
    const resultIds = new Set(results.map((u) => u.id));
    return activeUsers.filter((u) => resultIds.has(u.id));
  }, [results, activeUsers]);

  const filteredInactiveUsers = React.useMemo(() => {
    const resultIds = new Set(results.map((u) => u.id));
    return inactiveUsers.filter((u) => resultIds.has(u.id));
  }, [results, inactiveUsers]);

  return (
    <div className="pr-[90px]">
      <div className="justify-between gap-4 items-center mt-3 flex">
        <UsersSearchAdmin
          users={allUsers}
          setResults={setResults}
          className="max-sm:rounded-lg max-sm:h-8 max-sm:w-[251px] bg-light-grey"
        />
        <Link
          href={"/manage-members/add-member"}
          className="w-[234px] h-10 inline-flex bg-light-orange gap-3 text-off-white font-inter text-[17px] font-light leading-[150%] pl-8 items-center rounded-lg "
        >
          <PlusSVG /> <span>Add new member</span>
        </Link>
      </div>
      <div className="pb-12 flex flex-col gap-5 mt-3">
        <PeopleContainer
          users={filteredActiveUsers}
          token={token}
          statusTitle="Active People"
        />
        <PeopleContainer
          users={filteredInactiveUsers}
          token={token}
          statusTitle="Inactive People"
        />
      </div>
    </div>
  );
};

export default PeopleContainersWrapper;
