// lib/hooks/useShop.ts - FIXED VERSION
import { useState, useCallback } from 'react';
import {
  shopApi,
  ShopProfile,
  CreateShopData,
  UpdateShopData
} from '../api/shopApi';

interface UseShopReturn {
  shops: ShopProfile[];
  loading: boolean;
  error: string | null;
  totalShops: number;

  // Actions
  getMyShops: () => Promise<{ success: boolean; data?: ShopProfile[]; error?: string }>;
  createShop: (data: CreateShopData) => Promise<{ success: boolean; data?: ShopProfile; error?: string }>;
  updateShop: (shopId: string, data: UpdateShopData) => Promise<{ success: boolean; data?: ShopProfile; error?: string }>;
  uploadShopImages: (shopId: string, images: { imageUrl?: string; coverImageUrl?: string }) => Promise<{ success: boolean; data?: ShopProfile; error?: string }>;
  updateShopStatus: (shopId: string, isActive: boolean) => Promise<{ success: boolean; data?: ShopProfile; error?: string }>;
  deleteShop: (shopId: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  clearError: () => void;
}

export const useShop = (): UseShopReturn => {
  const [shops, setShops] = useState<ShopProfile[]>([]);
  const [totalShops, setTotalShops] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to update a single shop in the shops array
  const updateShopInList = useCallback((updatedShop: ShopProfile) => {
    setShops(prevShops =>
      prevShops.map(shop =>
        shop._id === updatedShop._id ? updatedShop : shop
      )
    );
  }, []);

  // Helper function to remove a shop from the list
  const removeShopFromList = useCallback((shopId: string) => {
    setShops(prevShops => prevShops.filter(shop => shop._id !== shopId));
    setTotalShops(prev => Math.max(0, prev - 1));
  }, []);

  // Get current user's shops
  const getMyShops = useCallback(async (): Promise<{ success: boolean; data?: ShopProfile[]; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🏪 useShop: Getting my shops...');
      const response = await shopApi.getMyShops();

      console.log('🏪 useShop: My shops response:', response);

      if (response.success && response.data) {
        console.log('🏪 useShop: My shops fetched successfully:', response.data.shops?.length || 0);
        setShops(response.data.shops || []);
        setTotalShops(response.data.total || 0);
        return { success: true, data: response.data.shops };
      } else {
        const errorMsg = response.message || 'Failed to fetch shops';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('🏪 useShop: Error getting my shops:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch shops';
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

      if (response.success && response.data) {
        console.log('🏪 useShop: Shop created successfully:', response.data.name);
        // Add new shop to the list
        setShops(prevShops => [response.data!, ...prevShops]);
        setTotalShops(prev => prev + 1);
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

      if (response.success && response.data) {
        console.log('🏪 useShop: Shop updated successfully:', response.data.name);
        updateShopInList(response.data);
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
  }, [updateShopInList]);

  // Upload shop images
  const uploadShopImages = useCallback(async (shopId: string, images: { imageUrl?: string; coverImageUrl?: string }): Promise<{ success: boolean; data?: ShopProfile; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🏪 useShop: Uploading shop images...', { shopId, images });
      const response = await shopApi.uploadShopImages(shopId, images);

      if (response.success && response.data) {
        console.log('🏪 useShop: Shop images uploaded successfully');
        updateShopInList(response.data);
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
  }, [updateShopInList]);

  // Update shop status
  const updateShopStatus = useCallback(async (shopId: string, isActive: boolean): Promise<{ success: boolean; data?: ShopProfile; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🏪 useShop: Updating shop status...', { shopId, isActive });
      const response = await shopApi.updateShopStatus(shopId, isActive);

      if (response.success && response.data) {
        console.log('🏪 useShop: Shop status updated successfully');
        updateShopInList(response.data);
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
  }, [updateShopInList]);

  // Delete shop
  const deleteShop = useCallback(async (shopId: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🏪 useShop: Deleting shop...', shopId);
      const response = await shopApi.deleteShop(shopId);

      if (response.success) {
        console.log('🏪 useShop: Shop deleted successfully');
        removeShopFromList(shopId);
        return { success: true, message: response.data?.message || 'Shop deleted' };
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
  }, [removeShopFromList]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    shops,
    loading,
    error,
    totalShops,
    getMyShops,
    createShop,
    updateShop,
    uploadShopImages,
    updateShopStatus,
    deleteShop,
    clearError,
  };
};