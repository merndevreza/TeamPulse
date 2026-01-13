"use client";
import React, { useEffect, useRef } from "react";

type Props = {
  show: boolean;
  title: string;           // e.g. "Are you sure you want to delete this Category?"
  subtitle?: string;       // e.g. "The category will be deleted permanently"
  confirmLabel?: string;   // default "Delete"
  cancelLabel?: string;    // default "Cancel"
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;       // disable buttons while awaiting
};

export default function ConfirmDialog({
  show,
  title,
  subtitle,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  // autofocus + Escape to close
  useEffect(() => {
    if (!show) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [show, onCancel]);

  if (!show) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-[#7D7D7D]/30"
        onClick={onCancel}
        aria-hidden
      />

      {/* Dialog */}
      <div className="fixed z-50 top-1/2 -translate-y-1/2 left-[37%] w-[510px] pr-2">
        <div
          role="dialog"
          aria-modal="true"
          className="w-full rounded-lg bg-off-white shadow-lg pt-10.5 pb-4.5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Body */}
          <div className="text-center ">
            <h2 className="text-[18px] text-center mx-auto desktop:text-[20px] desktop:px-0 font-medium text-dark-black -ml-1">
              {title}
            </h2>
            {subtitle ? (
              <p className="text-[14px] font-inter text-dark-grey mt-px ml-1">
                {subtitle}
              </p>
            ) : null}
          </div>

          {/* Actions */}
          <div className="px-5 pb-6 mt-6 flex items-center justify-center gap-5">
            <button
              ref={cancelRef}
              type="button"
              role="button"
              onClick={onCancel}
              disabled={loading}
              className="bg-background-grey text-light-black px-8 py-[7px] rounded-lg text-[17px] font-inter"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              role="button"
              disabled={loading}
              className="bg-warning-red text-off-white px-8 py-[7px] rounded-lg disabled:bg-background-grey disabled:opacity-50 disabled:text-middle-orange text-[17px] font-inter"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
