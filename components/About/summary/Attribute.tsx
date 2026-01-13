import React from "react";
import { AttributeSummary } from "@/app/actions/api/types";
import {
  AttributeSentimentLoop,
  AttributeSentimentOkay,
  AttributeSentimentThumbsUp,
} from "@/components/CommonSVGs/AboutSVGs";

const SENT_COL_W = "w-[9.6vw]";

const Attribute = ({ attribute }: { attribute: AttributeSummary }) => {
  const sentiments = [
    { name: "thumbs_up", count: attribute.thumbs_up_count },
    { name: "ok", count: attribute.total_count - attribute.thumbs_up_count - attribute.loop_count },
    { name: "loop", count: attribute.loop_count },
  ];
  return (
    <div className="flex justify-between text-center font-medium py-2.5 desktop:py-3.5 border-b border-b-light-grey-2 max-sm:min-h-[50px]">
      <div className={`w-full text-left pl-6 pr-10 text-[14px] text-dark-black max-sm:px-0  max-w-2/3 max-sm:max-w-full max-sm:w-[55%]`}>
        {attribute.label_text}
      </div>

      <div className="w-[10.6vw] flex justify-end items-center gap-[11px] desktop:gap-1 text-[14px] max-sm:text-dark-black pr-11.5 desktop:pr-2 max-sm:gap-3 max-sm:pr-2.5 max-sm:w-[45%]">
        {sentiments.map((sentiment) => (
          <p
            key={sentiment.name}
            className={`flex gap-1.5 items-center leading-[110%] desktop:leading-[130%] min-w-10 desktop:min-w-14 max-sm:min-w-auto max-sm:max-w-max max-sm:items-start ${sentiment.count === 0 ? "text-light-grey-2" : "text-[#464141]"}`}
          >
            {sentiment.name === "thumbs_up" && <AttributeSentimentThumbsUp className="max-sm:w-[15px] max-sm:h-3.5 desktop:h-[18px] desktop:w-[19px]" />}
            {sentiment.name === "ok" && <AttributeSentimentOkay className="max-sm:w-[15px] max-sm:h-[15px] desktop:h-[18px] desktop:w-[19px]" />}
            {sentiment.name === "loop" && <AttributeSentimentLoop className="max-sm:w-3 max-sm:h-[15px] desktop:h-[17px] desktop:w-[18px] -ml-1" />}
            <span className="text-[12px] desktop:text-[14px]" data-testid={`user-sentiment-${sentiment.name}`}>{sentiment.count}</span>
          </p>
        ))}
      </div>
    </div>
  );
};

export default Attribute;
