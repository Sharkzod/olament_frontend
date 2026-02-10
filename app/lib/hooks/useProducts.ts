// hooks/useProducts.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { getAllProducts, getProductsByCategory } from '../api/productsApi';
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
  data?: Product[]; // For category endpoint
  docs?: Product[]; // For general products endpoint
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
  category?: any; // Category info from category endpoint
  breadcrumb?: any[]; // Breadcrumb from category endpoint
  filters?: any; // Filters from category endpoint
}

interface UseProductsOptions {
  filters?: ProductFilters;
  autoFetch?: boolean;
  useCategoryEndpoint?: boolean; // New option to use category-specific endpoint
  onSuccess?: (data: ProductsResponse) => void;
  onError?: (error: Error) => void;
}

interface UseProductsReturn {
  // State
  products: Product[];
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: Error | null;
  categoryInfo: any | null; // Category metadata
  breadcrumb: any[] | null; // Breadcrumb trail
  availableFilters: any | null; // Available filters (brands, price range, etc.)
  
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
  useCategoryEndpoint = true, // Default to using category endpoint
  onSuccess,
  onError,
}: UseProductsOptions = {}): UseProductsReturn => {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [categoryInfo, setCategoryInfo] = useState<any | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<any[] | null>(null);
  const [availableFilters, setAvailableFilters] = useState<any | null>(null);
  
  // Use ref to track if we're currently fetching to prevent duplicate requests
  const isFetchingRef = useRef(false);
  const lastFiltersRef = useRef<string>('');

  // Main fetch function - NOT dependent on filters
  const fetchProducts = useCallback(async (customFilters?: ProductFilters) => {
    // Prevent duplicate simultaneous requests
    if (isFetchingRef.current) {
      console.log('⏸️ useProducts - Skipping duplicate request');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    isFetchingRef.current = true;
    
    try {
      // Merge default filters with custom ones
      const mergedFilters = { ...filters, ...customFilters };
      
      // Ensure page and limit are set
      if (!mergedFilters.page) mergedFilters.page = 1;
      if (!mergedFilters.limit) mergedFilters.limit = 20;
      
      let response: ProductsResponse;
      
      // Use category-specific endpoint if category is provided and useCategoryEndpoint is true
      if (useCategoryEndpoint && mergedFilters.category) {
        // Extract category slug and remove from params
        const categorySlug = mergedFilters.category;
        const { category, ...restParams } = mergedFilters;
        
        console.log(`🔍 Fetching products for category: ${categorySlug}`);
        response = await getProductsByCategory(categorySlug, restParams);
      } else {
        // Use general products endpoint
        response = await getAllProducts(mergedFilters);
      }
      
      console.log('🔍 useProducts - Raw API response:', response);
      
      // Handle response - category endpoint uses 'data', general uses 'docs'
      if (response && response.success) {
        const fetchedProducts = response.data || response.docs || [];
        setProducts(fetchedProducts);
        
        // Set category info if available (from category endpoint)
        if (response.category) {
          setCategoryInfo(response.category);
        }
        
        // Set breadcrumb if available
        if (response.breadcrumb) {
          setBreadcrumb(response.breadcrumb);
        }
        
        // Set available filters if available
        if (response.filters) {
          setAvailableFilters(response.filters);
        }
        
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
          pagination: paginationInfo,
          categoryInfo: response.category?.name,
          hasFilters: !!response.filters
        });
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        console.warn('⚠️ useProducts - Unexpected response structure:', response);
        setProducts([]);
        setPagination(null);
        setCategoryInfo(null);
        setBreadcrumb(null);
        setAvailableFilters(null);
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
      setCategoryInfo(null);
      setBreadcrumb(null);
      setAvailableFilters(null);
      
      // Call error callback if provided
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []); // Empty dependency array - we'll pass filters as arguments

  // Refetch current data
  const refetch = useCallback(() => {
    return fetchProducts(filters);
  }, [fetchProducts, filters]);

  // Reset state
  const reset = useCallback(() => {
    setProducts([]);
    setPagination(null);
    setError(null);
    setIsFirstLoad(true);
    setCategoryInfo(null);
    setBreadcrumb(null);
    setAvailableFilters(null);
    isFetchingRef.current = false;
  }, []);

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    if (!autoFetch) return;
    
    // Create a stable string representation of filters to compare
    const filtersString = JSON.stringify(filters);
    
    // Only fetch if filters have actually changed
    if (filtersString !== lastFiltersRef.current) {
      console.log('🔄 useProducts - Filters changed, fetching...', filters);
      lastFiltersRef.current = filtersString;
      fetchProducts(filters);
    }
  }, [autoFetch, filters]); // Only depend on autoFetch and filters

  // Computed properties
  const hasMore = Boolean(pagination?.hasNextPage);
  const isEmpty = !isLoading && products.length === 0;

  return {
    // State
    products,
    pagination,
    isLoading,
    error,
    categoryInfo,
    breadcrumb,
    availableFilters,
    
    // Actions
    fetchProducts,
    refetch,
    reset,
    
    // Helpers
    hasMore,
    isFirstLoad,
    isEmpty,
  };
};