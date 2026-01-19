// lib/api/shopApi.ts
import apiClient from './apiClient';

export interface ShopProfile {
  _id: string;
  shopName: string;
  description: string;
  category: string;
  logo: string;
  coverImage: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  businessHours: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };
  deliveryOptions: {
    deliveryAvailable: boolean;
    pickupAvailable: boolean;
    deliveryRadius: number;
    deliveryFee: number;
    minOrderAmount: number;
  };
  status: 'open' | 'closed' | 'busy';
  verificationStatus: 'verified' | 'pending' | 'unverified';
  owner?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateShopData {
  shopName: string;
  description: string;
  category: string;
  logo?: string;
  coverImage?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  businessHours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  deliveryOptions?: {
    deliveryAvailable?: boolean;
    pickupAvailable?: boolean;
    deliveryRadius?: number;
    deliveryFee?: number;
    minOrderAmount?: number;
  };
}

export interface UpdateShopData {
  shopName?: string;
  description?: string;
  category?: string;
  logo?: string;
  coverImage?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  businessHours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  deliveryOptions?: {
    deliveryAvailable?: boolean;
    pickupAvailable?: boolean;
    deliveryRadius?: number;
    deliveryFee?: number;
    minOrderAmount?: number;
  };
  status?: 'open' | 'closed' | 'busy';
  verificationStatus?: 'verified' | 'pending' | 'unverified';
}

export interface BaseResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ShopListResponse {
  shops: ShopProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class ShopApi {
  // Get current user's shop
  async getMyShop(): Promise<BaseResponse<ShopProfile>> {
    try {
      console.log('🏪 ShopApi: Getting my shop...');
      const response = await apiClient.get('/shops/my-shop');
      console.log('🏪 ShopApi: My shop response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🏪 ShopApi: Get my shop error:', error);
      throw error;
    }
  }

  // Create shop
  async createShop(data: CreateShopData): Promise<BaseResponse<ShopProfile>> {
    try {
      console.log('🏪 ShopApi: Creating shop...', data);
      const response = await apiClient.post('/shops', data);
      console.log('🏪 ShopApi: Create shop response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🏪 ShopApi: Create shop error:', error);
      throw error;
    }
  }

  // Update shop
  async updateShop(shopId: string, data: UpdateShopData): Promise<BaseResponse<ShopProfile>> {
    try {
      console.log('🏪 ShopApi: Updating shop...', { shopId, data });
      const response = await apiClient.put(`/shops/${shopId}`, data);
      console.log('🏪 ShopApi: Update shop response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🏪 ShopApi: Update shop error:', error);
      throw error;
    }
  }

  // Upload shop images
  async uploadShopImages(shopId: string, images: {
    logo?: string;
    coverImage?: string;
    gallery?: string[];
  }): Promise<BaseResponse<ShopProfile>> {
    try {
      console.log('🏪 ShopApi: Uploading shop images...', { shopId, images });
      const response = await apiClient.post(`/shops/${shopId}/images`, images);
      console.log('🏪 ShopApi: Upload images response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🏪 ShopApi: Upload images error:', error);
      throw error;
    }
  }

  // Update shop status
  async updateShopStatus(shopId: string, status: 'open' | 'closed' | 'busy'): Promise<BaseResponse<ShopProfile>> {
    try {
      console.log('🏪 ShopApi: Updating shop status...', { shopId, status });
      const response = await apiClient.put(`/shops/${shopId}/status`, { status });
      console.log('🏪 ShopApi: Update status response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🏪 ShopApi: Update status error:', error);
      throw error;
    }
  }

  // Delete shop
  async deleteShop(shopId: string): Promise<BaseResponse<{ message: string }>> {
    try {
      console.log('🏪 ShopApi: Deleting shop...', shopId);
      const response = await apiClient.delete(`/shops/${shopId}`);
      console.log('🏪 ShopApi: Delete shop response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🏪 ShopApi: Delete shop error:', error);
      throw error;
    }
  }

  // Get shop by ID (public)
  async getShopById(shopId: string): Promise<BaseResponse<ShopProfile>> {
    try {
      console.log('🏪 ShopApi: Getting shop by ID...', shopId);
      const response = await apiClient.get(`/shops/${shopId}`);
      console.log('🏪 ShopApi: Get shop by ID response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🏪 ShopApi: Get shop by ID error:', error);
      throw error;
    }
  }

  // Get all shops (public with pagination)
  async getAllShops(params?: {
    page?: number;
    limit?: number;
    category?: string;
    city?: string;
    search?: string;
    featured?: boolean;
    minRating?: number;
  }): Promise<BaseResponse<ShopListResponse>> {
    try {
      console.log('🏪 ShopApi: Getting all shops...', params);
      const response = await apiClient.get('/shops', { params });
      console.log('🏪 ShopApi: All shops response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🏪 ShopApi: Get all shops error:', error);
      throw error;
    }
  }

  // Get shop statistics
  async getShopStats(shopId: string): Promise<BaseResponse<{
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
  }>> {
    try {
      console.log('🏪 ShopApi: Getting shop stats...', shopId);
      const response = await apiClient.get(`/shops/${shopId}/stats`);
      console.log('🏪 ShopApi: Shop stats response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🏪 ShopApi: Get shop stats error:', error);
      throw error;
    }
  }
}

export const shopApi = new ShopApi();