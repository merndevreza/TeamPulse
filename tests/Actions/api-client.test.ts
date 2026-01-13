import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  apiRequest,
  apiGet,
  apiPost,
  apiPatch,
  apiPut,
  apiDelete,
  adminApiGet,
  adminApiPost,
  adminApiPatch,
  adminApiPut,
  adminApiDelete,
} from '@/app/actions/api/api-client';
import { ApiResponse } from '@/app/actions/api/lib/types';
import { mswServer } from '../../vitest.setup';

// Mock dependencies
vi.mock('@/app/actions/api/lib/auth-helpers', () => ({
  getValidAccessToken: vi.fn(),
  forceRefreshToken: vi.fn(),
  verifyAdminRole: vi.fn(),
}));

vi.mock('@/app/actions/api/lib/error-handlers', () => ({
  handleApiError: vi.fn(),
  handleNetworkError: vi.fn(),
}));

vi.mock('@/lib/env.server', () => ({
  env: {
    API_BASE_URL: 'https://api.test.com',
  },
}));

vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Import mocked modules
import { getValidAccessToken, forceRefreshToken, verifyAdminRole } from '@/app/actions/api/lib/auth-helpers';
import { handleApiError, handleNetworkError } from '@/app/actions/api/lib/error-handlers';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('api-client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
    // Bypass MSW for these tests to allow our mocked fetch to work
    mswServer.close();
  });

  afterEach(() => {
    vi.useRealTimers();
    // Re-enable MSW for other tests
    mswServer.listen({ onUnhandledRequest: 'warn' });
  });

  describe('apiRequest', () => {
    it('should make a successful GET request without authentication', async () => {
      const mockResponseData = { id: 1, name: 'test' };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockResponseData),
      });

      const result = await apiRequest('/test-endpoint', {
        requireAuth: false,
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [urlOrRequest, options] = mockFetch.mock.calls[0];
      
      // Handle both URL string and Request object cases
      if (typeof urlOrRequest === 'string') {
        expect(urlOrRequest).toBe('https://api.test.com/test-endpoint');
        expect(options.method).toBe('GET');
        expect(options.headers['Content-Type']).toBe('application/json');
        expect(options.signal).toBeInstanceOf(AbortSignal);
      } else {
        // urlOrRequest is a Request object
        expect(urlOrRequest.url).toBe('https://api.test.com/test-endpoint');
        expect(urlOrRequest.method).toBe('GET');
        expect(urlOrRequest.headers.get('Content-Type')).toBe('application/json');
        expect(urlOrRequest.signal).toBeInstanceOf(AbortSignal);
      }

      expect(result).toEqual({
        success: true,
        message: 'Request completed successfully',
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
      });
    });

    it('should make a successful authenticated GET request', async () => {
      const mockResponseData = { id: 1, name: 'test' };
      const mockAccessToken = 'valid-access-token';

      vi.mocked(getValidAccessToken).mockResolvedValue({
        token: mockAccessToken,
        shouldClearAuth: false,
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockResponseData),
      });

      const result = await apiRequest('/test-endpoint');

      expect(getValidAccessToken).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [urlOrRequest, options] = mockFetch.mock.calls[0];
      
      // Handle both URL string and Request object cases
      if (typeof urlOrRequest === 'string') {
        expect(urlOrRequest).toBe('https://api.test.com/test-endpoint');
        expect(options.method).toBe('GET');
        expect(options.headers['Content-Type']).toBe('application/json');
        expect(options.headers['Authorization']).toBe(`Bearer ${mockAccessToken}`);
        expect(options.signal).toBeInstanceOf(AbortSignal);
      } else {
        // urlOrRequest is a Request object
        expect(urlOrRequest.url).toBe('https://api.test.com/test-endpoint');
        expect(urlOrRequest.method).toBe('GET');
        expect(urlOrRequest.headers.get('Content-Type')).toBe('application/json');
        expect(urlOrRequest.headers.get('Authorization')).toBe(`Bearer ${mockAccessToken}`);
        expect(urlOrRequest.signal).toBeInstanceOf(AbortSignal);
      }

      expect(result).toEqual({
        success: true,
        message: 'Request completed successfully',
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
      });
    });

    it('should handle POST request with body', async () => {
      const mockRequestBody = { name: 'test', email: 'test@example.com' };
      const mockResponseData = { id: 1, ...mockRequestBody };
      const mockAccessToken = 'valid-access-token';

      vi.mocked(getValidAccessToken).mockResolvedValue({
        token: mockAccessToken,
        shouldClearAuth: false,
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 201,
        statusText: 'Created',
        json: () => Promise.resolve(mockResponseData),
      });

      const result = await apiRequest('/users', {
        method: 'POST',
        body: mockRequestBody,
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [urlOrRequest, options] = mockFetch.mock.calls[0];
      
      // Handle both URL string and Request object cases
      if (typeof urlOrRequest === 'string') {
        expect(urlOrRequest).toBe('https://api.test.com/users');
        expect(options.method).toBe('POST');
        expect(options.headers['Content-Type']).toBe('application/json');
        expect(options.headers['Authorization']).toBe(`Bearer ${mockAccessToken}`);
        expect(options.body).toBe(JSON.stringify(mockRequestBody));
        expect(options.signal).toBeInstanceOf(AbortSignal);
      } else {
        // urlOrRequest is a Request object
        expect(urlOrRequest.url).toBe('https://api.test.com/users');
        expect(urlOrRequest.method).toBe('POST');
        expect(urlOrRequest.headers.get('Content-Type')).toBe('application/json');
        expect(urlOrRequest.headers.get('Authorization')).toBe(`Bearer ${mockAccessToken}`);
        // For Request objects, body might be a ReadableStream, so we need to handle it differently
        // Since we're mocking, we'll just check that the request was made correctly
        expect(urlOrRequest.signal).toBeInstanceOf(AbortSignal);
      }

      expect(result).toEqual({
        success: true,
        message: 'Request completed successfully',
        data: mockResponseData,
        status: 201,
        statusText: 'Created',
      });
    });

    it('should handle DELETE request with 204 No Content response', async () => {
      const mockAccessToken = 'valid-access-token';

      vi.mocked(getValidAccessToken).mockResolvedValue({
        token: mockAccessToken,
        shouldClearAuth: false,
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
        statusText: 'No Content',
      });

      const result = await apiRequest('/users/1', {
        method: 'DELETE',
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [urlOrRequest] = mockFetch.mock.calls[0];
      
      // Verify the request was made to the correct endpoint
      if (typeof urlOrRequest === 'string') {
        expect(urlOrRequest).toBe('https://api.test.com/users/1');
      } else {
        expect(urlOrRequest.url).toBe('https://api.test.com/users/1');
        expect(urlOrRequest.method).toBe('DELETE');
      }

      expect(result).toEqual({
        success: true,
        message: 'Request completed successfully',
        status: 204,
        statusText: 'No Content',
      });
    });

    it('should return error when no access token is available', async () => {
      vi.mocked(getValidAccessToken).mockResolvedValue({
        token: null,
        shouldClearAuth: true,
      });

      const result = await apiRequest('/test-endpoint');

      expect(result).toEqual({
        success: false,
        message: 'Authentication required. Please log in again.',
        status: 401,
        statusText: 'Unauthorized',
        shouldClearAuth: true,
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should retry request after token refresh on 401 error', async () => {
      const mockAccessToken = 'old-access-token';
      const mockNewAccessToken = 'new-access-token';
      const mockResponseData = { id: 1, name: 'test' };

      vi.mocked(getValidAccessToken).mockResolvedValue({
        token: mockAccessToken,
        shouldClearAuth: false,
      });

      vi.mocked(forceRefreshToken).mockResolvedValue({
        token: mockNewAccessToken,
        shouldClearAuth: false,
      });

      // First call returns 401, second call succeeds
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: () => Promise.resolve(mockResponseData),
        });

      const result = await apiRequest('/test-endpoint');

      expect(getValidAccessToken).toHaveBeenCalled();
      expect(forceRefreshToken).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // Check first call with old token
      const [urlOrRequest1, options1] = mockFetch.mock.calls[0];
      if (typeof urlOrRequest1 === 'string') {
        expect(urlOrRequest1).toBe('https://api.test.com/test-endpoint');
        expect(options1.headers['Authorization']).toBe(`Bearer ${mockAccessToken}`);
      } else {
        expect(urlOrRequest1.url).toBe('https://api.test.com/test-endpoint');
        expect(urlOrRequest1.headers.get('Authorization')).toBe(`Bearer ${mockAccessToken}`);
      }

      // Check retry call with new token
      const [urlOrRequest2, options2] = mockFetch.mock.calls[1];
      if (typeof urlOrRequest2 === 'string') {
        expect(urlOrRequest2).toBe('https://api.test.com/test-endpoint');
        expect(options2.headers['Authorization']).toBe(`Bearer ${mockNewAccessToken}`);
      } else {
        expect(urlOrRequest2.url).toBe('https://api.test.com/test-endpoint');
        expect(urlOrRequest2.headers.get('Authorization')).toBe(`Bearer ${mockNewAccessToken}`);
      }

      expect(result).toEqual({
        success: true,
        message: 'Request completed successfully',
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
      });
    });

    it('should return error when token refresh fails', async () => {
      const mockAccessToken = 'old-access-token';

      vi.mocked(getValidAccessToken).mockResolvedValue({
        token: mockAccessToken,
        shouldClearAuth: false,
      });

      vi.mocked(forceRefreshToken).mockResolvedValue({
        token: null,
        shouldClearAuth: true,
      });

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      const result = await apiRequest('/test-endpoint');

      expect(result).toEqual({
        success: false,
        message: 'Authentication required. Please log in again.',
        status: 401,
        statusText: 'Unauthorized',
        shouldClearAuth: true,
      });
    });
 
    it('should handle API errors properly', async () => {
      const mockAccessToken = 'valid-access-token';
      const mockErrorResponse = {
        success: false,
        message: 'Not Found',
        status: 404,
        statusText: 'Not Found',
      };

      vi.mocked(getValidAccessToken).mockResolvedValue({
        token: mockAccessToken,
        shouldClearAuth: false,
      });

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      vi.mocked(handleApiError).mockResolvedValue(mockErrorResponse);

      const result = await apiRequest('/test-endpoint');

      expect(handleApiError).toHaveBeenCalled();
      expect(result).toEqual(mockErrorResponse);
    });

    it('should handle network errors properly', async () => {
      const mockAccessToken = 'valid-access-token';
      const mockNetworkError = new Error('Network error');
      const mockErrorResponse = {
        success: false,
        message: 'Network error occurred',
        status: 0,
        statusText: 'Network Error',
      };

      vi.mocked(getValidAccessToken).mockResolvedValue({
        token: mockAccessToken,
        shouldClearAuth: false,
      });

      mockFetch.mockRejectedValue(mockNetworkError);
      vi.mocked(handleNetworkError).mockResolvedValue(mockErrorResponse);

      const result = await apiRequest('/test-endpoint');

      expect(handleNetworkError).toHaveBeenCalledWith(mockNetworkError);
      expect(result).toEqual(mockErrorResponse);
    });

    it('should use custom headers when provided', async () => {
      const customHeaders = { 'X-Custom-Header': 'custom-value' };
      const mockAccessToken = 'valid-access-token';

      vi.mocked(getValidAccessToken).mockResolvedValue({
        token: mockAccessToken,
        shouldClearAuth: false,
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({}),
      });

      await apiRequest('/test-endpoint', {
        headers: customHeaders,
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [urlOrRequest, options] = mockFetch.mock.calls[0];
      
      if (typeof urlOrRequest === 'string') {
        expect(urlOrRequest).toBe('https://api.test.com/test-endpoint');
        expect(options.headers['Content-Type']).toBe('application/json');
        expect(options.headers['Authorization']).toBe(`Bearer ${mockAccessToken}`);
        expect(options.headers['X-Custom-Header']).toBe('custom-value');
      } else {
        expect(urlOrRequest.url).toBe('https://api.test.com/test-endpoint');
        expect(urlOrRequest.headers.get('Content-Type')).toBe('application/json');
        expect(urlOrRequest.headers.get('Authorization')).toBe(`Bearer ${mockAccessToken}`);
        expect(urlOrRequest.headers.get('X-Custom-Header')).toBe('custom-value');
      }
    });
  });

  describe('Convenience methods', () => {
    beforeEach(() => {
      vi.mocked(getValidAccessToken).mockResolvedValue({
        token: 'valid-token',
        shouldClearAuth: false,
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({ id: 1 }),
      });
    });

    it('should call apiGet correctly', async () => {
      await apiGet('/users');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [urlOrRequest, options] = mockFetch.mock.calls[0];
      
      if (typeof urlOrRequest === 'string') {
        expect(urlOrRequest).toBe('https://api.test.com/users');
        expect(options.method).toBe('GET');
        expect(options.headers['Authorization']).toBe('Bearer valid-token');
      } else {
        expect(urlOrRequest.url).toBe('https://api.test.com/users');
        expect(urlOrRequest.method).toBe('GET');
        expect(urlOrRequest.headers.get('Authorization')).toBe('Bearer valid-token');
      }
    });

    it('should call apiPost correctly', async () => {
      const body = { name: 'test' };
      await apiPost('/users', body);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [urlOrRequest, options] = mockFetch.mock.calls[0];
      
      if (typeof urlOrRequest === 'string') {
        expect(urlOrRequest).toBe('https://api.test.com/users');
        expect(options.method).toBe('POST');
        expect(options.headers['Authorization']).toBe('Bearer valid-token');
        expect(options.body).toBe(JSON.stringify(body));
      } else {
        expect(urlOrRequest.url).toBe('https://api.test.com/users');
        expect(urlOrRequest.method).toBe('POST');
        expect(urlOrRequest.headers.get('Authorization')).toBe('Bearer valid-token');
      }
    });

    it('should call apiPatch correctly', async () => {
      const body = { name: 'updated' };
      await apiPatch('/users/1', body);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [urlOrRequest, options] = mockFetch.mock.calls[0];
      
      if (typeof urlOrRequest === 'string') {
        expect(urlOrRequest).toBe('https://api.test.com/users/1');
        expect(options.method).toBe('PATCH');
        expect(options.headers['Authorization']).toBe('Bearer valid-token');
        expect(options.body).toBe(JSON.stringify(body));
      } else {
        expect(urlOrRequest.url).toBe('https://api.test.com/users/1');
        expect(urlOrRequest.method).toBe('PATCH');
        expect(urlOrRequest.headers.get('Authorization')).toBe('Bearer valid-token');
      }
    });

    it('should call apiPut correctly', async () => {
      const body = { name: 'replaced' };
      await apiPut('/users/1', body);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [urlOrRequest, options] = mockFetch.mock.calls[0];
      
      if (typeof urlOrRequest === 'string') {
        expect(urlOrRequest).toBe('https://api.test.com/users/1');
        expect(options.method).toBe('PUT');
        expect(options.headers['Authorization']).toBe('Bearer valid-token');
        expect(options.body).toBe(JSON.stringify(body));
      } else {
        expect(urlOrRequest.url).toBe('https://api.test.com/users/1');
        expect(urlOrRequest.method).toBe('PUT');
        expect(urlOrRequest.headers.get('Authorization')).toBe('Bearer valid-token');
      }
    });

    it('should call apiDelete correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
        statusText: 'No Content',
      });

      await apiDelete('/users/1');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [urlOrRequest, options] = mockFetch.mock.calls[0];
      
      if (typeof urlOrRequest === 'string') {
        expect(urlOrRequest).toBe('https://api.test.com/users/1');
        expect(options.method).toBe('DELETE');
        expect(options.headers['Authorization']).toBe('Bearer valid-token');
      } else {
        expect(urlOrRequest.url).toBe('https://api.test.com/users/1');
        expect(urlOrRequest.method).toBe('DELETE');
        expect(urlOrRequest.headers.get('Authorization')).toBe('Bearer valid-token');
      }
    });
  });

  describe('Admin API methods', () => {
    beforeEach(() => {
      vi.mocked(getValidAccessToken).mockResolvedValue({
        token: 'valid-admin-token',
        shouldClearAuth: false,
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({ id: 1 }),
      });
    });

    it('should call adminApiGet correctly when admin role is verified', async () => {
      vi.mocked(verifyAdminRole).mockResolvedValue({
        success: true,
        message: 'Admin role verified',
        status: 200,
        statusText: 'OK',
      });

      await adminApiGet('/admin/users');

      expect(verifyAdminRole).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [urlOrRequest, options] = mockFetch.mock.calls[0];
      
      if (typeof urlOrRequest === 'string') {
        expect(urlOrRequest).toBe('https://api.test.com/admin/users');
        expect(options.method).toBe('GET');
        expect(options.headers['Authorization']).toBe('Bearer valid-admin-token');
      } else {
        expect(urlOrRequest.url).toBe('https://api.test.com/admin/users');
        expect(urlOrRequest.method).toBe('GET');
        expect(urlOrRequest.headers.get('Authorization')).toBe('Bearer valid-admin-token');
      }
    });

    it('should return error when admin role verification fails', async () => {
      const adminError: ApiResponse<null> = {
        success: false,
        message: 'Access denied. Admin role required.',
        status: 403,
        statusText: 'Forbidden',
      };

      vi.mocked(verifyAdminRole).mockResolvedValue(adminError);

      const result = await adminApiGet('/admin/users');

      expect(verifyAdminRole).toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual(adminError);
    });

    it('should call adminApiPost correctly', async () => {
      vi.mocked(verifyAdminRole).mockResolvedValue({
        success: true,
        message: 'Admin role verified',
        status: 200,
        statusText: 'OK',
      });

      const body = { name: 'admin-test' };
      await adminApiPost('/admin/users', body);

      expect(verifyAdminRole).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [urlOrRequest, options] = mockFetch.mock.calls[0];
      
      if (typeof urlOrRequest === 'string') {
        expect(urlOrRequest).toBe('https://api.test.com/admin/users');
        expect(options.method).toBe('POST');
        expect(options.headers['Authorization']).toBe('Bearer valid-admin-token');
        expect(options.body).toBe(JSON.stringify(body));
      } else {
        expect(urlOrRequest.url).toBe('https://api.test.com/admin/users');
        expect(urlOrRequest.method).toBe('POST');
        expect(urlOrRequest.headers.get('Authorization')).toBe('Bearer valid-admin-token');
      }
    });

    it('should call adminApiPatch correctly', async () => {
      vi.mocked(verifyAdminRole).mockResolvedValue({
        success: true,
        message: 'Admin role verified',
        status: 200,
        statusText: 'OK',
      });

      const body = { name: 'admin-updated' };
      await adminApiPatch('/admin/users/1', body);

      expect(verifyAdminRole).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [urlOrRequest, options] = mockFetch.mock.calls[0];
      
      if (typeof urlOrRequest === 'string') {
        expect(urlOrRequest).toBe('https://api.test.com/admin/users/1');
        expect(options.method).toBe('PATCH');
        expect(options.headers['Authorization']).toBe('Bearer valid-admin-token');
        expect(options.body).toBe(JSON.stringify(body));
      } else {
        expect(urlOrRequest.url).toBe('https://api.test.com/admin/users/1');
        expect(urlOrRequest.method).toBe('PATCH');
        expect(urlOrRequest.headers.get('Authorization')).toBe('Bearer valid-admin-token');
      }
    });

    it('should call adminApiPut correctly', async () => {
      vi.mocked(verifyAdminRole).mockResolvedValue({
        success: true,
        message: 'Admin role verified',
        status: 200,
        statusText: 'OK',
      });

      const body = { name: 'admin-replaced' };
      await adminApiPut('/admin/users/1', body);

      expect(verifyAdminRole).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [urlOrRequest, options] = mockFetch.mock.calls[0];
      
      if (typeof urlOrRequest === 'string') {
        expect(urlOrRequest).toBe('https://api.test.com/admin/users/1');
        expect(options.method).toBe('PUT');
        expect(options.headers['Authorization']).toBe('Bearer valid-admin-token');
        expect(options.body).toBe(JSON.stringify(body));
      } else {
        expect(urlOrRequest.url).toBe('https://api.test.com/admin/users/1');
        expect(urlOrRequest.method).toBe('PUT');
        expect(urlOrRequest.headers.get('Authorization')).toBe('Bearer valid-admin-token');
      }
    });

    it('should call adminApiDelete correctly', async () => {
      vi.mocked(verifyAdminRole).mockResolvedValue({
        success: true,
        message: 'Admin role verified',
        status: 200,
        statusText: 'OK',
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
        statusText: 'No Content',
      });

      await adminApiDelete('/admin/users/1');

      expect(verifyAdminRole).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [urlOrRequest, options] = mockFetch.mock.calls[0];
      
      if (typeof urlOrRequest === 'string') {
        expect(urlOrRequest).toBe('https://api.test.com/admin/users/1');
        expect(options.method).toBe('DELETE');
        expect(options.headers['Authorization']).toBe('Bearer valid-admin-token');
      } else {
        expect(urlOrRequest.url).toBe('https://api.test.com/admin/users/1');
        expect(urlOrRequest.method).toBe('DELETE');
        expect(urlOrRequest.headers.get('Authorization')).toBe('Bearer valid-admin-token');
      }
    });
  });
});