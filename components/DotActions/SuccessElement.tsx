"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import classes from './SuccessElement.module.css';

const SuccessElement = ({
  hasSubmitted,
  type,
}: {
  hasSubmitted: boolean;
  type: "give" | "edit";
}) => {
  const router = useRouter();
  useEffect(() => {
    if (!hasSubmitted) return;

    if (type === "edit") {
      router.back();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      router.push("/about-me/summary");
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [hasSubmitted, type, router]);

  const showOverlay = hasSubmitted && type === "give";

  return (
    <div
      className="fixed top-0 left-0 h-full w-full flex justify-center items-center bg-background-grey z-[51]"
      style={{ display: showOverlay ? "flex" : "none" }}
    >
      <div className="max-w-[1000px] w-full border border-[#D1D9E2] rounded-[10px] min-h-[290px] flex flex-col items-center justify-center gap-9 mx-8">
        <h2 className="text-[22px] text-dark-black font-medium">
          Dot submitted successfully
        </h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          className={classes.successIcon}
        >
          <path
            d="M 40,3 A 37,37 0 0,0 3,40 A 37,37 0 0,0 40,77 A 37,37 0 0,0 77,40 A 37,37 0 0,0 40,3"
            fill="none"
            stroke="#28bc89"
            strokeWidth="4"
            pathLength="100"
            className={classes.circle}
          />
          <path
            d="M 25 40 L 35 50"
            fill="none"
            stroke="#28bc89"
            strokeWidth="4"
            strokeLinecap="round"
            pathLength="100"
            className={classes.checkmarkDown}
          />
          <path
            d="M 35 50 L 55 32"
            fill="none"
            stroke="#28bc89"
            strokeWidth="4"
            strokeLinecap="round"
            pathLength="100"
            className={classes.checkmarkUp}
          />
        </svg>
      </div>
    </div>
  );
};

export default SuccessElement;
