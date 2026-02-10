// lib/hooks/useProfile.ts
import { useState, useCallback, useEffect } from 'react';

// Address interface
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

// Business Address interface
export interface BusinessAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

// Vendor Profile interface
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
  address?: Address;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  vendorProfile?: VendorProfile;
  // Additional fields at root level for vendors
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
  address?: Address | string;
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

interface UseProfileReturn {
  // Profile Data
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;

  // Actions
  getProfile: () => Promise<{ success: boolean; data?: UserProfile; error?: string }>;
  updateProfile: (data: UpdateProfileData) => Promise<{ success: boolean; data?: UserProfile; error?: string }>;
  uploadAvatar: (imageUrl: string) => Promise<{ success: boolean; avatar?: string; error?: string }>;
  changePassword: (data: ChangePasswordData) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;

  // Helper functions
  formatAddress: (address?: Address | string) => string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://olament-backend-2.onrender.com/api';
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://olament-backend-2.onrender.com/api';

export const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get auth token
  const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    // Check all possible token keys (same order as AuthProvider)
    return localStorage.getItem('authToken') ||
           localStorage.getItem('accessToken') ||
           localStorage.getItem('token');
  }
  return null;
};

  // Helper function to format address for display
  const formatAddress = useCallback((address?: Address | string): string => {
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
  }, []);

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  // Get user profile
  const getProfile = useCallback(async (): Promise<{ success: boolean; data?: UserProfile; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('👤 useProfile: Getting profile...');

      const token = getAuthToken();
      if (!token) {
        const errorMsg = 'No authentication token found. Please login.';
        setError(errorMsg);
        setLoading(false);
        return { success: false, error: errorMsg };
      }

      console.log('👤 useProfile: Fetching from:', `${API_URL}/auth/profile`);

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('👤 useProfile: Response status:', response.status);

      const data = await response.json();

      console.log('👤 useProfile: Response data:', data);

      if (!response.ok) {
        // Handle 401 Unauthorized (token expired)
        if (response.status === 401) {
          console.log('👤 useProfile: Token expired, clearing localStorage');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }

        const errorMsg = data.message || `HTTP error! status: ${response.status}`;
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (data.success) {
        console.log('👤 useProfile: Profile fetched successfully:', data.data?.email);

        // Store profile data
        const profileData: UserProfile = data.data || data.user;
        setProfile(profileData);

        // Also store in localStorage for quick access
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(profileData));
        }

        return { success: true, data: profileData };
      } else {
        const errorMsg = data.message || 'Failed to fetch profile';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👤 useProfile: Error fetching profile:', err);
      const errorMessage = err.message || 'Failed to fetch profile. Please check your connection.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (data: UpdateProfileData): Promise<{ success: boolean; data?: UserProfile; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('👤 useProfile: Updating profile...', data);

      const token = getAuthToken();
      if (!token) {
        const errorMsg = 'No authentication token found. Please login.';
        setError(errorMsg);
        setLoading(false);
        return { success: false, error: errorMsg };
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.message || `HTTP error! status: ${response.status}`;
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (result.success) {
        console.log('👤 useProfile: Profile updated successfully');

        const updatedProfile: UserProfile = result.data || result.user;
        setProfile(updatedProfile);

        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(updatedProfile));
        }

        return { success: true, data: updatedProfile };
      } else {
        const errorMsg = result.message || 'Failed to update profile';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👤 useProfile: Error updating profile:', err);
      const errorMessage = err.message || 'Failed to update profile. Please check your connection.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload avatar
  const uploadAvatar = useCallback(async (imageUrl: string): Promise<{ success: boolean; avatar?: string; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('👤 useProfile: Uploading avatar...', imageUrl);

      const token = getAuthToken();
      if (!token) {
        const errorMsg = 'No authentication token found. Please login.';
        setError(errorMsg);
        setLoading(false);
        return { success: false, error: errorMsg };
      }

      const response = await fetch(`${API_URL}/auth/profile/avatar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatar: imageUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.message || `HTTP error! status: ${response.status}`;
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (result.success) {
        console.log('👤 useProfile: Avatar uploaded successfully');

        // Update profile with new avatar
        if (profile) {
          const updatedProfile = { ...profile, avatar: result.data?.avatar || imageUrl };
          setProfile(updatedProfile);

          // Update localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(updatedProfile));
          }
        }

        return { success: true, avatar: result.data?.avatar || imageUrl };
      } else {
        const errorMsg = result.message || 'Failed to upload avatar';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👤 useProfile: Error uploading avatar:', err);
      const errorMessage = err.message || 'Failed to upload avatar. Please check your connection.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // Change password
  const changePassword = useCallback(async (data: ChangePasswordData): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('👤 useProfile: Changing password...');

      const token = getAuthToken();
      if (!token) {
        const errorMsg = 'No authentication token found. Please login.';
        setError(errorMsg);
        setLoading(false);
        return { success: false, error: errorMsg };
      }

      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.message || `HTTP error! status: ${response.status}`;
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (result.success) {
        console.log('👤 useProfile: Password changed successfully');
        return { success: true };
      } else {
        const errorMsg = result.message || 'Failed to change password';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👤 useProfile: Error changing password:', err);
      const errorMessage = err.message || 'Failed to change password. Please check your connection.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Load profile on mount - only runs once
  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const token = getAuthToken();
      if (token && isMounted) {
        await getProfile();
      } else if (isMounted) {
        setLoading(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  return {
    profile,
    loading,
    error,
    getProfile,
    updateProfile,
    uploadAvatar,
    changePassword,
    clearError,
    formatAddress,
  };
};