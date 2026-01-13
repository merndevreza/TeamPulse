"use client";
import React from "react";
import { useRouter } from "next/navigation";

const LeavePagePopup = ({
  isOpen = false,
  onClose = () => {},
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) => {
  const [open, setOpen] = React.useState(isOpen);
  const router = useRouter();

  React.useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  if (!open) return null;

  const handleStay = () => {
    setOpen(false);
    onClose();
  };

  const handleLeave = () => {
    router.push("/about-me/summary");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        className="inline-flex flex-col items-center gap-8 rounded-[10px] border border-light-grey-2 bg-[#FBFCFD] shadow-[0_0_12px_0_rgba(0,0,0,0.07)] px-8 pt-8 pb-11 w-[489px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-title"
        aria-describedby="leave-subtitle"
      >
        <div>
          <h2
            id="leave-title"
            className="text-dark-black font-geist text-[18px] font-medium leading-[150%] "
          >
            Are you sure you want to leave?
          </h2>
          <p
            id="leave-subtitle"
            className="text-center text-dark-black font-inter text-[15px] font-medium leading-[150%] mt-0.5"
          >
            You will lose changes if you exit now.
          </p>
        </div>
        <div className="flex items-center gap-4.5">
          <button
            type="button"
            className="flex h-10 items-center justify-center gap-2 px-8 py-2 font-inter text-[17px] font-medium leading-[150%] text-light-black bg-light-grey-3 rounded-lg hover:bg-light-grey-2"
            onClick={handleStay}
          >
            Stay
          </button>
          <button
            type="button"
            className="flex h-10 items-center justify-center gap-2 px-7.5 py-2 rounded-lg bg-warning-red font-inter text-[17px] font-medium leading-[150%] text-white hover:bg-red-700"
            onClick={handleLeave}
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeavePagePopup;