"use client";
import Button from '@/components/Button';
import InputEmail from '@/components/Form/InputEmail';
import InputFirstName from '@/components/Form/InputFirstName';
import InputLastName from '@/components/Form/InputLastName';
import InputPassword from '@/components/Form/InputPassword';
import { Switch } from '@/components/SwitchBtn';
import { registerUserByAdmin } from '@/app/actions/auth/register-user-by-admin';
import React from 'react';
import Link from 'next/link';

const AddMemberForm = () => {
   const [email, setEmail] = React.useState('');
   const [firstName, setFirstName] = React.useState('');
   const [lastName, setLastName] = React.useState('');
   const [password, setPassword] = React.useState('');
   const [confirmPassword, setConfirmPassword] = React.useState('');
   const [isChecked, setIsChecked] = React.useState(false);
   const [errors, setErrors] = React.useState<{ confirmPassword?: string; }>({});
   const [isValid, setIsValid] = React.useState({ isValidEmail: false, isValidFirstName: false, isValidLastName: true, isValidPassword: false, isValidConfirmPassword: false });
   const [isSubmitting, setIsSubmitting] = React.useState(false);
   const [message, setMessage] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);



   const validatePasswordMatch = (passwordValue: string, confirmPasswordValue: string) => {
      if (confirmPasswordValue && passwordValue !== confirmPasswordValue) {
         setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
         return false;
      } else {
         setErrors(prev => ({ ...prev, confirmPassword: undefined }));
         return true;
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isValid.isValidEmail && isValid.isValidFirstName && isValid.isValidLastName && isValid.isValidPassword && isValid.isValidConfirmPassword) {
         if (password !== confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
            return;
         }

         setIsSubmitting(true);
         setMessage(null);

         try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('first_name', firstName);
            formData.append('last_name', lastName);
            formData.append('password', password);
            formData.append('confirm_password', confirmPassword);
            formData.append('role', isChecked ? 'admin' : 'team_member');

            const result = await registerUserByAdmin(formData); 

            if (result.success) {
               setMessage({ text: result.message, type: 'success' });
               // Reset form
               setEmail('');
               setFirstName('');
               setLastName('');
               setPassword('');
               setConfirmPassword('');
               setIsChecked(false);
               setIsValid({ isValidEmail: false, isValidFirstName: false, isValidLastName: true, isValidPassword: false, isValidConfirmPassword: false });
               setErrors({});

               // Clear success message after 2 seconds
               setTimeout(() => {
                  setMessage(null);
               }, 2000);
            } else {
               setMessage({ text: result.message, type: 'error' });

               // Clear error message after 2 seconds
               setTimeout(() => {
                  setMessage(null);
               }, 2000);
            }
         } catch (error) {
            console.error('Registration error:', error);
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

   const makeDisabled = isSubmitting || !isValid.isValidEmail || !isValid.isValidFirstName || !isValid.isValidLastName || !isValid.isValidPassword || !isValid.isValidConfirmPassword || !email || !firstName || !password || !confirmPassword || (password !== confirmPassword);

   return (
      <section className='w-full my-9 max-sm:my-6 max-sm:pb-12'>
         <form onSubmit={handleSubmit} className='flex flex-col justify-center items-center gap-9 w-full max-w-[1482px] bg-off-white p-[30px] rounded-[10px] shadow-custom
         max-sm:px-4 max-sm:py-5
         '>
            <div  className='w-full max-w-[955px] mx-auto space-y-5 sm:space-y-[30px] max-sm:space-y-5'>
               <div  className='w-full flex flex-col md:flex-row items-start gap-5 desktop:gap-10 max-sm:gap-2'>
                  <InputFirstName
                     firstName={firstName}
                     setFirstName={setFirstName}
                     onValidationChange={(isValid) => {
                        setIsValid(prev => ({ ...prev, isValidFirstName: isValid }));
                     }}
                     wrapperClass='w-full'
                     labelClass='text-dark-grey-4 mb-[10px] max-sm:text-[#6C7278] text-[16px] max-sm:text-[14px] max-sm:mb-0 max-sm:leading-[150%]'
                     placeholder=''
                  />
                  <InputLastName
                     lastName={lastName}
                     setLastName={setLastName}
                     onValidationChange={(isValid) => {
                        setIsValid(prev => ({ ...prev, isValidLastName: isValid }));
                     }}
                     wrapperClass='w-full'
                     labelClass='text-dark-grey-4 mb-[10px] max-sm:mb-0 max-sm:leading-[150%]'
                     placeholder=''
                  />
               </div> 
               <div className='flex flex-col md:flex-row  w-full gap-3 md:gap-10 max-sm:gap-2'>
                  <InputEmail
                     email={email}
                     setEmail={setEmail}
                     onValidationChange={(isValid) => {
                        setIsValid(prev => ({ ...prev, isValidEmail: isValid }));
                     }}
                     wrapperClass='w-full'
                     labelClass='text-dark-grey-4 mb-[10px] max-sm:pl-0 max-sm:text-[14px] max-sm:mb-0 max-sm:leading-[150%]'
                     placeholder=''
                  />
                  <InputPassword
                     password={password}
                     setPassword={(value) => {
                        setPassword(value);
                        validatePasswordMatch(value, confirmPassword);
                     }}
                     showPasswordStrength={true}
                     id="password"
                     onValidationChange={(isValid) => {
                        setIsValid(prev => ({ ...prev, isValidPassword: isValid }));
                     }}
                     placeholder=''
                     labelClass='text-dark-grey-4 mb-[10px] max-sm:mb-0 max-sm:leading-[150%]'
                  />
               </div>
               <div className='w-full relative'>
                  <InputPassword
                     password={confirmPassword}
                     setPassword={(value) => {
                        setConfirmPassword(value);
                        validatePasswordMatch(password, value);
                     }}
                     showPasswordStrength={false}
                     onValidationChange={(isValid) => {
                        setIsValid(prev => ({ ...prev, isValidConfirmPassword: isValid }));
                     }}
                     labelText='Confirm Password'
                     id="confirm-password"
                     placeholder=''
                     labelClass='text-dark-grey-4 mb-[10px] max-sm:mb-0 max-sm:leading-[150%]'
                  />
                  <div className='mt-2'>
                     {errors.confirmPassword && (
                        <div className='text-xs text-red-500'>
                           <span>{errors.confirmPassword}</span>
                        </div>
                     )}
                  </div>
               </div>
               <div className='flex justify-center gap-3 items-center w-full py-1'>
                  <label htmlFor='admin-switch' className='text-dark-grey-4 font-medium text-lg desktop:text-xl font-geist max-sm:text-[16px]'>Do you want to give this person Admin Access/Role?</label>
                  <Switch isChecked={isChecked} setIsChecked={setIsChecked} id="admin-switch"/>
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
                     text={isSubmitting ? "Adding..." : "Add"}
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

export default AddMemberForm;

