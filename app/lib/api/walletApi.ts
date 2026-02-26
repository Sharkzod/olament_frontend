import apiClient from './apiClient';

// ─── Types ───

export interface WalletBalance {
  balance: number;
  escrowBalance: number;
  availableBalance: number;
  currency: string;
  totalFunded: number;
  totalSpent: number;
  totalEarnings: number;
  totalWithdrawn: number;
  totalRefunded: number;
  lastTransactionAt: string | null;
}

export interface WalletTransaction {
  _id: string;
  wallet: string;
  user: string;
  type: 'funding' | 'payment' | 'escrow_lock' | 'escrow_release' | 'withdrawal' | 'refund' | 'platform_fee' | 'reversal';
  amount: number;
  direction: 'credit' | 'debit';
  balanceBefore: number;
  balanceAfter: number;
  escrowBefore: number;
  escrowAfter: number;
  currency: string;
  reference: string;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  order?: {
    _id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
  };
  counterparty?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: string;
  direction?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedTransactions {
  docs: WalletTransaction[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

// ─── API Functions ───

export const walletApi = {
  async getBalance(): Promise<{ success: boolean; data?: WalletBalance; error?: string }> {
    try {
      const response = await apiClient.get('/wallet/balance');
      if (response.data.success) {
        return { success: true, data: response.data.data };
      }
      return { success: false, error: response.data.message || 'Failed to fetch balance' };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch wallet balance',
      };
    }
  },

  async getTransactions(filters?: TransactionFilters): Promise<{ success: boolean; data?: PaginatedTransactions; error?: string }> {
    try {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));
      if (filters?.type) params.append('type', filters.type);
      if (filters?.direction) params.append('direction', filters.direction);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      const response = await apiClient.get(`/wallet/transactions?${params.toString()}`);
      if (response.data.success) {
        return { success: true, data: response.data.data };
      }
      return { success: false, error: response.data.message || 'Failed to fetch transactions' };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch transactions',
      };
    }
  },
};
