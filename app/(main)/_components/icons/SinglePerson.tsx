import React from "react";

const SinglePerson = ({ className } : { className?: string }) => {
  return (
    <svg
      width="33"
      height="33"
      viewBox="0 0 33 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="0.689453"
        y="0.753906"
        width="32"
        height="32"
        rx="16"
        fill="#7C8B9D"
      />
      <circle cx="16.6891" cy="10.8619" r="4.33554" fill="white" />
      <path
        d="M25.2524 24.9822C25.2524 24.9822 21.4185 24.9822 16.6892 24.9822C11.9599 24.9822 8.12598 24.9822 8.12598 24.9822C8.12598 24.9822 8.14362 24.3447 8.17798 24.0331C8.65019 19.7504 12.2806 16.4189 16.6892 16.4189C21.0978 16.4189 24.7282 19.7504 25.2004 24.0331C25.2348 24.3447 25.2524 24.9822 25.2524 24.9822Z"
        fill="white"
      />
    </svg>
  );
};

export default SinglePerson;
