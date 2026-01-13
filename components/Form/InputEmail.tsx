"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { validateEmailRealTime, validateEmail, EmailValidationResult } from '@/utils/emailValidation';

interface InputEmailProps {
   email: string;
   setEmail: (email: string) => void;
   wrapperClass?: string;
   labelClass?: string;
   inputClass?: string;
   placeholder?: string;
   disabled?: boolean;
   hideLabel?: boolean;
   labelText?: string;
   onValidationChange?: (isValid: boolean) => void;
   validateOnBlur?: boolean;
   showErrorOnMount?: boolean;
}

const InputEmail: React.FC<InputEmailProps> = ({
   email,
   setEmail,
   wrapperClass = '',
   labelClass = '',
   inputClass = '',
   placeholder = 'Email',
   disabled = false,
   hideLabel = false,
   labelText = 'Email Address',
   onValidationChange,
   validateOnBlur = true,
   showErrorOnMount = false
}) => {
   const [validation, setValidation] = useState<EmailValidationResult>({
      isValid: true,
      errorType: null,
      errorMessage: ''
   });
   const [hasBlurred, setHasBlurred] = useState(showErrorOnMount);

   // Validate email and update validation state
   const performValidation = useCallback((emailValue: string, isBlurEvent = false) => {
      const result = isBlurEvent || hasBlurred
         ? validateEmail(emailValue)
         : validateEmailRealTime(emailValue);

      setValidation(result);

      // Notify parent component of validation changes
      if (onValidationChange) {
         onValidationChange(result.isValid);
      }
   }, [hasBlurred, onValidationChange]);

   // Handle email input changes
   const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newEmail = e.target.value;
      setEmail(newEmail);
      performValidation(newEmail);
   }, [setEmail, performValidation]);

   // Handle blur event for stricter validation
   const handleBlur = useCallback(() => {
      if (validateOnBlur) {
         setHasBlurred(true);
         performValidation(email, true);
      }
   }, [email, performValidation, validateOnBlur]);

   // Validate on mount if required
   useEffect(() => {
      if (showErrorOnMount && email) {
         performValidation(email, true);
      }
   }, [email, performValidation, showErrorOnMount]);

   const hasError = !validation.isValid && validation.errorMessage !== '';
   const borderColor = hasError ? 'border-red-500' : 'border-light-grey-2';

   return (
      <div className={cn(`w-full relative ${wrapperClass}`)}>
         {!hideLabel && (
            <label
               className={cn(`text-[16px] desktop:text-[17px] font-medium text-dark-grey-4 mb-[15px] inline-block pl-5 ${labelClass}`)}
               htmlFor="email"
            >
               {labelText}
            </label>
         )}
         <div className='w-full relative'>
            <input
               className={cn(`w-full outline-none p-2 border max-sm:rounded-[10px] rounded-md text-dark-black text-[15px] desktop:text-[18px] font-medium ${borderColor} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${inputClass}`)}
               placeholder={placeholder}
               type="email"
               name="email"
               id='email'
               value={email}
               onChange={handleEmailChange}
               onBlur={handleBlur}
               autoComplete="email"
               disabled={disabled}
               required
            />
         </div>
         <div className='mt-2 max-sm:mt-0'>
            {hasError && (
               <div className='text-xs text-red-500'>
                  <span>{validation.errorMessage}</span>
               </div>
            )}
         </div>
      </div>
   );
};

export default InputEmail;