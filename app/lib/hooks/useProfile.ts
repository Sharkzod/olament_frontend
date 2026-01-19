// lib/hooks/useProfile.ts
import { useState, useCallback } from 'react';
import { profileApi, UserProfile, UpdateProfileData, ChangePasswordData } from '../api/profileApi';

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
}

export const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get user profile
  const getProfile = useCallback(async (): Promise<{ success: boolean; data?: UserProfile; error?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('👤 useProfile: Getting profile...');
      const response = await profileApi.getProfile();
      
      if (response.success) {
        console.log('👤 useProfile: Profile fetched successfully:', response.data.email);
        setProfile(response.data);
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.message || 'Failed to fetch profile';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👤 useProfile: Error fetching profile:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch profile';
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
      const response = await profileApi.updateProfile(data);
      
      if (response.success) {
        console.log('👤 useProfile: Profile updated successfully');
        setProfile(response.data);
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.message || 'Failed to update profile';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👤 useProfile: Error updating profile:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
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
      console.log('👤 useProfile: Uploading avatar...');
      const response = await profileApi.uploadAvatar(imageUrl);
      
      if (response.success) {
        console.log('👤 useProfile: Avatar uploaded successfully');
        // Update profile with new avatar
        if (profile) {
          const updatedProfile = { ...profile, avatar: response.data.avatar };
          setProfile(updatedProfile);
        }
        return { success: true, avatar: response.data.avatar };
      } else {
        const errorMsg = response.message || 'Failed to upload avatar';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👤 useProfile: Error uploading avatar:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to upload avatar';
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
      const response = await profileApi.changePassword(data);
      
      if (response.success) {
        console.log('👤 useProfile: Password changed successfully');
        return { success: true };
      } else {
        const errorMsg = response.message || 'Failed to change password';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👤 useProfile: Error changing password:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to change password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    profile,
    loading,
    error,
    getProfile,
    updateProfile,
    uploadAvatar,
    changePassword,
  };
};