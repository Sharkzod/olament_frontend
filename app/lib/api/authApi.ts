// lib/api/authApi.ts
import apiClient from './apiClient';
import { setAuthToken } from './apiClient';

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  agreeToTerms: boolean;
  agreeToMarketing?: boolean;
}

// Login function
export const login = async (data: LoginData) => {
  console.log('📝 authApi: Attempting login with email:', data.email);
  
  try {
    const response = await apiClient.post('/auth/login', data);
    console.log('📝 authApi: Login response received:', response.data);
    
    if (response.data.success && response.data.data?.accessToken) {
      setAuthToken(response.data.data.accessToken);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        console.log('✅ authApi: Tokens stored successfully');
      }
      
      return {
        success: true,
        user: response.data.data.user,
        token: response.data.data.accessToken,
        message: response.data.message
      };
    }
    
    return {
      success: false,
      error: response.data.message || 'Login failed',
      message: response.data.message
    };
    
  } catch (error: any) {
    console.error('❌ authApi: Login error:', error);
    
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.message || 'Login failed. Please check your credentials.',
        status: error.response.status
      };
    } else if (error.request) {
      return {
        success: false,
        error: 'Unable to connect to server. Please check your internet connection.'
      };
    } else {
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.'
      };
    }
  }
};

// Signup function
export const signup = async (data: SignupData) => {
  console.log('📝 authApi: Attempting signup with email:', data.email);
  
  try {
    const backendData = {
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      password: data.password,
      role: data.role,
      phone: data.phone || '',
      agreeToTerms: data.agreeToTerms,
      agreeToMarketing: data.agreeToMarketing || false
    };

    const response = await apiClient.post('/auth/register', backendData);
    console.log('📝 authApi: Signup response received:', response.data);
    
    if (response.data.success && response.data.token) {
      setAuthToken(response.data.token);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', response.data.refreshToken || '');
        console.log('✅ authApi: Tokens stored successfully');
      }
      
      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
        message: response.data.message
      };
    }
    
    return {
      success: false,
      error: response.data.message || 'Signup failed',
      message: response.data.message
    };
    
  } catch (error: any) {
    console.error('❌ authApi: Signup error:', error);
    
    if (error.response) {
      const errorMessage = error.response.data?.message || 
                          error.response.data?.errors?.[0]?.msg || 
                          'Signup failed';
      return {
        success: false,
        error: errorMessage,
        status: error.response.status,
        errors: error.response.data?.errors
      };
    } else if (error.request) {
      return {
        success: false,
        error: 'Unable to connect to server. Please check your internet connection.'
      };
    } else {
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.'
      };
    }
  }
};

// Logout function
export const logout = async (refreshToken?: string) => {
  const token = refreshToken || (typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null);
  
  try {
    const response = await apiClient.post('/auth/logout', { refreshToken: token });
    return response.data;
  } finally {
    // Always clear tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
};

// Get current user - FIXED VERSION
// lib/api/authApi.ts

// Get current user - CORRECTED for your backend structure
export const getCurrentUser = async () => {
  try {
    console.log('🔄 authApi: Fetching current user from /auth/profile');
    const response = await apiClient.get('/auth/profile');
    
    console.log('📦 authApi: Profile response:', {
      status: response.status,
      success: response.data?.success,
      hasUser: !!response.data?.user
    });
    
    // Your backend returns: { success: true, user: {...} }
    if (response.data?.success && response.data?.user) {
      const userData = response.data.user;
      
      console.log('✅ authApi: User authenticated:', {
        id: userData._id || userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role
      });
      
      return {
        success: true,
        user: userData
      };
    }
    
    console.warn('⚠️ authApi: No user data in response');
    return {
      success: false,
      error: 'No user data in response'
    };
    
  } catch (error: any) {
    console.error('❌ authApi: Get current user error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // If 401, token is invalid
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
      }
      
      return {
        success: false,
        error: 'Unauthorized - please login again'
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to get user information'
    };
  }
};

// Initialize auth (check existing tokens)
export const initializeAuth = async () => {
  const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  
  console.log('🔄 authApi: Initializing auth, tokens found:', {
    authToken: authToken ? 'Yes' : 'No',
    refreshToken: refreshToken ? 'Yes' : 'No'
  });
  
  if (!authToken && !refreshToken) {
    return null;
  }
  
  try {
    if (authToken) {
      setAuthToken(authToken);
      const userResponse = await getCurrentUser();
      
      if (userResponse.success && userResponse.user) {
        console.log('✅ authApi: User authenticated with existing token');
        return userResponse.user;
      } else {
        console.log('⚠️ authApi: Failed to get user with authToken:', userResponse.error);
      }
    }
    
    // If authToken failed or doesn't exist, try refresh token
    if (refreshToken) {
      console.log('🔄 authApi: Attempting token refresh');
      const response = await apiClient.post('/auth/refresh', { refreshToken });
      
      if (response.data.success && response.data.accessToken) {
        setAuthToken(response.data.accessToken);
        
        if (response.data.refreshToken && typeof window !== 'undefined') {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        const userResponse = await getCurrentUser();
        if (userResponse.success && userResponse.user) {
          console.log('✅ authApi: User authenticated with refresh token');
          return userResponse.user;
        }
      }
    }
  } catch (error: any) {
    console.error('❌ authApi: Auth initialization failed:', error);
    
    // Clear invalid tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
  
  return null;
};