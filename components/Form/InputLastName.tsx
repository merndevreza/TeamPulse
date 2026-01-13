"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface LastNameValidationResult {
   isValid: boolean;
   errorMessage: string;
}

interface InputLastNameProps {
   lastName: string;
   setLastName: (lastName: string) => void;
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

const InputLastName: React.FC<InputLastNameProps> = ({
   lastName,
   setLastName,
   wrapperClass = '',
   labelClass = '',
   inputClass = '',
   placeholder = 'Last Name',
   disabled = false,
   hideLabel = false,
   labelText = 'Last Name',
   onValidationChange,
   validateOnBlur = true,
   showErrorOnMount = false,
   maxLength = 30,
   required = false // Last name is typically optional
}) => {
   const [validation, setValidation] = useState<LastNameValidationResult>({
      isValid: true,
      errorMessage: ''
   });
   const [hasBlurred, setHasBlurred] = useState(showErrorOnMount);

   // Validate last name
   const validateLastName = useCallback((value: string, isBlurEvent = false) => {
      let error = '';
      
      if (required && !value) {
         error = 'Last Name is required.';
      } else if (value && value.length > 0) {
         // Last name is optional, but if provided, it must be valid
         if (value.length < 2) {
            error = 'Last Name must be at least 2 characters.';
         } else if (!/^[a-zA-Z]/.test(value)) {
            error = 'Last Name must start with a letter.';
         } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
            error = 'Last Name can only contain letters, spaces, hyphens, and apostrophes.';
         } else if (value.length > maxLength) {
            error = `Last Name must be ${maxLength} characters or less.`;
         }
      }

      const result: LastNameValidationResult = {
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

   // Handle last name input changes
   const handleLastNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newLastName = e.target.value;
      setLastName(newLastName);
      validateLastName(newLastName);
   }, [setLastName, validateLastName]);

   // Handle blur event for stricter validation
   const handleBlur = useCallback(() => {
      if (validateOnBlur) {
         setHasBlurred(true);
         validateLastName(lastName, true);
      }
   }, [lastName, validateLastName, validateOnBlur]);

   // Validate on mount if required
   useEffect(() => {
      if (showErrorOnMount && lastName) {
         validateLastName(lastName, true);
      }
   }, [lastName, validateLastName, showErrorOnMount]);

   const hasError = !validation.isValid && validation.errorMessage !== '';
   const borderColor = hasError ? 'border-red-500' : 'border-light-grey-2';

   return (
      <div className={cn(`w-full relative ${wrapperClass}`)}>
         {!hideLabel && (
            <label
               className={cn(`text-[16px] max-sm:text-[14px] desktop:text-[17px] max-sm:pl-0 max-sm:mb-1 font-medium text-dark-grey-4 mb-2.5 inline-block pl-5 ${labelClass}`)}
               htmlFor="last-name"
            >
               {labelText}
            </label>
         )}
         <div className='w-full relative'>
            <input
               className={cn(`w-full p-2 max-sm:pl-3.5 max-sm:text-[16px] max-sm:h-[46px] outline-none border max-sm:rounded-[10px] rounded-md text-dark-black text-[15px] desktop:text-[18px] font-medium ${borderColor} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${inputClass}`)}
               type="text"
               name="last_name"
               id="last-name"
               placeholder={placeholder}
               value={lastName}
               onChange={handleLastNameChange}
               onBlur={handleBlur}
               autoComplete="family-name"
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

export default InputLastName;