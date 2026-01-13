"use client";
import InputPassword from '@/components/Form/InputPassword';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState, useRef, useEffect } from 'react';
import Button from '@/components/Button';
import { resetPassword } from '@/app/actions/auth/reset-password';
import { sanitizeAndValidateEmailParam } from '@/utils/sanitization';
import PasswordChecker from '@/components/Form/PasswordChecker';

export interface ResetPasswordFormProps {
   email?: string;
   token?: string;
}
const ResetPasswordForm = ({ email = '', token = '' }: ResetPasswordFormProps) => {
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(false);
   const [newPassword, setNewPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [errorMessage, setErrorMessage] = useState('');
   const [success, setSuccess] = useState<string | null>(null);
   const [isValid, setIsValid] = useState({ isValidNewPassword: false, isValidConfirmPassword: false });

   // Ref to store timeout ID for cleanup
   const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

   const setErrorWithTimeout = useCallback((message: string, timeout = 5000) => {
      if (errorTimeoutRef.current) {
         clearTimeout(errorTimeoutRef.current);
      }

      setErrorMessage(message);
      errorTimeoutRef.current = setTimeout(() => {
         setErrorMessage('');
         errorTimeoutRef.current = null;
      }, timeout);
   }, []);



   // Cleanup timeouts on component unmount
   useEffect(() => {
      return () => {
         if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
         }
      };
   }, []);

   const clearForm = useCallback(() => {
      setNewPassword('');
      setConfirmPassword('');
      setErrorMessage('');
      setSuccess(null);

      // Clear any active timeouts
      if (errorTimeoutRef.current) {
         clearTimeout(errorTimeoutRef.current);
         errorTimeoutRef.current = null;
      }
   }, []);

   // Helper function to create delays
   const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

   const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();


      // Validate and sanitize email parameter
      const { sanitizedEmail, isValid: isEmailValid, error: emailError } = sanitizeAndValidateEmailParam(email);

      if (!isEmailValid || !sanitizedEmail) {
         setErrorWithTimeout(emailError || 'Invalid email parameter in reset link. Please request a new password reset.');
         return;
      }

      if (!token) {
         setErrorWithTimeout('Invalid password reset token. Please request a new password reset link.');
         return;
      }

      if (newPassword !== confirmPassword) {
         setErrorWithTimeout('New passwords do not match.');
         return;
      }

      if (!isValid.isValidNewPassword || !isValid.isValidConfirmPassword) {
         setErrorWithTimeout('Please ensure all password fields are valid.');
         return;
      }

      if (isLoading) return;

      // Clear previous messages
      setErrorMessage("");
      setSuccess(null);
      setIsLoading(true);

      try {
         const formData = new FormData();
         formData.append('new_password', newPassword);
         formData.append('confirm_password', confirmPassword);

         const result = await resetPassword(formData, token, sanitizedEmail);
         if (!result.success) {
            console.error('Failed to reset password:', result.message);

            // Handle authentication errors
            if (result.shouldClearAuth) {
               setErrorWithTimeout('Your session has expired. Redirecting to login...', 2000);
               setTimeout(() => {
                  router.push('/');
               }, 2000);
               return;
            }

            setErrorWithTimeout(result.message || 'Failed to reset password. Please try again.');
            return;
         }

         clearForm();

         // Show success message for 2 seconds
         setSuccess('Password reset successfully!');
         await delay(2000);

         // Show redirect message for 3 seconds
         setSuccess('Redirecting to login...');
         await delay(3000);

         // Navigate to login
         router.push('/');
      } catch (error) {
         console.error('Unexpected error in handleSave:', error);
         setErrorWithTimeout('An unexpected error occurred. Please try again.');
      } finally {
         setIsLoading(false);
      }
   };

   const handleCancel = () => {
      clearForm();
   };
   const makeDisabled = isLoading || !isValid.isValidNewPassword || !isValid.isValidConfirmPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword;

   return (
      <form onSubmit={handleSave} role="form" className="px-5 rounded-[10px] w-full max-w-[560px] mx-auto">
         <div className='flex flex-col w-full gap-2.5'>
            <div data-testid="new-password-wrapper">
               <InputPassword
                  password={newPassword}
                  setPassword={setNewPassword}
                  placeholder=""
                  labelText='New password'
                  showPasswordStrength={true}
                  id="new-password"
                  onValidationChange={(isValid) => {
                     setIsValid(prev => ({ ...prev, isValidNewPassword: isValid }));
                  }}
                  inputClass='max-sm:py-[10px]'
               />
            </div>
            <div data-testid="confirm-password-wrapper">
               <InputPassword
                  password={confirmPassword}
                  setPassword={setConfirmPassword}
                  placeholder=""
                  labelText='Repeat new password'
                  id="confirm-password"
                  disabled={!isValid.isValidNewPassword}
                  onValidationChange={(isValid) => {
                     setIsValid(prev => ({ ...prev, isValidConfirmPassword: isValid }));
                  }}
               />
            </div>
            <div className='mt-0.5'>
               <PasswordChecker password={newPassword} />
            </div>
         </div>
         <div className='flex max-sm:gap-3 gap-5 justify-center max-sm:mt-[30px] mt-6 mb-2.5'>
            <Button variant='secondary' type='reset' text='Cancel' onClick={handleCancel} />
            <Button
               variant='primary'
               type='submit'
               text='Save'
               disabled={makeDisabled}
            />
         </div>
         {(errorMessage || success) && (
            <div
               data-testid={errorMessage ? "error-message" : "success-message"}
               className={`mt-4 p-3 rounded-md ${errorMessage ? 'bg-red-50 border border-red-200 text-red-800' :
                  'bg-green-50 border border-green-200 text-green-800'
                  }`}
            >
               {errorMessage || success}
            </div>
         )}
      </form>
   );
};

export default ResetPasswordForm;