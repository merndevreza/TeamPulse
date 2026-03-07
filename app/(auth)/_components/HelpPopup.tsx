"use client";
import React from 'react';

const HelpPopup = () => {
   const [isOpen, setIsOpen] = React.useState(false);
   return (
      <div className='relative ml-auto mr-2'>
         <button className='bg-middle-orange py-1 text-sm px-2 rounded' onClick={() => setIsOpen(!isOpen)}>{isOpen ? 'Hide Credentials' : 'Show Credentials'}</button>
         {isOpen && (
            <div className='absolute top-[115%] right-0 w-64 bg-light-orange/45 p-4 rounded-md'>
               <p className='mb-4'>Email: ariful@lexaeon.com</p>
               <p className='mb-2'>Password: @Arif_1824</p>
            </div>
         )}
      </div>
   );
};

export default HelpPopup;