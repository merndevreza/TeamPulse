import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Server-side component that handles authentication errors
 * by checking for valid tokens and redirecting if necessary
 */
export default async function AuthErrorBoundary({ 
  children, 
  fallback 
}: AuthErrorBoundaryProps) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    // If no tokens at all, redirect to login
    if (!accessToken && !refreshToken) {
      redirect('/');
    }

    return <>{children}</>;
  } catch (error) {
    // If there's any error (like API failures due to invalid tokens),
    // render fallback or redirect
    console.error('AuthErrorBoundary caught error:', error);
    
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Clear auth cookies and redirect
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    
    redirect('/');
  }
}