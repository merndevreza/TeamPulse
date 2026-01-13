import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '@/middleware';

// Mock the auth helpers
vi.mock('@/app/actions/auth/middleware-refresh-access-token', () => ({
  refreshTokenForMiddleware: vi.fn(),
}));

vi.mock('@/utils/token-cache', () => ({
  isValidToken: vi.fn(),
  extractRoleFromToken: vi.fn(),
}));

// Import mocked modules
import { refreshTokenForMiddleware } from '@/app/actions/auth/middleware-refresh-access-token';
import { isValidToken, extractRoleFromToken } from '@/utils/token-cache';

// Helper function to create mock NextRequest
function createMockRequest(pathname: string, cookies: Record<string, string> = {}) {
  const url = `https://example.com${pathname}`;
  const mockCookies = new Map();
  
  Object.entries(cookies).forEach(([key, value]) => {
    mockCookies.set(key, { value });
  });

  const request = {
    nextUrl: { pathname },
    url,
    cookies: {
      get: (name: string) => mockCookies.get(name),
    },
  } as unknown as NextRequest;

  return request;
}

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment
    vi.stubEnv('NODE_ENV', 'test');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Static resources and API routes', () => {
    it('should allow static resources without authentication', async () => {
      const request = createMockRequest('/_next/static/chunk-123.js');
      const response = await middleware(request);
      
      expect(response).toBeInstanceOf(NextResponse);
      expect(isValidToken).not.toHaveBeenCalled();
      expect(extractRoleFromToken).not.toHaveBeenCalled();
    });

    it('should allow API routes without authentication', async () => {
      const request = createMockRequest('/api/some-endpoint');
      const response = await middleware(request);
      
      expect(response).toBeInstanceOf(NextResponse);
      expect(isValidToken).not.toHaveBeenCalled();
      expect(extractRoleFromToken).not.toHaveBeenCalled();
    });
  });

  describe('Public routes', () => {
    it('should allow access to public routes without tokens', async () => {
      const request = createMockRequest('/');
      const response = await middleware(request);
      
      expect(response).toBeInstanceOf(NextResponse);
      expect(isValidToken).not.toHaveBeenCalled();
      expect(extractRoleFromToken).not.toHaveBeenCalled();
    });

    it('should allow access to reset-password route without tokens', async () => {
      const request = createMockRequest('/reset-password');
      const response = await middleware(request);
      
      expect(response).toBeInstanceOf(NextResponse);
      expect(isValidToken).not.toHaveBeenCalled();
      expect(extractRoleFromToken).not.toHaveBeenCalled();
    });
  });

  describe('Protected routes authentication', () => {
    it('should redirect to login when accessing protected route without any tokens', async () => {
      const request = createMockRequest('/about-me');
      const response = await middleware(request);
      
      expect(response).toBeInstanceOf(NextResponse);
      // Check if it's a redirect response
      const location = response.headers.get('location');
      expect(location).toBe('https://example.com/');
    });

    it('should allow access to protected route with valid access token', async () => {
      vi.mocked(isValidToken).mockResolvedValue(true);
      
      const request = createMockRequest('/about-me', { 
        accessToken: 'valid-access-token' 
      });
      
      const response = await middleware(request);
      
      expect(isValidToken).toHaveBeenCalledWith('valid-access-token');
      expect(response).toBeInstanceOf(NextResponse);
      // Should not be a redirect
      expect(response.headers.get('location')).toBeNull();
    });

    it('should refresh token and allow access when access token is invalid but refresh token is valid', async () => {
      vi.mocked(isValidToken)
        .mockResolvedValueOnce(false) // access token invalid
        .mockResolvedValueOnce(true)  // refresh token valid
        .mockResolvedValueOnce(true); // new access token valid

      vi.mocked(refreshTokenForMiddleware).mockResolvedValue({
        success: true,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const request = createMockRequest('/about-me', { 
        accessToken: 'invalid-access-token',
        refreshToken: 'valid-refresh-token'
      });
      
      const response = await middleware(request);
      
      expect(refreshTokenForMiddleware).toHaveBeenCalledWith('valid-refresh-token');
      expect(response).toBeInstanceOf(NextResponse);
      // Should not be a redirect
      expect(response.headers.get('location')).toBeNull();
      
      // Check if new cookies are set
      const setCookieHeaders = response.headers.getSetCookie();
      expect(setCookieHeaders.some(cookie => cookie.includes('accessToken=new-access-token'))).toBe(true);
    });

    it('should redirect to login when token refresh fails for protected route', async () => {
      vi.mocked(isValidToken)
        .mockResolvedValueOnce(false) // access token invalid
        .mockResolvedValueOnce(true); // refresh token valid

      vi.mocked(refreshTokenForMiddleware).mockResolvedValue({
        success: false,
        shouldClearAuth: true,
      });

      const request = createMockRequest('/about-me', { 
        accessToken: 'invalid-access-token',
        refreshToken: 'valid-refresh-token'
      });
      
      const response = await middleware(request);
      
      expect(refreshTokenForMiddleware).toHaveBeenCalledWith('valid-refresh-token');
      const location = response.headers.get('location');
      expect(location).toBe('https://example.com/');
      
      // Check if cookies are cleared
      const setCookieHeaders = response.headers.getSetCookie();
      expect(setCookieHeaders.some(cookie => cookie.includes('accessToken=;'))).toBe(true);
      expect(setCookieHeaders.some(cookie => cookie.includes('refreshToken=;'))).toBe(true);
    });
  });

  describe('Admin routes authorization', () => {
    it('should allow access to admin route with valid admin token', async () => {
      vi.mocked(isValidToken).mockResolvedValue(true);
      vi.mocked(extractRoleFromToken).mockResolvedValue('admin');
      
      const request = createMockRequest('/manage-members', { 
        accessToken: 'valid-admin-token' 
      });
      
      const response = await middleware(request);
      
      expect(isValidToken).toHaveBeenCalledWith('valid-admin-token');
      expect(extractRoleFromToken).toHaveBeenCalledWith('valid-admin-token');
      expect(response).toBeInstanceOf(NextResponse);
      // Should not be a redirect
      expect(response.headers.get('location')).toBeNull();
    });

    it('should redirect non-admin user from admin route even with valid token', async () => {
      vi.mocked(isValidToken).mockResolvedValue(true);
      vi.mocked(extractRoleFromToken).mockResolvedValue('user');
      
      const request = createMockRequest('/manage-dots', { 
        accessToken: 'valid-user-token' 
      });
      
      const response = await middleware(request);
      
      expect(isValidToken).toHaveBeenCalledWith('valid-user-token');
      expect(extractRoleFromToken).toHaveBeenCalledWith('valid-user-token');
      
      const location = response.headers.get('location');
      expect(location).toBe('https://example.com/');
      
      // Check if cookies are cleared due to unauthorized access
      const setCookieHeaders = response.headers.getSetCookie();
      expect(setCookieHeaders.some(cookie => cookie.includes('accessToken=;'))).toBe(true);
      expect(setCookieHeaders.some(cookie => cookie.includes('refreshToken=;'))).toBe(true);
    });

    it('should refresh token and check admin role for admin routes', async () => {
      vi.mocked(isValidToken)
        .mockResolvedValueOnce(false) // access token invalid
        .mockResolvedValueOnce(true)  // refresh token valid
        .mockResolvedValueOnce(true); // new access token valid

      vi.mocked(refreshTokenForMiddleware).mockResolvedValue({
        success: true,
        accessToken: 'new-admin-token',
        refreshToken: 'new-refresh-token',
      });

      vi.mocked(extractRoleFromToken).mockResolvedValue('admin');

      const request = createMockRequest('/manage-members', { 
        accessToken: 'invalid-access-token',
        refreshToken: 'valid-refresh-token'
      });
      
      const response = await middleware(request);
      
      expect(refreshTokenForMiddleware).toHaveBeenCalledWith('valid-refresh-token');
      expect(extractRoleFromToken).toHaveBeenCalledWith('new-admin-token');
      expect(response).toBeInstanceOf(NextResponse);
      // Should not be a redirect
      expect(response.headers.get('location')).toBeNull();
      
      // Check if new cookies are set
      const setCookieHeaders = response.headers.getSetCookie();
      expect(setCookieHeaders.some(cookie => cookie.includes('accessToken=new-admin-token'))).toBe(true);
    });
  });
});