"use client";
import React from "react";
import AttributeDot from "./AttributeDot";
import Link from "next/link";
import { DotCategory, DotDetailedResult } from "@/app/actions/api/types";

import {
  AttributeSentimentLoop,
  AttributeSentimentOkay,
  AttributeSentimentThumbsUp,
} from "@/components/CommonSVGs/AboutSVGs";
import InitialsAvatar from "@/components/Avatar/InitialsAvatar";
import { usePathname } from "next/navigation";
import InactiveText from "@/components/InactiveText";
import DotQuality from "./DotQuality/DotQuality"; 
import useIsDesktop from "@/hooks/useIsDesktop";

const Attribute = ({
  type,
  dot,
  allDots,
  isAdmin = false,
}: {
  type: "given" | "received";
  dot: DotDetailedResult;
  allDots: DotCategory[];
  isAdmin?: boolean;
}) => { 
  const isDesktop = useIsDesktop();
  const [currentQuality, setCurrentQuality] = React.useState(dot.dot_quality);
  const isActive =
    type === "given" ? dot?.receiver_is_active : dot?.giver_is_active;
  const date = dot ? new Date(dot.created_at) : null;
  const numberOfThumbsUp = dot
    ? dot.details.filter((detail) => detail.dot_type_name === "thumbs_up")
      .length
    : 0;
  const numberOfOkay = dot
    ? dot.details.filter((detail) => detail.dot_type_name === "ok").length
    : 0;
  const numberOfLoop = dot
    ? dot.details.filter((detail) => detail.dot_type_name === "loop").length
    : 0;

  const sentiments = [
    { name: "thumbs_up", count: numberOfThumbsUp },
    { name: "ok", count: numberOfOkay },
    { name: "loop", count: numberOfLoop },
  ];

  const first_name =
    type === "given"
      ? dot?.receiver_name.split(" ")[0]
      : dot?.giver_name.split(" ")[0];
  const last_name =
    type === "given"
      ? dot?.receiver_name.split(" ")[1]
      : dot?.giver_name.split(" ")[1];

  const pathName = usePathname();
  const pathNameIsNotAboutOthers = !pathName?.includes("/about-others/");
  let formattedDate: React.ReactNode = "";
  if (date) {
    const dateString = date.toLocaleDateString(
      undefined,
      { month: "2-digit", day: "2-digit", year: "numeric" }
    ).replace(/\//g, "-");
    const timeString = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (!isDesktop) {
      formattedDate = (
        <>
          {dateString}
          <br />
          {timeString}
        </>
      );
    } else {
      formattedDate = `${dateString} at ${timeString}`;
    }
  }

  const isActiveUser = type === "given" ? dot?.receiver_is_active : dot?.giver_is_active;
  const userId = type === "given" ? dot?.receiver_id : dot?.giver_id;
  const userLink = isActiveUser && userId ? `/about-others/${userId}/summary` : null;

  const hasBadQualityBorder = isActive && currentQuality === "bad";
 
  return (
    <div
      className={`flex items-start desktop:gap-[50px] font-medium pt-4 desktop:pt-6 pb-4 desktop:pb-7 pl-6 desktop:pl-10 pr-5 desktop:pr-12.5 bg-off-white rounded-[10px] mb-3 desktop:mb-4 max-[1000px]:flex-col max-sm:py-4 max-sm:px-3 ${hasBadQualityBorder ? "border-2 border-warning-red-2" : ""}`}
      style={{
        boxShadow: "0 18px 31px 0 rgba(0, 0, 0, 0.12)",
      }}
    >
      <div className="max-sm:flex max-sm:w-full pt-3">
        <div
          className="w-[198px] desktop:w-[255px] flex gap-4.5 max-sm:mb-4 max-[1000px]:w-full max-sm:px-1 pr-2"
        >
          {userLink ? (
            <Link href={userLink} >
              <InitialsAvatar
                firstName={first_name ?? ""}
                lastName={last_name ?? ""}
                className="translate-y-1 max-sm:w-8 max-sm:h-8 flex-none"
              />
            </Link>
          ) : (
            <div>
              <InitialsAvatar
                firstName={first_name ?? ""}
                lastName={last_name ?? ""}
                className="translate-y-1 max-sm:w-8 max-sm:h-8 flex-none"
              />
            </div>
          )}
          <div className="mt-[3px]">
            {userLink ? (
              <Link href={userLink} className="text-[14px] leading-[150%] text-dark-black">
                {type == "given" ? dot?.receiver_name : dot?.giver_name}
              </Link>
            ) : (
              <p className="text-[14px] leading-[150%] text-dark-black">
                {type == "given" ? dot?.receiver_name : dot?.giver_name}
              </p>
            )}
            <p className="text-[14px] text-middle-grey mt-1 font-inter font-medium max-sm:mt-1">
              {formattedDate}
            </p>
            <p>
              <InactiveText isActive={isActive ?? true} text="Inactive user" />
            </p>
            {type === "given" && pathNameIsNotAboutOthers && dot && dot.id && (
              <p className="max-sm:hidden mt-2.5 -ml-[3px]">
                <Link
                  href={`/edit-dot/${dot.id}`}
                  className="text-highlight-blue text-[15px] desktop:text-[16px] border-b
                font-inter"
                  data-testid="edit-link"
                  prefetch={true}
                  onClick={() =>
                    sessionStorage.removeItem("previouslyEditedDotData")
                  }
                >
                  edit dot
                </Link>
              </p>
            )}
          </div>
        </div>

        {type === "given" && pathNameIsNotAboutOthers && dot && dot.id && (
          <p className="hidden max-sm:block w-20">
            <Link
              href={`/edit-dot/${dot.id}`}
              className="text-highlight-blue text-[16px] border-b
                font-inter max-sm:text-[16px] w-full inline-block
                "
              data-testid="edit-link"
              prefetch={true}
              onClick={() =>
                sessionStorage.removeItem("previouslyEditedDotData")
              }
            >
              edit dot
            </Link>
          </p>
        )}
      </div>
      <div className="w-full desktop:w-[41vw] max-[1000px]:w-full max-[1000px]:mt-3 max-sm:mt-3 -mt-0.5 desktop:mt-0 pr-4">
        <div className="flex gap-1.5 desktop:gap-[11px] flex-wrap">
          {dot?.details.map((detail, i) => (
            <AttributeDot
              key={i}
              dot_type_name={
                detail.dot_type_name as "thumbs_up" | "ok" | "loop"
              }
              dot={detail}
              allDots={allDots}
            />
          ))}
        </div>
        <div
          className="text-[14px] text-[#6B6B6B] mt-3 desktop:mt-4"
        >
          {dot?.comment}
        </div>
      </div>
      <div className="flex flex-col gap-2.5 justify-between items-center ml-auto"
        style={{
          height: "-webkit-fill-available",
        }}
      >
        <div className="w-[155px] desktop:w-[203px] pl-6 pt-[13px] pb-[15px] border-b border-light-grey-2 max-sm:hidden max-[1000px]:hidden flex gap-4 desktop:gap-7.5">
          {sentiments.length > 0 &&
            sentiments.map((sentiment, i) => (
              <span
                key={i}
                data-testid={`sentiment-${sentiment.name}`}
                className={`inline-flex items-center gap-1 text-[12px] text-[#464141] desktop:text-[14px] ${sentiment.name === "loop" && "-ml-2"}`}
              >
                {sentiment.name === "thumbs_up" ? (
                  <AttributeSentimentThumbsUp className="h-4 w-4 desktop:h-4.5 desktop:w-4.5" height={28} width={28} />
                ) : sentiment.name === "ok" ? (
                  <AttributeSentimentOkay className="h-4 w-4 desktop:h-4.5 desktop:w-4.5" height={28} width={28} />
                ) : sentiment.name === "loop" ? (
                  <AttributeSentimentLoop className="h-4 w-4 desktop:h-4.5 desktop:w-4.5" height={28} width={28} />
                ) : null}{" "}
                {sentiment.count}
              </span>
            ))}
        </div>
        <DotQuality
          isAdmin={isAdmin}
          dot_id={dot.id}
          existingQuality={!isActive ? null : currentQuality}
          className="mt-auto mr-auto"
          onQualityChange={setCurrentQuality}
        />
      </div>
    </div>
  );
};

export default Attribute;
