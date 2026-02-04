// lib/api/shopApi.ts - FIXED VERSION
import apiClient from './apiClient';

// This matches what the API actually returns
export interface ShopApiResponse {
  _id: string;
  name: string;  // API uses 'name', not 'shopName'
  description: string;
  category: string;
  marketId?: {
    _id?: string;
    name?: string;
    city?: string;
    state?: string;
  };
  ownerId: string;
  address: string;
  contactPhone?: string;
  contactEmail?: string;
  isActive: boolean;
  rating: number;
  totalReviews: number;
  productsCount: number;
  imageUrl?: string;
  coverImageUrl?: string;
  tags?: string[];
  isVerified: boolean;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  features?: string[];
  minimumOrder?: number;
  deliveryFee?: number;
  deliveryRadius?: number;
  createdAt?: string;
  updatedAt?: string;
}

// This is what your component uses
export interface ShopProfile {
  _id: string;
  name: string;  // Changed from shopName to match API
  description: string;
  category: string;
  marketId?: {
    _id?: string;
    name?: string;
    city?: string;
    state?: string;
  };
  address: string;
  contactPhone?: string;
  contactEmail?: string;
  isActive: boolean;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  productsCount: number;
  imageUrl?: string;
  coverImageUrl?: string;
  tags?: string[];
  verificationStatus?: 'verified' | 'pending' | 'unverified';
  createdAt?: string;
  updatedAt?: string;
  // Optional fields for full profile
  logo?: string;
  coverImage?: string;
  status?: 'open' | 'closed' | 'busy';
  owner?: string;
}

export interface CreateShopData {
  name: string;  // Changed from shopName
  description: string;
  category: string;
  marketId?: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  imageUrl?: string;
  coverImageUrl?: string;
  tags?: string[];
  minimumOrder?: number;
  deliveryFee?: number;
  deliveryRadius?: number;
}

export interface UpdateShopData {
  name?: string;  // Changed from shopName
  description?: string;
  category?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  tags?: string[];
  isActive?: boolean;
  minimumOrder?: number;
  deliveryFee?: number;
  deliveryRadius?: number;
}

export interface BaseResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export interface ShopListResponse {
  shops: ShopProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class ShopApi {
  // Helper to map API response to ShopProfile
  private mapToShopProfile(apiShop: ShopApiResponse): ShopProfile {
    return {
      _id: apiShop._id,
      name: apiShop.name,
      description: apiShop.description,
      category: apiShop.category,
      marketId: apiShop.marketId,
      address: apiShop.address,
      contactPhone: apiShop.contactPhone,
      contactEmail: apiShop.contactEmail,
      isActive: apiShop.isActive,
      isVerified: apiShop.isVerified,
      rating: apiShop.rating,
      totalReviews: apiShop.totalReviews,
      productsCount: apiShop.productsCount,
      imageUrl: apiShop.imageUrl,
      coverImageUrl: apiShop.coverImageUrl,
      tags: apiShop.tags,
      verificationStatus: apiShop.verificationStatus,
      createdAt: apiShop.createdAt,
      updatedAt: apiShop.updatedAt,
    };
  }

  // Get current user's shops
  async getMyShops(): Promise<BaseResponse<{ shops: ShopProfile[]; total: number }>> {
    try {
      console.log('🏪 ShopApi: Getting my shops...');
      const response = await apiClient.get('/shops/my-shops');
      console.log('🏪 ShopApi: My shops response:', response.data);

      // Handle the actual API response structure
      const apiData = response.data;

      if (apiData.success && Array.isArray(apiData.data)) {
        const shops = apiData.data.map((shop: ShopApiResponse) => this.mapToShopProfile(shop));

        return {
          success: true,
          data: {
            shops,
            total: apiData.total || apiData.count || shops.length
          }
        };
      }

      return response.data;
    } catch (error: any) {
      console.error('🏪 ShopApi: Get my shops error:', error);
      throw error;
    }
  }

  // Create shop
  async createShop(data: CreateShopData): Promise<BaseResponse<ShopProfile>> {
    try {
      console.log('🏪 ShopApi: Creating shop...', data);
      const response = await apiClient.post('/shops', data);
      console.log('🏪 ShopApi: Create shop response:', response.data);

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: this.mapToShopProfile(response.data.data)
        };
      }

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

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: this.mapToShopProfile(response.data.data)
        };
      }

      return response.data;
    } catch (error: any) {
      console.error('🏪 ShopApi: Update shop error:', error);
      throw error;
    }
  }

  // Upload shop images
  async uploadShopImages(shopId: string, images: {
    imageUrl?: string;
    coverImageUrl?: string;
  }): Promise<BaseResponse<ShopProfile>> {
    try {
      console.log('🏪 ShopApi: Uploading shop images...', { shopId, images });
      const response = await apiClient.put(`/shops/${shopId}`, images);
      console.log('🏪 ShopApi: Upload images response:', response.data);

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: this.mapToShopProfile(response.data.data)
        };
      }

      return response.data;
    } catch (error: any) {
      console.error('🏪 ShopApi: Upload images error:', error);
      throw error;
    }
  }

  // Update shop status (active/inactive)
  async updateShopStatus(shopId: string, isActive: boolean): Promise<BaseResponse<ShopProfile>> {
    try {
      console.log('🏪 ShopApi: Updating shop status...', { shopId, isActive });
      const response = await apiClient.put(`/shops/${shopId}`, { isActive });
      console.log('🏪 ShopApi: Update status response:', response.data);

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: this.mapToShopProfile(response.data.data)
        };
      }

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

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: this.mapToShopProfile(response.data.data)
        };
      }

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

      if (response.data.success && Array.isArray(response.data.data)) {
        const shops = response.data.data.map((shop: ShopApiResponse) => this.mapToShopProfile(shop));

        return {
          success: true,
          data: {
            shops,
            total: response.data.total || shops.length,
            page: response.data.page || 1,
            limit: params?.limit || 10,
            totalPages: response.data.pages || 1
          }
        };
      }

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