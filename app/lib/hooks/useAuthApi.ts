// hooks/useAuth.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  login as apiLogin, 
  logout as apiLogout, 
  getCurrentUser, 
  signup as apiSignup,
  type LoginData,
  type SignupData
} from '../api/authApi';

interface AuthHookReturn {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData & { rememberMe?: boolean }) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<{ success: boolean; user?: any }>; // Updated
  isInitialized: boolean;
}


export function useAuth(): AuthHookReturn {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  
  // Prevent multiple simultaneous initialization attempts
  const initializingRef = useRef(false);
  const mountedRef = useRef(false);

  // Check token validity - memoized with useCallback
  const validateExistingToken = useCallback(async () => {
    try {
      console.log('🔄 useAuth: validateExistingToken - checking token...');
      
      // First, check if we have a token
      const authToken = typeof window !== 'undefined' 
        ? localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
        : null;
      
      if (!authToken) {
        console.log('🚫 useAuth: No token found');
        return null;
      }
      
      console.log('🔑 useAuth: Token found, attempting to validate...');
      
      // Try getCurrentUser directly
      const result = await getCurrentUser();
      
      if (result.success && result.user) {
        console.log('✅ useAuth: Token validated successfully, user:', result.user._id);
        return result.user;
      } else {
        console.log('❌ useAuth: Token validation failed:', result.error);
        return null;
      }
    } catch (error) {
      console.error('🔥 useAuth: Token validation error:', error);
      return null;
    }
  }, []);

  // Initialize auth on mount - with improved error handling and duplicate prevention
  useEffect(() => {
    // Prevent running in SSR or if already initializing
    if (typeof window === 'undefined' || initializingRef.current) {
      return;
    }

    const initAuth = async () => {
      initializingRef.current = true;
      setIsLoading(true);
      
      try {
        console.log('🔄 useAuth: Starting initialization...');
        
        // Check for existing valid token
        const validUser = await validateExistingToken();
        
        // Only update state if component is still mounted
        if (!mountedRef.current) return;
        
        if (validUser) {
          console.log('✅ useAuth: Setting user from validated token');
          setUser(validUser);
        } else {
          console.log('🚫 useAuth: No valid token/user found');
          setUser(null);
          
          // Clear potentially invalid tokens
          const hadToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
          if (hadToken) {
            console.log('🧹 useAuth: Clearing invalid/stale tokens');
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
          }
        }
      } catch (error: any) {
        console.error('🔥 useAuth: Auth initialization error:', error);
        if (mountedRef.current) {
          setUser(null);
        }
      } finally {
        if (mountedRef.current) {
          console.log('🏁 useAuth: Initialization complete');
          setIsInitialized(true);
          setIsLoading(false);
        }
        initializingRef.current = false;
      }
    };

    mountedRef.current = true;
    initAuth();
    
    // Set up token check on storage changes (for multiple tabs)
    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key === 'authToken' || e.key === 'refreshToken') {
        console.log('🔄 useAuth: Token storage changed, revalidating...');
        const validUser = await validateExistingToken();
        
        if (!mountedRef.current) return;
        
        if (validUser && !user) {
          setUser(validUser);
        } else if (!validUser && user) {
          setUser(null);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      mountedRef.current = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty deps - only run once on mount

  const login = useCallback(async (data: LoginData & { rememberMe?: boolean }) => {
    setIsLoading(true);
    try {
      console.log('🔄 useAuth: Attempting login...');
      const result = await apiLogin(data);
      
      if (result.success && result.user) {
        console.log('✅ useAuth: Login successful, setting user:', result.user._id);
        setUser(result.user);
        
        // Store remember me
        if (data.rememberMe && typeof window !== 'undefined') {
          localStorage.setItem('rememberMe', 'true');
        }
        
        return { success: true };
      } else {
        console.error('❌ useAuth: Login failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error('❌ useAuth: Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    setIsLoading(true);
    try {
      console.log('🔄 useAuth: Attempting signup...');
      
      // Prepare data for backend
      const signupData = {
        ...data,
        email: data.email.trim().toLowerCase(),
      };

      const result = await apiSignup(signupData);
      
      if (result.success && result.user) {
        setUser(result.user);
        
        // Store additional user data
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        
        console.log('✅ useAuth: Signup successful');
        return { success: true, data: result };
      } else {
        console.error('❌ useAuth: Signup failed:', result.error);
        return { 
          success: false, 
          error: result.error,
          errors: result.errors 
        };
      }
    } catch (error: any) {
      console.error('❌ useAuth: Signup error:', error);
      return { 
        success: false, 
        error: error.message || 'Signup failed' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('🔄 useAuth: Logging out...');
      await apiLogout();
    } finally {
      console.log('✅ useAuth: Logout complete');
      setUser(null);
      setIsLoading(false);
      
      // Clear all storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      router.push('/login');
    }
  }, [router]);

  const checkAuth = useCallback(async () => {
    try {
      console.log('🔄 useAuth: Manually checking auth...');
      const result = await getCurrentUser();
      if (result.success && result.user) {
        console.log('✅ useAuth: User authenticated:', result.user._id);
        setUser(result.user);
        return { success: true, user: result.user };
      } else {
        console.log('❌ useAuth: No valid session');
        setUser(null);
        return { success: false };
      }
    } catch (error) {
      console.error('🔥 useAuth: Check auth error:', error);
      setUser(null);
      return { success: false };
    }
  }, []);

  return {
    user,
    isLoading,
    isInitialized,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    checkAuth,
  };
}