import React from 'react';
import DashboardWrapper from './_components/DashboardWrapper';
import { getDashboardDotGivenData } from '@/app/actions/dashboard';
import { DotsDataType } from './_components/type';
 
export const dynamic = 'force-dynamic';

const Page = async () => {
   const result = await getDashboardDotGivenData();

   if (!result.success) {
      console.error('Error fetching dots given data:', result.message);
      return (
         <main className='pl-[59px]'
            style={{ paddingRight: "clamp(60px, calc(3.75rem + ((1vw - 14.4px) * 12.9167)), 122px)" }}>
            <h2 className='text-[32px] font-medium'>Dashboard</h2>
            <div className="mt-8 p-6 bg-red-50 border border-red-400 text-red-700 rounded-lg">
               <p className="font-bold text-lg mb-2">Error Loading Dashboard</p>
               <p>{result.message || 'Failed to load dashboard data. Please try again later.'}</p>
            </div>
         </main>
      );
   }

   if (!result.data) {
      return (
         <main className='pl-[59px]'
            style={{ paddingRight: "clamp(60px, calc(3.75rem + ((1vw - 14.4px) * 12.9167)), 122px)" }}>
            <h2 className='text-[32px] text-dark-black font-medium'>Dashboard</h2>
            <div className="mt-8 p-6 bg-yellow-50 border border-yellow-400 text-yellow-700 rounded-lg">
               <p className="font-bold text-lg">No Data Available</p>
            </div>
         </main>
      );
   }

   return (
      <main className='pl-[59px] -mt-[3px]' style={{ paddingRight: "clamp(60px, calc(3.75rem + ((1vw - 14.4px) * 12.9167)), 122px)" }}> 
         <DashboardWrapper givenData={result.data as DotsDataType} />
      </main>
   );
};

export default Page;