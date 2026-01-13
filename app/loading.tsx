import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import React from 'react';

const Loading = () => {
   return (
      <div className="absolute max-sm:fixed inset-0 flex items-center justify-center">
         <LoadingSpinner />
      </div>
   );
};

export default Loading;