import InitialsAvatar from '@/components/Avatar/InitialsAvatar';
import React from 'react';
import { ChartBar } from './ChartBar';
import { FeedbackChart } from './FeedbackChart';
import Link from 'next/link';

// Utility function to transform user data into ChartBar format
const transformToChartData = (
   users: { first_name: string; last_name: string; dots_given?: number; dots_received?: number }[]
): { "data-key": string; "data-value": number }[] => {
   return users.map(user => ({
      "data-key": user.first_name,
      "data-value": user.dots_given || user.dots_received || 0
   }));
};

// Utility function to get styling based on days
const getDayRangeStyle = (days: number): string => {
   if (days >= 30) {
      return "bg-[#FEE8E8] text-[#FF3232]";
   } else if (days >= 15) {
      return "bg-[#FEF5E8] text-[#EE6700]";
   }
   return "bg-[#E5F6E9] text-[#07B730]";
};

type cardsTitlesType = {
   activity_card1: string,
   activity_card2: string,
   monthly_card1: string,
   monthly_card2: string,
   feedback_card1: string,
   feedback_card2: string,
}
type MonthlyActivityUser = {
   user_id: number,
   first_name: string;
   last_name: string;
   dots_given?: number;
   dots_received?: number;
}

type dataType = {
   activity: {
      not_giving_dots?: { user_id: number, first_name: string, last_name: string, days: number }[],
      giving_dots?: { user_id: number, first_name: string, last_name: string, days: number }[],
      not_receiving_dots?: { user_id: number, first_name: string, last_name: string, days: number }[],
      receiving_dots?: { user_id: number, first_name: string, last_name: string, days: number }[]
   },
   monthlyActivity: {
      fewerDotGivers?: MonthlyActivityUser[],
      mostDotGivers?: MonthlyActivityUser[],
      fewerDotReceivers?: MonthlyActivityUser[],
      mostDotReceivers?: MonthlyActivityUser[],
   },
   feedbackType: {
      thumbs_up: { user_id: number, first_name: string, last_name: string, thumbs_up_percentage: number, loop_percentage: number, ok_percentage: number, total_dots: number }[],
      loop: { user_id: number, first_name: string, last_name: string, thumbs_up_percentage: number, loop_percentage: number, ok_percentage: number, total_dots: number }[]
   }
}

