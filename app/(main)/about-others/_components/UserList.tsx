"use client";
import React, { useEffect } from "react";
import UserDiv from "./UserDiv";
import { useAllUsers } from "@/app/contexts/AllUsersContext";
import { UsersSearch } from "@/components/Search/Search";
import { OtherUser } from "@/app/actions/api/types";
import Title from "@/components/Title";
import AboutOthersSVG from "@/lib/SVGS/AboutOthersSVG";

const UserList: React.FC<{ allUsers: OtherUser[] }> = ({ allUsers }) => {
  const { filteredUsers, setAllUsers } = useAllUsers();
  useEffect(() => {
    setAllUsers(allUsers);
  }, [allUsers, setAllUsers]);
  const users = filteredUsers ?? [];
  return (
    <section className="pb-10 pt-0 pl-[22px] desktop:pl-15.5 pr-8 w-full max-sm:px-2 max-sm:pt-5 max-sm:pb-16">
      <div className="flex items-center gap-4 border-b border-light-grey-2 pb-[9px] desktop:pb-4 mb-2 desktop:mb-5 -mt-0.5 desktop:mt-0">
        <AboutOthersSVG />
        <Title
          first_name="About"
          last_name="Others"
        />
      </div>
      <div className="px-4">
        <UsersSearch className="hidden max-sm:flex mb-4 w-[313px]" />
      </div>
      <div className="desktop:pr-[86px] w-full">
        <div
          className="w-full bg-off-white rounded-[10px] pb-2.5 desktop:pb-5 px-[30px] desktop:px-[45px]"
          style={{
            boxShadow: "0 18px 31px 0 rgba(0, 0, 0, 0.12)",
          }}
        >
          <div
            className="flex justify-between items-center pt-2 pb-1.5 desktop:pt-2.5 desktop:pb-2.5 border-b border-light-grey-2 max-sm:hidden pl-[15px] pr-[29px] desktop:pr-0"
          >
            <p className="text-[14px] text-dark-grey pl-4 desktop:pl-9 -mt-1 desktop:mt-0">People</p>
            <UsersSearch className="py-0.5 desktop:py-1 desktop:mt-0.5 bg-light-grey"/>
          </div>
          <div className="grid grid-cols-2 w-full max-[1100px]:grid-cols-1 gap-x-9 desktop:gap-x-[162px] mt-[5px] desktop:mt-0"> 
            {users.map((user) => (
              <UserDiv key={user.id} id={user.id} user={user} />
            ))}
          </div>
        </div>
      </div> 
    </section>
  );
};

export default UserList;
