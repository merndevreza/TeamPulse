import { DotQuality } from "@/app/actions/api/types";
import React from "react";

const DotQualityUser = ({
  quality = null,
}: {
  quality: DotQuality["dot_quality"];
}) => {
  return (
    <div>
      <p
        className={`text-dark-grey font-inter text-sm desktop:text-[16px] font-medium leading-[150%] ml-2 ${
          quality === null ? "mb-1" : "mb-3 max-sm:mb-2"
        }`}
      >
        Dot Quality
      </p>

      <div className="inline-flex h-[35px] max-sm:h-[30px]">
        <div
          className={`flex items-center justify-center gap-2 desktop:gap-3 ${
            quality === null ? "" : "py-2"
          } px-5 desktop:px-6 rounded-full`}
          style={{
            background:
              quality === null
                ? ""
                : quality === "good"
                ? "#E5F6E9"
                : "#FEE8E8",
          }}
        >
          {quality === null ? (
            <span className="bg-dark-grey inline-block h-px w-3 rounded-full p-0"></span>
          ) : (
            <span className="text-dark-black text-[17px] font-medium max-sm:leading-[150%]
              max-sm:text-[16px]
            ">
              {quality === "good" ? "Excellent" : "Bad"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DotQualityUser;
