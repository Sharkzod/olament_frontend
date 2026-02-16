// lib/hooks/useProfile.ts
import { useState, useCallback, useEffect } from 'react';
import apiClient from '../api/apiClient';

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

export const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const response = await apiClient.get('/auth/profile');

      console.log('👤 useProfile: Response received:', response.data);

      if (response.data.success) {
        console.log('👤 useProfile: Profile fetched successfully:', response.data.data?.email);
        
        // Store profile data
        const profileData: UserProfile = response.data.data || response.data.user;
        setProfile(profileData);

        // Also store in localStorage for quick access
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(profileData));
        }

        return { success: true, data: profileData };
      } else {
        const errorMsg = response.data.message || 'Failed to fetch profile';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👤 useProfile: Error fetching profile:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch profile. Please check your connection.';
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

      const response = await apiClient.put('/auth/profile', data);

      console.log('👤 useProfile: Update response:', response.data);

      if (response.data.success) {
        console.log('👤 useProfile: Profile updated successfully');
        
        const updatedProfile: UserProfile = response.data.data || response.data.user;
        setProfile(updatedProfile);

        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(updatedProfile));
        }

        return { success: true, data: updatedProfile };
      } else {
        const errorMsg = response.data.message || 'Failed to update profile';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👤 useProfile: Error updating profile:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile. Please check your connection.';
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

      const response = await apiClient.put('/auth/profile', { avatar: imageUrl });

      console.log('👤 useProfile: Avatar upload response:', response.data);

      if (response.data.success) {
        console.log('👤 useProfile: Avatar uploaded successfully');

        // Update profile with new avatar
        if (profile) {
          const updatedProfile = { 
            ...profile, 
            avatar: response.data.data?.avatar || imageUrl 
          };
          setProfile(updatedProfile);

          // Update localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(updatedProfile));
          }
        }

        return { success: true, avatar: response.data.data?.avatar || imageUrl };
      } else {
        const errorMsg = response.data.message || 'Failed to upload avatar';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👤 useProfile: Error uploading avatar:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to upload avatar. Please check your connection.';
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

      const response = await apiClient.put('/auth/change-password', data);

      console.log('👤 useProfile: Password change response:', response.data);

      if (response.data.success) {
        console.log('👤 useProfile: Password changed successfully');
        return { success: true };
      } else {
        const errorMsg = response.data.message || 'Failed to change password';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👤 useProfile: Error changing password:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to change password. Please check your connection.';
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
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken') || 
                       localStorage.getItem('accessToken') || 
                       localStorage.getItem('token');
        
        if (token && isMounted) {
          await getProfile();
        } else if (isMounted) {
          setLoading(false);
        }
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