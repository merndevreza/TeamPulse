"use client";

import useHeader from "@/hooks/useHeader";
import useIsDesktop from "@/hooks/useIsDesktop";
import { firstLetters } from "@/utils/firstLetters";
import Link from "next/link";
import React from "react";

const MyProfileLink = ({ isMobile = false }: { isMobile?: boolean }) => {
  const { pathname, userInfo } = useHeader();
  const isDesktop = useIsDesktop();
  return (
    <Link href="/my-profile" className="flex items-center">
      <button
        className={`cursor-pointer font-inter active:scale-90 transition-transform rounded-[10px] border border-black/[0.06] ${
          isMobile &&
          "rounded-full text-[14px] desktop:text-[16px] leading-6 tracking-[0.64px]"
        } font-light ${
          pathname === "/my-profile"
            ? "bg-middle-orange text-off-white"
            : "bg-light-grey hover:bg-off-white-2 text-light-black"
        } ${isMobile ? "h-[31px] w-[31px]" : isDesktop ? "h-10 w-10" : "h-[31px] w-[31px]"}`}
      >
        {firstLetters(userInfo?.firstName, userInfo?.lastName)}
      </button>
    </Link>
  );
};

export default MyProfileLink;
