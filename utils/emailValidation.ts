export interface EmailValidationResult {
  isValid: boolean;
  errorType: 'empty' | 'invalid_format' | 'invalid_domain' | null;
  errorMessage: string;
}
const isValidEmailFormat = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};

const isLexaeonDomain = (email: string): boolean => {
  return email.toLowerCase().endsWith('@lexaeon.com');
};
export const validateEmail = (email: string): EmailValidationResult => {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      errorType: 'empty',
      errorMessage: 'Email is required.'
    };
  }

  // Check email format
  if (!isValidEmailFormat(email)) {
    return {
      isValid: false,
      errorType: 'invalid_format',
      errorMessage: 'Please enter a valid email address.'
    };
  }

  // Check domain restriction
  if (!isLexaeonDomain(email)) {
    return {
      isValid: false,
      errorType: 'invalid_domain',
      errorMessage: 'Only @lexaeon.com email addresses are allowed.'
    };
  }

  return {
    isValid: true,
    errorType: null,
    errorMessage: ''
  };
};

export const validateEmailRealTime = (email: string): EmailValidationResult => {
  // Don't show errors while user is still typing (less than 3 characters)
  if (email.length < 3) {
    return {
      isValid: true,
      errorType: null,
      errorMessage: ''
    };
  }

  return validateEmail(email);
};