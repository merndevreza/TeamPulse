"use client";

import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { DotCategory as Dot } from "@/app/actions/api/types";
import { LikeSVG, OkSVG } from "@/components/CommonSVGs/GiveDotSVGs";
import LottieLoopButton from "./LottieLoopButton";

import { SelectedDot } from "./Wrapper";
import AccordionArrow from "../CommonSVGs/AccordionArrow";
import classes from "./DotCategory.module.css";
import './DotCategory.css'
const DotCategory = ({
  category,
  setSelectedDots,
  selectedDots,
  toggleAllAccordions = true,
  type
}: {
  selectedDots: SelectedDot[];
  category: Dot;
  setSelectedDots: React.Dispatch<React.SetStateAction<SelectedDot[]>>;
  toggleAllAccordions?: boolean;
  type: "give" | "edit";
}) => {
  const [open, setOpen] = useState(true);
  const listRef = useRef<HTMLUListElement | null>(null);
  const [maxHeight, setMaxHeight] = useState("0px");

  // Measure content height for smooth animation
  const recalcHeight = () => {
    if (listRef.current) {
      setMaxHeight(listRef.current.scrollHeight + "px");
    }
  };

  useLayoutEffect(() => {
    recalcHeight();
  }, [category.labels]);

  // Recalculate if labels change asynchronously
  useEffect(() => {
    const ro = new ResizeObserver(() => recalcHeight());
    if (listRef.current) ro.observe(listRef.current);
    return () => ro.disconnect();
  }, []);

  const handleDotSelect = (dotType: string, label: string, label_id: number) => {
    setSelectedDots((prev) => {
      if (type === "edit") return prev;
      const existingIndex = prev.findIndex((dot) => dot.label === label);
      if (existingIndex !== -1) {
        const updatedDots = [...prev];
        updatedDots[existingIndex] = {
          label_id,
          label,
          dot_type: dotType,
          categoryName: category.name,
        };
        return updatedDots;
      } else {
        if (prev.length >= 5) {
          return [
            ...prev.slice(0, 4),
            { label_id, label, dot_type: dotType, categoryName: category.name },
          ];
        }
        return [
          ...prev,
          { label_id, label, dot_type: dotType, categoryName: category.name },
        ];
      }
    });
  };

  useEffect(() => {
    setOpen(toggleAllAccordions);
  }, [toggleAllAccordions]);

  return (
    <div
      data-testid="dot-category-wrapper"
      className="pt-3 desktop:pt-4 pb-2 desktop:pb-2.5 pl-6 pr-[21px] rounded-xl bg-off-white max-sm:w-full max-sm:rounded-none"
      style={{
        boxShadow: "0 18px 31px 0 rgba(0, 0, 0, 0.12)",
        height: open ? "max-content" : "fit-content",
      }}
    >
      <button
        data-testid="dot-category-title"
        id={`accordion-button-${category.name}`}
        aria-expanded={open}
        aria-controls={`panel-${category.name}`}
        onClick={() => setOpen((o) => !o)}
        className=" flex justify-between items-center text-highlight-grey font-medium border-b border-light-grey w-full text-left pb-2.5 pl-4 pr-2  desktop:pl-5 desktop:pr-5 text-[18px]"
      >
        {category.name}
        <span
            style={{
              display: "inline-flex",
              transition: "transform 0.3s ease",
              transform: open ? "rotate(0deg)" : "rotate(180deg)",
            }}
        >
          <AccordionArrow />
        </span>
      </button>
      <ul
        id={`panel-${category.name}`}
        ref={listRef}
        className="dot-accordion list-disc"
        style={{
          overflow: "hidden",
          maxHeight: open ? maxHeight : "0px",
          // transition: "max-height 0.35s ease",
        }}
      >
        {category.labels?.map((label) => (
          <li
            data-testid={`dot-label-row-${label.id}`}
            key={label.id}
            className="list-none flex justify-between items-center py-[5px] desktop:py-2 max-sm:py-3 pl-5 pr-1 desktop:pl-5 desktop:pr-5 gap-1 border-b border-light-grey"
          >
            <span className="dot-label font-medium text-[14px] text-dark-black">
              {label.label}
            </span>
            <p
              data-testid={`dot-buttons-${label.id}`}
              className="dot-buttons flex desktop:gap-1"
            >
              <button
                data-testid={`select-${label.id}-thumbs_up`}
                className={`${classes.likeButton} dotButton text-off-white h-7 w-7 rounded-full flex justify-center items-center  ${selectedDots.find(
                    (dot) => dot.label === label.label && dot.dot_type === "thumbs_up"
                  ) ? "selectedDot" : ""}`}
                onClick={() =>
                  handleDotSelect("thumbs_up", label.label, label.id)
                }
              >
                <LikeSVG
                  selected={!!selectedDots.find(
                    (dot) =>
                      dot.label === label.label && dot.dot_type === "thumbs_up"
                  )}
                />
              </button>
              <button
                data-testid={`select-${label.id}-ok`}
                className={`okButton dotButton text-off-white h-7 w-7 rounded-full flex justify-center items-center ${selectedDots.find(
                    (dot) => dot.label === label.label && dot.dot_type === "ok"
                  ) ? "selectedDot" : ""}`}
                onClick={() => handleDotSelect("ok", label.label, label.id)}
              >
                <OkSVG
                  selected={!!selectedDots.find(
                    (dot) =>
                      dot.label === label.label && dot.dot_type === "ok"
                  )}
                />
              </button>
              <LottieLoopButton
                data-testid={`select-${label.id}-loop`}
                className={`dotButton loopButton text-off-white h-7 w-7 rounded-full flex justify-center items-center  ${selectedDots.find(
                    (dot) => dot.label === label.label && dot.dot_type === "loop"
                  ) ? "selectedDot" : ""}`}
                onClick={() => handleDotSelect("loop", label.label, label.id)}
              />
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DotCategory;