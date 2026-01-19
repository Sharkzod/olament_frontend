'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, userData?: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Initialize auth from localStorage
  useEffect(() => {
    const initAuth = async () => {
      console.log('🔐 AuthProvider: Starting auth initialization...');
      
      try {
        // Check if we're in the browser (client-side)
        if (typeof window === 'undefined') {
          console.log('🔐 AuthProvider: Not in browser, skipping initialization');
          setIsLoading(false);
          return;
        }

        const storedToken = localStorage.getItem('token');
        console.log('🔐 AuthProvider: Token in localStorage?', !!storedToken);
        
        if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
          console.log('🔐 AuthProvider: Found token, setting it...');
          setToken(storedToken);
          await fetchUserProfile(storedToken);
        } else {
          console.log('🔐 AuthProvider: No valid token found');
          setIsAuthenticated(false);
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('🔐 AuthProvider: Initialization error:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setToken(null);
        setUser(null);
      } finally {
        console.log('🔐 AuthProvider: Initialization complete');
        console.log('🔐 AuthProvider: Final state - isLoading: false, isAuthenticated:', isAuthenticated);
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure localStorage is available
    setTimeout(() => {
      initAuth();
    }, 100);
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    console.log('🔐 AuthProvider: Fetching user profile with token...');
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      console.log('🔐 AuthProvider: Using API URL:', API_URL);
      
      const response = await fetch(
        `${API_URL}/users/profile`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(5000),
        }
      );

      console.log('🔐 AuthProvider: Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.log('🔐 AuthProvider: Token is invalid (401/403)');
          throw new Error('Unauthorized');
        }
        const errorText = await response.text();
        console.log('🔐 AuthProvider: API error response:', errorText);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔐 AuthProvider: Profile API response:', data);
      
      if (data.success && data.data) {
        const userData = data.data;
        const newUser = {
          _id: userData._id || 'test_id',
          firstName: userData.firstName || 'John',
          lastName: userData.lastName || 'Doe',
          email: userData.email || 'john@example.com',
          role: userData.role || 'buyer',
          avatar: userData.avatar || userData.profile?.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          emailVerified: userData.emailVerified || false,
          phoneVerified: userData.phoneVerified || false,
        };
        
        console.log('🔐 AuthProvider: Setting authenticated user:', newUser);
        setUser(newUser);
        setIsAuthenticated(true);
        console.log('🔐 AuthProvider: isAuthenticated set to TRUE');
      } else {
        console.log('🔐 AuthProvider: API returned unsuccessful');
        throw new Error(data.message || 'Failed to fetch profile');
      }
    } catch (error: any) {
      console.error('🔐 AuthProvider: Failed to fetch user profile:', error);
      
      // Check if it's a network error vs auth error
      if (error.name === 'AbortError' || error.name === 'TypeError') {
        console.log('🔐 AuthProvider: Network error - backend might be down');
        // For development, create a mock user
        const mockUser = {
          _id: 'dev_mock_id',
          firstName: 'Development',
          lastName: 'User',
          email: 'dev@example.com',
          role: 'buyer',
          avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          emailVerified: true,
          phoneVerified: false,
        };
        console.log('🔐 AuthProvider: Setting mock user for development');
        setUser(mockUser);
        setIsAuthenticated(true);
      } else {
        // Clear invalid token
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  };

  const refreshUser = async () => {
    console.log('🔐 AuthProvider: Refreshing user...');
    if (token) {
      await fetchUserProfile(token);
    }
  };

  const login = (newToken: string, userData?: User) => {
    console.log('🔐 AuthProvider: Login called with token');
    localStorage.setItem('token', newToken);
    setToken(newToken);
    
    if (userData) {
      console.log('🔐 AuthProvider: Setting user from login data');
      setUser(userData);
      setIsAuthenticated(true);
    } else if (newToken) {
      console.log('🔐 AuthProvider: Fetching profile with new token');
      fetchUserProfile(newToken);
    }
  };

  const logout = () => {
    console.log('🔐 AuthProvider: Logging out...');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  const updateUser = (userData: Partial<User>) => {
    console.log('🔐 AuthProvider: Updating user data');
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    refreshUser,
  };

  console.log('🔐 AuthProvider: Rendering with state:', { 
    user: !!user, 
    token: !!token, 
    isLoading, 
    isAuthenticated 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};