// lib/utils/cookieStorage.ts
import { cookies } from 'next/headers';

// Cookie keys
export const COOKIE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data'
} as const;

// Set auth token cookie
export async function setAuthToken(token: string, options?: {
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(COOKIE_KEYS.AUTH_TOKEN, token, {
    httpOnly: options?.httpOnly ?? true,
    secure: options?.secure ?? process.env.NODE_ENV === 'production',
    sameSite: options?.sameSite ?? 'strict',
    maxAge: options?.maxAge ?? 60 * 60 * 24 * 7, // 1 week default
    path: '/',
  });
  
  console.log('🍪 CookieStorage: Auth token set');
}

// Get auth token (server-side only)
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_KEYS.AUTH_TOKEN)?.value;
  
  if (token && isValidToken(token)) {
    return token;
  }
  
  return null;
}

// Set refresh token
export async function setRefreshToken(token: string, options?: {
  maxAge?: number;
}): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(COOKIE_KEYS.REFRESH_TOKEN, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: options?.maxAge ?? 60 * 60 * 24 * 30, // 30 days for refresh token
    path: '/',
  });
}

// Get refresh token
export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_KEYS.REFRESH_TOKEN)?.value || null;
}

// Set user data (can be non-httpOnly for client access)
export async function setUserData(user: any): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(COOKIE_KEYS.USER_DATA, JSON.stringify(user), {
    httpOnly: false, // Allow client-side access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

// Get user data
export async function getUserData(): Promise<any | null> {
  const cookieStore = await cookies();
  const userData = cookieStore.get(COOKIE_KEYS.USER_DATA)?.value;
  
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }
  
  return null;
}

// Clear all auth cookies
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  
  Object.values(COOKIE_KEYS).forEach(key => {
    cookieStore.delete(key);
  });
  
  console.log('🍪 CookieStorage: All auth cookies cleared');
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}

// Helper: Validate token format
function isValidToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  
  // Basic JWT validation (should have 3 parts)
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  return true;
}