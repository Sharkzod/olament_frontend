// hooks/useAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  login as apiLogin, 
  logout as apiLogout, 
  getCurrentUser, 
  initializeAuth,
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
  checkAuth: () => Promise<void>;
}

export function useAuth(): AuthHookReturn {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const userData = await initializeAuth();
        if (userData) {
          setUser(userData);
          console.log('✅ User authenticated on mount');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginData & { rememberMe?: boolean }) => {
    setIsLoading(true);
    try {
      console.log('🔄 useAuth: Attempting login...');
      const result = await apiLogin(data);
      
      if (result.success && result.user) {
        setUser(result.user);
        
        // Store remember me
        if (data.rememberMe && typeof window !== 'undefined') {
          localStorage.setItem('rememberMe', 'true');
        }
        
        console.log('✅ useAuth: Login successful');
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
  };

  const signup = async (data: SignupData) => {
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
};

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiLogout();
    } finally {
      setUser(null);
      setIsLoading(false);
      
      // Clear all storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      router.push('/login');
    }
  };

  const checkAuth = async () => {
    try {
      const result = await getCurrentUser();
      if (result.success) {
        setUser(result.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    checkAuth,
  };
}