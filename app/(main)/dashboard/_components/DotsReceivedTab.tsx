"use client";
import React, { useEffect } from 'react';
import TabContent from './TabContent';
import { DotsDataType } from './type';
import { getDashboardDotReceivedData } from '@/app/actions/dashboard';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
const cardsTitles = {
   activity_card1: "Top 5 employees who haven't received dots in the longest time",
   activity_card2: "Top 5 employees who received dots most recently",
   monthly_card1: "Employees who receive the fewest dots per month (average during 1 year)",
   monthly_card2: "Employees who receive the most dots per month (average during 1 year)",
   feedback_card1: "Top Thumb Up Receivers",
   feedback_card2: "Top Loop Receivers",
}
const DotsReceivedTab = () => {
   const [receivedData, setReceivedData] = React.useState<DotsDataType | null>(null);
   const [loading, setLoading] = React.useState<boolean>(true);
   const [error, setError] = React.useState<string | null>(null);

   useEffect(() => {
      // Fetch received data from server-side API
      async function fetchReceivedData() {
         try {
            setLoading(true);
            setError(null);
            const result = await getDashboardDotReceivedData(); 
            
            if (result.success) {
               setReceivedData(result.data as DotsDataType);
            } else {
               setError(result.message || 'Failed to fetch dots received data');
               console.error('Error fetching dots received data:', result.message);
            }
         } catch (err) {
            setError('An unexpected error occurred while fetching data');
            console.error('Error fetching dots received data:', err);
         } finally {
            setLoading(false);
         }
      }
      fetchReceivedData();
   }, []); 

   if (loading || !receivedData) {
      return (
         <div className="absolute max-sm:fixed inset-0 flex items-center justify-center">
         <LoadingSpinner />
      </div>
      );
   }

   if (error) {
      return (
         <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
         </div>
      );
   } 

   return (
      <div>  
         <TabContent tabName="received" cardsTitles={cardsTitles} data={receivedData} />
      </div>
   );
};

export default DotsReceivedTab;