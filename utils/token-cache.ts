import { jwtDecode, JwtPayload } from 'jwt-decode';
import { logger } from './logger';

// Token expiry constants (in seconds) - Single Source of Truth
export const ACCESS_TOKEN_MAX_AGE = 60 * 30; // 30 minutes
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
export const TOKEN_REFRESH_BUFFER = 60 * 2; // 2 minutes - proactively refresh tokens expiring within this time
export const isProduction = process.env.NODE_ENV === 'production';

// Extended token interface that includes common fields
export interface DecodedToken extends JwtPayload {
  role?: string;
  jti?: string;
  user_id?: string;
  email?: string;
  token_type?: string;
  [key: string]: unknown;
}

// Standardized validation result interface
export interface ValidationResult {
  isValid: boolean;
  decoded?: DecodedToken;
  role?: string;
  userId?: number;
  email?: string;
  jti?: string;
  message?: string;
}

// Cache for decoded tokens to avoid repeated JWT decoding
export const tokenCache = new Map<string, { decoded: DecodedToken; timestamp: number }>();
const CACHE_TTL = 60 * 1000 * 5; // 5 minutes cache

// Helper function to get current time in seconds
export function getCurrentTimeSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

// Generate cache key for token 
function generateCacheKey(token: string): string {  
  return `token:${token}`;
}

/**
 * Extract user information from decoded token 
 */
function extractUserInfoFromDecoded(decoded: DecodedToken): {
  userId?: number;
  role?: string;
  email?: string;
  jti?: string;
  error?: string;
} {
  const role = decoded.role;
  const email = decoded.email;
  const jti = decoded.jti;
  
  let userId: number | undefined;
  if (decoded.user_id !== undefined) {
    const parsedUserId = Number(decoded.user_id);
    if (!Number.isNaN(parsedUserId)) {
      userId = parsedUserId;
    } else {
      return { error: "Invalid user_id in token" };
    }
  }
  
  return { userId, role, email, jti };
}

// Clean up expired cache entries
function cleanupCache(now: number): void {
  const currentTimeSeconds = Math.floor(now / 1000);
  
  // Remove entries that are:
  // 1. Older than CACHE_TTL
  // 2. Tokens that have already expired (based on exp claim)
  const entriesToRemove = Array.from(tokenCache.entries())
    .filter(([, value]) => {
      const isCacheStale = (now - value.timestamp) > CACHE_TTL;
      const isTokenExpired = value.decoded.exp ? value.decoded.exp <= currentTimeSeconds : false;
      return isCacheStale || isTokenExpired;
    });
  
  entriesToRemove.forEach(([key]) => tokenCache.delete(key));

  // If still too large, remove oldest entries
  if (tokenCache.size > 100) {
    const sortedEntries = Array.from(tokenCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Keep only the 50 most recent entries
    const toRemove = sortedEntries.slice(0, tokenCache.size - 50);
    toRemove.forEach(([key]) => tokenCache.delete(key));
  }
}

/**
 * Combined decode and validation function with proper cache lookup 
 */
export async function validateAndCacheToken(token: string | undefined): Promise<ValidationResult> { 
  
  try {  
    if (!token) {
      return {
        isValid: false,
        message: "No token provided"
      };
    }

    const cacheKey = generateCacheKey(token);
    const now = Date.now();
    const currentTime = getCurrentTimeSeconds();
    
    // Check cache first - avoid any decoding if cached and recent
    const cached = tokenCache.get(cacheKey); 
    
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      const isValid = cached.decoded.exp ? cached.decoded.exp > currentTime : false;
      
      if (!isValid) {
        // Don't cache expired tokens - remove them
        tokenCache.delete(cacheKey);
        return {
          isValid: false,
          decoded: cached.decoded,
          message: "Token expired"
        };
      }

      // Extract user information using helper
      const userInfo = extractUserInfoFromDecoded(cached.decoded);
      if (userInfo.error) {
        return {
          isValid: false,
          decoded: cached.decoded,
          message: userInfo.error
        };
      }

      return { 
        isValid: true, 
        decoded: cached.decoded,
        role: userInfo.role,
        userId: userInfo.userId,
        email: userInfo.email,
        jti: userInfo.jti,
        message: "Token validation successful (cached)"
      };
    }
    
    // Cache miss - decode the token only once
    const decoded = jwtDecode<DecodedToken>(token); 
    
    // Check if token is expired
    const isValid = decoded.exp ? decoded.exp > currentTime : false;
    
    if (!isValid) {
      // Don't cache expired tokens
      return {
        isValid: false,
        decoded,
        message: "Token expired"
      };
    }

    // Extract user information using helper
    const userInfo = extractUserInfoFromDecoded(decoded);
    if (userInfo.error) {
      return {
        isValid: false,
        decoded,
        message: userInfo.error
      };
    }
        
    // Cache the valid result only
    tokenCache.set(cacheKey, { decoded, timestamp: now }); 
    
    // Run cleanup more frequently to remove expired tokens
    // This helps prevent stale tokens from accumulating
    if (tokenCache.size > 3) {
      cleanupCache(now);
    }
    
    return { 
      isValid: true, 
      decoded,
      role: userInfo.role,
      userId: userInfo.userId,
      email: userInfo.email,
      jti: userInfo.jti,
      message: "Token validation successful"
    };
  } catch (error) {
    logger.authError('validateAndCacheToken', 'Token validation failed', { error });
    return { 
      isValid: false,
      message: "Invalid token format"
    };
  }
}

