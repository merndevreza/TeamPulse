import { NextResponse, NextRequest } from 'next/server'; 
import { refreshTokenForMiddleware } from './app/actions/auth/middleware-refresh-access-token';
import { isValidToken, extractRoleFromToken, needsProactiveRefresh, ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE, isProduction } from './utils/token-cache';

const PUBLIC_ROUTES = ['/', '/reset-password', "/error"];
const PROTECTED_ROUTES = ['/about-me', '/about-others', '/my-profile', '/give-dot', '/edit-dot', '/dashboard'];
const ADMIN_ROUTES = ['/manage-members', '/manage-dots'];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
}

function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
  return response;
}

async function attemptTokenRefresh(request: NextRequest): Promise<{ success: boolean; response?: NextResponse; newAccessToken?: string; newRefreshToken?: string }> {
  const redirectToLogin = () => NextResponse.redirect(new URL('/', request.url));
  
  try {
    const refreshTokenValue = request.cookies.get('refreshToken')?.value;
    
    if (!refreshTokenValue) {
      const response = redirectToLogin();
      return { success: false, response: clearAuthCookies(response) };
    }
    
    const refreshResult = await refreshTokenForMiddleware(refreshTokenValue);
    
    if (refreshResult.success && refreshResult.accessToken) {
      // Clone the request headers to modify them
      const requestHeaders = new Headers(request.headers);
      
      // Parse existing cookies and filter out old tokens
      const existingCookies = request.headers.get('cookie') || '';
      const cookiePairs = existingCookies
        .split(';')
        .map(c => c.trim())
        .filter(c => c && !c.startsWith('accessToken=') && !c.startsWith('refreshToken='));
      
      // Add the new tokens to the cookie string
      cookiePairs.push(`accessToken=${refreshResult.accessToken}`);
      if (refreshResult.refreshToken) {
        cookiePairs.push(`refreshToken=${refreshResult.refreshToken}`);
      }
      
      // Update the cookie header on the request so that downstream handlers see the new tokens
      requestHeaders.set('cookie', cookiePairs.join('; '));
      
      // Create response with modified request headers (Single Source of Truth)
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
       
      // Also set cookies on response so the browser receives the new tokens
      response.cookies.set('accessToken', refreshResult.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/',
        maxAge: ACCESS_TOKEN_MAX_AGE,
      });
      
      if (refreshResult.refreshToken) {
        response.cookies.set('refreshToken', refreshResult.refreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: 'strict',
          path: '/',
          maxAge: REFRESH_TOKEN_MAX_AGE,
        });
      }
      
      return { 
        success: true, 
        newAccessToken: refreshResult.accessToken, 
        newRefreshToken: refreshResult.refreshToken,
        response 
      };

    } else if (refreshResult.shouldClearAuth) {  
      const response = redirectToLogin();
      return { success: false, response: clearAuthCookies(response) };

    } else {
      return { success: false, response: NextResponse.next() };
    }

  } catch (error) {
    console.error('Token refresh failed in middleware:', error);
    // Don't automatically clear auth on network errors
    // Only redirect to login if refresh explicitly failed
    return { success: false, response: NextResponse.next() };
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl; 
  
  const redirectToLogin = () => NextResponse.redirect(new URL('/', request.url));

  // Early static resource check - most performant
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Early public route check - avoid token operations
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // Early exit if no tokens at all - avoid validation calls
  if (!accessToken && !refreshToken) {
    return redirectToLogin();
  }

  // Check if access token is valid
  const isHavingValidAccessToken = accessToken && (await isValidToken(accessToken));
  
  // Proactively refresh tokens that are about to expire
  // This prevents Server Components from getting stale tokens
  if (isHavingValidAccessToken && refreshToken) {
    const needsRefresh = await needsProactiveRefresh(accessToken);
    if (needsRefresh && (await isValidToken(refreshToken))) {
      const refreshResult = await attemptTokenRefresh(request);
      if (refreshResult.success && refreshResult.response) {
        return refreshResult.response;
      }
      // If proactive refresh fails, continue with existing valid token
    }
  }
  
  // Handle admin routes
  if (isAdminRoute(pathname)) {
    if (!isHavingValidAccessToken) {
      if (refreshToken && (await isValidToken(refreshToken))) {
        const refreshResult = await attemptTokenRefresh(request); 

        if (!refreshResult.success) {
          return refreshResult.response || redirectToLogin();
        }
        
        if (!refreshResult.newAccessToken || !(await isValidToken(refreshResult.newAccessToken))) {
          const response = redirectToLogin();
          return clearAuthCookies(response);
        }
        
        const userRole = await extractRoleFromToken(refreshResult.newAccessToken);
        if (userRole !== 'admin') {
          const response = redirectToLogin();
          return clearAuthCookies(response);
        }
        
        return refreshResult.response || NextResponse.next();
      } else {
        const response = redirectToLogin();
        return clearAuthCookies(response);
      }
    } else {
      const userRole = await extractRoleFromToken(accessToken);
      if (userRole !== 'admin') {
        const response = redirectToLogin();
        return clearAuthCookies(response);
      }
    }

    return NextResponse.next();
  }

  // Handle protected routes
  if (isProtectedRoute(pathname)) {
    if (!isHavingValidAccessToken) {
      if (refreshToken && (await isValidToken(refreshToken))) {
        const refreshResult = await attemptTokenRefresh(request);
        
        if (!refreshResult.success) {
          return refreshResult.response || redirectToLogin();
        }
        
        return refreshResult.response || NextResponse.next();
      }
      const response = redirectToLogin();
      return clearAuthCookies(response);
    }

    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = { 
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};