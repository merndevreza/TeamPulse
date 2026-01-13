"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  isChecked: boolean;  
  setIsChecked: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, isChecked, setIsChecked, disabled = false, ...props }, ref) => {
    const handleClick = () => {
      if (!disabled) {
        setIsChecked(!isChecked);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        handleClick();
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={disabled}
        className={cn(
          "peer inline-flex h-[30px] w-[70px] shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-[#E6E9EC] relative",
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <span
          className={cn(
            "absolute text-[14px] font-medium transition-all duration-300 uppercase text-gray",
            isChecked ? "left-2 opacity-100" : "right-3 opacity-100"
          )}
        >
          {isChecked ? "Yes" : "No"}
        </span>

        <span
          className={cn(
            "pointer-events-none block h-[23px] w-[23px] rounded-full shadow-lg ring-0 transition-transform duration-300 ",
            isChecked
              ? "bg-blue-500 translate-x-[43px]"
              : "bg-[#919BA5] translate-x-1"
          )}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
