import React from "react";
import Attribute from "./Attribute";
import { DotCategory, ReceivedDotDetailed } from "@/app/actions/api/types";

const ReceivedAttributes = (
  { receivedDotsDetailed, allDots, isAdmin }: { receivedDotsDetailed: ReceivedDotDetailed; allDots: DotCategory[]; isAdmin?: boolean }
) => {
  if (!receivedDotsDetailed || receivedDotsDetailed.results.length === 0) {
    return <p className="text-center mt-12">No received dots available.</p>;
  }

  return (
    <div className="max-sm:py-7 max-sm:pb-4">
      {receivedDotsDetailed.results.map((dot, i) => (
        <Attribute key={dot.id ?? i} dot={dot} type="received" allDots={allDots} isAdmin={isAdmin} />
      ))}
    </div>
  );
};

export default ReceivedAttributes;