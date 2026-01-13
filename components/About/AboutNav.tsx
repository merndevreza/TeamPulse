"use client";
import { cn } from "@/utils/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
 
const activeLinkStyle = "text-off-white bg-light-black border border-light-black";
 
const inactiveLinkStyle = `text-dark-black bg-light-grey border border-light-grey-2  hover:bg-off-white-2`;

const generalLinkStyle =
  `py-[1px] desktop:py-[4px] px-3.5 rounded-[7px] transition-all duration-200 ease-in-out max-sm:py-1 max-sm:px-1.5 max-sm:w-max font-inter text-[16px]`;

const AboutNav = ({ link }: { link: string }) => {
  return (
    <div
      className={`flex gap-2.5 w-full items-center justify-start font-medium text-[16px] desktop:text-[18px] max-sm:text-[16px] max-sm:leading-[150%] max-sm:gap-1 flex-wrap max-sm:pb-2`}
    >
      <NavLink link={link + "summary"} text="Dots Summary" />
      <NavLink className="px-4" link={link + "dots/received/?page=1"} text="Dots Received" />
      <NavLink className="px-4" link={link + "dots/given/?page=1"} text="Dots Given" />
    </div>
  );
};

const NavLink = ({className, link, text }: { className?: string; link: string; text: string }) => {
  const pathName = usePathname();
  const isActive = link.search(pathName) !== -1;
  return (
    <Link 
      className={cn(`${generalLinkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle} ${className || ""}`)}
      href={link}
       prefetch={true}
    >
      {text}
    </Link>
  );
};

export default AboutNav;
