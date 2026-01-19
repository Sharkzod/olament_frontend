// lib/hooks/useVendor.ts
import { useState, useCallback } from 'react';
import { 
  vendorApi, 
  Shop, 
  VendorProfile, 
  CreateShopData, 
  UpdateShopData, 
  UpdateVendorProfileData, 
  VendorStats 
} from '../api/vendorApi';

interface UseVendorReturn {
  // Data
  shops: Shop[];
  vendorProfile: VendorProfile | null;
  stats: VendorStats | null;
  loading: boolean;
  error: string | null;
  
  // Profile Management
  getVendorProfile: () => Promise<{ success: boolean; profile?: VendorProfile; error?: string }>;
  updateVendorProfile: (data: UpdateVendorProfileData) => Promise<{ success: boolean; profile?: VendorProfile; error?: string }>;
  
  // Shop Management
  getMyShops: () => Promise<{ success: boolean; shops?: Shop[]; error?: string }>;
  getShopsByOwnerId: (ownerId: string) => Promise<{ success: boolean; shops?: Shop[]; error?: string }>;
  getVendorStats: () => Promise<{ success: boolean; stats?: VendorStats; error?: string }>;
  createShop: (data: CreateShopData) => Promise<{ success: boolean; shop?: Shop; error?: string }>;
  updateShop: (shopId: string, data: UpdateShopData) => Promise<{ success: boolean; shop?: Shop; error?: string }>;
  deleteShop: (shopId: string) => Promise<{ success: boolean; error?: string }>;
  toggleShopStatus: (shopId: string, isActive: boolean) => Promise<{ success: boolean; shop?: Shop; error?: string }>;
  getShopDetails: (shopId: string) => Promise<{ success: boolean; shop?: Shop; error?: string }>;
  refreshShops: () => Promise<void>;
  refreshVendorData: () => Promise<void>;
}

