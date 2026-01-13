"use client";
import React from 'react';

const ResetPasswordTopPart = (
   { email }: { email?: string }
) => {
   return (
      <div className='flex flex-col items-center justify-center gap-2.5 max-sm:mb-[34px] mb-[94px]'>
         <h1 className='text-[28px] text-black leading-normal font-medium font-geist -mb-0.5'>Reset Password</h1>
         <p className='text-dark-grey-3 max-sm:text-[14px] font-medium leading-normal'>{email}</p>
      </div>
   );
};

export default ResetPasswordTopPart;