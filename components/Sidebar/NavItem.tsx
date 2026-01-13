"use client";

import useIsDesktop from "@/hooks/useIsDesktop";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItemProps = {
  item: {
    url: string
    title: string
    img: string
    imgWidth: number
    imgHeight: number
  };
};

const NavItem = ({ item }: NavItemProps) => {
  const isDesktop = useIsDesktop();
  const pathname = usePathname();
  const itemPath = item.url.replace(/\/$/, ''); // Remove trailing slash
  const active = pathname === itemPath || pathname.startsWith(itemPath + '/');

  return (
    <div>
      <Link
        href={item.url}
        className={`flex items-center gap-[9px] desktop:gap-2 pl-[15px] desktop:pl-4.5 py-2.5 desktop:py-[11px] transition-all border-l-[3px] mt-1 mb-[3px] desktop:mb-1 desktop:mt-1 ${active
          ? "border-off-white-3 bg-middle-black"
          : "border-transparent bg-transparent"
          }`}
           prefetch={true}
        aria-label={`Navigate to ${item.title}`}
        aria-current={active ? "page" : undefined}
      >
        <div className="flex items-center justify-center shrink-0 w-5 h-5 desktop:w-9 desktop:h-6">
          <Image
            className="object-contain"
            src={item.img}
            alt={`${item.title} Icon`}
            width={isDesktop ? item.imgWidth : 19}
            height={isDesktop ? item.imgHeight : 19}
            style={{ width: "auto", height: "auto" }}
          />
        </div>
        <span className="text-base desktop:text-[17px] font-medium text-off-white-3 font-geist">{item.title}</span>
      </Link>
    </div>
  );
};

export default NavItem;
