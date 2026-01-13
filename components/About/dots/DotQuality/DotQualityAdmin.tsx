"use client";
import { DotQuality } from "@/app/actions/api/types";
import { updateDotQuality } from "@/app/actions/dot-quality/dot-quality-api";
import ErrorPopup from "@/components/ErrorPopup";
import React from "react";

const inputs = [
  { label: "Excellent", value: "good" },
  { label: "Bad", value: "bad" },
];

const DotQualityAdmin = ({
  dot_id,
  existingQuality,
  onQualityChange,
}: {
  dot_id: number;
  existingQuality: DotQuality["dot_quality"];
  onQualityChange?: (quality: DotQuality["dot_quality"] | null) => void;
}) => {
  const [selectedQuality, setSelectedQuality] = React.useState<
    DotQuality["dot_quality"] | null
  >(existingQuality);
  const [tempSelectedQuality, setTempSelectedQuality] = React.useState<
    DotQuality["dot_quality"] | null
  >(existingQuality);
  const [error, setError] = React.useState<string | null>(null);

  const handleQualityChange = async (value: DotQuality["dot_quality"]) => {
    // Toggle: if already selected, unset (null)
    const nextValue: DotQuality["dot_quality"] | null =
      tempSelectedQuality === value ? null : value;

    setTempSelectedQuality(nextValue);
    const response = await updateDotQuality({ dot_id, dot_quality: nextValue }); // send null to clear
    if (!response.success) {
      setError(response.error ?? null);
      setTempSelectedQuality(selectedQuality); // revert
      return;
    }
    setSelectedQuality(nextValue);
    onQualityChange?.(nextValue);
  };

  return (
    <div>
      <p className="text-dark-grey font-inter text-sm desktop:text-[16px] font-medium leading-[150%] ml-2 mb-2 desktop:mb-3.5 max-sm:mb-2.5">
        Select Dot Quality
      </p>

      <div className="flex gap-2 desktop:gap-3 flex-col desktop:flex-row">
        {inputs.map((input) => {
          const isRatingSelected = tempSelectedQuality === input.value;
          const isGood = input.value === "good";
          const isBad = input.value === "bad";

          // Determine padding
          const paddingClass = isGood ? "pr-5" : isBad ? "pr-8.5" : "pr-4";

          // Determine background color
          const bgClass = isRatingSelected
            ? isGood
              ? "bg-[#E5F6E9]"
              : isBad
              ? "bg-[#FEE8E8]"
              : "bg-background-grey"
            : "bg-background-grey";

          // Determine hover state
          const hoverClass =
            !isRatingSelected && isGood
              ? "hover:bg-[#EEFFF2]"
              : !isRatingSelected && isBad
              ? "hover:bg-[#FEE8E8]"
              : "";

          return (
            <label
              key={input.value}
              className={`group flex items-center justify-start gap-3 py-2 pl-2 desktop:pl-2.5 cursor-pointer rounded-full desktop:h-[35px] desktop:min-w-[100px] w-max h-[30px] text-[16px] desktop:text-[17px] leading-[150%] select-none ${paddingClass} ${bgClass} ${hoverClass}`}
              onClick={() =>
                handleQualityChange(input.value as DotQuality["dot_quality"])
              } 
            >
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer border-middle-grey bg-off-white ${!isRatingSelected ? "group-hover:border-light-orange" : ""}`}
                >
                  {isRatingSelected && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="w-3 h-3"
                    >
                      <circle cx="6" cy="6" r="5.64667" fill="#F0642D" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-dark-black text-[14px] font-inter desktop:text-[17px] font-medium leading-[150%]">
                {input.label}
              </span>
            </label>
          );
        })}
      </div>
      {error && <ErrorPopup errorText={error} onClose={() => setError(null)} />}
    </div>
  );
};
export default DotQualityAdmin;
