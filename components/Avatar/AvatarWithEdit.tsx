"use client";
import React, { useRef } from 'react';
import Avatar from './Avatar';
import { cn } from '@/utils/cn';
import { toast } from 'react-toastify'

interface AvatarWithEditProps {
   isEditing: boolean;
   setAvatar: (avatar: string | null) => void;
   avatar: string | null | undefined;
   firstName: string;
   lastName: string;
   size?: 'sm' | 'md' | 'lg' | 'xl';
}

const AvatarWithEdit = ({ isEditing, setAvatar, avatar, firstName, lastName, size }: AvatarWithEditProps) => {
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [isImageUpdated, setIsImageUpdated] = React.useState(false);
   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
         // Validate file type
         if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file.');
            return;
         }

         // Validate file size (e.g., max 5MB)
         const maxSize = 5 * 1024 * 1024; // 5MB
         if (file.size > maxSize) {
            toast.error('Please select an image smaller than 5MB.');
            return;
         }

         // Create object URL for preview
         const objectUrl = URL.createObjectURL(file);
         setAvatar(objectUrl);
         setIsImageUpdated(true);
      }
   };

   const handleAvatarClick = () => {
      if (isEditing && fileInputRef.current) {
         fileInputRef.current.click();
      }
   }; 

   return (
      <div className="relative">
         <div
            className={cn(
               "relative",
               isEditing && !isImageUpdated && "cursor-pointer transition-all duration-200 hover:opacity-80"
            )}
            onClick={handleAvatarClick}
         >
            <Avatar
               src={avatar}
               alt={`${firstName} ${lastName} Avatar`}
               placeholderLetter={firstName.charAt(0).toUpperCase()}
               size={size}
            />
            {isEditing && !isImageUpdated && (
               <div className="absolute inset-0 rounded-full bg-[#E6E9EC] bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center scale-[1.01]">
                  <div className="flex flex-col justify-center items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" fill="none">
                        <path d="M22.2818 5.97984L16.926 0.624023L13.2148 4.33517L18.5706 9.69099L22.2818 5.97984Z" fill="var(--highlight-blue)" />
                        <path d="M0.323242 22.5832L6.21467 22.0477L16.3528 11.9096L10.9969 6.55371L0.858819 16.6918L0.323242 22.5832Z" fill="var(--highlight-blue)" />
                     </svg>
                     <p className='text-sm font-medium text-black text-center'>Change Picture</p>
                  </div>
               </div>
            )}
         </div>
         <input
            ref={fileInputRef}
            type="file"
            id="fileInput"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
         />
      </div>
   );
};

export default AvatarWithEdit;