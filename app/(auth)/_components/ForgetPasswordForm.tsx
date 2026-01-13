"use client";
import { handleForgotPassword } from '@/app/actions/auth/forgot-password';
import Button from '@/components/Button';
import InputEmail from '@/components/Form/InputEmail';
import React, { useCallback, useRef, useEffect } from 'react';

interface ForgetPasswordFormProps {
   setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

const ForgetPasswordForm: React.FC<ForgetPasswordFormProps> = ({ setIsLogin }) => {
   const [email, setEmail] = React.useState('');
   const [apiErrorMessage, setAPIErrorMessage] = React.useState<string>('');
   const [apiSuccessMessage, setAPISuccessMessage] = React.useState<string>('');
   const [isLoading, setIsLoading] = React.useState(false);
   const [isValidEmail, setIsValidEmail] = React.useState(false);

   // Refs to store timeout IDs for cleanup
   const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
   const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

   const setErrorWithTimeout = useCallback((message: string, timeout = 5000) => {
      if (errorTimeoutRef.current) {
         clearTimeout(errorTimeoutRef.current);
      }

      setAPIErrorMessage(message);
      errorTimeoutRef.current = setTimeout(() => {
         setAPIErrorMessage('');
         errorTimeoutRef.current = null;
      }, timeout);
   }, []);

   const setSuccessWithTimeout = useCallback((message: string, timeout = 5000) => {
      if (successTimeoutRef.current) {
         clearTimeout(successTimeoutRef.current);
      }

      setAPISuccessMessage(message);
      successTimeoutRef.current = setTimeout(() => {
         setAPISuccessMessage('');
         successTimeoutRef.current = null;
      }, timeout);
   }, []);

   // Cleanup timeouts on component unmount
   useEffect(() => {
      return () => {
         if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
         }
         if (successTimeoutRef.current) {
            clearTimeout(successTimeoutRef.current);
         }
      };
   }, []);

   const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isLoading) return;

      if (isValidEmail && email) {
         setIsLoading(true);
         setAPIErrorMessage('');
         setAPISuccessMessage('');

         try {
            const response = await handleForgotPassword({ email });

            if (response.success && response.status === 200) {
               setSuccessWithTimeout(response.message);
               setEmail('');
               setIsLoading(false);
               await delay(2000);
               setSuccessWithTimeout('Redirecting to login...');
               await delay(3000);
               setIsLogin(true);
            } else {
               setErrorWithTimeout(response?.message || 'An error occurred');
            }
         } catch (error) {
            console.error('Forgot password error:', error);
            setErrorWithTimeout('An unexpected error occurred');
         } finally {
            setIsLoading(false);
         }
      }
   };

   return (
      <div className='w-full'>
         <p className='text-center text-sm leading-normal font-medium w-full mx-auto max-sm:max-w-[230px] max-w-60 max-sm:mb-6 mb-9 text-dark-black'>Enter your email, and we will send you a password reset link.</p>
         <form onSubmit={handleSubmit} className='flex flex-col justify-center items-center max-sm:gap-6 gap-9 w-full px-5 sm:px-[60px]'>
            <InputEmail
               email={email}
               setEmail={setEmail}
               onValidationChange={(isValid) => {
                  setIsValidEmail(isValid);
               }}
               wrapperClass="w-full"
               inputClass='max-sm:py-[8px] py-[13px] pl-[24px]'
               placeholder='EMAIL'
               hideLabel={true}
            />
            {(apiErrorMessage || apiSuccessMessage) && (
               <div className={`p-3 rounded-md ${apiErrorMessage ? 'bg-red-50 border border-red-200 text-red-800' :
                  'bg-green-50 border border-green-200 text-green-800'
                  }`}>
                  {apiErrorMessage || apiSuccessMessage}
               </div>
            )}
            <Button
               text={isLoading ? "Sending..." : "Send"}
               variant="primary"
               type="submit"
               disabled={isLoading || !email || !isValidEmail}
               onClick={handleSubmit}
            />
         </form>
      </div>
   );
};

export default ForgetPasswordForm;