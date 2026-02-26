import apiClient from './apiClient';

// ─── Customer Dashboard Types ───

export interface CustomerProfile {
  name: string;
  email: string;
  avatar: string;
  phone: string;
  memberSince: string;
}

export interface CustomerOrderSummary {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

export interface CustomerWallet {
  balance: number;
  availableBalance: number;
  totalFunded: number;
  totalSpent: number;
  totalRefunded: number;
  currency: string;
}

export interface CustomerActiveOrder {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  vendor: {
    _id: string;
    name: string;
  };
}

export interface CustomerDashboard {
  profile: CustomerProfile;
  orderSummary: CustomerOrderSummary;
  activeOrders: CustomerActiveOrder[];
  recentOrders: CustomerActiveOrder[];
  wallet: CustomerWallet;
  wishlistCount: number;
}

// ─── Vendor Dashboard Types ───

export interface VendorProductStats {
  totalProducts: number;
  totalViews: number;
  totalFavorites: number;
  inventoryValue: number;
}

export interface VendorOrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  shippingOrders: number;
  deliveredOrders: number;
  completedOrders: number;
}

export interface VendorWallet {
  balance: number;
  escrowBalance: number;
  availableBalance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  currency: string;
}

export interface VendorRecentProduct {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  status: string;
  createdAt: string;
}

export interface VendorLowStockProduct {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface VendorRecentOrder {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  customer: {
    _id: string;
    name: string;
  };
}

export interface VendorDashboard {
  stats: {
    products: VendorProductStats;
    orders: VendorOrderStats;
    wallet: VendorWallet;
  };
  recentProducts: VendorRecentProduct[];
  lowStockProducts: VendorLowStockProduct[];
  recentOrders: VendorRecentOrder[];
  quickActions: Array<{ label: string; path: string; icon: string }>;
}

// ─── API Functions ───

export const dashboardApi = {
  async getCustomerDashboard(): Promise<{ success: boolean; dashboard?: CustomerDashboard; error?: string }> {
    try {
      const response = await apiClient.get('/dashboard/customer');
      if (response.data.success) {
        return { success: true, dashboard: response.data.dashboard };
      }
      return { success: false, error: response.data.message || 'Failed to fetch dashboard' };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch customer dashboard',
      };
    }
  },

  async getVendorDashboard(): Promise<{ success: boolean; dashboard?: VendorDashboard; error?: string }> {
    try {
      const response = await apiClient.get('/vendor/dashboard');
      if (response.data.success) {
        return { success: true, dashboard: response.data.dashboard };
      }
      return { success: false, error: response.data.message || 'Failed to fetch dashboard' };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch vendor dashboard',
      };
    }
  },
};
