import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from 'vitest';
import { getAccessTokenByRefreshToken } from '@/app/actions/auth/refresh-access-token';

// Mock dependencies
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}));

// Import mocked modules
import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

describe('getAccessTokenByRefreshToken', () => {
  const mockCookieStore = {
    set: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    [Symbol.iterator]: vi.fn(),
    size: 0,
  };

  const validToken = 'valid.jwt.token';
  const mockDecodedToken = {
    email: 'test@example.com',
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    iat: Math.floor(Date.now() / 1000),
    user_id: '123',
    role: 'user',
  };

  const mockRefreshResponse = {
    access: 'new-access-token',
    refresh: 'new-refresh-token',
  };

  // Store and mock fetch
  const mockFetch = vi.fn();

  beforeAll(() => {
    // Replace global fetch with our mock
    global.fetch = mockFetch;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock NODE_ENV and API_BASE_URL
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('API_BASE_URL', 'https://api.example.com');
    
    // Setup default cookie store mock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
    
    // Reset mock implementations
    mockCookieStore.set.mockImplementation(() => {});
    mockCookieStore.get.mockImplementation(() => undefined);
    
    // Setup default JWT decode mock
    vi.mocked(jwtDecode).mockReturnValue(mockDecodedToken);
    
    // Setup default fetch mock
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockRefreshResponse),
    } as Response);
  });

  afterEach(() => {
    // Reset the mock after each test
    mockFetch.mockReset();
  });

  it('should return error when no refresh token exists', async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const result = await getAccessTokenByRefreshToken();

    expect(result).toEqual({
      success: false,
      message: "No refresh token available",
      shouldClearAuth: true,
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockCookieStore.set).not.toHaveBeenCalled();
  });

  it('should handle expired refresh token', async () => {
    const expiredToken = {
      ...mockDecodedToken,
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    };

    mockCookieStore.get.mockReturnValue({ value: validToken });
    vi.mocked(jwtDecode).mockReturnValue(expiredToken);

    const result = await getAccessTokenByRefreshToken();

    expect(result).toEqual({
      success: false,
      message: "Refresh token expired",
      shouldClearAuth: true,
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockCookieStore.set).not.toHaveBeenCalled();
  });

  it('should successfully refresh tokens with valid refresh token', async () => {
    mockCookieStore.get.mockReturnValue({ value: validToken });

    const result = await getAccessTokenByRefreshToken();

    expect(result).toEqual({
      success: true,
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      message: "Token refreshed successfully",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/api/user/token/refresh/',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: validToken }),
        signal: expect.any(AbortSignal),
      })
    );

    expect(mockCookieStore.set).toHaveBeenCalledTimes(2);
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      'accessToken',
      'new-access-token',
      expect.objectContaining({
        httpOnly: true,
        secure: false, // development mode
        sameSite: 'strict',
        path: '/',
        maxAge: expect.any(Number),
      })
    );
  });

  it('should handle API 401/403 errors and blacklisted tokens', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockCookieStore.get.mockReturnValue({ value: validToken });
    
    const errorResponse = {
      detail: 'Token is blacklisted',
      code: 'token_not_valid',
    };

    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve(JSON.stringify(errorResponse)),
    } as Response);

    const result = await getAccessTokenByRefreshToken();

    expect(result).toEqual({
      success: false,
      message: "Session expired. Please log in again.",
      shouldClearAuth: true,
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Refresh token API failed:',
      401,
      JSON.stringify(errorResponse)
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith('Refresh token is blacklisted');
    
    expect(mockCookieStore.set).not.toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });

  it('should handle network errors and timeouts', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockCookieStore.get.mockReturnValue({ value: validToken });
    
    // Mock fetch to throw an AbortError (timeout)
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    mockFetch.mockRejectedValue(abortError);

    const result = await getAccessTokenByRefreshToken();

    expect(result).toEqual({
      success: false,
      message: "Request timeout",
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Refresh token request timed out');
    expect(mockCookieStore.set).not.toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });
});