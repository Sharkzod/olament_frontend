// lib/api/apiClient.ts
import axios from 'axios';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://olament-backend-2.onrender.com/api';

// Get token from localStorage
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('accessToken');
};

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 80000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token attached to request:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No token found for request');
    }
    
    // Don't set Content-Type for FormData (let browser set it)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token expiration (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          // Try to refresh token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          // Update tokens
          if (accessToken && typeof window !== 'undefined') {
            localStorage.setItem('authToken', accessToken);
            localStorage.setItem('accessToken', accessToken);
          }
          
          if (newRefreshToken && typeof window !== 'undefined') {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear tokens and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper functions
export const setAuthToken = (token: string | null) => {
  if (token && typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
    localStorage.setItem('accessToken', token);
  } else if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('accessToken');
  }
};

export const clearAuthTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

export default apiClient;