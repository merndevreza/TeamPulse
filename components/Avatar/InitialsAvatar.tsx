import { firstLetters } from "@/utils/firstLetters";
import React from "react";

const InitialsAvatar = ({
  firstName,
  lastName,
  className,
  isAdmin = false,
}: {
  firstName: string;
  lastName: string | null;
  className?: string;
  isAdmin?: boolean;
}) => {
  const initials = firstLetters(firstName, lastName);
  return (
    <div
      className={`relative w-7 h-7 desktop:w-[30px] desktop:h-[30px] rounded-full text-sm desktop:text-base font-light font-inter bg-dark-grey text-off-white flex items-center justify-center leading-normal ${className}`}
      style={{letterSpacing:"0.64px"}}
    >
      {initials}
      {isAdmin && (
        <div className="absolute -bottom-1 -right-1 bg-off-white rounded-full">
          <AdminStarSVG />
        </div>
      )}
    </div>
  );
};

export default InitialsAvatar;

const AdminStarSVG = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className="h-[16px] w-[16px] desktop:h-[18px] desktop:w-[18px]"
    >
      <path
        d="M9.02246 1.22949C13.2795 1.22967 16.7305 4.68042 16.7305 8.9375C16.7303 13.1944 13.2794 16.6453 9.02246 16.6455C4.76538 16.6455 1.31463 13.1945 1.31445 8.9375C1.31445 4.68031 4.76527 1.22949 9.02246 1.22949Z"
        fill="var(--actions-blue)"
        stroke="var(--off-white-2)"
        strokeWidth="1.1"
      />
      <path
        d="M8.83748 4.67331C8.9049 4.50662 9.1409 4.50663 9.20831 4.67331L10.2026 7.132C10.2313 7.20284 10.2978 7.25117 10.374 7.25652L13.0196 7.44241C13.199 7.45501 13.2719 7.67946 13.1342 7.79508L11.1031 9.50052C11.0446 9.54966 11.0192 9.62785 11.0377 9.702L11.6784 12.2756C11.7219 12.45 11.5309 12.5888 11.3784 12.4935L9.12882 11.0889C9.064 11.0484 8.98179 11.0484 8.91697 11.0889L6.66736 12.4935C6.51485 12.5888 6.32392 12.45 6.36736 12.2756L7.00811 9.702C7.02658 9.62785 7.00117 9.54966 6.94265 9.50052L4.91156 7.79508C4.77386 7.67946 4.84679 7.45501 5.02615 7.44241L7.67176 7.25652C7.74799 7.25117 7.81451 7.20284 7.84316 7.132L8.83748 4.67331Z"
        fill="var(--off-white-2)"
      />
    </svg>
  );
};
