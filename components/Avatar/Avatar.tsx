import Image from 'next/image';
import React from 'react';
import { cn } from '@/utils/cn';

interface AvatarProps {
   placeholderLetter?: string;
   src?: string | null | undefined;
   alt?: string | null | undefined;
   className?: string;
   size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Avatar = ({ 
   placeholderLetter = "A", 
   src, 
   alt = "Avatar", 
   className,
   size = 'md'
}: AvatarProps) => {
   // Size variants for responsive design
   const sizeClasses = {
      sm: 'w-8 h-8 text-sm sm:w-10 sm:h-10 sm:text-base',
      md: 'w-12 h-12 text-lg sm:w-16 sm:h-16 sm:text-xl',
      lg: 'w-20 h-20 text-2xl sm:w-24 sm:h-24 sm:text-3xl md:w-28 md:h-28',
      xl: 'w-24 h-24 text-3xl sm:w-32 sm:h-32 sm:text-4xl 2xl:w-[133px] 2xl:h-[133px]'
   };

   const baseClasses = cn(
      'relative rounded-full overflow-hidden',
      sizeClasses[size],
      className
   );

   return (
      <div className={baseClasses}>
         {src ? (
            <Image 
               src={src} 
               alt={alt ?? "Avatar"} 
               fill
               className="object-cover"
               sizes="(max-width: 640px) 80px, (max-width: 768px) 120px, 160px"
            />
         ) : (
            <div className="flex items-center justify-center w-full h-full bg-light-grey">
               <span className="text-5xl font-medium text-gray-600 uppercase select-none">
                  {placeholderLetter}
               </span>
            </div>
         )}
      </div>
   );
};

export default Avatar;