import React from "react";
import Attribute from "./Attribute";
import { DotCategory, GivenDotDetailed } from "@/app/actions/api/types";

const GivenAttributes = ({
  givenDotsDetailed,
  allDots,
  isAdmin = false,
}: {
  givenDotsDetailed: GivenDotDetailed;
  allDots: DotCategory[];
  isAdmin?: boolean;
}) => {
  if (!givenDotsDetailed || givenDotsDetailed.results.length === 0) {
    return <p className="text-center mt-12">No given dots available.</p>;
  } 

  return (
    <div className="max-sm:py-7 max-sm:pb-4">
      {givenDotsDetailed.results.map((dot, i) => (
        <Attribute key={dot.id ?? i} dot={dot} type="given" allDots={allDots} isAdmin={isAdmin} />
      ))}
    </div>
  );
};

export default GivenAttributes;