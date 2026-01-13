"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface FirstNameValidationResult {
   isValid: boolean;
   errorMessage: string;
}

interface InputFirstNameProps {
   firstName: string;
   setFirstName: (firstName: string) => void;
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
   maxLength?: number;
   required?: boolean;
}

const InputFirstName: React.FC<InputFirstNameProps> = ({
   firstName,
   setFirstName,
   wrapperClass = '',
   labelClass = '',
   inputClass = '',
   placeholder = 'First Name',
   disabled = false,
   hideLabel = false,
   labelText = 'First Name',
   onValidationChange,
   validateOnBlur = true,
   showErrorOnMount = false,
   maxLength = 30,
   required = true
}) => {
   const [validation, setValidation] = useState<FirstNameValidationResult>({
      isValid: true,
      errorMessage: ''
   });
   const [hasBlurred, setHasBlurred] = useState(showErrorOnMount);

   // Validate first name
   const validateFirstName = useCallback((value: string, isBlurEvent = false) => {
      let error = '';
      
      if (required && !value) {
         error = 'First Name is required.';
      } else if (value && value.length > 0) {
         if (value.length < 2) {
            error = 'First Name must be at least 2 characters.';
         } else if (!/^[a-zA-Z]/.test(value)) {
            error = 'First Name must start with a letter.';
         } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
            error = 'First Name can only contain letters, spaces, hyphens, and apostrophes.';
         } else if (value.length > maxLength) {
            error = `First Name must be ${maxLength} characters or less.`;
         }
      }

      const result: FirstNameValidationResult = {
         isValid: error === '',
         errorMessage: error
      };

      // Only show errors after blur or if explicitly requested
      if (isBlurEvent || hasBlurred || showErrorOnMount) {
         setValidation(result);
      } else {
         // For real-time validation, only show validation state, not errors
         setValidation({ isValid: result.isValid, errorMessage: '' });
      }

      // Notify parent component of validation changes
      if (onValidationChange) {
         onValidationChange(result.isValid);
      }

      return result.isValid;
   }, [hasBlurred, onValidationChange, showErrorOnMount, maxLength, required]);

   // Handle first name input changes
   const handleFirstNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newFirstName = e.target.value;
      setFirstName(newFirstName);
      validateFirstName(newFirstName);
   }, [setFirstName, validateFirstName]);

   // Handle blur event for stricter validation
   const handleBlur = useCallback(() => {
      if (validateOnBlur) {
         setHasBlurred(true);
         validateFirstName(firstName, true);
      }
   }, [firstName, validateFirstName, validateOnBlur]);

   // Validate on mount if required
   useEffect(() => {
      if (showErrorOnMount && firstName) {
         validateFirstName(firstName, true);
      }
      
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [firstName, showErrorOnMount]);

   const hasError = !validation.isValid && validation.errorMessage !== '';
   const borderColor = hasError ? 'border-red-500' : 'border-light-grey-2';

   return (
      <div className={cn(`w-full relative ${wrapperClass}`)}>
         {!hideLabel && (
            <label
               className={cn(`text-[16px] desktop:text-[17px] max-sm:pl-0 max-sm:mb-1 font-medium text-dark-grey-4 mb-2.5 inline-block pl-5 ${labelClass}`)}
               htmlFor="first-name"
            >
               {labelText}
            </label>
         )}
         <div className='w-full relative'>
            <input
               className={cn(`w-full max-sm:pl-3.5 max-sm:text-[16px] max-sm:h-[46px] p-2 outline-none border max-sm:rounded-[10px] rounded-md text-dark-black text-[15px] desktop:text-[18px] font-medium ${borderColor} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${inputClass}`)}
               type="text"
               name="first_name"
               id="first-name"
               placeholder={placeholder}
               value={firstName}
               onChange={handleFirstNameChange}
               onBlur={handleBlur}
               autoComplete="given-name"
               disabled={disabled}
               required={required}
               maxLength={maxLength}
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

export default InputFirstName;