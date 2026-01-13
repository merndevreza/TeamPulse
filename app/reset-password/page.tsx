import React from 'react';
import ResetPasswordForm from './_components/ResetPasswordForm';
import ResetPasswordTopPart from './_components/ResetPasswordTopPart';

export interface ResetPassPageProps {
   searchParams: Promise<{
      email?: string;
      token?: string;
   }>;
}

const page = async ({ searchParams }: ResetPassPageProps) => {
   const { email, token } = await searchParams;
   return (
      <main className='bg-light-black min-h-screen px-5 w-full flex justify-center py-10'>
         <div className='w-full max-sm:max-w-[343px] max-w-[577px] flex items-center min-h-screen'>
            <section className='bg-off-white max-sm:rounded-[10px] rounded-[20px] w-full max-sm:min-h-[568px] min-h-[652px] max-sm:pt-[55px] pt-14.5 pb-10 my-auto'>
               <ResetPasswordTopPart email={email} />
               <ResetPasswordForm email={email} token={token} />
            </section>
         </div>
      </main>
   );
};

export default page;