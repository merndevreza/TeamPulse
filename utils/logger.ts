/**
 * Centralized logging utility
 * Provides structured logging with different levels and production-safe logging
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

// Environment check
const isProduction = process.env.NODE_ENV === 'production';

// Helper functions for logging
const formatMessage = (level: LogLevel, message: string, context?: LogContext): string => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
};

const shouldLog = (level: LogLevel): boolean => {
  if (isProduction) {
    // In production, only log errors and warnings
    return level === 'error' || level === 'warn';
  }
  // In development, log everything
  return true;
};

// Core logging functions
const logError = (message: string, error?: Error | unknown, context?: LogContext): void => {
  if (!shouldLog('error')) return;

  const logMessage = formatMessage('error', message, context);
  console.error(logMessage);
  
  if (error) {
    console.error('Error details:', error);
  }
};

const logWarn = (message: string, context?: LogContext): void => {
  if (!shouldLog('warn')) return;
  
  const logMessage = formatMessage('warn', message, context);
  console.warn(logMessage);
};

const logInfo = (message: string, context?: LogContext): void => {
  if (!shouldLog('info')) return;
  
  const logMessage = formatMessage('info', message, context);
  console.info(logMessage);
};

const logDebug = (message: string, context?: LogContext): void => {
  if (!shouldLog('debug')) return;
  
  const logMessage = formatMessage('debug', message, context);
  console.debug(logMessage);
};

// Specialized logging functions
const logApiError = (endpoint: string, status: number, message: string, context?: LogContext): void => {
  logError(`API Error [${endpoint}]`, undefined, {
    endpoint,
    status,
    message,
    ...context
  });
};

const logAuthError = (action: string, message: string, context?: LogContext): void => {
  logError(`Auth Error [${action}]: ${message}`, undefined, context);
};

// Export logger object with functional interface
export const logger = {
  error: logError,
  warn: logWarn,
  info: logInfo,
  debug: logDebug,
  apiError: logApiError,
  authError: logAuthError,
} as const;

// Export standardized error messages
export const ERROR_MESSAGES = {
  // Authentication errors
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
  INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
  ACCESS_DENIED: "Access denied. You don't have permission to perform this action.",
  TOKEN_REFRESH_FAILED: "Session refresh failed. Please log in again.",

  // API errors
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  SERVER_ERROR: "Server error. Please try again later.",
  TIMEOUT_ERROR: "Request timeout. Please try again.",
  INVALID_INPUT: "Invalid input data. Please check your information and try again.",

  // General errors
  UNEXPECTED_ERROR: "An unexpected error occurred. Please try again.",
  OPERATION_FAILED: "Operation failed. Please try again.",
} as const;

export type ErrorMessage = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES];