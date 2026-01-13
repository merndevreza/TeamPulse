import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleLogin } from '@/app/actions/auth/login';
import { LoginData, LoginTokenResponse } from '@/app/actions/auth/type';
import { ACCESS_TOKEN_MAX_AGE, isProduction, REFRESH_TOKEN_MAX_AGE } from '@/utils/token-cache';

// Mock dependencies
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/app/actions/api/api-client', () => ({
  apiPost: vi.fn(),
}));

vi.mock('@/lib/schemas/auth', () => ({
  LoginInputSchema: {
    safeParse: vi.fn(),
  },
  LoginTokenResponseSchema: {
    safeParse: vi.fn(),
  },
}));

// Import mocked modules
import { cookies } from 'next/headers';
import { apiPost } from '@/app/actions/api/api-client';
import { LoginInputSchema, LoginTokenResponseSchema } from '@/lib/schemas/auth';

describe('handleLogin', () => {
  const mockCookieStore = {
    set: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    [Symbol.iterator]: vi.fn(),
    size: 0,
  };

  const validLoginData: LoginData = {
    email: 'test@example.com',
    password: 'validPassword123',
  };

  const mockTokenResponse: LoginTokenResponse = {
    access: 'mock-access-token',
    refresh: 'mock-refresh-token',
    message: 'Login successful',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock NODE_ENV to development for consistent testing
    vi.stubEnv('NODE_ENV', 'development');
    
    // Reset mock implementation to avoid interference between tests
    mockCookieStore.set.mockImplementation(() => {});
    mockCookieStore.delete.mockImplementation(() => {});
    
    // Setup default cookie store mock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
    
    // Setup default schema validation mocks
    vi.mocked(LoginInputSchema.safeParse).mockReturnValue({
      success: true,
      data: validLoginData,
    });
    
    vi.mocked(LoginTokenResponseSchema.safeParse).mockReturnValue({
      success: true,
      data: mockTokenResponse,
    });
  });

  describe('Input validation', () => {
    it('should return error when input validation fails', async () => {
      const invalidData = { email: 'invalid-email', password: '123' };
      
      vi.mocked(LoginInputSchema.safeParse).mockReturnValue({
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: { issues: [] } as any,
      });

      const result = await handleLogin(invalidData);

      expect(result).toEqual({
        success: false,
        message: 'Email and password are required and must be valid',
        status: 400,
        statusText: 'Bad Request',
      });

      expect(apiPost).not.toHaveBeenCalled();
    });

    it('should proceed with valid input data', async () => {
      vi.mocked(apiPost).mockResolvedValue({
        success: true,
        message: 'API success',
        data: mockTokenResponse,
        status: 200,
        statusText: 'OK',
      });

      await handleLogin(validLoginData);

      expect(LoginInputSchema.safeParse).toHaveBeenCalledWith(validLoginData);
      expect(apiPost).toHaveBeenCalledWith('/api/user/login/', validLoginData, {
        requireAuth: false,
      });
    });
  });

  describe('API call handling', () => {
    it('should handle successful login with valid response', async () => {
      vi.mocked(apiPost).mockResolvedValue({
        success: true,
        message: 'API success',
        data: mockTokenResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await handleLogin(validLoginData);

      expect(result).toEqual({
        success: true,
        message: 'Login successful',
        data: mockTokenResponse,
        status: 200,
        statusText: 'OK',
      });

      expect(mockCookieStore.set).toHaveBeenCalledTimes(2);
      expect(mockCookieStore.delete).not.toHaveBeenCalled();
    });

    it('should handle API failure with client error (4xx)', async () => {
      vi.mocked(apiPost).mockResolvedValue({
        success: false,
        message: 'Unauthorized',
        status: 401,
        statusText: 'Unauthorized',
      });

      const result = await handleLogin(validLoginData);

      expect(result).toEqual({
        success: false,
        message: 'Invalid email or password',
        status: 401,
        statusText: 'Unauthorized',
      });

      expect(mockCookieStore.delete).toHaveBeenCalledWith('accessToken');
      expect(mockCookieStore.delete).toHaveBeenCalledWith('refreshToken');
      expect(mockCookieStore.set).not.toHaveBeenCalled();
    });

    it('should handle API failure with server error (5xx)', async () => {
      vi.mocked(apiPost).mockResolvedValue({
        success: false,
        message: 'Internal Server Error',
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await handleLogin(validLoginData);

      expect(result).toEqual({
        success: false,
        message: 'Server error. Please try again later.',
        status: 500,
        statusText: 'Internal Server Error',
      });

      expect(mockCookieStore.delete).toHaveBeenCalledWith('accessToken');
      expect(mockCookieStore.delete).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('Response validation', () => {
    it('should handle invalid response schema', async () => {
      vi.mocked(apiPost).mockResolvedValue({
        success: true,
        message: 'API success',
        data: { invalid: 'response' },
        status: 200,
        statusText: 'OK',
      });

      vi.mocked(LoginTokenResponseSchema.safeParse).mockReturnValue({
        success: false,
        error: {
          flatten: () => ({ fieldErrors: {}, formErrors: [] }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      });

      const result = await handleLogin(validLoginData);

      expect(result).toEqual({
        success: false,
        message: 'Invalid response from server',
        status: 502,
        statusText: 'Bad Gateway',
      });

      expect(mockCookieStore.set).not.toHaveBeenCalled();
    });

    it('should log schema mismatch in development mode', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      vi.mocked(apiPost).mockResolvedValue({
        success: true,
        message: 'API success',
        data: { invalid: 'response' },
        status: 200,
        statusText: 'OK',
      });

      const mockError = {
        flatten: () => ({ fieldErrors: {}, formErrors: ['Invalid schema'] }),
      };

      vi.mocked(LoginTokenResponseSchema.safeParse).mockReturnValue({
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: mockError as any,
      });

      await handleLogin(validLoginData);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Login response schema mismatch:',
        { fieldErrors: {}, formErrors: ['Invalid schema'] }
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Cookie management', () => {
    it('should set cookies with correct options in production', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      
      vi.mocked(apiPost).mockResolvedValue({
        success: true,
        message: 'API success',
        data: mockTokenResponse,
        status: 200,
        statusText: 'OK',
      });

      await handleLogin(validLoginData);

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'accessToken',
        'mock-access-token',
        expect.objectContaining({
          httpOnly: true,
          secure: isProduction,
          sameSite: 'strict',
          path: '/',
          maxAge: expect.any(Number),
        })
      );

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'refreshToken',
        'mock-refresh-token',
        expect.objectContaining({
          httpOnly: true,
          secure: isProduction,
          sameSite: 'strict',
          path: '/',
          maxAge: expect.any(Number),
        })
      );
    });

    it('should set cookies with correct options in development', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      
      vi.mocked(apiPost).mockResolvedValue({
        success: true,
        message: 'API success',
        data: mockTokenResponse,
        status: 200,
        statusText: 'OK',
      });

      await handleLogin(validLoginData);

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'accessToken',
        'mock-access-token',
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          path: '/',
          maxAge: expect.any(Number),
        })
      );
    });

    it('should handle cookie setting errors', async () => {
      mockCookieStore.set.mockImplementation(() => {
        throw new Error('Cookie setting failed');
      });

      vi.mocked(apiPost).mockResolvedValue({
        success: true,
        message: 'API success',
        data: mockTokenResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await handleLogin(validLoginData);

      expect(result).toEqual({
        success: false,
        message: 'Invalid token format received',
        status: 500,
        statusText: 'Internal Server Error',
      });
    });

    it('should validate token expiry times', async () => {
      // Mock Date.now() to return a fixed timestamp
      const fixedTime = 1640995200000; // 2022-01-01 00:00:00 UTC
      
      vi.spyOn(Date, 'now').mockReturnValue(fixedTime);

      // Reset mock implementations to ensure they work properly
      mockCookieStore.set.mockImplementation(() => {});
      
      vi.mocked(apiPost).mockResolvedValue({
        success: true,
        message: 'API success',
        data: mockTokenResponse,
        status: 200,
        statusText: 'OK',
      });

      await handleLogin(validLoginData);

      // Verify that maxAge is calculated correctly (30 minutes for access token)
      const accessTokenCall = mockCookieStore.set.mock.calls.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (call: any[]) => call[0] === 'accessToken'
      );
      expect(accessTokenCall?.[2]).toEqual(
        expect.objectContaining({
          maxAge: ACCESS_TOKEN_MAX_AGE,
        })
      );

      // Verify refresh token maxAge (7 days)
      const refreshTokenCall = mockCookieStore.set.mock.calls.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (call: any[]) => call[0] === 'refreshToken'
      );
      expect(refreshTokenCall?.[2]).toEqual(
        expect.objectContaining({
          maxAge: REFRESH_TOKEN_MAX_AGE,
        })
      );

      vi.restoreAllMocks();
    });
  });

  describe('Error handling', () => {
    it('should handle unexpected errors and clear cookies', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      vi.mocked(apiPost).mockRejectedValue(new Error('Network error'));

      const result = await handleLogin(validLoginData);

      expect(result).toEqual({
        success: false,
        message: 'An unexpected error occurred. Please try again.',
        status: 500,
        statusText: 'Internal Server Error',
      });

      expect(mockCookieStore.delete).toHaveBeenCalledWith('accessToken');
      expect(mockCookieStore.delete).toHaveBeenCalledWith('refreshToken');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Login error:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    }); 
  });

  describe('Response message handling', () => {
    it('should use custom message from API response', async () => {
      const customMessage = 'Welcome back!';
      const responseWithCustomMessage = {
        ...mockTokenResponse,
        message: customMessage,
      };

      // Reset mock implementation to avoid interference
      mockCookieStore.set.mockImplementation(() => {});

      vi.mocked(apiPost).mockResolvedValue({
        success: true,
        message: 'API success',
        data: responseWithCustomMessage,
        status: 200,
        statusText: 'OK',
      });

      vi.mocked(LoginTokenResponseSchema.safeParse).mockReturnValue({
        success: true,
        data: responseWithCustomMessage,
      });

      const result = await handleLogin(validLoginData);

      expect(result.message).toBe(customMessage);
    });

    it('should use default message when API response has no message', async () => {
      const responseWithoutMessage = {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
      };

      // Reset mock implementation to avoid interference
      mockCookieStore.set.mockImplementation(() => {});

      vi.mocked(apiPost).mockResolvedValue({
        success: true,
        message: 'API success',
        data: responseWithoutMessage,
        status: 200,
        statusText: 'OK',
      });

      vi.mocked(LoginTokenResponseSchema.safeParse).mockReturnValue({
        success: true,
        data: responseWithoutMessage,
      });

      const result = await handleLogin(validLoginData);

      expect(result.message).toBe('Login successful');
    });
  });
});
