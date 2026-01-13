import React from "react";

interface ChevronRightIconProps {
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
}

export default function ChevronRightIcon({ 
  width = 8, 
  height = 16, 
  stroke = "#8A8483",
  strokeWidth = 1.56863,
  className 
}: ChevronRightIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={width} 
      height={height} 
      viewBox="0 0 8 16" 
      fill="none"
      className={className}
    >
      <path 
        d="M0.78418 0.783937L6.7866 6.78636C7.22948 7.22924 7.22948 7.94728 6.7866 8.39015L0.78418 14.3926" 
        stroke={stroke} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
      />
    </svg>
  );
}