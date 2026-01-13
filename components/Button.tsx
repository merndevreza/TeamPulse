"use client";
import React from 'react';
import { cn } from '@/utils/cn';
import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
   text: string;
   variant: 'primary' | 'secondary' | 'tertiary';
   icon?: ReactNode;
}

export default function Button({
   className = '',
   text,
   variant,
   icon,
   disabled,
   ...buttonProps
}: ButtonProps) {
   const baseStyle = 'px-8 max-sm:px-[38px] max-sm:py-[6px] py-2 rounded-[8px] font-medium flex items-center gap-1.5 transition-all duration-200 text-center text-[16px] desktop:text-[17px] justify-center';

   const variantStyles: Record<ButtonProps['variant'], string> = {
      primary: 'bg-light-orange hover:bg-middle-orange text-white active:scale-90 transition-transform',
      secondary: 'bg-light-grey-3 hover:bg-light-grey-2 text-light-black active:scale-90 transition-transform',
      tertiary: 'bg-transparent hover:bg-[#437ff71c] border-2 border-[actions-blue] text-[actions-blue] active:scale-90 transition-transform',
   };

   const disabledStyles: Record<ButtonProps['variant'], string> = {
      primary: 'bg-light-orange text-white opacity-50',
      secondary: 'bg-light-grey-3 text-light-black opacity-50',
      tertiary: 'bg-transparent border-2 border-[actions-blue] text-[actions-blue] opacity-50',
   };

   const cursorStyle = disabled ? 'cursor-not-allowed' : 'cursor-pointer';
   const activeStyles = disabled ? disabledStyles[variant] : variantStyles[variant];
   const style = `${baseStyle} ${cursorStyle} ${activeStyles}`;

   return (
      <button
         className={cn(`${style} ${className} `)}
         disabled={disabled}
         {...buttonProps}
      >
         {icon && <>{icon}</>}
         {text}
      </button>
   );
}
