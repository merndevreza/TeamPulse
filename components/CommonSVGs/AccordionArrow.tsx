import React from "react";

const AccordionArrow = (
    {
        className
    }: {
        className?: string
    }
) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="10"
      viewBox="0 0 18 10"
      fill="none"
        className={className}
    >
      <path
        d="M0.91272 8.5293L7.62764 1.81438C8.12308 1.31894 8.92636 1.31894 9.4218 1.81438L16.1367 8.5293"
        stroke="#7C8B9D"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default AccordionArrow;
