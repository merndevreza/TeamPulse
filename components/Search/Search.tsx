"use client"
import SearchIcon from "@/app/(main)/_components/icons/SearchIcon";
import { DotCategory, OtherUser, UserForAdmin } from "@/app/actions/api/types";
import { useAllUsers } from "@/app/contexts/AllUsersContext";
import { useDots } from "@/app/contexts/DotsContext";
import useSearch from "@/hooks/useSearch";
import { cn } from "@/utils/cn";
import React, { useEffect, useRef } from "react";

const BG_COLOR = "var(--off-white-2)";

export const DotsSearch = (
  {
    className
  } : {
    className?: string
  }
) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setFilteredDots, allDots } = useDots();
  const { results } = useSearch({ inputRef, data: allDots, type: "dots" });

  useEffect(() => {
    setFilteredDots(results as DotCategory[]);
  }, [results, setFilteredDots]);

  return (
    <div
      className={`py-2 pl-3 pr-5 text-dark-black border border-light-grey-2 rounded-xl flex gap-3.5 h-8 w-[217px] items-center ${className}`}
      style={{ backgroundColor: "var(--light-grey)" }}
    >
      <SearchIcon />
      <input
        ref={inputRef}
        type="text"
        name="Search"
        placeholder="Search"
        className="outline-none bg-transparent w-full text-[14px] font-inter placeholder:text-[12px] desktop:placeholder:text-[14px] placeholder:leading-[150%]"
      />
    </div>
  );
};

export const DotsSearchAdmin = (
  { setFilteredDots, allDots }: { setFilteredDots: React.Dispatch<React.SetStateAction<DotCategory[]>>, allDots: DotCategory[] }
) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { results } = useSearch({ inputRef, data: allDots, type: "dots" });

  useEffect(() => {
    setFilteredDots(results as DotCategory[]);
  }, [results, setFilteredDots]);

  return (
    <div
      className={`py-2 pl-3 pr-5 text-dark-black border border-light-grey-2 rounded-xl flex gap-3.5 h-8 w-[217px] items-center`}
      style={{ backgroundColor: "var(--light-grey)" }}
    >
      <SearchIcon />
      <input
        ref={inputRef}
        type="text"
        name="Search"
        placeholder="Search"
        className="outline-none bg-transparent w-full text-[14px] font-inter placeholder:text-[12px] desktop:placeholder:text-[14px] placeholder:leading-[150%]"
      />
    </div>
  );
};

export const UsersSearch = ({
  className
} : {
  className?: string  
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setFilteredUsers, allUsers } = useAllUsers();
  const { results } = useSearch({ inputRef, data: allUsers as OtherUser[], type: "users" });

  useEffect(() => {
    setFilteredUsers(results as OtherUser[]);
  }, [results, setFilteredUsers]);

  return (
    <div
      className={cn(`py-1 desktop:py-2 pl-2.5 desktop:pl-3 pr-5 text-dark-black border 
      max-sm:w-full border-light-grey-2 max-sm:rounded-lg rounded-xl flex gap-2.5
      desktop:gap-3 w-[175px] desktop:w-[217px] items-center  bg-off-white-2 ${className}`)} 
    >
      <SearchIcon className=" w-4.5 h-4.5 desktop:w-[23px] desktop:h-[23px]" />
      <input
      ref={inputRef}
      type="text"
      name="Search users"
      placeholder="Search"
      aria-label="Search users"
      className="outline-none bg-transparent w-full text-[14px] font-inter placeholder:text-[12px] desktop:placeholder:text-[14px] placeholder:leading-[150%]"
      />
    </div>
  );
};

export const UsersSearchAdmin = (
  {
    users,
    setResults,
    className
  } : {
    users: UserForAdmin[],
    setResults?: React.Dispatch<React.SetStateAction<UserForAdmin[]>>
    className?: string
  }
) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { results } = useSearch({ inputRef, data: users, type: "admin_users" });

  useEffect(() => {
    if (setResults) {
      setResults(results as UserForAdmin[]);
    }
  }, [results, setResults]);

  return (
    <div
      className={`py-2 pl-3 pr-5 text-dark-black border border-light-grey-2 rounded-xl flex gap-3 h-8 w-[217px] items-center ${className}`}
      style={{ backgroundColor: BG_COLOR }}
    >
      <SearchIcon />
      <input
        ref={inputRef}
        type="text"
        name="Search users"
        placeholder="Search"
        aria-label="Search users"
        className="outline-none bg-transparent w-full text-[14px] font-inter placeholder:text-[12px] desktop:placeholder:text-[14px] placeholder:leading-[150%]"
      />
    </div>
  );
};
