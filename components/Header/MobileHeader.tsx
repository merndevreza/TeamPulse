import React from "react";
import MyProfileLink from "./MyProfileLink";
import NotificationsWrapper from "./NotificationsWrapper";

const MobileHeader = () => {
  return (
    <div className="max-sm:flex hidden h-[50px] bg-middle-black w-full px-4 justify-between">
      <p className="lexaeon-font leading-[29.98px] text-[23.43px] pt-[9px]">
        <span className="text-off-white">Lexaeon </span>
        <span className="text-light-orange">DOTS</span>
      </p>

      <div className="flex gap-5">
        <NotificationsWrapper isMobile />
        <MyProfileLink isMobile />
      </div>
    </div>
  );
};

export default MobileHeader;
