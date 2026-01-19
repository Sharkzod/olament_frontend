// lib/api/userApi.ts
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

class UserApi {
  // Get current user profile
  async getProfile(): Promise<{ success: boolean; data: UserProfile; message?: string }> {
    try {
      console.log('👤 UserApi: Getting user profile...');
      const response = await apiClient.get('/users/profile');
      console.log('👤 UserApi: Profile response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('👤 UserApi: Profile fetch error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(data: UpdateProfileData): Promise<{ success: boolean; data: UserProfile; token?: string }> {
    try {
      console.log('👤 UserApi: Updating profile...', data);
      const response = await apiClient.put('/users/profile', data);
      console.log('👤 UserApi: Update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('👤 UserApi: Update profile error:', error);
      throw error;
    }
  }

  // Upload profile avatar
  async uploadAvatar(imageUrl: string): Promise<{ success: boolean; data: { avatar: string } }> {
    try {
      console.log('👤 UserApi: Uploading avatar...');
      const response = await apiClient.post('/users/profile/avatar', { imageUrl });
      console.log('👤 UserApi: Avatar upload response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('👤 UserApi: Avatar upload error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('👤 UserApi: Changing password...');
      const response = await apiClient.put('/users/change-password', {
        currentPassword,
        newPassword
      });
      console.log('👤 UserApi: Password change response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('👤 UserApi: Password change error:', error);
      throw error;
    }
  }
}

export const userApi = new UserApi();