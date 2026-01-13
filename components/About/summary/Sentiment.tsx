"use client";
import { UserMostDotSummary } from "@/app/actions/api/types";
import InitialsAvatar from "@/components/Avatar/InitialsAvatar";
import {
  AttributeSentimentLoop,
  AttributeSentimentOkay,
  AttributeSentimentThumbsUp,
} from "@/components/CommonSVGs/AboutSVGs";
import InactiveText from "@/components/InactiveText";
import Link from "next/link";
import React from "react";

const Sentiment = ({ user }: { user: UserMostDotSummary }) => {
  const sentiments = [
    { name: "thumbs_up", count: user.thumbs_up_count },
    { name: "ok", count: user.ok_count },
    { name: "loop", count: user.loop_count },
  ];

  // Derive active status directly
  const isActive =  user.is_active;

  return (
    <div className="flex text-center font-medium py-[7px] desktop:py-[9px] border-b border-b-light-grey-2">
      <div className="w-full flex items-center px-6 desktop:px-6 max-sm:px-0 max-sm:w-[55%] text-dark-black">
        <Link href={`/about-others/${user.id}/summary`} className="inline-flex items-center"> 
        <InitialsAvatar firstName={user.first_name} lastName={user.last_name} className="w-5 h-5 desktop:w-[31px] desktop:h-[31px]" />
        <p className="ml-4.5 text-[14px] font-medium font-geist flex flex-col text-left ">
          {user.first_name} {user.last_name} <br />
          <InactiveText isActive={isActive} text="Inactive" className="leading-tight -mt-0.5" />
        </p>
        </Link>
      </div>
      <div className="w-[10.6vw] pt-1 flex justify-end items-center gap-3 desktop:gap-1 text-[14px] pr-4 desktop:pr-2 max-sm:gap-3 max-sm:pr-2.5 max-sm:w-[45%]">
        {sentiments.map((sentiment) => (
          <p
            key={sentiment.name}
            className={`flex gap-1.5 items-center flex-none leading-[110%] desktop:leading-[130%] min-w-10 desktop:min-w-14 max-sm:min-w-auto max-sm:max-w-max max-sm:items-start ${sentiment.count === 0 ? "text-light-grey-2" : "text-[#464141] "}`}
          >
            {sentiment.name === "thumbs_up" && <AttributeSentimentThumbsUp className="flex-none max-sm:w-[15px] max-sm:h-3.5 w-[17px] h-[17px] desktop:h-[18px] desktop:w-[19px]" />}
            {sentiment.name === "ok" && <AttributeSentimentOkay className="flex-none max-sm:w-[15px] max-sm:h-[15px] w-[17px] h-[17px] desktop:h-[18px] desktop:w-[19px]" />}
            {sentiment.name === "loop" && <AttributeSentimentLoop className="flex-none max-sm:w-3 max-sm:h-[15px] w-[17px] h-[17px] desktop:h-[17px] desktop:w-[18px] -ml-1" />}
            <span className="flex-none text-[12px] desktop:text-[14px]" data-testid={`user-sentiment-${sentiment.name}`}>{sentiment.count}</span>
          </p>
        ))}
      </div>
    </div>
  );
};

export default Sentiment;
