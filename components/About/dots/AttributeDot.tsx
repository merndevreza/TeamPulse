import { DotCategory, DotDetail } from "@/app/actions/api/types";
import {
  AttributeContentLoop,
  AttributeContentOK,
  AttributeContentThumbsUp,
} from "@/components/CommonSVGs/AboutSVGs";
import React from "react";

const AttributeDot = ({
  dot_type_name,
  dot,
  allDots,
}: {
  dot_type_name: "thumbs_up" | "ok" | "loop";
  dot: DotDetail;
  allDots: DotCategory[];
}) => {
  const label = dot
    ? allDots
        ?.find((category) =>
          category.labels.find((label) => label.id === dot.label_id)
        )
        ?.labels.find((label) => label.id === dot.label_id)
    : undefined;
  return (
    <div className="w-fit text-[14px] leading-[110%] desktop:leading-[120%] h-[33px] desktop:h-9 gap-2.5 desktop:gap-[11px] border border-light-grey-2 rounded-3xl flex items-center pl-1 pr-4 desktop:pr-7 bg-off-white-2 max-sm:text-[15px]">
      <p>
        {dot_type_name === "thumbs_up" ? (
          <AttributeContentThumbsUp className="w-6.5 desktop:w-7 desktop:h-7" />
        ) : dot_type_name === "ok" ? (
          <AttributeContentOK className="w-6.5 desktop:w-7 desktop:h-7" />
        ) : dot_type_name === "loop" ? (
          <AttributeContentLoop className="w-6.5 desktop:w-7 desktop:h-7" />
        ) : null}
      </p>
      <p className="text-dark-black">{label?.label}</p>
    </div>
  );
};

export default AttributeDot;
