import React from 'react';  
import AddMemberForm from './_components/AddMemberForm';

const page = () => {
  return (
    <main className='w-full max-w-[1482px] pl-6 desktop:pl-[70px] pr-6 desktop:pr-12 mt-2 max-sm:mt-5'>
      <h2 className='text-3xl desktop:text-4xl font-medium font-geist'>New member</h2>
      <AddMemberForm />
    </main>
  );
};

export default page;