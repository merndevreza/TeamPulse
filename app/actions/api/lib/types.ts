// Common response interface for all API calls
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  status: number;
  statusText: string;
  shouldClearAuth?: boolean;
}

// Configuration options for API calls
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  requireAuth?: boolean; // Whether the request needs authentication (default: true)
  timeout?: number; // Request timeout in milliseconds (default: 10000)
  isServerSide?: boolean; // Whether this is a server-side call (default: auto-detect)
  cache?: RequestCache; // Caching strategy
  revalidate?: number; // Revalidation time in seconds for cached responses
  tags?: string[]; // Tags for cache invalidation
  parentSignal?: AbortSignal; // Parent AbortSignal for request cancellation
}
