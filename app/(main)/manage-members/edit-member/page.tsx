import React from "react"; 
import EditMemberForm from "./_components/EditMemberForm";

export interface EditMemberPageProps {
  searchParams: Promise<{
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    id: string;
  }>;
}

const page = async ({ searchParams }: EditMemberPageProps) => {
  const { email, first_name, last_name, role, id } = await searchParams;
  return (
    <main className='w-full max-w-[1482px] pl-6 desktop:pl-[70px] pr-6 desktop:pr-12 mt-2 max-sm:mt-5'>
      <h2 className='text-3xl desktop:text-4xl font-medium font-geist max-sm:text-[28px]'>Edit user</h2>
      <EditMemberForm
        userEmail={email}
        userFirstName={first_name}
        userLastName={last_name}
        userRole={role}
        userId={id}
      />
    </main>
  );
};

export default page;
