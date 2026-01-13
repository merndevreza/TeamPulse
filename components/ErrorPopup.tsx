"use client";
import React, { useEffect, useState } from "react";

const ErrorPopup = (
  { errorText = "An error occurred", onClose }: { errorText?: string; onClose: () => void }
) => {
  const [open, setOpen] = useState(!!errorText);

  // Re-open only when a new non-empty errorText appears while closed.
  useEffect(() => {
    if (errorText && !open) {
      setOpen(true);
    }
  }, [errorText, open]);

  if (!open || !errorText) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 top-1/3">
      {/* Card */}
      <div
        className="
          relative flex flex-col items-center gap-2.5
          rounded-[10px] border border-[#D7D6D6] bg-[#FBFCFD]
          shadow-[0_0_12px_0_rgba(0,0,0,0.07)]
          px-8 pt-4 pb-11
          max-w-lg
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="error-title"
      >
        {/* Close (X) */}
        <button
          type="button"
          aria-label="Close popup"
          onClick={() => {
            setOpen(false);
            onClose(); // parent should clear errorText
          }}
          className="absolute right-4 top-4 p-1 rounded hover:bg:black/5 active:scale-95 transition"
        >
          {/* Cross icon svg */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="15"
            viewBox="0 0 16 15"
            fill="none"
          >
            <path
              d="M14.8468 0.704266C15.1554 1.01279 15.1551 1.51289 14.8468 1.82155L9.06431 7.60408L14.8468 13.3866C15.1552 13.6953 15.1553 14.1954 14.8468 14.5039C14.5383 14.8124 14.0382 14.8122 13.7296 14.5039L7.94703 8.72137L2.16933 14.4991C1.8607 14.8077 1.35999 14.8084 1.05136 14.4998C0.742728 14.1911 0.743418 13.6904 1.05205 13.3818L6.82974 7.60408L1.05205 1.82638C0.743417 1.51775 0.742727 1.01704 1.05136 0.708409C1.35999 0.399821 1.86072 0.400484 2.16933 0.7091L7.94703 6.4868L13.7296 0.704266C14.0382 0.395962 14.5383 0.395745 14.8468 0.704266Z"
              fill="#080808"
            />
          </svg>
        </button>

        {/* Error title */}
        <h2
          id="error-title"
          className="mb-[10px] font-[Geist] text-[20px] font-medium leading-[150%] text-[#E2333F]"
        >
          Error
        </h2>

        {/* Dynamic text content container */}
        <div
          className="
            flex flex-col items-center gap-[35px]
            rounded-[10px] border border-[#D7D6D6]
            px-5 pt-5 pb-[30px]
          "
        >
          <p className="text-center font-[Inter] text-[17px] font-medium leading-[150%] text-[#080808]">
            {errorText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPopup;
