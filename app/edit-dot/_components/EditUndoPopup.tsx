"use client";
import React, { useEffect, useState } from "react";
import styles from "./EditUndoPopup.module.css";
import { useRouter } from "next/navigation";

const EditUndoPopup = () => {
  const [dotId, setDotId] = useState<string | null>(null);
  const router = useRouter();

  // Load undo snapshot safely
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const json = sessionStorage.getItem("previouslyEditedDotUndoData");
      if (json) {
        const parsed = JSON.parse(json);
        if (parsed?.dotId) setDotId(String(parsed.dotId));
      }
    } catch {
      /* ignore */
    }
    // Auto-expire undo snapshot after timeout
    const timer = setTimeout(() => {
      sessionStorage.removeItem("previouslyEditedDotUndoData");
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!dotId) return null;

  const handleClick = () => {
    // Restore old version into main key so Wrapper will use it
    const undoJson = sessionStorage.getItem("previouslyEditedDotUndoData");
    if (undoJson) {
      sessionStorage.setItem("previouslyEditedDotData", undoJson);
      sessionStorage.removeItem("previouslyEditedDotUndoData");
    }
    router.push(`/edit-dot/${dotId}`);
  };

  return (
    <div
      className={`
        fixed bottom-8 desktop:bottom-12 left-1/2 transform -translate-x-1/2
        inline-flex items-center justify-center gap-[37px]
        px-4 py-2 desktop:px-5 desktop:py-3
        rounded-[7px]
        bg-light-black
        shadow-[0_8px_19px_0_rgba(0,0,0,0.12)]
        ${styles.animateSlideUpFade}
      `}
      role="status"
      aria-live="polite"
    >
      <span className="text-off-white font-inter text-[14px] desktop:text-[17px] font-medium leading-[130%] desktop:leading-[150%]">
        Dot edited successfully
      </span>
      <button
        onClick={handleClick}
        type="button"
        className="
          inline-flex items-center gap-[10px]
          text-off-white font-inter text-[14px] desktop:text-[17px] font-medium leading-[130%] desktop:leading-[150%]
          underline
          hover:opacity-80 transition-opacity
        "
      >
        Undo
        <UndoIcon />
      </button>
    </div>
  );
};

export default EditUndoPopup;

const UndoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.59356 1.01676C7.86719 1.35392 7.81491 1.8499 7.47674 2.12352L3.69534 5.18453H11.835C15.2402 5.18453 18.0001 7.94437 18.0001 11.3496C18.0001 14.7548 15.2402 17.5146 11.835 17.5146H8.8181C8.38361 17.5146 8.03107 17.1621 8.03107 16.7276C8.03107 16.2931 8.38361 15.9406 8.8181 15.9406H11.835C14.3703 15.9406 16.426 13.8849 16.426 11.3496C16.426 8.81427 14.3703 6.75858 11.835 6.75858H3.69534L7.47674 9.81959C7.81493 10.0932 7.86718 10.5892 7.59356 10.9264C7.31994 11.2645 6.82396 11.3168 6.4868 11.0432L0.977612 6.58337C0.793154 6.43375 0.685547 6.20932 0.685547 5.97159C0.685547 5.73385 0.793149 5.50942 0.977612 5.35981L6.4868 0.89999C6.82396 0.626367 7.31994 0.678581 7.59356 1.01676Z"
      fill="white"
    />
  </svg>
);
