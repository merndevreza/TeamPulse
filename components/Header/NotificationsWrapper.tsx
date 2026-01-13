'use client';
import React, { useEffect, useRef } from 'react';
import { NotificationItem, NotificationsResponse } from './type';
import { getNotifications, markedNotificationsRead } from '@/app/actions/auth/notifications';
import { useAuth } from '@/hooks/useAuth';
import NotificationsList from './NotificationsList';
import { revalidateAllDots, revalidateUserDotsSummary, revalidateUserGivenDots, revalidateUserReceivedDots } from '@/app/actions/revalidate';
import useIsDesktop from '@/hooks/useIsDesktop';

const NotificationsWrapper = (
   { isMobile = false }: { isMobile?: boolean }
) => {
   const { isAuthenticated } = useAuth();
   const [notificationCount, setNotificationCount] = React.useState(0);
   const [showNotifications, setShowNotifications] = React.useState(false);
   const [notificationData, setNotificationData] = React.useState<NotificationItem[]>([]);
   const [isLoading, setIsLoading] = React.useState(false);
   const notificationRef = useRef<HTMLDivElement>(null);
   const buttonRef = useRef<HTMLButtonElement>(null);
   const isDesktop = useIsDesktop();
   const fetchNotifications = React.useCallback(async () => {
      // Prevent excessive API calls
      if (isLoading) return;

      setIsLoading(true);

      try {
         const response = await getNotifications();

         if (response.success && response.data) {
            const typedData = response.data as NotificationsResponse;
            const { unread_count, notifications } = typedData;
            setNotificationCount(unread_count || 0);
            setNotificationData(notifications || []);
            revalidateAllDots();
            revalidateUserGivenDots();
            revalidateUserReceivedDots();
            revalidateUserDotsSummary();
         } else {
            const errorMessage = response.message;
            console.error('[Header] Failed to fetch notifications:', errorMessage);
         }
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
         console.error('[Header] Failed to fetch notifications:', errorMessage);

      } finally {
         setIsLoading(false);
      }
   }, [isLoading]);

   useEffect(() => {
      if (isAuthenticated) {
         fetchNotifications();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isAuthenticated]);

   // Handle click outside to close notifications (supports both mouse and touch)
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent | TouchEvent) => {
         const target = event.target as Node;
         // Check if click was outside both the notification panel and the notification button
         if (notificationRef.current && !notificationRef.current.contains(target) &&
            buttonRef.current && !buttonRef.current.contains(target)) {
            setShowNotifications(false);
         }
      };

      if (showNotifications) {
         document.addEventListener('mousedown', handleClickOutside);
         document.addEventListener('touchstart', handleClickOutside);
      }

      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
         document.removeEventListener('touchstart', handleClickOutside);
      };
   }, [showNotifications]);

   const handleNotificationsClick = async () => {
      if (showNotifications) {
         setShowNotifications(false);
         return;
      }

      setShowNotifications(true);

      try {
         const response = await markedNotificationsRead();
         if (response.success) {
            setNotificationCount(0);
         } else {
            const errorMessage = response.message;
            console.error('[Header] Failed to mark notifications as read:', errorMessage);
         }
      } catch (error) {
         console.log("[Header] Error marking notifications as read:", error);
      }
   };
   return (
      <>
         <button
            ref={buttonRef}
            onClick={handleNotificationsClick}
            className={`cursor-pointer active:scale-90 transition-transform relative rounded-[10px] flex items-center justify-center border border-black/[0.06] ${isMobile ? "h-[33px] w-[33px] mt-2 translate-x-[5px]" : isDesktop ? "h-10 w-10" : "h-[31px] w-[31px]"} ${isMobile ? "" : showNotifications ? "bg-middle-orange" : "bg-light-grey hover:bg-off-white-2"}`}
         >
            <svg className='w-[19px] desktop:w-5' xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
               <path d="M10.707 0.353516C6.97911 0.353516 3.95703 3.37559 3.95703 7.10352V10.8958L1.06391 15.7176C0.924893 15.9493 0.921252 16.2379 1.05438 16.473C1.18751 16.7082 1.43683 16.8535 1.70703 16.8535H7.03205C7.3795 18.5652 8.89282 19.8535 10.707 19.8535C12.5213 19.8535 14.0346 18.5652 14.382 16.8535H20.207C20.4867 16.8535 20.7432 16.6979 20.8723 16.4498C21.0014 16.2017 20.9818 15.9024 20.8214 15.6733L17.457 10.8692V7.10352C17.457 3.37559 14.435 0.353516 10.707 0.353516Z"
                  fill={isMobile ? showNotifications ? 'var(--middle-orange)' : 'var(--light-grey-2)' : showNotifications ? 'var(--off-white)' : 'var(--dark-grey)'} />
            </svg>
            {notificationCount > 0 && (
               <span className='absolute -top-0.5 desktop:-top-1.5 -right-1.5 bg-[#D4644E] text-white text-[10px] w-3.5 h-3.5 desktop:w-4 desktop:h-4 flex items-center justify-center rounded-full'>
                  {notificationCount}
               </span>
            )}
         </button>
         {showNotifications && (
            <div className='absolute top-[55px] right-[60px] z-10' ref={notificationRef}>
               <div
                  className='bg-neutral-50 border border-light-grey-2 rounded-lg w-[80vw] sm:w-[510px]'
                  style={{ boxShadow: '0 0 11px 0 rgba(16, 24, 40, 0.15)' }}>
                  <div className='flex justify-between items-center py-4 pl-[57px] pr-4'>
                     <h2 className='text-highlight-grey font-medium text-[15px]'>Notifications</h2>
                     <button
                        onClick={() => fetchNotifications()}
                        disabled={isLoading}
                        className={`p-1 rounded-md transition-all ${isLoading ? 'opacity-50' : 'hover:bg-gray-100'}`}
                        title="Refresh notifications"
                     >
                        <svg className={`w-4 h-4 text-[#5F6D7E] ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                     </button>
                  </div>
                  <NotificationsList data={notificationData} />
               </div>
            </div>
         )}
      </>
   );
};

export default NotificationsWrapper;