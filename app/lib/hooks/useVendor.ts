// lib/hooks/useVendor.ts - FIXED VERSION
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
  createVendor: (data: any) => Promise<{ success: boolean; vendor?: any; error?: string }>;

  // Profile Management
  getVendorProfile: () => Promise<{ success: boolean; profile?: VendorProfile; error?: string }>;
  updateVendorProfile: (data: UpdateVendorProfileData) => Promise<{ success: boolean; profile?: VendorProfile; error?: string }>;

  // Shop Management
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


  const createVendor = useCallback(async (data: any): Promise<{ success: boolean; vendor?: any; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('👨‍💼 useVendor: Creating vendor account...', data);

      // You'll need to create this endpoint in your API
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        console.log('👨‍💼 useVendor: Vendor account created successfully');
        return { success: true, vendor: result.vendor };
      } else {
        const errorMsg = result.message || 'Failed to create vendor account';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👨‍💼 useVendor: Error creating vendor account:', err);
      const errorMessage = err.message || 'Failed to create vendor account';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get vendor profile
  const getVendorProfile = async () => {
    setLoading(true);
    try {
      const response = await vendorApi.getVendorProfile();

      console.log('Hook received response:', response);

      // Response is { success: true, data: { businessName: "", ... } }
      if (response.success && response.data) {
        const vendorData = {
          ...response.data,
          // Ensure shops array exists with proper structure
          // Ensure shops array exists with proper structure
        shops: (response.data.shops || []).map(shop => {
          // Cast shop to any to access potentially missing properties
          const shopData = shop as any;
          return {
            ...shop,
            // Add missing fields that your UI expects
            isActive: shopData.isActive !== undefined ? shopData.isActive : true,
            productsCount: shopData.productsCount || 0,
            totalReviews: shopData.totalReviews || 0,
            address: shopData.address || '',
            description: shopData.description || '',
            marketId: shopData.marketId || null,
            // Use _id as id if not present
            id: shopData.id || shopData._id
          };
        })
        };

        console.log('Setting vendor profile:', vendorData);
        setVendorProfile(vendorData);
        return { success: true, profile: vendorData };
      } else {
        console.log('No vendor profile found');
        setVendorProfile(null);
        return { success: true, profile: null };
      }
    } catch (error: any) {
      console.error('Failed to get vendor profile:', error);

      // Check if it's a 404 (profile doesn't exist)
      if (error.response?.status === 404) {
        console.log('Vendor profile not found (404)');
        setVendorProfile(null);
        return { success: true, profile: null };
      }

      setError(error.message || 'Failed to load vendor profile');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get shops by owner ID
  const getShopsByOwnerId = useCallback(async (ownerId: string): Promise<{ success: boolean; shops?: Shop[]; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('👨‍💼 useVendor: Getting shops by owner ID...', ownerId);
      const response = await vendorApi.getShopsByOwnerId(ownerId);

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
      console.log('👨‍💼 useVendor: Updating/creating vendor profile...', data);
      const response = await vendorApi.updateVendorProfile(data);

      if (response.success) {
        console.log('👨‍💼 useVendor: Profile saved successfully');
        setVendorProfile(response.data);
        return { success: true, profile: response.data };
      } else {
        const errorMsg = response.message || 'Failed to save profile';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('👨‍💼 useVendor: Error saving profile:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get vendor stats - TEMPORARILY COMMENTED OUT
  const getVendorStats = useCallback(async (): Promise<{ success: boolean; stats?: VendorStats; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      console.log('👨‍💼 useVendor: Getting vendor stats...');
      // This endpoint is commented out in vendorApi.ts
      // For now, return empty stats or handle differently
      const mockStats: VendorStats = {
        totalShops: shops.length,
        activeShops: shops.filter(shop => shop.isActive).length,
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        averageRating: shops.reduce((acc, shop) => acc + shop.rating, 0) / shops.length || 0,
        totalCustomers: 0,
        thisMonthOrders: 0,
        thisMonthRevenue: 0
      };

      console.log('👨‍💼 useVendor: Using mock stats for now');
      setStats(mockStats);
      return { success: true, stats: mockStats };

      // If you uncomment the endpoint in vendorApi.ts, use this instead:
      // const response = await vendorApi.getVendorStats();
      // if (response.success) {
      //   console.log('👨‍💼 useVendor: Stats fetched successfully');
      //   setStats(response.data);
      //   return { success: true, stats: response.data };
      // } else {
      //   const errorMsg = response.message || 'Failed to fetch stats';
      //   setError(errorMsg);
      //   return { success: false, error: errorMsg };
      // }
    } catch (err: any) {
      console.error('👨‍💼 useVendor: Error fetching stats:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch stats';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [shops]);

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

  // Refresh shops - Now uses getShopsByOwnerId instead of getMyShops
  const refreshShops = useCallback(async () => {
    if (vendorProfile) {
      // You'll need to pass the ownerId from vendorProfile
      // Assuming vendorProfile has a user ID field
      // await getShopsByOwnerId(vendorProfile.userId);
      console.log('👨‍💼 useVendor: Refresh shops - need ownerId from vendorProfile');
    }
  }, [vendorProfile]);

  // Refresh all vendor data
  const refreshVendorData = useCallback(async () => {
    await Promise.all([
      getVendorProfile(),
      // getMyShops() is removed - use getShopsByOwnerId instead
      getVendorStats()
    ]);
  }, [getVendorProfile, getVendorStats]);

  return {
    shops,
    vendorProfile,
    stats,
    loading,
    error,
    createVendor,
    getVendorProfile,
    updateVendorProfile,
    getShopsByOwnerId, // Changed from getMyShops
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