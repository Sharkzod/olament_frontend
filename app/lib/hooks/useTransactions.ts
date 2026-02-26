import { useState, useCallback, useEffect } from 'react';
import { walletApi, WalletBalance, WalletTransaction, TransactionFilters, PaginatedTransactions } from '../api/walletApi';

export const useWalletBalance = () => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await walletApi.getBalance();
      if (result.success && result.data) {
        setBalance(result.data);
      } else {
        setError(result.error || 'Failed to fetch balance');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, error, fetchBalance };
};

export const useTransactions = (initialFilters?: TransactionFilters) => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [pagination, setPagination] = useState<Omit<PaginatedTransactions, 'docs'> | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters || { page: 1, limit: 15 });

  const fetchTransactions = useCallback(async (newFilters?: TransactionFilters, append = false) => {
    const activeFilters = newFilters || filters;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await walletApi.getTransactions(activeFilters);
      if (result.success && result.data) {
        const { docs, ...paginationData } = result.data;
        if (append) {
          setTransactions(prev => [...prev, ...docs]);
        } else {
          setTransactions(docs);
        }
        setPagination(paginationData);
      } else {
        setError(result.error || 'Failed to fetch transactions');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters]);

  const loadMore = useCallback(() => {
    if (pagination?.hasNextPage && pagination.nextPage && !loadingMore) {
      const nextFilters = { ...filters, page: pagination.nextPage };
      setFilters(nextFilters);
      fetchTransactions(nextFilters, true);
    }
  }, [pagination, filters, loadingMore, fetchTransactions]);

  const applyFilters = useCallback((newFilters: Partial<TransactionFilters>) => {
    const updated = { ...filters, ...newFilters, page: 1 };
    setFilters(updated);
    fetchTransactions(updated, false);
  }, [filters, fetchTransactions]);

  useEffect(() => {
    fetchTransactions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    transactions,
    pagination,
    loading,
    loadingMore,
    error,
    filters,
    fetchTransactions: () => fetchTransactions(filters, false),
    loadMore,
    applyFilters,
  };
};
