'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { useRouter } from 'next/navigation';
import { ACCESS_TOKEN_MAX_AGE } from '@/utils/token-cache';

/**
 * Hook that handles token refresh when the user returns to the tab after being away.
 * This addresses the issue where the access token expires while the tab is inactive,
 * and the middleware doesn't get a chance to refresh it proactively.
 */
export const useTokenRefresh = () => {
  const { isAuthenticated, clearUser } = useAuth();
  const router = useRouter();
  const lastActivityRef = useRef<number>(Date.now());
  const isRefreshingRef = useRef<boolean>(false);

  // Track user activity
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Handle visibility change - when user returns to tab
  const handleVisibilityChange = useCallback(async () => { 
   
    if (document.visibilityState !== 'visible') {
      return;
    }

    // Only proceed if user is authenticated
    if (!isAuthenticated) {
      return;
    }

    // Prevent concurrent refresh attempts
    if (isRefreshingRef.current) {
      return;
    }

    const timeSinceLastActivity = Date.now() - lastActivityRef.current;
    const TOKEN_EXPIRY_MS = ACCESS_TOKEN_MAX_AGE * 1000; // 30 minutes in ms
    const BUFFER_MS = 5 * 60 * 1000; // 5 minute buffer

    // If user has been away for more than 25 minutes, proactively trigger a refresh
    // by making a lightweight request that will go through middleware
    if (timeSinceLastActivity > (TOKEN_EXPIRY_MS - BUFFER_MS)) {
      isRefreshingRef.current = true;
      
      try { 
        // Trigger a navigation to refresh token through middleware
        // Using router.refresh() will cause a soft navigation that triggers middleware
        router.refresh();
        
        // Update activity timestamp after successful refresh
        lastActivityRef.current = Date.now();
      } catch (error) {
        console.error('Token refresh on visibility change failed:', error);
        // If refresh fails, clear auth state
        clearUser();
        router.replace('/');
      } finally {
        isRefreshingRef.current = false;
      }
    }
  }, [isAuthenticated, clearUser, router]);

  useEffect(() => {
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Track user activity to know when they were last active
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [handleVisibilityChange, updateActivity]);
};
