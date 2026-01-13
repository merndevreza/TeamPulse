import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import React from 'react';

const Loading = () => {
   return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background-grey)' }}>
         <LoadingSpinner />
      </div>
   );
};

export default Loading;