// lib/api/vendorApi.ts
import apiClient from './apiClient';

export interface Shop {
  _id: string;
  name: string;
  description: string;
  marketId: {
    _id: string;
    name: string;
    state: string;
    city: string;
  };
  ownerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
  };
  category: string;
  subCategory?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  openingHours?: Record<string, { open: string; close: string }>;
  isActive: boolean;
  rating: number;
  totalReviews: number;
  productsCount: number;
  imageUrl?: string;
  coverImageUrl?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  tags: string[];
  features: string[];
  minimumOrder: number;
  deliveryFee: number;
  deliveryRadius: number;
  createdAt: string;
  updatedAt: string;
}

export interface VendorProfile {
  businessName?: string;
  businessDescription?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWebsite?: string;
  taxId?: string;
  businessRegistration?: string;
  yearsInBusiness?: number;
  shopIds: string[];
  shops?: Array<{
    _id: string;
    name: string;
    category: string;
    rating: number;
    isVerified: boolean;
  }>;
}

export interface CreateShopData {
  name: string;
  marketId: string;
  category: string;
  description?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  tags?: string[];
}

export interface UpdateShopData {
  name?: string;
  description?: string;
  category?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  openingHours?: Record<string, { open: string; close: string }>;
  tags?: string[];
  features?: string[];
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
  minimumOrder?: number;
  deliveryFee?: number;
  deliveryRadius?: number;
}

export interface UpdateVendorProfileData {
  businessName?: string;
  businessDescription?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWebsite?: string;
  taxId?: string;
  businessRegistration?: string;
  yearsInBusiness?: number;
  vendorProfile?: {
    businessName?: string;
    businessDescription?: string;
    taxId?: string;
    bankAccount?: any;
  };
}


export interface VendorStats {
  totalShops: number;
  activeShops: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageRating: number;
  totalCustomers: number;
  thisMonthOrders: number;
  thisMonthRevenue: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

class VendorApi {
  // Get vendor's shops
  // async getMyShops(): Promise<ApiResponse<Shop[]>> {
  //   try {
  //     const response = await apiClient.get('/shops/my-shops');
  //     return response.data;
  //   } catch (error: any) {
  //     console.error('VendorApi: Get my shops error:', error);
  //     throw error;
  //   }
  // }

  // Get vendor profile
  async getVendorProfile(): Promise<ApiResponse<VendorProfile>> {
    try {
      const response = await apiClient.get('/vendor/profile');

      console.log('VendorApi: Get vendor profile response:', response.data);
      // Return just the data part
      return response.data;
    } catch (error: any) {
      console.error('VendorApi: Get vendor profile error:', error);
      throw error;
    }
  }

  // async getMyProfile(): Promise<ApiResponse<VendorProfile>> {
  //   try {
  //     const response = await apiClient.get('/vendor/profile');
  //     return response.data;
  //   } catch (error: any) {
  //     console.error('VendorApi: Get my profile error:', error);
  //     throw error;
  //   }
  // }

  // Update vendor profile
  async updateVendorProfile(data: UpdateVendorProfileData): Promise<ApiResponse<VendorProfile>> {
    try {
      // Prepare data in the format backend expects
      const backendData: any = {};

      // Map fields to backend structure
      if (data.businessName) {
        backendData['vendorProfile.businessName'] = data.businessName;
        backendData.businessName = data.businessName;
      }
      if (data.businessDescription) {
        backendData['vendorProfile.businessDescription'] = data.businessDescription;
        backendData.businessDescription = data.businessDescription;
      }
      if (data.businessAddress) {
        backendData.address = data.businessAddress;
        backendData.businessAddress = data.businessAddress;
      }
      if (data.businessPhone) {
        backendData.phone = data.businessPhone;
      }
      if (data.taxId) {
        backendData['vendorProfile.taxId'] = data.taxId;
        backendData.taxId = data.taxId;
      }
      if (data.yearsInBusiness !== undefined) {
        backendData.yearsInBusiness = data.yearsInBusiness;
      }
      if (data.businessRegistration) {
        backendData.businessRegistration = data.businessRegistration;
      }
      if (data.businessEmail) {
        backendData.businessEmail = data.businessEmail;
      }
      if (data.businessWebsite) {
        backendData.businessWebsite = data.businessWebsite;
      }

      const response = await apiClient.put('/vendor/profile', backendData);
      return response.data;
    } catch (error: any) {
      console.error('VendorApi: Update vendor profile error:', error);
      throw error;
    }
  }

