"use client";
import React from 'react';
import { handleLogin } from '@/app/actions/auth/login';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';
import InputPassword from '@/components/Form/InputPassword';
import InputEmail from '@/components/Form/InputEmail';
import { useAuth } from '@/hooks/useAuth';

const LoginForm = () => {
   const [email, setEmail] = React.useState('');
   const [password, setPassword] = React.useState('');
   const [apiErrorMessage, setAPIErrorMessage] = React.useState<string>('');
   const [isLoading, setIsLoading] = React.useState(false);
   const router = useRouter();
   const [isValid, setIsValid] = React.useState({ isValidEmail: false, isValidPassword: false });
   const { setIsAuthenticated } = useAuth();
   
   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isLoading) return;

      if (isValid.isValidEmail && isValid.isValidPassword && email && password) {
         setIsLoading(true);
         try {
            const response = await handleLogin({ email, password });
            if (response.success && response.status === 200 && response.data) {
               setIsAuthenticated(true);
              if (response.data.role === "admin") {
                  router.replace('/dashboard');
               } else {
                  router.replace('/about-me/summary');
               }
            } else {
               setAPIErrorMessage(response?.message || 'An error occurred');
            }
         } catch (error) {
            console.error('Login error:', error);
            setAPIErrorMessage('An unexpected error occurred');
         } finally {
            setIsLoading(false);
         }
      }
   };

   return (
      <form onSubmit={handleSubmit} className='flex flex-col justify-center items-center max-sm:gap-1.5 gap-8 w-full px-5 sm:px-[60px]'>
         <InputEmail
            email={email}
            setEmail={setEmail}
            onValidationChange={(isValid) => {
               setIsValid(prev => ({ ...prev, isValidEmail: isValid }));
            }}
            wrapperClass="w-full"
            inputClass='max-sm:py-[9px] py-[14px] pl-[22px]'
            placeholder='EMAIL'
            hideLabel={true}
         />
         <InputPassword
            password={password}
            setPassword={setPassword}
            hideLabel={true}
            placeholder="PASSWORD"
            wrapperClass="w-full"
            inputClass='max-sm:py-[9px] py-[14px] pl-[22px]'
            onValidationChange={(isValid) => {
               setIsValid(prev => ({ ...prev, isValidPassword: isValid }));
            }}
         />
         {apiErrorMessage && <div className='text-red-500 text-sm'>{apiErrorMessage}</div>}
         <Button
         className='max-sm:mt-6'
            text={isLoading ? "Logging in..." : "Log in"}
            variant="primary"
            type="submit"
            disabled={isLoading || !email || !password || !isValid.isValidEmail || !isValid.isValidPassword}
         />
      </form>
   );
};

export default LoginForm;