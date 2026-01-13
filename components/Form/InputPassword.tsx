"use client";
import React from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';

export interface PasswordValidationConfig {
   minLength?: number;
   requireUppercase?: boolean;
   requireLowercase?: boolean;
   requireNumbers?: boolean;
   requireSpecialChars?: boolean;
   customPattern?: RegExp;
}

export interface PasswordProps {
   password: string;
   setPassword: (value: string) => void;
   placeholder?: string;
   wrapperClass?: string;
   inputClass?: string;
   labelClass?: string;
   labelText?: string;
   hideLabel?: boolean;
   validation?: PasswordValidationConfig;
   showPasswordStrength?: boolean;
   onValidationChange?: (isValid: boolean) => void;
   disabled?: boolean;
   required?: boolean;
   id?: string;
   showMissingRequirements?: boolean;
   hasError?: boolean;
}
// Default validation config for strong passwords
const defaultValidation: Required<PasswordValidationConfig> = {
   minLength: 8,
   requireUppercase: true,
   requireLowercase: true,
   requireNumbers: true,
   requireSpecialChars: true,
   customPattern: /^.*$/
};

const InputPassword = ({
   password,
   setPassword,
   placeholder = "Password",
   wrapperClass = "",
   inputClass = "",
   hideLabel = false,
   labelText = "Password",
   labelClass = "",
   validation = {},
   showPasswordStrength = false,
   showMissingRequirements = false,
   onValidationChange,
   disabled = false,
   required = true,
   id = "password",
   hasError = false
}: PasswordProps) => {
   const [showPassword, setShowPassword] = React.useState(false);
   const [showRequiredError, setShowRequiredError] = React.useState(false); 

   const validationConfig = React.useMemo(() => ({ ...defaultValidation, ...validation }), [validation]);

   const validatePassword = React.useCallback((value: string): { isValid: boolean; errors: string[]; hints: string[] } => {
      const errors: string[] = [];
      const hints: string[] = [];

      if (required && !value) {
         errors.push('Password is required');
         return { isValid: false, errors, hints };
      }

      if (!value && !required) {
         return { isValid: true, errors, hints };
      }

      // Check minimum length
      if (value.length < validationConfig.minLength) {
         errors.push(`Password must be at least ${validationConfig.minLength} characters long`);
         hints.push(`✗ ${validationConfig.minLength}+ chars`);
      } else {
         hints.push(`✓ ${validationConfig.minLength}+ chars`);
      }

      // Check uppercase letters
      if (validationConfig.requireUppercase) {
         if (!/[A-Z]/.test(value)) {
            errors.push('Password must contain at least one uppercase');
            hints.push('✗ Uppercase (A-Z)');
         } else {
            hints.push('✓ Uppercase (A-Z)');
         }
      }

      // Check lowercase letters
      if (validationConfig.requireLowercase) {
         if (!/[a-z]/.test(value)) {
            errors.push('Password must contain at least one lowercase');
            hints.push('✗ Lowercase (a-z)');
         } else {
            hints.push('✓ Lowercase (a-z)');
         }
      }

      // Check numbers
      if (validationConfig.requireNumbers) {
         if (!/[0-9]/.test(value)) {
            errors.push('Password must contain at least one number');
            hints.push('✗ Number (0-9)');
         } else {
            hints.push('✓ Number (0-9)');
         }
      }

      // Check special characters
      if (validationConfig.requireSpecialChars) {
         if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            errors.push('Password must contain at least one special character');
            hints.push('✗ Special char (!@#$%^&*...)');
         } else {
            hints.push('✓ Special char (!@#$%^&*...)');
         }
      }

      // Check custom pattern
      if (validationConfig.customPattern && !validationConfig.customPattern.test(value)) {
         errors.push('Password does not meet the required format');
      }

      // Calculate password strength for validation
      const passedChecks = hints.filter(hint => hint.startsWith('✓')).length;
      const totalChecks = hints.length;
      const strengthPercentage = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;

      return {
         isValid: errors.length === 0 && strengthPercentage >= 75, // Valid if 75%+ requirements met (Good or Strong)
         errors,
         hints
      };
   }, [validationConfig, required]);

   const handlePasswordChange = (value: string) => {
      setPassword(value);
      const validation = validatePassword(value);
 
      // Reset required error when user starts typing
      if (showRequiredError && value) {
         setShowRequiredError(false);
      }

      if (onValidationChange) {
         onValidationChange(validation.isValid);
      }
   };

   const handlePasswordBlur = () => {
      if (required && !password.trim()) {
         setShowRequiredError(true);
      }
   }; 
   // Calculate password strength
   const getPasswordStrength = React.useMemo(() => {
      if (!password) return { level: 0, text: '', color: '' };

      const validation = validatePassword(password);
      const passedChecks = validation.hints.filter(hint => hint.startsWith('✓')).length;
      const totalChecks = validation.hints.length;

      if (totalChecks === 0) return { level: 0, text: '', color: '' };

      const strengthPercentage = (passedChecks / totalChecks) * 100;

      if (strengthPercentage < 25) {
         return { level: 1, text: 'Very Weak', color: 'bg-red-500' };
      } else if (strengthPercentage < 50) {
         return { level: 2, text: 'Weak', color: 'bg-red-400' };
      } else if (strengthPercentage < 75) {
         return { level: 3, text: 'Medium', color: 'bg-yellow-500' };
      } else if (strengthPercentage < 100) {
         return { level: 4, text: 'Good', color: 'bg-blue-500' };
      } else {
         return { level: 5, text: 'Strong', color: 'bg-green-500' };
      }
   }, [password, validatePassword]);

   // Get missing requirements text (reusable function)
   const getMissingRequirements = React.useMemo(() => {
      if (!password) return '';

      const validation = validatePassword(password);
      const missing = validation.hints
         .filter(hint => hint.startsWith('✗'))
         .map(hint => hint.replace('✗ ', ''));

      return missing.length > 0 ? `Missing: ${missing.join(', ')}` : '';
   }, [password, validatePassword]);
   
   return (
      <div className={cn(`w-full relative ${wrapperClass}`)}>
         {!hideLabel && (
            <label
               className={cn(`text-[14px] font-medium text-dark-grey-4 max-sm:text-sm max-sm:mb-[2px] mb-2 inline-block pl-4 max-sm:pl-0 ${labelClass}`)}
               htmlFor={id}
            >
               {labelText}
            </label>
         )}

         <div className='w-full relative'>
            <input
               className={cn(`w-full outline-none p-2 border max-sm:rounded-[10px] rounded-md text-dark-black text-[15px] desktop:text-[18px] font-medium ${
                  showRequiredError || hasError || (password && getPasswordStrength.level < 5) ? 'border-red-500' : 'border-light-grey-2'
                  } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${inputClass}`)}
               type={showPassword ? 'text' : 'password'}
               placeholder={placeholder}
               name="password"
               id={id}
               value={password}
               onChange={e => handlePasswordChange(e.target.value)}
               onBlur={handlePasswordBlur}
               autoComplete="current-password"
               disabled={disabled}
            />
            <button
               type="button"
               onClick={() => setShowPassword(!showPassword)}
               className="absolute right-2 top-1/2 -translate-y-1/2 text-xl text-gray-600 cursor-pointer disabled:cursor-not-allowed"
               disabled={disabled}
            >
               {showPassword ? (
                  <Image src="/eye-off.svg" width={26} height={21} alt="Hide password" style={{ width: "auto", height: "auto" }} />
               ) : (
                  <Image src="/eye.svg" width={26} height={21} alt="Show password" style={{ width: "auto", height: "auto" }}  />
               )}
            </button>
         </div> 
         <div className='mt-2 space-y-1'>
            {showRequiredError && (
               <div className="text-xs text-red-500">
                  Password is required
               </div>
            )}
            {showPasswordStrength && password && (
               <div className='flex items-center gap-1'>
                  {[1, 2, 3, 4, 5].map((dot) => (
                     <div
                        key={dot}
                        className={`w-3 h-3 rounded-sm transition-colors duration-200 ${dot <= getPasswordStrength.level
                           ? getPasswordStrength.color
                           : 'bg-gray-200'
                           }`}
                     />
                  ))}
                  <span className={`ml-2 text-sm font-medium transition-colors duration-200 ${getPasswordStrength.level <= 2 ? 'text-red-500' :
                     getPasswordStrength.level === 3 ? 'text-yellow-600' :
                        getPasswordStrength.level === 4 ? 'text-blue-600' :
                           'text-green-600'
                     }`}>
                     {getPasswordStrength.text}
                  </span>
               </div>
            )}
            {showMissingRequirements && getPasswordStrength.level < 5 && password && !showRequiredError && (
               <div className={`text-xs transition-colors duration-200 ${getPasswordStrength.level <= 2 ? 'text-red-500' :
                  getPasswordStrength.level === 3 ? 'text-yellow-600' :
                     getPasswordStrength.level === 4 ? 'text-blue-600' :
                        'text-green-600'
                  }`}>
                  {getMissingRequirements}
               </div>
            )} 
         </div>
      </div>
   );
};

export default InputPassword;