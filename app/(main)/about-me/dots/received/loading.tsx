import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import React from 'react';

const loading = () => {
    return (
        <div className='flex justify-center items-center h-full mt-56'>
            <LoadingSpinner />
        </div>
    );
};

export default loading;