export const useVendor = (): UseVendorReturn => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get vendor profile
  const getVendorProfile = useCallback(async (): Promise<{ success: boolean; profile?: VendorProfile; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('👨‍💼 useVendor: Getting vendor profile...');
      const response = await vendorApi.getVendorProfile();
      
      if (response.success) {
        console.log('👨‍💼 useVendor: Profile fetched successfully');
        setVendorProfile(response.data);
        return { success: true, profile: response.data };
      } else {
        const errorMsg = response.message || 'Failed to fetch profile';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👨‍💼 useVendor: Error fetching profile:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);


  const getShopsByOwnerId = useCallback(async (ownerId: string): Promise<{ success: boolean; shops?: Shop[]; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('👨‍💼 useVendor: Getting shops by owner ID...', ownerId);
      const response = await vendorApi.getShopsByOwnerId(ownerId);
      
      if (response.success) {
        console.log('👨‍💼 useVendor: Shops fetched successfully:', response.data.length);
        return { success: true, shops: response.data };
      } else {
        const errorMsg = response.message || 'Failed to fetch shops';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👨‍💼 useVendor: Error fetching shops by owner:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch shops';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);


  // Update vendor profile
  const updateVendorProfile = useCallback(async (data: UpdateVendorProfileData): Promise<{ success: boolean; profile?: VendorProfile; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('👨‍💼 useVendor: Updating vendor profile...', data);
      const response = await vendorApi.updateVendorProfile(data);
      
      if (response.success) {
        console.log('👨‍💼 useVendor: Profile updated successfully');
        setVendorProfile(response.data);
        return { success: true, profile: response.data };
      } else {
        const errorMsg = response.message || 'Failed to update profile';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👨‍💼 useVendor: Error updating profile:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get vendor's shops
  const getMyShops = useCallback(async (): Promise<{ success: boolean; shops?: Shop[]; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('👨‍💼 useVendor: Getting my shops...');
      const response = await vendorApi.getMyShops();
      
      if (response.success) {
        console.log('👨‍💼 useVendor: Shops fetched successfully:', response.data.length);
        setShops(response.data);
        return { success: true, shops: response.data };
      } else {
        const errorMsg = response.message || 'Failed to fetch shops';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👨‍💼 useVendor: Error fetching shops:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch shops';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get vendor stats
  const getVendorStats = useCallback(async (): Promise<{ success: boolean; stats?: VendorStats; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('👨‍💼 useVendor: Getting vendor stats...');
      const response = await vendorApi.getVendorStats();
      
      if (response.success) {
        console.log('👨‍💼 useVendor: Stats fetched successfully');
        setStats(response.data);
        return { success: true, stats: response.data };
      } else {
        const errorMsg = response.message || 'Failed to fetch stats';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👨‍💼 useVendor: Error fetching stats:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch stats';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new shop
  const createShop = useCallback(async (data: CreateShopData): Promise<{ success: boolean; shop?: Shop; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('👨‍💼 useVendor: Creating shop...', data);
      const response = await vendorApi.createShop(data);
      
      if (response.success) {
        console.log('👨‍💼 useVendor: Shop created successfully');
        // Add new shop to the list
        setShops(prev => [response.data, ...prev]);
        // Refresh vendor profile to update shop count
        await getVendorProfile();
        return { success: true, shop: response.data };
      } else {
        const errorMsg = response.message || 'Failed to create shop';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👨‍💼 useVendor: Error creating shop:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create shop';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [getVendorProfile]);

  // Update shop
  const updateShop = useCallback(async (shopId: string, data: UpdateShopData): Promise<{ success: boolean; shop?: Shop; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('👨‍💼 useVendor: Updating shop...', shopId, data);
      const response = await vendorApi.updateShop(shopId, data);
      
      if (response.success) {
        console.log('👨‍💼 useVendor: Shop updated successfully');
        // Update shop in the list
        setShops(prev => prev.map(shop => 
          shop._id === shopId ? response.data : shop
        ));
        return { success: true, shop: response.data };
      } else {
        const errorMsg = response.message || 'Failed to update shop';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👨‍💼 useVendor: Error updating shop:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update shop';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete shop
  const deleteShop = useCallback(async (shopId: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('👨‍💼 useVendor: Deleting shop...', shopId);
      const response = await vendorApi.deleteShop(shopId);
      
      if (response.success) {
        console.log('👨‍💼 useVendor: Shop deleted successfully');
        // Remove shop from the list
        setShops(prev => prev.filter(shop => shop._id !== shopId));
        // Refresh vendor profile to update shop count
        await getVendorProfile();
        return { success: true };
      } else {
        const errorMsg = response.message || 'Failed to delete shop';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👨‍💼 useVendor: Error deleting shop:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete shop';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [getVendorProfile]);

  // Toggle shop status
  const toggleShopStatus = useCallback(async (shopId: string, isActive: boolean): Promise<{ success: boolean; shop?: Shop; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('👨‍💼 useVendor: Toggling shop status...', shopId, isActive);
      const response = await vendorApi.toggleShopStatus(shopId, isActive);
      
      if (response.success) {
        console.log('👨‍💼 useVendor: Shop status updated successfully');
        // Update shop in the list
        setShops(prev => prev.map(shop => 
          shop._id === shopId ? response.data : shop
        ));
        return { success: true, shop: response.data };
      } else {
        const errorMsg = response.message || 'Failed to update shop status';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👨‍💼 useVendor: Error toggling shop status:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update shop status';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get shop details
  const getShopDetails = useCallback(async (shopId: string): Promise<{ success: boolean; shop?: Shop; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('👨‍💼 useVendor: Getting shop details...', shopId);
      const response = await vendorApi.getShopDetails(shopId);
      
      if (response.success) {
        console.log('👨‍💼 useVendor: Shop details fetched successfully');
        return { success: true, shop: response.data };
      } else {
        const errorMsg = response.message || 'Failed to fetch shop details';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👨‍💼 useVendor: Error fetching shop details:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch shop details';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh shops
  const refreshShops = useCallback(async () => {
    await getMyShops();
  }, [getMyShops]);

  // Refresh all vendor data
  const refreshVendorData = useCallback(async () => {
    await Promise.all([
      getVendorProfile(),
      getMyShops(),
      getVendorStats()
    ]);
  }, [getVendorProfile, getMyShops, getVendorStats]);

  return {
    shops,
    vendorProfile,
    stats,
    loading,
    error,
    getVendorProfile,
    updateVendorProfile,
    getMyShops,
    getVendorStats,
    createShop,
    updateShop,
    deleteShop,
    toggleShopStatus,
    getShopDetails,
    refreshShops,
    refreshVendorData,
  };
};