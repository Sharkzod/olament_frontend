import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Address interface matching API response
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

// Business Address interface (can be same as Address)
export interface BusinessAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

// Vendor Profile interface matching API response
export interface VendorProfile {
  businessName: string;
  businessDescription: string;
  businessAddress: BusinessAddress;
  businessPhone: string;
  businessEmail: string;
  businessWebsite: string;
  taxId: string;
  businessRegistration: string;
  yearsInBusiness: number;
  businessLogo: string;
  shopIds: string[];
  shops: Array<{
    _id: string;
    name: string;
    category: string;
    rating: number;
    isVerified: boolean;
  }>;
}

// User Profile interface matching API response
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  address?: Address;  // Changed from string to Address object
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  vendorProfile?: VendorProfile;
  // Additional fields that appear at root level for vendors
  businessName?: string;
  businessDescription?: string;
  businessLogo?: string;
  shops?: Array<{
    _id: string;
    name: string;
    category: string;
    rating: number;
    isVerified: boolean;
  }>;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatar?: string;
  address?: Address | string;  // Can accept both formats
  businessInfo?: {
    businessName?: string;
    businessDescription?: string;
    businessAddress?: BusinessAddress | string;
    businessPhone?: string;
    businessEmail?: string;
    businessWebsite?: string;
    taxId?: string;
    businessRegistration?: string;
    yearsInBusiness?: number;
    businessLogo?: string;
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log('📡 apiClient: Token expired, clearing localStorage');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Profile API functions
export const profileApi = {
  // Get user profile
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      console.log('📡 profileApi: Fetching profile from:', `${API_URL}/users/profile`);

      const response = await apiClient.get('/users/profile');

      console.log('📡 profileApi: Response received:', response.data);

      return {
        success: true,
        data: response.data.data || response.data.user,
      };
    } catch (error: any) {
      console.error('📡 profileApi: Error fetching profile:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch profile',
      };
    }
  },

  // Update profile
  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<UserProfile>> {
    try {
      console.log('📡 profileApi: Updating profile with:', data);

      const response = await apiClient.put('/users/profile', data);

      return {
        success: true,
        data: response.data.data || response.data.user,
      };
    } catch (error: any) {
      console.error('📡 profileApi: Error updating profile:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update profile',
      };
    }
  },

  // Upload avatar
  async uploadAvatar(imageUrl: string): Promise<ApiResponse<{ avatar: string }>> {
    try {
      const response = await apiClient.put('/users/profile/avatar', { avatar: imageUrl });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('📡 profileApi: Error uploading avatar:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to upload avatar',
      };
    }
  },

  // Change password
  async changePassword(data: ChangePasswordData): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.put('/users/change-password', data);

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error('📡 profileApi: Error changing password:', error);

      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to change password',
      };
    }
  },

  // Helper function to format address for display
  formatAddress(address?: Address | string): string {
    if (!address) return 'No address provided';

    if (typeof address === 'string') return address;

    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country
    ].filter(Boolean);

    return parts.join(', ') || 'No address provided';
  },
};