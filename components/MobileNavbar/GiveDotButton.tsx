import Link from 'next/link';
import React from 'react';

const PlusIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="13"
      viewBox="0 0 14 13"
      fill="none"
    >
      <path
        d="M6.96802 0.160156C7.4669 0.160156 7.87224 0.564617 7.87231 1.06348V5.56641H12.3752C12.8741 5.56641 13.2785 5.97087 13.2786 6.46973C13.2786 6.96865 12.8742 7.37305 12.3752 7.37305H7.87231V11.875C7.87231 12.3738 7.46769 12.7781 6.96899 12.7783C6.47007 12.7783 6.06567 12.3739 6.06567 11.875V7.37305H1.56372C1.0648 7.37305 0.6604 6.96865 0.6604 6.46973C0.660476 5.97087 1.06484 5.56641 1.56372 5.56641H6.06567V1.06348C6.06575 0.56478 6.46936 0.16042 6.96802 0.160156Z"
        fill="#F0522D"
      />
    </svg>
  );
};

const GiveDotButton = () => {
  return (
    <Link
      href={"/give-dot"}
      className="w-[111px] h-9 inline-flex py-1.5 px-3 bg-background-grey gap-1.5
              text-middle-orange font-inter text-[16px] font-medium leading-[150%] justify-center items-center rounded-lg"
    >
      <PlusIcon /> <span>Give Dot</span>
    </Link>
  );
};

export default GiveDotButton;