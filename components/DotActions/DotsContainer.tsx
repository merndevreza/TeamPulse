"use client";
import React, { useEffect } from "react";
import { DotCategory as DotCategoryType } from "@/app/actions/api/types";
import { useDots } from "@/app/contexts/DotsContext";
import DotCategory from "./DotCategory";
import { SelectedDot } from "./Wrapper";
import AccordionCollapseSVG from "../CommonSVGs/AccordionCollapseSVG";

const DotsContainer = ({
  allDots,
  setSelectedDots,
  selectedDots,
  type
}: {
  allDots: DotCategoryType[];
  selectedDots: SelectedDot[];
  setSelectedDots: React.Dispatch<React.SetStateAction<SelectedDot[]>>;
  type: "give" | "edit";
}) => {
  const { filteredDots, setAllDots } = useDots();
  useEffect(() => {
    setAllDots(allDots);
  }, [allDots, setAllDots]);

  const [toggleAllAccordions, setToggleAllAccordions] = React.useState(true);

  return (
    <>
    <div
      data-testid="dots-container"
      className="relative pl-[3.3vw] desktop:pl-[5.3vw] pt-[21px] desktop:pt-6 max-sm:pt-0 pb-12 pr-[13.3vw] 
      desktop:pr-[11.61vw] columns-2 desktop:columns-3 gap-6 max-sm:flex max-sm:flex-col max-sm:px-0 max-sm:gap-0"
    >
      {filteredDots.map((dot, index) => (
        <div key={index} className="break-inside-avoid mb-4">
        <DotCategory
          data-testid={`dot-category-${index}`}
          key={index}
          category={dot}
          setSelectedDots={setSelectedDots}
          selectedDots={selectedDots}
          toggleAllAccordions={toggleAllAccordions}
          type={type}
        />
        </div>
      ))}
      <button className="absolute top-5 right-[8.5vw] desktop:right-[8.63vw] max-[900px]:right-[7vw]
       max-sm:top-[-65px] max-sm:left-[86vw]"
        onClick={() => setToggleAllAccordions(!toggleAllAccordions)}
      >
        <AccordionCollapseSVG />
      </button>
    </div>
    </>
  );
};

export default DotsContainer;
