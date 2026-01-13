import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import React from 'react';

const Loading = () => {
   return (
       <main className='h-screen w-full flex justify-center items-center'>
         <LoadingSpinner />
       </main>
   );
};

export default Loading;
