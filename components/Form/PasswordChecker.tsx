import React from 'react';

interface PasswordCheckerProps {
   password: string;
}

interface ValidationRule {
   id: string;
   label: string;
   isValid: boolean; 
}

const PasswordChecker = ({ password }: PasswordCheckerProps) => {
   // Password validation checks
   const validationRules: ValidationRule[] = [
      {
         id: 'length',
         label: 'Minimum 8 characters',
         isValid: password.length >= 8, 
      },
      {
         id: 'uppercase',
         label: 'At least 1 uppercase letter',
         isValid: /[A-Z]/.test(password), 
      },
      {
         id: 'lowercase',
         label: 'At least 1 lowercase letter',
         isValid: /[a-z]/.test(password), 
      },
      {
         id: 'digit',
         label: 'At least 1 digit',
         isValid: /\d/.test(password), 
      },
      {
         id: 'special',
         label: 'At least 1 special character',
         isValid: /[!@#$%^&*(),.?":{}|<>]/.test(password), 
      }
   ];

   return (
      <div>
         <ul>
            {validationRules.map((rule) => (
               <li 
                  key={rule.id}
                  className={`flex items-center gap-[7px] text-[15px]`}
               >
                  <span className='inline-flex justify-center items-center w-[20px]'>
                     {rule.isValid ? <CheckMarkSVG /> : <CrossMarkSVG />}
                  </span>
                  <span className={rule.isValid ? 'font-medium' : 'font-normal'}>
                     {rule.label}
                  </span>
               </li>
            ))}
         </ul> 
      </div>
   );
};

export default PasswordChecker;

const CheckMarkSVG = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="19" height="20" viewBox="0 0 19 20" fill="none">
      <path d="M16.9341 6.15045L7.93408 15.6504C7.85569 15.7335 7.76255 15.7994 7.65999 15.8443C7.55743 15.8893 7.44747 15.9124 7.33642 15.9124C7.22537 15.9124 7.11542 15.8893 7.01286 15.8443C6.9103 15.7994 6.81715 15.7335 6.73877 15.6504L2.80127 11.4942C2.72278 11.4114 2.66052 11.313 2.61805 11.2048C2.57557 11.0965 2.55371 10.9805 2.55371 10.8633C2.55371 10.7462 2.57557 10.6302 2.61805 10.5219C2.66052 10.4137 2.72278 10.3153 2.80127 10.2325C2.87975 10.1496 2.97293 10.0839 3.07548 10.0391C3.17802 9.99425 3.28793 9.97117 3.39892 9.97117C3.50992 9.97117 3.61983 9.99425 3.72237 10.0391C3.82492 10.0839 3.9181 10.1496 3.99658 10.2325L7.33713 13.7586L15.7402 4.89022C15.8987 4.7229 16.1137 4.62891 16.3378 4.62891C16.562 4.62891 16.777 4.7229 16.9355 4.89022C17.094 5.05753 17.183 5.28446 17.183 5.52108C17.183 5.75769 17.094 5.98462 16.9355 6.15194L16.9341 6.15045Z" fill="#71CF3A" />
   </svg>
);

const CrossMarkSVG = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M12.2196 0.80749C12.5125 1.10038 12.5125 1.57526 12.2196 1.86815L7.64412 6.44363L12.2196 11.0191C12.5125 11.312 12.5125 11.7869 12.2196 12.0798C11.9267 12.3724 11.4517 12.3726 11.1589 12.0798L6.58346 7.50429L2.01144 12.0763C1.71851 12.3689 1.24355 12.3691 0.950776 12.0763C0.658052 11.7835 0.658243 11.3086 0.950776 11.0157L5.5228 6.44363L0.950776 1.8716C0.658085 1.5788 0.65821 1.10382 0.950776 0.810943C1.24363 0.518085 1.71853 0.518154 2.01144 0.810943L6.58346 5.38297L11.1589 0.80749C11.4518 0.514615 11.9267 0.514651 12.2196 0.80749Z" fill="#6B6B6B" />
   </svg>
);
