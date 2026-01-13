"use client";
import React, { useEffect, useRef, useState } from "react";

/**
 * Generic single-field popup with the exact same visuals/positioning
 * as your original category popup. Parent drives all behavior via props.
 */
type Props = {
  show: boolean;
  setShowPopup: (show: boolean) => void;

  /** Heading text */
  title: string;

  /** Field label */
  label: string;

  /** Submit button text, e.g. "Create" | "Save" */
  submitLabel: string;

  /** Optional initial value for the input */
  initialValue?: string;

  /** Called with the trimmed value when the form is submitted */
  onSubmit: (value: string) => Promise<void> | void;

  /** Optional loading/disable state you can pass down */
  submitting?: boolean;

  /** Optional input placeholder */
  placeholder?: string;

  type?: "create" | "edit";
  categoryName?: string;
};

const CreateCategoryPopup = ({
  show,
  setShowPopup,
  title,
  label,
  submitLabel,
  initialValue = "",
  onSubmit,
  submitting = false,
  placeholder,
  type,
  categoryName,
}: Props) => {
  const [value, setValue] = useState(initialValue);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Reset value when (re)opening
  useEffect(() => {
    if (show) setValue(initialValue);
  }, [show, initialValue]);

  // Escape to close
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowPopup(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [show, setShowPopup]);

  if (!show) return <></>;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-[#7D7D7D] opacity-30"
        style={{ display: show ? "block" : "none" }}
        onClick={() => setShowPopup(false)}
        aria-hidden
        role="presentation"
      />

      {/* card — same size/position as before, with higher z-index */}
      <div
        ref={cardRef}
        className="fixed z-50 w-[51.2vw] desktop:w-[34.2vw] top-[20.2vh] left-[32.9%] pt-7 pl-8 pr-7.5 desktop:px-8 pb-8 flex flex-col items-center justify-center bg-off-white rounded-xl shadow-lg
        max-sm:w-[307px] max-sm:mx-auto max-sm:left-[10vw]
        max-sm:px-4 max-sm:py-8 max-sm:top-[25%]
        "
        style={{ display: show ? "flex" : "none" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="generic-popup-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="generic-popup-title" className="desktop:mb-7 mb-6 text-[22px] desktop:text-[28px] font-medium max-sm:mb-1 text-dark-black">
          {title}
        </h2>
       {type === "create" && <p className="hidden max-sm:block w-[231px]
          text-dark-grey text-[14px] mb-0 font-geist text-center
        ">Under {categoryName} Category</p>}
        <form
          className="w-full border border-gray-300 rounded-xl pt-5 desktop:pt-5.5 pb-5 px-4.5 flex flex-col
          max-sm:border-0 max-sm:px-0 max-sm:py-0 max-sm:mt-6
          "
          onSubmit={async (e) => {
            e.preventDefault();
            const trimmed = value.trim();
            if (!trimmed || submitting) return;
            await onSubmit(trimmed);
          }}
        >
          <label htmlFor="genericPopupField" className="text-dark-grey ml-4.5
          max-sm:text-[14px] text-[17px] font-medium max-sm:ml-0
          ">
            {label}
          </label>

          <input
            id="genericPopupField"
            type="text"
            className="border border-light-grey-2 rounded-md py-3 pl-5.5 mt-1.5 max-sm:hidden text-[17.6px]"
            value={value}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
            disabled={submitting}
          />

          <textarea
            id="genericPopupFieldMobile"
            className="hidden max-sm:block border border-light-grey-2 rounded-md p-2 mt-2
            max-sm:h-[145px] max-sm:mb-6 text-start outline-0 px-4 py-3"
            value={value}
            placeholder={placeholder}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
            disabled={submitting}
          />

          <div className="w-full flex justify-center items-center gap-5 desktop:gap-5.5 mt-6 desktop:mt-12.5 mb-3 desktop:mb-7">
            <button
              type="button"
              className="bg-background-grey text-light-black px-7.5 desktop:px-8 py-1 desktop:py-[7px] rounded-lg text-[16px] desktop:text-[17px] font-inter"
              onClick={() => setShowPopup(false)}
              disabled={submitting}
              role="button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-light-orange text-off-white px-7.5 desktop:px-8 py-1 desktop:py-[7px] rounded-lg disabled:bg-background-grey disabled:opacity-50 disabled:text-middle-orange text-[16px] desktop:text-[17px] font-inter"
              disabled={!value.trim() || submitting}
              role="button"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateCategoryPopup;
