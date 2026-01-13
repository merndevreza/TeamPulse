import React from "react";
import { UserDotsSummary } from "@/app/actions/api/types";
import Sentiment from "./Sentiment";

const DotSentiments = ({ userDotsSummary }: { userDotsSummary: UserDotsSummary }) => {
  return (
    <div className="flex gap-4 desktop:gap-5 w-full max-sm:flex-col max-sm:w-full max-sm:gap-2 max-[1270px]:flex-col 
    max-sm:border-b border-b-light-grey max-sm:pb-4">
      <SentimentSection
        title="Most dots RECEIVED FROM"
        users={userDotsSummary?.most_dots_received_from}
      />
      <SentimentSection
        title="Most dots GIVEN TO"
        users={userDotsSummary?.most_dots_given_to}
      />
    </div>
  );
};

export default DotSentiments;

type SentimentSectionProps = {
  title: string;
  users: UserDotsSummary["most_dots_received_from" | "most_dots_given_to"];
};

const SentimentSection = ({ title, users }: SentimentSectionProps) => {
  if (!users || users.length === 0) return null;

  return (
    <div className="bg-off-white rounded-[10px] px-5 desktop:px-[30px] pb-2 desktop:pb-3 pr-5 desktop:pr-8 w-1/2 max-sm:w-full max-sm:px-4 max-[1270px]:w-full"
    style={{
      boxShadow: "0 18px 31px 0 rgba(0, 0, 0, 0.12)"
    }}
    >
      <div className="flex font-medium justify-center items-center text-center text-highlight-grey border-b border-b-light-grey-2 pt-3 desktop:pt-3.5 pb-1 desktop:pb-2.5">
        <p className="w-full text-left text-[15px] desktop:text-[14px] text-highlight-grey-2 pl-5 desktop:pl-6">
          {title}
        </p>
        <p className="text-right pr-11.5 desktop:pr-17 text-highlight-grey-2 max-sm:pl-0 text-[15px] desktop:text-[14px] max-sm:text-start ">
          Sentiment
        </p>
      </div>
      <div>
        {users.map((user) => (
          <Sentiment key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
};

