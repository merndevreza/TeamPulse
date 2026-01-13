import React from "react";
import { UserDotsSummary } from "@/app/actions/api/types";
import { cn } from "@/utils/cn";
import "./top-summary.css";

const TopSummary = ({
  userDotsSummary,
}: {
  userDotsSummary: UserDotsSummary;
}) => {
  return (
    <div className="border-t max-sm:pb-4 max-sm:pt-2 max-[1000px]:border-b border-light-grey-2">
      <div className="flex desktop:justify-between items-center font-medium pt-2 desktop:pt-3 max-[1000px]:px-0 max-[1000px]:grid max-[1000px]:grid-cols-2 max-[1000px]:py-5 max-[1000px]:text-start max-sm:gap-0 mx-[18px] desktop:mx-[30px] max-sm:pt-1 max-sm:pb-1.5 max-w-[1348px] gap-0 desktop:gap-[84px] -mb-2.5 desktop:mb-0">
        <SummaryItem
          value={userDotsSummary?.total_dots_received || 0}
          label="Dots Received"
          className="max-[1000px]:border-r max-[1000px]:border-b border-light-grey-2 add-border-right w-[200px]"
          labelClass="min-[1001px]:-ml-4.5"
          valueClass="min-[1001px]:-ml-4"
        />
        <SummaryItem
          value={userDotsSummary?.last_dot_received ? userDotsSummary.last_dot_received.slice(0, 10).replace(/-/g, "/") : "N/A"}
          label="Last Dot Received" 
          className="max-[1000px]:border-b border-light-grey-2 add-border-right w-[275px]"
          valueClass="min-[1001px]:-ml-4"
        />
        <SummaryItem
          value={userDotsSummary?.total_dots_given || 0}
          label="Dots Given"  
          className="max-[1000px]:border-r border-light-grey-2 add-border-right w-[217px]"
          valueClass="min-[1001px]:-ml-3"
        />
        <SummaryItem
          value={userDotsSummary?.last_dot_given ? userDotsSummary.last_dot_given.slice(0, 10).replace(/-/g, "/") : "N/A"}
          label="Last Dot Given" 
          className="w-[270px]"
        />
      </div>
    </div>
  );
};

type SummaryItemProps = {
  value: string | number;
  label: string; 
  removeBorderOnMobile?: boolean;
  className?: string;
  labelClass?: string;
  valueClass?: string;
};

const SummaryItem = ({ value, label, removeBorderOnMobile, className, labelClass, valueClass }: SummaryItemProps) => {
  return (
    <div className={cn(`flex flex-col justify-center text-center max-[1000px]:w-full desktop:w-[274px] items-center max-[1000px]:items-start max-[1000px]:pl-7 pb-5 pt-5.5 desktop:pt-6 ${removeBorderOnMobile ? "max-sm:border-none" : ""} ${className || ""}`)} >
      <p className={`text-[22px] desktop:text-[28px] font-geist font-semibold max-sm:text-[20px] text-middle-black mb-0.5 desktop:mb-0 ${valueClass}`}>{value}</p>
      <p className={`text-[15px] font-inter text-dark-grey leading-[110%] desktop:leading-[130%] desktop:-ml-0.5 ${labelClass}`}>{label}</p>
    </div>
  );
};

export default TopSummary;
