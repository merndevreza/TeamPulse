"use client";
import React from 'react';
import Button from '@/components/Button';
import InputEmail from '@/components/Form/InputEmail';
import InputFirstName from '@/components/Form/InputFirstName';
import InputLastName from '@/components/Form/InputLastName';
import { Switch } from '@/components/SwitchBtn';
import { useRouter } from 'next/navigation';
import { updateUserByAdmin } from '@/app/actions/auth/update-user-by-admin';
import Link from 'next/link';

const EditMemberForm = (
   {
      userEmail, userFirstName, userLastName, userRole, userId
   }: {
      userEmail: string;
      userFirstName: string;
      userLastName: string;
      userRole: string;
      userId: string;
   }
) => {
   const hasRequiredParams = userEmail && userFirstName && userRole && userId;

   const [email, setEmail] = React.useState(userEmail);
   const [firstName, setFirstName] = React.useState(userFirstName);
   const [lastName, setLastName] = React.useState(userLastName);
   const [isChecked, setIsChecked] = React.useState(userRole === 'admin');
   const [isValid, setIsValid] = React.useState({ isValidEmail: false, isValidFirstName: false, isValidLastName: true });
   const [isSubmitting, setIsSubmitting] = React.useState(false);
   const [message, setMessage] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);
   const router = useRouter();



   // Memoized callback for email validation
   const handleEmailValidationChange = React.useCallback((isValid: boolean) => {
      setIsValid(prev => ({ ...prev, isValidEmail: isValid }));
   }, []);



   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isValid.isValidEmail && isValid.isValidFirstName) {
         setIsSubmitting(true);
         setMessage(null);

         try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('first_name', firstName);
            formData.append('last_name', lastName);
            formData.append('role', isChecked ? 'admin' : 'team_member');

            const result = await updateUserByAdmin(formData, userId);

            if (result.success) {
               setMessage({ text: result.message, type: 'success' });
               setTimeout(() => {
                  setMessage(null);
                  router.push('/manage-members');
               }, 2000);
            } else {
               setMessage({ text: result.message, type: 'error' });

               // Clear error message after 2 seconds
               setTimeout(() => {
                  setMessage(null);
               }, 2000);
            }
         } catch (error) {
            console.error('Update user error:', error);
            setMessage({ text: 'An unexpected error occurred. Please try again.', type: 'error' });

            // Clear error message after 2 seconds
            setTimeout(() => {
               setMessage(null);
            }, 2000);
         } finally {
            setIsSubmitting(false);
         }
      }
   };

   const makeDisabled = isSubmitting || !isValid.isValidEmail || !isValid.isValidFirstName || !isValid.isValidLastName || !email || !firstName;

   // Show error if required search params are missing
   if (!hasRequiredParams) {
      return (
         <section className='w-full my-8'>
            <div className='bg-red-50 border border-red-200 text-red-800 p-4 rounded-md text-center'>
               <p className='font-medium'>Missing Required Information</p>
               <p className='text-sm mt-1'>
                  Please ensure the URL contains all required parameters.
               </p>
            </div>
         </section>
      );
   }

   return (
      <section className='w-full my-9 max-sm:my-6 max-sm:pb-12'>
         <form onSubmit={handleSubmit} className='flex flex-col justify-center items-center gap-9 w-full max-w-[1482px] bg-off-white p-[30px] rounded-[10px] shadow-custom
            max-sm:px-4 max-sm:py-5
         '>
            <div className='w-full max-w-[955px] mx-auto space-y-5 sm:space-y-[30px] max-sm:space-y-5'>
               <div className='w-full flex flex-col md:flex-row items-start gap-5 desktop:gap-10 max-sm:gap-2'>
                  <InputFirstName
                     firstName={firstName}
                     setFirstName={setFirstName}
                     onValidationChange={(isValid) => {
                        setIsValid(prev => ({ ...prev, isValidFirstName: isValid }));
                     }}
                     wrapperClass='w-full'
                     labelClass='max-sm:text-[#6C7278] text-[16px] max-sm:text-[14px] text-dark-grey-4 mb-[10px]'
                     placeholder=''
                     showErrorOnMount={Boolean(hasRequiredParams && userFirstName)}
                  />
                  <InputLastName
                     lastName={lastName}
                     setLastName={setLastName}
                     onValidationChange={(isValid) => {
                        setIsValid(prev => ({ ...prev, isValidLastName: isValid }));
                     }}
                     wrapperClass='w-full'
                     labelClass='text-dark-grey-4 mb-[10px]'
                     placeholder=''
                  />
               </div>
               <div className='flex flex-col md:flex-row  w-full gap-3 md:gap-10 max-sm:gap-2'>
                  <InputEmail
                     email={email}
                     setEmail={setEmail}
                     onValidationChange={handleEmailValidationChange}
                     wrapperClass='w-full'
                     labelClass='text-dark-grey-4 mb-[10px] max-sm:pl-0 max-sm:text-[14px]'
                     placeholder=''
                     showErrorOnMount={Boolean(hasRequiredParams && userEmail)}
                  />
               </div>
               <div className='flex justify-center gap-3 items-center w-full py-1'>
                  <label className='text-dark-grey-4 font-medium text-lg desktop:text-xl font-geist max-sm:text-[16px]'>Do you want to give this person Admin Access/Role?</label>
                  <Switch isChecked={isChecked} setIsChecked={setIsChecked} />
               </div>
               <div className='flex justify-center gap-5 desktop:gap-8'>
                  <Link href="/manage-members/" >
                     <Button
                        text="Cancel"
                        variant="secondary"
                        className='max-sm:h-9 max-sm:text-[16px]'
                     />
                  </Link>
                  <Button
                     text={isSubmitting ? "Updating..." : "Update"}
                     variant="primary"
                     type="submit"
                     disabled={makeDisabled}
                     onClick={handleSubmit}
                     className='max-sm:h-9 max-sm:text-[16px]'
                  />
               </div>
            </div>
            {message && (
               <div className={`mt-4 p-3 rounded-md w-full max-w-md text-center ${message.type === 'error'
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-green-50 border border-green-200 text-green-800'
                  }`}>
                  {message.text}
               </div>
            )}
         </form>
      </section>
   );
};

export default EditMemberForm;
