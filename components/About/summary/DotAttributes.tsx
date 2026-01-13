import React from "react";
import { UserDotsSummary } from "@/app/actions/api/types";
import Attribute from "./Attribute";

const DotAttributes = ({ userDotsSummary }: { userDotsSummary: UserDotsSummary }) => {
  return (
    <div className="flex flex-col desktop:flex-row desktop:justify-between w-full bg-transparent desktop:bg-off-white desktop:rounded-[10px] max-sm:gap-2 desktop:gap-[85px] gap-[19px] max-sm:px-0 desktop:px-7 max-sm:border-b border-b-light-grey desktop:pb-0 desktop:shadow-[0_18px_31px_0_rgba(0,0,0,0.12)] shadow-none desktop:-mt-1"
    >
      <AttributeSection
        title="Top attributes RECEIVED"
        attributes={userDotsSummary?.top_attributes_received.slice(0, 7)}
      />
      <AttributeSection
        title="Top attributes GIVEN"
        attributes={userDotsSummary?.top_attributes_given.slice(0, 7)}
      />
    </div>
  );
};

export default DotAttributes;

type AttributeSectionProps = {
  title: string;
  attributes: UserDotsSummary["top_attributes_received" | "top_attributes_given"];
};

const AttributeSection = ({ title, attributes }: AttributeSectionProps) => {
  if (!attributes || attributes.length === 0) return null;

  return (
    <div
      className="desktop:pt-3.5 pt-2.5 max-sm:pb-2 pb-3.5 px-9 desktop:px-0 desktop:pb-3 desktop:w-full max-sm:w-full max-sm:px-4 max-[1270px]:w-full bg-off-white shadow-[0_18px_31px_0_rgba(0,0,0,0.12)] desktop:shadow-none rounded-[10px] desktop:rounded-0">
      <div className="flex font-medium justify-between desktop:justify-start items-center text-center text-highlight-grey-2 text-[15px] desktop:text-[14px]">
        <p className={`w-full border-b border-b-light-grey-2 pb-1 desktop:pb-2 text-left pl-7 max-sm:pl-0`}>{title}</p>
        <p className={` pb-1 desktop:pb-2 border-b text-right border-b-light-grey-2 pr-[87px] desktop:pr-[70px] max-sm:pl-0 max-sm:text-start max-sm:pr-7`}>Sentiment</p>
      </div>
       
      <div>
        {attributes.map((attribute) => (
          <Attribute key={attribute.label_text} attribute={attribute} />
        ))}
      </div>
    </div>
  );
};