/**
 * Validate token using cache 
 */
export async function isValidToken(token: string | undefined): Promise<boolean> {
  const result = await validateAndCacheToken(token);
  return result.isValid;
}

/**
 * Check if token needs proactive refresh (valid but expiring soon)
 * Returns true if token should be refreshed to prevent expiry during request
 */
export async function needsProactiveRefresh(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  
  const result = await validateAndCacheToken(token);
  if (!result.isValid || !result.decoded?.exp) return false;
  
  const currentTime = getCurrentTimeSeconds();
  const timeUntilExpiry = result.decoded.exp - currentTime;
  
  // Refresh if token expires within the buffer period
  return timeUntilExpiry <= TOKEN_REFRESH_BUFFER;
}

/**
 * Extract role from token using cache 
 */
export async function extractRoleFromToken(token: string | undefined): Promise<string | null> {
  const result = await validateAndCacheToken(token);
  return result.role || null;
}

/**
 * Get user ID from JWT token (using cache) 
 */
export async function getUserIdFromToken(token: string | undefined): Promise<number | null> {
  const validation = await validateAndCacheToken(token);
  return validation.userId || null;
}


/**
 * Clear cache entries for a specific token or all entries
 */
export function invalidateTokenCache(token?: string): void {
  if (token) {
    const cacheKey = generateCacheKey(token);
    tokenCache.delete(cacheKey);
  } else {
    // Clear all cache entries
    tokenCache.clear();
  }
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats(): { size: number; maxAge: number } {
  const now = Date.now();
  
  if (tokenCache.size === 0) {
    return {
      size: 0,
      maxAge: 0
    };
  }
  
  let oldestEntry = now;
  
  for (const [, value] of tokenCache.entries()) {
    if (value.timestamp < oldestEntry) {
      oldestEntry = value.timestamp;
    }
  }
  
  return {
    size: tokenCache.size,
    maxAge: now - oldestEntry
  };
}
export async function getUserInfoFromToken(token: string | undefined): Promise<{
  userId: number | null;
  email: string | null;
  role: string | null; 
  isValid: boolean;
}> {
  const validation = await validateAndCacheToken(token);
  
  if (!validation.isValid) {
    return { userId: null, email: null, role: null, isValid: false };
  }

  return {
    userId: validation.userId || null,
    email: validation.email || null,
    role: validation.role || null, 
    isValid: true
  };
}