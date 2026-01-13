import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleLogout } from '@/app/actions/auth/logout';

// Mock dependencies
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/app/actions/api/api-client', () => ({
  apiPost: vi.fn(),
}));

// Import mocked modules
import { cookies } from 'next/headers';
import { apiPost } from '@/app/actions/api/api-client';

describe('handleLogout', () => {
  const mockCookieStore = {
    set: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    [Symbol.iterator]: vi.fn(),
    size: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default cookie store mock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
    
    // Reset mock implementations
    mockCookieStore.delete.mockImplementation(() => {});
    mockCookieStore.get.mockImplementation(() => undefined);
  });

  it('should handle logout when no access token exists', async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const result = await handleLogout();

    expect(result).toEqual({
      success: true,
      message: "Logged out successfully",
      status: 200,
      statusText: "OK",
    });

    expect(mockCookieStore.delete).toHaveBeenCalledWith('accessToken');
    expect(mockCookieStore.delete).toHaveBeenCalledWith('refreshToken');
    expect(apiPost).not.toHaveBeenCalled();
  });

  it('should handle successful API logout with refresh token', async () => {
    mockCookieStore.get.mockImplementation((name) => {
      if (name === 'accessToken') return { value: 'mock-access-token' };
      if (name === 'refreshToken') return { value: 'mock-refresh-token' };
      return undefined;
    });

    vi.mocked(apiPost).mockResolvedValue({
      success: true,
      message: 'API success',
      data: { message: 'Logged out successfully' },
      status: 200,
      statusText: 'OK',
    });

    const result = await handleLogout();

    expect(result).toEqual({
      success: true,
      message: "Logged out successfully",
      status: 200,
      statusText: "OK",
    });

    expect(apiPost).toHaveBeenCalledWith('/api/user/logout/', { refresh: 'mock-refresh-token' });
    expect(mockCookieStore.delete).toHaveBeenCalledWith('accessToken');
    expect(mockCookieStore.delete).toHaveBeenCalledWith('refreshToken');
  });

  it('should handle logout without refresh token', async () => {
    mockCookieStore.get.mockImplementation((name) => {
      if (name === 'accessToken') return { value: 'mock-access-token' };
      if (name === 'refreshToken') return undefined;
      return undefined;
    });

    vi.mocked(apiPost).mockResolvedValue({
      success: true,
      message: 'API success',
      data: { message: 'Logged out successfully' },
      status: 200,
      statusText: 'OK',
    });

    const result = await handleLogout();

    expect(result).toEqual({
      success: true,
      message: "Logged out successfully",
      status: 200,
      statusText: "OK",
    });

    expect(apiPost).toHaveBeenCalledWith('/api/user/logout/', {});
    expect(mockCookieStore.delete).toHaveBeenCalledWith('accessToken');
    expect(mockCookieStore.delete).toHaveBeenCalledWith('refreshToken');
  });

  it('should handle API 401 error gracefully', async () => {
    mockCookieStore.get.mockImplementation((name) => {
      if (name === 'accessToken') return { value: 'mock-access-token' };
      if (name === 'refreshToken') return { value: 'mock-refresh-token' };
      return undefined;
    });

    vi.mocked(apiPost).mockResolvedValue({
      success: false,
      message: 'Unauthorized',
      status: 401,
      statusText: 'Unauthorized',
    });

    const result = await handleLogout();

    expect(result).toEqual({
      success: true,
      message: "Logged out successfully",
      status: 200,
      statusText: "OK",
    });

    expect(mockCookieStore.delete).toHaveBeenCalledWith('accessToken');
    expect(mockCookieStore.delete).toHaveBeenCalledWith('refreshToken');
  });

  it('should handle API errors by falling back to local logout', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockCookieStore.get.mockImplementation((name) => {
      if (name === 'accessToken') return { value: 'mock-access-token' };
      if (name === 'refreshToken') return { value: 'mock-refresh-token' };
      return undefined;
    });

    vi.mocked(apiPost).mockResolvedValue({
      success: false,
      message: 'Server error',
      status: 500,
      statusText: 'Internal Server Error',
    });

    const result = await handleLogout();

    expect(result).toEqual({
      success: true,
      message: "Logged out locally",
      status: 200,
      statusText: "OK",
    });

    expect(mockCookieStore.delete).toHaveBeenCalledWith('accessToken');
    expect(mockCookieStore.delete).toHaveBeenCalledWith('refreshToken');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Logout API failed:",
      500,
      'Server error'
    );

    consoleErrorSpy.mockRestore();
  });

  it('should handle unexpected errors and ensure cookies are cleared', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockCookieStore.get.mockImplementation(() => {
      throw new Error('Cookie access failed');
    });

    const result = await handleLogout();

    expect(result).toEqual({
      success: false,
      message: "An unexpected error occurred during logout",
      status: 500,
      statusText: "Internal Server Error",
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error));
    
    consoleErrorSpy.mockRestore();
  });
});