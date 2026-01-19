// lib/api/profileApi.ts
import apiClient from './apiClient';

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  avatar: string;
  profile?: {
    shopName?: string;
    address?: string;
    avatarUrl?: string;
  };
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  profile?: {
    shopName?: string;
    address?: string;
    avatarUrl?: string;
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface BaseResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

class ProfileApi {
  // Get current user profile
  async getProfile(): Promise<BaseResponse<UserProfile>> {
    try {
      console.log('👤 ProfileApi: Getting user profile...');
      const response = await apiClient.get('/users/profile');
      console.log('👤 ProfileApi: Profile response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('👤 ProfileApi: Profile fetch error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(data: UpdateProfileData): Promise<BaseResponse<UserProfile>> {
    try {
      console.log('👤 ProfileApi: Updating profile...', data);
      const response = await apiClient.put('/users/profile', data);
      console.log('👤 ProfileApi: Update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('👤 ProfileApi: Update profile error:', error);
      throw error;
    }
  }

  // Upload profile avatar
  async uploadAvatar(imageUrl: string): Promise<BaseResponse<{ avatar: string }>> {
    try {
      console.log('👤 ProfileApi: Uploading avatar...');
      const response = await apiClient.post('/users/profile/avatar', { imageUrl });
      console.log('👤 ProfileApi: Avatar upload response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('👤 ProfileApi: Avatar upload error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(data: ChangePasswordData): Promise<BaseResponse<null>> {
    try {
      console.log('👤 ProfileApi: Changing password...');
      const response = await apiClient.put('/users/change-password', data);
      console.log('👤 ProfileApi: Password change response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('👤 ProfileApi: Password change error:', error);
      throw error;
    }
  }
}

export const profileApi = new ProfileApi();