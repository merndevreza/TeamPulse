"use client"
import React from "react";

const HoverTooltip = ({
  show = false,
  content = "Tooltip text",
  tipX = 10,
  containerX = 0,
  containerY = 0,
}: {
  show?: boolean;
  content?: string;
  containerY?: number;
  containerX?: number;
  tipX?: number;
}) => {
  const isTouchDevice = () => {
    if (typeof window === "undefined") return false;
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0
    );
  };
  return (
    <p
      className="flex-col absolute cursor-default pointer-events-none w-max z-5 max-sm:hidden"
      style={{
        display: isTouchDevice() ? "none" : show ? "flex" : "none",
        transform: `translate(${containerX}px, ${containerY}px)`,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="13"
        height="10"
        viewBox="0 0 13 10"
        fill="none"
        style={{
          transform: `translate(${tipX}px, 1px)`,
        }}
      >
        <path
          d="M5.98163 0.949219C6.36653 0.282553 7.32878 0.282552 7.71368 0.949219L12.8477 9.84153H0.847656L5.98163 0.949219Z"
          fill="var(--dark-grey-3)"
        />
      </svg>
      <span className="tooltip-content font-inter text-[12px] desktop:text-[14px] px-2.5 py-[3px] rounded-sm bg-dark-grey-3 text-off-white block">
        {content}
      </span>
    </p>
  );
};

export default HoverTooltip;