  async getShopsByOwnerId(ownerId: string): Promise<ApiResponse<Shop[]>> {
    try {
      const response = await apiClient.get(`/shops/owner/${ownerId}`);
      return response.data;
    } catch (error: any) {
      console.error('VendorApi: Get shops by owner ID error:', error);
      throw error;
    }
  }

  // // Get vendor stats
  // async getVendorStats(): Promise<ApiResponse<VendorStats>> {
  //   try {
  //     const response = await apiClient.get('/vendors/stats');
  //     return response.data;
  //   } catch (error: any) {
  //     console.error('VendorApi: Get stats error:', error);
  //     throw error;
  //   }
  // }

  // Create new shop
  async createShop(data: CreateShopData): Promise<ApiResponse<Shop>> {
    try {
      const response = await apiClient.post('/shops', data);
      return response.data;
    } catch (error: any) {
      console.error('VendorApi: Create shop error:', error);
      throw error;
    }
  }

  // Update shop
  async updateShop(shopId: string, data: UpdateShopData): Promise<ApiResponse<Shop>> {
    try {
      const response = await apiClient.put(`/shops/${shopId}`, data);
      return response.data;
    } catch (error: any) {
      console.error('VendorApi: Update shop error:', error);
      throw error;
    }
  }

  // Delete shop (soft delete)
  async deleteShop(shopId: string): Promise<ApiResponse<Shop>> {
    try {
      const response = await apiClient.delete(`/shops/${shopId}`);
      return response.data;
    } catch (error: any) {
      console.error('VendorApi: Delete shop error:', error);
      throw error;
    }
  }

  // Toggle shop active status
  async toggleShopStatus(shopId: string, isActive: boolean): Promise<ApiResponse<Shop>> {
    try {
      const response = await apiClient.patch(`/shops/${shopId}/status`, { isActive });
      return response.data;
    } catch (error: any) {
      console.error('VendorApi: Toggle shop status error:', error);
      throw error;
    }
  }

  // Upload shop image
  async uploadShopImage(shopId: string, imageUrl: string, type: 'logo' | 'cover' = 'logo'): Promise<ApiResponse<{ imageUrl: string }>> {
    try {
      const response = await apiClient.post(`/shops/${shopId}/image`, { imageUrl, type });
      return response.data;
    } catch (error: any) {
      console.error('VendorApi: Upload shop image error:', error);
      throw error;
    }
  }

  // Get shop details
  async getShopDetails(shopId: string): Promise<ApiResponse<Shop>> {
    try {
      const response = await apiClient.get(`/shops/${shopId}`);
      return response.data;
    } catch (error: any) {
      console.error('VendorApi: Get shop details error:', error);
      throw error;
    }
  }

  // Get available markets for shop creation
  async getAvailableMarkets(): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get('/markets?isActive=true');
      return response.data;
    } catch (error: any) {
      console.error('VendorApi: Get markets error:', error);
      throw error;
    }
  }

  // Upload business logo
  async uploadBusinessLogo(imageUrl: string): Promise<ApiResponse<{ logoUrl: string }>> {
    try {
      const response = await apiClient.post('/vendors/logo', { imageUrl });
      return response.data;
    } catch (error: any) {
      console.error('VendorApi: Upload business logo error:', error);
      throw error;
    }
  }
}

export const vendorApi = new VendorApi();