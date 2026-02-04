// hooks/useProducts.ts
import { useState, useEffect, useCallback } from 'react';
import { getAllProducts } from '../api/productsApi';
import { Product, ProductFilters } from '@/types/product';

interface PaginationInfo {
  page: number;
  limit: number;
  totalDocs: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

interface ProductsResponse {
  success: boolean;
  docs: Product[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

interface UseProductsOptions {
  filters?: ProductFilters;
  autoFetch?: boolean;
  onSuccess?: (data: ProductsResponse) => void;
  onError?: (error: Error) => void;
}

interface UseProductsReturn {
  // State
  products: Product[];
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  fetchProducts: (customFilters?: ProductFilters) => Promise<void>;
  refetch: () => Promise<void>;
  reset: () => void;
  
  // Helpers
  hasMore: boolean;
  isFirstLoad: boolean;
  isEmpty: boolean;
}

export const useProducts = ({
  filters = {},
  autoFetch = true,
  onSuccess,
  onError,
}: UseProductsOptions = {}): UseProductsReturn => {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);

  // Main fetch function
  const fetchProducts = useCallback(async (customFilters?: ProductFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Merge default filters with custom ones
      const mergedFilters = { ...filters, ...customFilters };
      
      // Ensure page and limit are set
      if (!mergedFilters.page) mergedFilters.page = 1;
      if (!mergedFilters.limit) mergedFilters.limit = 20;
      
      const response = await getAllProducts(mergedFilters);
      
      console.log('🔍 useProducts - Raw API response:', response);
      
      // The response itself is the data (not nested under response.data)
      // Response structure: { success, docs, page, limit, totalDocs, ... }
      if (response && response.success && response.docs) {
        // Products are in the 'docs' array
        const fetchedProducts = response.docs || [];
        setProducts(fetchedProducts);
        
        // Build pagination info from API response
        const paginationInfo: PaginationInfo = {
          page: response.page || 1,
          limit: response.limit || 20,
          totalDocs: response.totalDocs || 0,
          totalPages: response.totalPages || 0,
          hasNextPage: response.hasNextPage || false,
          hasPrevPage: response.hasPrevPage || false,
          nextPage: response.nextPage || null,
          prevPage: response.prevPage || null,
        };
        
        setPagination(paginationInfo);
        
        console.log('✅ useProducts - Parsed:', {
          productsCount: fetchedProducts.length,
          pagination: paginationInfo
        });
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        console.warn('⚠️ useProducts - Unexpected response structure:', response);
        setProducts([]);
        setPagination(null);
      }
      
      if (isFirstLoad) {
        setIsFirstLoad(false);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch products');
      console.error('❌ useProducts - Error:', error);
      setError(error);
      setProducts([]);
      setPagination(null);
      
      // Call error callback if provided
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, onSuccess, onError, isFirstLoad]);

  // Load next page
  const loadNextPage = useCallback(async () => {
    if (!pagination?.hasNextPage || isLoading) return;
    
    try {
      setIsLoading(true);
      const nextPage = pagination.nextPage || (pagination.page + 1);
      const response = await getAllProducts({ ...filters, page: nextPage });
      
      if (response && response.success && response.docs) {
        const newProducts = response.docs || [];
        
        // Append new products
        setProducts(prev => [...prev, ...newProducts]);
        
        // Update pagination
        const paginationInfo: PaginationInfo = {
          page: response.page || nextPage,
          limit: response.limit || 20,
          totalDocs: response.totalDocs || 0,
          totalPages: response.totalPages || 0,
          hasNextPage: response.hasNextPage || false,
          hasPrevPage: response.hasPrevPage || false,
          nextPage: response.nextPage || null,
          prevPage: response.prevPage || null,
        };
        
        setPagination(paginationInfo);
        
        if (onSuccess) {
          onSuccess(response);
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load more products');
      setError(error);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [pagination, filters, isLoading, onSuccess, onError]);

  // Refetch current data
  const refetch = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  // Reset state
  const reset = useCallback(() => {
    setProducts([]);
    setPagination(null);
    setError(null);
    setIsFirstLoad(true);
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [autoFetch, fetchProducts]);

  // Computed properties
  const hasMore = Boolean(pagination?.hasNextPage);
  const isEmpty = !isLoading && products.length === 0;

  return {
    // State
    products,
    pagination,
    isLoading,
    error,
    
    // Actions
    fetchProducts,
    refetch,
    reset,
    // loadNextPage, // Uncomment if you want to expose this
    
    // Helpers
    hasMore,
    isFirstLoad,
    isEmpty,
  };
};