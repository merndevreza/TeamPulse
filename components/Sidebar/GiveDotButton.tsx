"use client";
import useActionState from '@/hooks/useActionState';
import Link from 'next/link';
import React from 'react';
import Button from '../Button';

const GiveDotButton = () => {
   const { isActionRunning, actionType } = useActionState();
   return (
      <Link href="/give-dot"
         prefetch={true}
      >
         <Button
            text='Give Dot'
            variant="secondary"
            disabled={isActionRunning}
            className='w-full font-medium font-inter whitespace-nowrap py-[5px] desktop:py-[7px] text-[16px] desktop:text-[17px] text-middle-orange gap-[13px] px-0'
            title={isActionRunning ? `Action in progress: ${actionType}` : undefined}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
               <path d="M8.37012 1.17773C8.92221 1.17783 9.36993 1.62566 9.37012 2.17773V7.76465H14.957C15.5091 7.76472 15.9568 8.21258 15.957 8.76465C15.957 9.31689 15.5093 9.76458 14.957 9.76465H9.37012V15.3496C9.37008 15.9018 8.9223 16.3495 8.37012 16.3496C7.81785 16.3496 7.37015 15.9019 7.37012 15.3496V9.76465H1.78516C1.2329 9.76461 0.785156 9.31691 0.785156 8.76465C0.785357 8.21256 1.23303 7.76468 1.78516 7.76465H7.37012V2.17773C7.3703 1.62561 7.81795 1.17773 8.37012 1.17773Z" fill="#F0522D" />
            </svg>}
         />
      </Link>
   );
};

export default GiveDotButton;