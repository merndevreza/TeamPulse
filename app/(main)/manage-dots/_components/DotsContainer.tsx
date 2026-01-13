"use client";
import { DotCategory as DotCategoryType } from "@/app/actions/api/types";
import React, { useEffect, useState } from "react";
import DotCategory from "./DotCategory";
import { DotsSearchAdmin } from "@/components/Search/Search";
import CreateCategoryBtn from "./CreateCategoryBtn";
import AccordionCollapseSVG from "@/components/CommonSVGs/AccordionCollapseSVG";

const DotsContainer = ({
  dots,
  token,
}: {
  dots: DotCategoryType[];
  token?: string;
}) => {
  const [allDots, setAllDots] = useState<DotCategoryType[]>(dots);
  const [filteredDots, setFilteredDots] = useState<DotCategoryType[]>(dots);

  useEffect(() => {
    setAllDots(dots);
    setFilteredDots(dots);
  }, [dots]);

  const [toggleAllAccordions, setToggleAllAccordions] = useState(true);

  return (
    <>
      <div className="mb-2.5 desktop:mb-5 pr-0 max-sm:px-0 max-sm:mb-0">
        <div className="flex justify-between items-center w-full pb-2 desktop:pr-[35px] max-sm:pt-3 pt-2.5 desktop:pt-2 pl-2">
          <DotsSearchAdmin
            setFilteredDots={setFilteredDots}
            allDots={allDots}
          />
          <div className="flex items-center gap-4.5 desktop:gap-10 max-sm:w-0 pr-1">
            <CreateCategoryBtn />
            <button
              onClick={() => setToggleAllAccordions(!toggleAllAccordions)}
              className="max-sm:relative top-0 right-14"
            >
              <AccordionCollapseSVG />
            </button>
          </div>
        </div>
        <div className="border-b border-light-grey-2 w-full max-sm:hidden" />
      </div>
      <div className="columns-2 desktop:columns-3 pr-0 pl-2.5 max-sm:columns-1 max-sm:px-0 max-[1032px]:columns-1 gap-6">
        {filteredDots.length > 0 &&
          filteredDots.map((dot, index) => (
            <div key={index} className="break-inside-avoid mb-4 max-sm:mb-0">
              <DotCategory
                dot={dot}
                token={token}
                toggleAllAccordions={toggleAllAccordions}
              />
            </div>
          ))}
      </div>
    </>
  );
};

export default DotsContainer;
