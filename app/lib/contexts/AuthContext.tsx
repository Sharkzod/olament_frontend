// app/lib/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

import { Frown } from 'lucide-react';
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  profile: {
    avatarUrl: string;
    shopName?: string;
    address?: string;
  };
  emailVerified: boolean;
  phoneVerified: boolean;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData & { rememberMe?: boolean }) => Promise<{ success: boolean; error?: string; message?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      console.log('🔄 AuthContext: Initializing authentication...');
      setIsLoading(true);
      
      try {
        const userData = await initializeAuth();
        console.log('🔄 AuthContext: Initialize result:', userData ? 'User found' : 'No user');
        
        if (userData) {
          setUser(userData);
          console.log('✅ AuthContext: User authenticated successfully');
        } else {
          console.log('ℹ️ AuthContext: No authenticated user found');
        }
      } catch (error) {
        console.error('❌ AuthContext: Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginData & { rememberMe?: boolean }) => {
    console.log('🔄 AuthContext: Starting login process...');
    setIsLoading(true);
    
    try {
      console.log('📝 AuthContext: Calling API login with email:', data.email);
      
      const result = await apiLogin({
        email: data.email,
        password: data.password
      });
      
      console.log('📝 AuthContext: API login result:', result);
      
      if (result.success && result.user) {
        setUser(result.user);
        console.log('✅ AuthContext: Login successful, user set in context');
        
        // Store remember me preference
        if (data.rememberMe && typeof window !== 'undefined') {
          localStorage.setItem('rememberMe', 'true');
        }
        
        return {
          success: true,
          message: result.message
        };
      } else {
        console.error('❌ AuthContext: Login failed:', result.error);
        return {
          success: false,
          error: result.error || 'Login failed'
        };
      }
    } catch (error: any) {
      console.error('❌ AuthContext: Login error caught:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    setIsLoading(true);
    
    try {
      const result = await apiSignup(data);
      
      if (result.success && result.user) {
        setUser(result.user);
        return {
          success: true,
          message: result.message
        };
      } else {
        return {
          success: false,
          error: result.error || 'Signup failed'
        };
      }
    } catch (error: any) {
      console.error('❌ AuthContext: Signup error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      await apiLogout();
      setUser(null);
      
      // Clear all storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      router.push('/login');
    } catch (error) {
      console.error('❌ AuthContext: Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};