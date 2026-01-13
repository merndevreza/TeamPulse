import { ApiResponse } from "./types";
import { logger, ERROR_MESSAGES } from "@/utils/logger";

// Define known error codes that should trigger auth clearing
const AUTH_CLEARING_ERROR_CODES = new Set([
  'token_not_valid',
  'token_blacklisted', 
  'token_expired',
  'invalid_token',
  'authentication_failed'
]);

// Define error patterns that indicate auth should be cleared
const AUTH_CLEARING_PATTERNS = [
  /token.*blacklisted/i,
  /token.*invalid/i,
  /token.*expired/i,
  /authentication.*failed/i,
  /session.*expired/i
];

// Define error detail interface for better type safety
interface ErrorDetails {
  code?: string;
  detail?: string;
  message?: string;
  error?: string;
  error_type?: string;
  type?: string;
  [key: string]: unknown;
}

// Utility function to determine if error should clear auth
function shouldClearAuthFromError(errorDetails: ErrorDetails): boolean {
  // Check specific error codes first (most reliable)
  if (errorDetails?.code && AUTH_CLEARING_ERROR_CODES.has(errorDetails.code)) {
    return true;
  }
  
  // Check for known error types
  if (errorDetails?.error_type === 'authentication_error' || 
      errorDetails?.type === 'invalid_token') {
    return true;
  }
  
  // Fallback to pattern matching for detail messages (less reliable)
  const detailText = errorDetails?.detail || errorDetails?.message || '';
  if (typeof detailText === 'string') {
    return AUTH_CLEARING_PATTERNS.some(pattern => pattern.test(detailText));
  }
  
  return false;
}

// Handle API errors and return standardized responses
export const handleApiError = async <T>(response: Response, requireAuth: boolean = true): Promise<ApiResponse<T>> => {
  const errorText = await response.text();
  logger.apiError(`${response.url}`, response.status, errorText);

  // Parse error response with type safety
  let errorDetails: ErrorDetails;
  try {
    errorDetails = JSON.parse(errorText);
  } catch {
    errorDetails = { detail: errorText };
  }

  // Handle specific error cases
  if (response.status === 401) {
    // Use robust error classification approach
    const shouldClearAuth = requireAuth && shouldClearAuthFromError(errorDetails);
    
    return {
      success: false,
      message: requireAuth ? 
        (shouldClearAuth ? ERROR_MESSAGES.SESSION_EXPIRED : "Authentication failed. Please try again.") : 
        "Authentication failed.",
      status: 401,
      statusText: "Unauthorized",
      shouldClearAuth,
    };
  }

  if (response.status === 403) {
    return {
      success: false,
      message: ERROR_MESSAGES.ACCESS_DENIED,
      status: 403,
      statusText: "Forbidden",
    };
  }

  if (response.status === 400) {
    const message = errorDetails?.detail || errorDetails?.message || errorDetails?.error || ERROR_MESSAGES.INVALID_INPUT;
    const formattedMessage = Array.isArray(message) ? message.join(' ') : String(message);
    return {
      success: false,
      message: formattedMessage,
      status: 400,
      statusText: "Bad Request",
    };
  }

  if (response.status >= 500) {
    return {
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      status: response.status,
      statusText: response.statusText,
    };
  }

  // Default error handling with type safety
  const defaultMessage = errorDetails?.detail || errorDetails?.message || errorDetails?.error || ERROR_MESSAGES.OPERATION_FAILED;
  return {
    success: false,
    message: String(defaultMessage),
    status: response.status,
    statusText: response.statusText,
  };
};

// Handle network and other errors
export const handleNetworkError = <T>(error: unknown): ApiResponse<T> => {
  logger.error('API request failed', error);

  // Check if it's a network error
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      success: false,
      message: ERROR_MESSAGES.NETWORK_ERROR,
      status: 0,
      statusText: "Network Error",
    };
  }

  // Check for timeout errors
  if (error instanceof Error && error.name === 'AbortError') {
    return {
      success: false,
      message: ERROR_MESSAGES.TIMEOUT_ERROR,
      status: 0,
      statusText: "Timeout",
    };
  }

  return {
    success: false,
    message: ERROR_MESSAGES.UNEXPECTED_ERROR,
    status: 500,
    statusText: "Internal Server Error",
  };
};
