"use client";

import { DotsSearch } from "@/components/Search/Search";
import React from "react";
import { SelectedDot } from "./Wrapper";

const TEXT_COLOR = "#7C8B9D";

const SearchContainer = ({ selectedDots }: { selectedDots: SelectedDot[] }) => {
  return (
    <div
      data-testid="search-container"
      className="pl-10 pr-8 max-sm:pl-3.5 max-sm:pr-5 max-sm:pt-[57px]"
      style={{ color: TEXT_COLOR }}
    >
      <div className="flex justify-between items-center w-full py-2.5 desktop:py-[7px] desktop:pl-7 pr-6 desktop:pr-[38px] max-sm:flex-col max-sm:items-start max-sm:gap-2 ">
        <DotsSearch className="max-sm:w-[79vw] max-sm:h-8 max-sm:rounded-lg" />
        <span data-testid="selected-dots-count" className="desktop:text-[16px] text-dark-grey font-medium text-[14px] max-sm:pl-2.5">
          {selectedDots.length} / 5 (max) selected
        </span>
      </div>
      <div className="border-b border-b-[#B1AFAE] w-full max-sm:hidden" />
    </div>
  );
};

export default SearchContainer;
