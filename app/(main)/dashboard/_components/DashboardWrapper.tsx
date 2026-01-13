"use client";
import Button from '@/components/Button';
import React, { useState } from 'react';
import DotsGivenTab from './DotsGivenTab';
import DotsReceivedTab from './DotsReceivedTab';
import { DotsDataType } from './type';

const activeLinkStyle = {
   color: "var(--off-white)",
   backgroundColor: "var(--light-black)",
   border: "1px solid var(--light-black)",
   wordSpacing: "-1px",
   fontSize: "16px"
};

const inactiveLinkStyle = {
   color: "var(--dark-black)",
   backgroundColor: "var(--light-grey)",
   border: "1px solid var(--light-grey-2)",
   wordSpacing: "-1px",
   fontSize: "16px"
};

const generalLinkStyle =
   `py-1 px-[14px] rounded-[7px] max-sm:rounded-lg transition-all duration-200 ease-in-out max-sm:px-1.5 max-sm:w-max font-inter text-[16px] leading-[1.4]`;

const DashboardWrapper = ({ givenData }: { givenData: DotsDataType }) => {
   const [tabType, setTabType] = useState<'given' | 'received'>('given');
   const [hoveredTab, setHoveredTab] = useState<'given' | 'received' | null>(null);

   const getButtonStyle = (tab: 'given' | 'received') => {
      if (tabType === tab) return activeLinkStyle;
      if (hoveredTab === tab) return { ...inactiveLinkStyle, backgroundColor: "var(--off-white-2)" };
      return inactiveLinkStyle;
   };

   return (
      <>
         <div className='flex gap-[50px] pb-3 border-b border-b-[#D7D6D6] mb-6'>
            <div className='flex gap-4 items-center'>
               <svg width="20" height="26" viewBox="0 0 20 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g>
                     <rect x="0.300781" y="6.22656" width="5.00475" height="17.462" rx="1.09611" fill="#7C8B9D" />
                     <rect x="7.49805" y="2.3125" width="5.00475" height="21.3741" rx="1.09611" fill="#7C8B9D" />
                     <rect x="14.6953" y="10.207" width="5.00475" height="13.4804" rx="1.09611" fill="#7C8B9D" />
                  </g>
               </svg>
               <h2 className='text-[28px] font-medium text-dark-black'>Dashboard</h2>
            </div>
            <div className='flex gap-2.5 items-center mt-0'>
               <Button
                  onClick={() => setTabType('given')}
                  onMouseEnter={() => setHoveredTab('given')}
                  onMouseLeave={() => setHoveredTab(null)}
                  text="Dots Given"
                  variant="secondary"
                  className={generalLinkStyle}
                  style={getButtonStyle('given')}
               />
               <Button
                  onClick={() => setTabType('received')}
                  onMouseEnter={() => setHoveredTab('received')}
                  onMouseLeave={() => setHoveredTab(null)}
                  text="Dots Received"
                  variant="secondary"
                  className={generalLinkStyle}
                  style={getButtonStyle('received')}
               />
            </div>
         </div>
         <div className='pb-14'>
            {tabType === 'given' ? (
               <DotsGivenTab givenData={givenData} />
            ) : (
               <DotsReceivedTab />
            )}
         </div>
      </>
   );
};

export default DashboardWrapper;