const TabContent = ({ cardsTitles, data, tabName = "given" }: { cardsTitles: cardsTitlesType, data: dataType, tabName?: "given" | "received" }) => {
   const isReceived = tabName === "received";

   // Get the correct data based on tab type
   const activityData1 = isReceived ? data.activity.not_receiving_dots : data.activity.not_giving_dots;
   const activityData2 = isReceived ? data.activity.receiving_dots : data.activity.giving_dots;
   const monthlyData1 = isReceived ? data.monthlyActivity.fewerDotReceivers : data.monthlyActivity.fewerDotGivers;
   const monthlyData2 = isReceived ? data.monthlyActivity.mostDotReceivers : data.monthlyActivity.mostDotGivers;
   const dotsKey = isReceived ? 'dots_received' : 'dots_given';
   return (
      <div>
         <section className='mb-6'>
            <SectionTitle title="Activity Overview" tabName={tabName} />
            <div className='flex flex-col desktop:flex-row' style={{ gap: "clamp(20px, calc(1.25rem + ((1vw - 19.2px) * 3.125)), 40px)" }}>
               <Card cardTitle={cardsTitles.activity_card1}>
                  <div>
                     {activityData1?.map((user, index) => (
                        <div key={index} className='flex justify-between pt-[9px] pb-2 border-b border-b-light-grey-2'
                           style={{
                              paddingRight: "clamp(20px, calc(1.25rem + ((1vw - 14.4px) * 0.8333)), 24px)",
                              paddingLeft: "clamp(20px, calc(1.25rem + ((1vw - 14.4px) * 0.8333)), 24px)"
                           }}>
                           <UserName user_id={user.user_id} firstName={user.first_name} lastName={user.last_name} />
                           <p className={`text-[16px] font-inter font-medium w-[134px] py-1 rounded-full text-center ${getDayRangeStyle(user.days)}`}>{user.days} days</p>
                        </div>
                     ))}
                  </div>
               </Card>
               <Card cardTitle={cardsTitles.activity_card2}>
                  <div>
                     {activityData2?.map((user, index) => (
                        <div key={index} className='flex justify-between pt-[9px] pb-2 border-b border-b-light-grey-2'
                           style={{
                              paddingRight: "clamp(20px, calc(1.25rem + ((1vw - 14.4px) * 0.8333)), 24px)",
                              paddingLeft: "clamp(20px, calc(1.25rem + ((1vw - 14.4px) * 0.8333)), 24px)"
                           }}>
                           <UserName user_id={user.user_id} firstName={user.first_name} lastName={user.last_name} />
                           <p className={`text-[16px] font-medium w-[134px] py-1 rounded-full text-center ${getDayRangeStyle(user.days)}`}>{user.days} days</p>
                        </div>
                     ))}
                  </div>
               </Card>
            </div>
         </section>
         <section className='mb-6'>
            <SectionTitle title="Monthly Activity" tabName={tabName} />
            <div className='flex flex-col desktop:flex-row' style={{ gap: "clamp(20px, calc(1.25rem + ((1vw - 19.2px) * 3.125)), 40px)" }}>
               <Card cardTitle={cardsTitles.monthly_card1}>
                  <ChartBar data={transformToChartData(monthlyData1 || [])} />
                  <div className='-mt-1'>
                     {monthlyData1?.map((user, index) => (
                        <div key={index} className='flex justify-between items-center pt-[9px] pb-2 border-b border-b-light-grey-2'
                           style={{
                              paddingRight: "clamp(20px, calc(1.25rem + ((1vw - 14.4px) * 9.5833)), 66px)",
                              paddingLeft: "clamp(20px, calc(1.25rem + ((1vw - 14.4px) * 0.8333)), 24px)"
                           }}>
                           <UserName user_id={user.user_id} firstName={user.first_name} lastName={user.last_name} />
                           <p className='text-[16px] font-medium text-[#FF3232]'>{user[dotsKey]} dots</p>
                        </div>
                     ))}
                  </div>
               </Card>
               <Card cardTitle={cardsTitles.monthly_card2}>
                  <ChartBar data={transformToChartData(monthlyData2 || [])} />
                  <div className='-mt-1'>
                     {monthlyData2?.map((user, index) => (
                        <div key={index} className='flex justify-between items-center pt-[9px] pb-2 border-b border-b-light-grey-2'
                           style={{
                              paddingRight: "clamp(20px, calc(1.25rem + ((1vw - 14.4px) * 9.5833)), 66px)",
                              paddingLeft: "clamp(20px, calc(1.25rem + ((1vw - 14.4px) * 0.8333)), 24px)"
                           }}>
                           <UserName user_id={user.user_id} firstName={user.first_name} lastName={user.last_name} />
                           <p className='text-[16px] font-medium text-[#07B730]'>{user[dotsKey]} dots</p>
                        </div>
                     ))}
                  </div>
               </Card>
            </div>
         </section>
         <section className='mb-6'>
            <SectionTitle title={`Type of Feedback that employees ${isReceived ? 'receive' : 'give'}`} tabName={tabName} />
            <div className='flex flex-col desktop:flex-row' style={{ gap: "clamp(20px, calc(1.25rem + ((1vw - 19.2px) * 3.125)), 40px)" }}>
               <Card>
                  <div className='flex justify-between items-center pb-3 border-b border-b-[#D7D6D6]'>
                     <h3 className='text-[#808080] text-lg leading-normal font-geist font-medium mt-0.5'>{cardsTitles.feedback_card1}</h3>
                     <ul className='flex gap-4'>
                        <li className='text-[#6D6B6B] flex items-center text-sm mr-1'>
                           <span className='inline-block w-4 h-4 bg-[#F6C2C5] rounded-full mr-1'></span>Thumbs Up
                        </li>
                        <li className='text-[#6D6B6B] flex items-center text-sm'>
                           <span className='inline-block w-4 h-4 bg-[#F0642D] rounded-full mr-1'></span>Loops
                        </li>
                        <li className='text-[#6D6B6B] flex items-center text-sm'>
                           <span className='inline-block w-4 h-4 bg-[#8A8483] rounded-full mr-1'></span>Oks
                        </li>
                     </ul>
                  </div>
                  <div>
                     {data.feedbackType.thumbs_up.map((user, index) => (
                        <div key={index} className='flex justify-between items-center pl-6 pt-[7px] pb-1 border-b border-b-light-grey-2'>
                           <UserName user_id={user.user_id} firstName={user.first_name} lastName={user.last_name} />
                           <div className='flex items-center gap-4'>
                              <div className='text-right font-inter'>
                                 <p className='text-[#222]'>{user?.thumbs_up_percentage}%</p>
                                 <p className='text-[#6D6B6B] text-sm'>{user?.thumbs_up_percentage}% / {user?.loop_percentage}% / {user?.ok_percentage}%</p>
                              </div>
                              <div>
                                 <FeedbackChart
                                    thumbsUp={user.thumbs_up_percentage}
                                    loop={user.loop_percentage}
                                    ok={user.ok_percentage}
                                 />
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </Card>
               <Card>
                  <div className='flex justify-between items-center pb-3 border-b border-b-[#D7D6D6]'>
                     <h3 className='text-[#808080] text-lg leading-normal font-geist font-medium mt-0.5'>{cardsTitles.feedback_card2}</h3>
                     <ul className='flex gap-4'>
                        <li className='text-[#6D6B6B] flex items-center text-sm mr-1'>
                           <span className='inline-block w-4 h-4 bg-[#F6C2C5] rounded-full mr-1'></span>Thumbs Up
                        </li>
                        <li className='text-[#6D6B6B] flex items-center text-sm'>
                           <span className='inline-block w-4 h-4 bg-[#F0642D] rounded-full mr-1'></span>Loops
                        </li>
                        <li className='text-[#6D6B6B] flex items-center text-sm'>
                           <span className='inline-block w-4 h-4 bg-[#8A8483] rounded-full mr-1'></span>Oks
                        </li>
                     </ul>
                  </div>
                  <div>
                     {data.feedbackType.loop.map((user, index) => (
                        <div key={index} className='flex justify-between items-center pl-6 pt-[7px] pb-1 border-b border-b-light-grey-2'>
                           <UserName user_id={user.user_id} firstName={user.first_name} lastName={user.last_name} />
                           <div className='flex items-center gap-4'>
                              <div className='text-right font-inter'>
                                 <p className='text-[#222]'>{user?.thumbs_up_percentage}%</p>
                                 <p className='text-[#6D6B6B] text-sm'>{user?.thumbs_up_percentage}% / {user?.loop_percentage}% / {user?.ok_percentage}%</p>
                              </div>
                              <div>
                                 <FeedbackChart
                                    thumbsUp={user.thumbs_up_percentage}
                                    loop={user.loop_percentage}
                                    ok={user.ok_percentage}
                                 />
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </Card>
            </div>
         </section>
      </div>
   );
};

export default TabContent;


const SectionTitle = ({ title, tabName }: { title: string, tabName: string }) => {
   return (
      <div className='flex items-center gap-2 mb-3 border-b border-b-[#E8E8E8]'>
         <h2 className='text-[19px] text-[#0A0A0A] font-medium font-inter leading-[37px] pl-2.5'>{title}</h2>
         <div className='flex gap-2'>
            <span className='inline-block w-[3px] h-[3px] mt-1 rounded-full bg-[#D9D9D9]'></span>
            <span className='uppercase text-[12px] leading-tight mt-0.5 font-inter font-medium text-middle-grey'>
               {tabName === "given" ? "Dots Given" : "Dots Received"}
            </span>
         </div>
      </div>
   );
};


const Card = ({ cardTitle, children }: { cardTitle?: string, children: React.ReactNode }) => {
   return (
      <div className='w-full px-[30px] pt-5.5 pb-[30px] bg-white rounded-[10px]'
         style={{ boxShadow: "0 18px 31px 0 rgba(0, 0, 0, 0.12)" }}>
         {cardTitle && <h3 className='text-[#808080] text-lg leading-normal font-geist font-medium pb-3 border-b border-b-[#D7D6D6]'>{cardTitle}</h3>}
         {children}
      </div>
   );
};

const UserName = ({ user_id, firstName, lastName }: { user_id: number, firstName: string, lastName: string }) => {
   return (
      <Link
         href={`/about-others/${user_id}/summary`}
         className='flex items-center gap-4'
         aria-label={`View profile of ${firstName} ${lastName}`}
      >
         <InitialsAvatar firstName={firstName} lastName={lastName} className="max-sm:w-8 max-sm:h-8" />
         <p className="text-[14px] text-dark-black font-medium flex flex-col text-left">
            {firstName} {lastName}
         </p>
      </Link>
   );
}