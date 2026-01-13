import React from "react";
import navigator from "@/utils/navigator";
import MobileNavItem from "./MobileNavItem";
import GiveDotButton from "./GiveDotButton";

const MobileNavbar = async ({ className }: { className?: string }) => {
  const { isAdmin, navigationItemsMobile } = await navigator();
  return (
    <div
      className={`max-sm:flex w-full hidden py-1 fixed bottom-0 left-0 bg-light-black items-center justify-between ${className} pl-6 pr-[9px] h-[50px] z-5`}
    >
      {!isAdmin ? (
        <>
          <MobileNavItem index={0} item={navigationItemsMobile[0]} />
          <GiveDotButton />
          <MobileNavItem index={1} item={navigationItemsMobile[1]} />
        </>
      ) : (
        <>
          <>
            <MobileNavItem index={0} item={navigationItemsMobile[0]} />
            <MobileNavItem index={1} item={navigationItemsMobile[1]} />
            <GiveDotButton />
            <MobileNavItem index={2} item={navigationItemsMobile[2]} />
            <MobileNavItem index={3} item={navigationItemsMobile[3]} />
          </>
        </>
      )}
    </div>
  );
};

export default MobileNavbar;
