import React from "react";

const InactiveText = ({
  isActive,
  text,
  className
}: {
  isActive: boolean;
  text: string;
  className?: string;
}) => {
  if (isActive) return null;
  return (
    <span className={`text-dark-grey font-inter text-[11px] italic font-medium leading-[20px] tracking-[-0.1px] uppercase ${className}`}>
      {text}
    </span>
  );
};

export default InactiveText;
