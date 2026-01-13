import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginForgetWrapper from './_components/LoginForgetWrapper';
import { validateAndCacheToken } from '@/utils/token-cache';

export default async function AuthPage() {
   const cookieStore = await cookies(); 
   const refreshToken = cookieStore.get('refreshToken')?.value;

   // Case 1: If user is authenticated 
   let refreshValidation = null;
   if (refreshToken) {
      refreshValidation = await validateAndCacheToken(refreshToken);
   }
   if (refreshToken && refreshValidation?.isValid) {
      if (refreshValidation.role === 'admin') {
         redirect('/dashboard');
      } else {
         redirect('/about-me/summary');
      }
   }
   // Case 2: If user is not authenticated, show login page
   return (
      <main className='bg-light-black flex justify-center items-center h-screen w-full p-5'>
         <LoginForgetWrapper />
      </main>
   );
};
