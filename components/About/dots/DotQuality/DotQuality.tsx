import React from "react";
import DotQualityUser from "./DotQualityUser";
import DotQualityAdmin from "./DotQualityAdmin";
import { DotQuality as DotQualityType } from "@/app/actions/api/types";

const DotQuality = ({
  isAdmin,
  dot_id,
  existingQuality,
  className,
  onQualityChange,
}: {
  isAdmin: boolean;
  dot_id: number;
  existingQuality: DotQualityType["dot_quality"];
  className?: string;
  onQualityChange?: (quality: DotQualityType["dot_quality"] | null) => void;
}) => {
  return (
    <div className={className}>
      {isAdmin ? (
        <DotQualityAdmin dot_id={dot_id} existingQuality={existingQuality} onQualityChange={onQualityChange} />
      ) : existingQuality ? (
        <DotQualityUser quality={existingQuality} />
      ) : null}
    </div>
  );
};

export default DotQuality;
