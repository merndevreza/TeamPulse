'use client';

import { useTokenRefresh } from '@/hooks/useTokenRefresh';

/**
 * Client component that handles automatic token refresh when user returns to the tab.
 * This should be placed at the root layout level, inside AuthProvider.
 */
export const TokenRefreshHandler: React.FC = () => {
  useTokenRefresh();
  return null;
};
