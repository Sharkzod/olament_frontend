// lib/hooks/useShop.ts
import { useState, useCallback } from 'react';
import { 
  shopApi, 
  ShopProfile, 
  CreateShopData, 
  UpdateShopData 
} from '../api/shopApi';

interface UseShopReturn {
  // Shop Data
  shop: ShopProfile | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  getMyShop: () => Promise<{ success: boolean; data?: ShopProfile; error?: string }>;
  createShop: (data: CreateShopData) => Promise<{ success: boolean; data?: ShopProfile; error?: string }>;
  updateShop: (shopId: string, data: UpdateShopData) => Promise<{ success: boolean; data?: ShopProfile; error?: string }>;
  uploadShopImages: (shopId: string, images: { logo?: string; coverImage?: string; gallery?: string[] }) => Promise<{ success: boolean; data?: ShopProfile; error?: string }>;
  updateShopStatus: (shopId: string, status: 'open' | 'closed' | 'busy') => Promise<{ success: boolean; data?: ShopProfile; error?: string }>;
  deleteShop: (shopId: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  clearError: () => void;
}

export const useShop = (): UseShopReturn => {
  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get current user's shop
  const getMyShop = useCallback(async (): Promise<{ success: boolean; data?: ShopProfile; error?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏪 useShop: Getting my shop...');
      const response = await shopApi.getMyShop();
      
      if (response.success) {
        console.log('🏪 useShop: My shop fetched successfully:', response.data.shopName);
        setShop(response.data);
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.message || 'Failed to fetch shop';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('🏪 useShop: Error getting my shop:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch shop';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create shop
  const createShop = useCallback(async (data: CreateShopData): Promise<{ success: boolean; data?: ShopProfile; error?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏪 useShop: Creating shop...', data);
      const response = await shopApi.createShop(data);
      
      if (response.success) {
        console.log('🏪 useShop: Shop created successfully:', response.data.shopName);
        setShop(response.data);
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.message || 'Failed to create shop';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('🏪 useShop: Error creating shop:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create shop';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update shop
  const updateShop = useCallback(async (shopId: string, data: UpdateShopData): Promise<{ success: boolean; data?: ShopProfile; error?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏪 useShop: Updating shop...', { shopId, data });
      const response = await shopApi.updateShop(shopId, data);
      
      if (response.success) {
        console.log('🏪 useShop: Shop updated successfully:', response.data.shopName);
        setShop(response.data);
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.message || 'Failed to update shop';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('🏪 useShop: Error updating shop:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update shop';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload shop images
  const uploadShopImages = useCallback(async (shopId: string, images: { logo?: string; coverImage?: string; gallery?: string[] }): Promise<{ success: boolean; data?: ShopProfile; error?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏪 useShop: Uploading shop images...', { shopId, images });
      const response = await shopApi.uploadShopImages(shopId, images);
      
      if (response.success) {
        console.log('🏪 useShop: Shop images uploaded successfully');
        setShop(response.data);
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.message || 'Failed to upload images';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('🏪 useShop: Error uploading shop images:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to upload images';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update shop status
  const updateShopStatus = useCallback(async (shopId: string, status: 'open' | 'closed' | 'busy'): Promise<{ success: boolean; data?: ShopProfile; error?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏪 useShop: Updating shop status...', { shopId, status });
      const response = await shopApi.updateShopStatus(shopId, status);
      
      if (response.success) {
        console.log('🏪 useShop: Shop status updated successfully');
        setShop(response.data);
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.message || 'Failed to update status';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('🏪 useShop: Error updating shop status:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update status';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete shop
  const deleteShop = useCallback(async (shopId: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏪 useShop: Deleting shop...', shopId);
      const response = await shopApi.deleteShop(shopId);
      
      if (response.success) {
        console.log('🏪 useShop: Shop deleted successfully');
        setShop(null);
        return { success: true, message: response.data.message };
      } else {
        const errorMsg = response.message || 'Failed to delete shop';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('🏪 useShop: Error deleting shop:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete shop';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    shop,
    loading,
    error,
    getMyShop,
    createShop,
    updateShop,
    uploadShopImages,
    updateShopStatus,
    deleteShop,
    clearError,
  };
};