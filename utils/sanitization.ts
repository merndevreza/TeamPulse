/**
 * Sanitizes input text by escaping HTML characters to prevent XSS attacks
 * @param input - The input string to sanitize
 * @returns The sanitized string with HTML characters escaped
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Escape HTML characters that could be used for XSS
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validates and sanitizes an email address from URL parameters
 * @param email - The email string from URL parameters
 * @returns Object containing the sanitized email and validation result
 */
export const sanitizeAndValidateEmailParam = (email: string | null): {
  sanitizedEmail: string;
  isValid: boolean;
  error?: string;
} => {
  if (!email) {
    return {
      sanitizedEmail: '',
      isValid: false,
      error: 'Email parameter is missing'
    };
  }

  // First sanitize the input to prevent XSS
  const sanitizedEmail = sanitizeInput(email);

  // Basic email format validation (simple regex for URL parameter validation)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(sanitizedEmail)) {
    return {
      sanitizedEmail,
      isValid: false,
      error: 'Invalid email format'
    };
  }

  return {
    sanitizedEmail,
    isValid: true
  };
};