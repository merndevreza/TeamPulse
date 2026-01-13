"use client";
import { useAllUsers } from "@/app/contexts/AllUsersContext";
import React, { useState, useRef, useEffect } from "react";
import InitialsAvatar from "../Avatar/InitialsAvatar";

const HeaderSelected = ({ selectedUsers, setSelectedUsers, showUserList }: { selectedUsers: number[], setSelectedUsers: React.Dispatch<React.SetStateAction<number[]>>, showUserList: boolean }) => {
  const { allUsers } = useAllUsers();
  const [hoveredUserId, setHoveredUserId] = useState<number | null>(null);
  const [tooltipOffset, setTooltipOffset] = useState(0);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hoveredUserId !== null && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      if (rect.left < 0) {
        setTooltipOffset(-rect.left + 8);
      } else if (rect.right > window.innerWidth) {
        setTooltipOffset(window.innerWidth - rect.right - 8);
      } else {
        setTooltipOffset(0);
      }
    }
  }, [hoveredUserId]);

  if (!allUsers || showUserList) return null;

  return (
    <div className="py-2 pl-3 max-sm:pl-1 flex items-center gap-3 desktop:gap-4">
      {allUsers
        .filter((user) => selectedUsers.includes(user.id))
        .map((user) => (
          <div
            className="relative flex bg-white p-0.5 desktop:p-1 pr-1.5 desktop:pr-3 rounded-3xl gap-2 desktop:gap-2.5 items-center text-[14px] max-sm:bg-transparent max-sm:p-0"
            key={user.id}
            onMouseEnter={() => setHoveredUserId(user.id)}
            onMouseLeave={() => { setHoveredUserId(null); setTooltipOffset(0); }}
          >
            {hoveredUserId === user.id && (
              <div
                ref={tooltipRef}
                className="absolute top-[70%] desktop:top-[90%] left-1/2 mt-2 flex flex-col items-center pointer-events-none z-50"
                style={{ transform: `translateX(calc(-50% + ${tooltipOffset}px))` }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="10"
                  viewBox="0 0 12 10"
                  fill="none"
                  className="-mb-[1px]"
                  style={{ transform: `translateX(${-tooltipOffset}px)` }}
                >
                  <path d="M5.13398 0.500001C5.51888 -0.166666 6.48113 -0.166666 6.86603 0.5L12 9.39231H0L5.13398 0.500001Z" fill="#333A42" />
                </svg>
                <span className="whitespace-nowrap  px-2.5 py-[3px] rounded text-white text-[12px] desktop:text-[14px] font-inter" style={{ backgroundColor: '#333A42' }}>
                  {user.first_name} {user.last_name}
                </span>
              </div>
            )}
            <InitialsAvatar firstName={user.first_name} lastName={user.last_name} className="desktop:text-base text-[10px] w-[22px] h-[22px] desktop:w-[30px] desktop:h-[30px]" />
            <button
              aria-label="Remove user"
              className="max-sm:hidden"
              onClick={() => {
                setSelectedUsers((prev) => prev.filter((id) => id !== user.id));
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="15"
                viewBox="0 0 14 15"
                fill="none"
                className="w-2.5 h-2.5 desktop:w-3.5 desktop:h-3.5"
              >
                <path
                  d="M13.5018 0.996948C13.8924 1.38747 13.8924 2.02064 13.5018 2.41116L8.41329 7.49971L13.5025 12.5889C13.8926 12.9794 13.8926 13.6127 13.5025 14.0032C13.1121 14.3936 12.4789 14.3934 12.0883 14.0032L6.99907 8.91392L1.91467 13.9983C1.52415 14.3888 0.890979 14.3888 0.500457 13.9983C0.109979 13.6078 0.109957 12.9746 0.500457 12.5841L5.58486 7.49971L0.501148 2.416C0.110624 2.02547 0.110623 1.39231 0.501148 1.00178C0.891698 0.611577 1.52494 0.611364 1.91536 1.00178L6.99907 6.08549L12.0876 0.996948C12.4781 0.606438 13.1113 0.606466 13.5018 0.996948Z"
                  fill="var(--middle-orange)"
                />
              </svg>
            </button>
          </div>
        ))}
    </div>
  );
};

export default HeaderSelected;
