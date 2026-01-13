"use client";

import React from 'react';
import TabContent from './TabContent'; 
import { DotsDataType } from './type';

const cardsTitles = {
   activity_card1: "Top 5 employees who haven't given dots in the longest time",
   activity_card2: "Top 5 employees who gave dots most recently",
   monthly_card1: "Employees who give the fewest dots per month (average during 1 year)",
   monthly_card2: "Employees who give the most dots per month (average during 1 year)",
   feedback_card1: "Top Thumb Up Givers",
   feedback_card2: "Top Loop Givers",
};

const DotsGivenTab = ({givenData}: {givenData: DotsDataType}) => {
   return (
      <div>
         {givenData && <TabContent tabName="given" cardsTitles={cardsTitles} data={givenData} />}
      </div>
   );
};

export default DotsGivenTab;