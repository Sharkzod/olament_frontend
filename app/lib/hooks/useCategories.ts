// hooks/useCategories.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { getAllCategories } from '../api/categoryApi';

export interface Category {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  slug?: string;
  productCount?: number;
  image?: string;
  color?: string;
  isActive?: boolean;
  parentCategory?: string | null;
  showInMenu?: boolean;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

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

interface CategoriesResponse {
  success: boolean;
  docs: Category[];
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

interface UseCategoriesOptions {
  params?: {
    page?: number;
    limit?: number;
    parentCategory?: string | null;
    isActive?: boolean;
    showInMenu?: boolean;
    featured?: boolean;
  };
  autoFetch?: boolean;
  onSuccess?: (data: CategoriesResponse) => void;
  onError?: (error: Error) => void;
}

interface UseCategoriesReturn {
  categories: Category[];
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: Error | null;
  fetchCategories: (customParams?: any) => Promise<void>;
  refetch: () => Promise<void>;
  reset: () => void;
  hasMore: boolean;
  isEmpty: boolean;
}

export const useCategories = ({
  params = {},
  autoFetch = true,
  onSuccess,
  onError,
}: UseCategoriesOptions = {}): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Prevent duplicate requests
  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  
const fetchCategories = useCallback(async (customParams?: any) => {
  // Prevent duplicate simultaneous requests
  if (isFetchingRef.current) {
    console.log('⏸️ useCategories - Skipping duplicate request');
    return;
  }
  
  setIsLoading(true);
  setError(null);
  isFetchingRef.current = true;
    
    try {
      // Merge default params with custom ones
      const mergedParams = { ...params, ...customParams };
      
      // Set default limit if not specified (get all categories)
      if (!mergedParams.limit) {
        mergedParams.limit = 100;
      }
      
      const response = await getAllCategories();
      
      console.log('🔍 useCategories - Raw API response:', response);
      
      // Handle the paginated response structure (similar to products)
      if (response && response.success && response.docs) {
        const fetchedCategories = response.docs || [];
        setCategories(fetchedCategories);
        
        // Build pagination info from API response
        const paginationInfo: PaginationInfo = {
          page: response.page || 1,
          limit: response.limit || 100,
          totalDocs: response.totalDocs || 0,
          totalPages: response.totalPages || 0,
          hasNextPage: response.hasNextPage || false,
          hasPrevPage: response.hasPrevPage || false,
          nextPage: response.nextPage || null,
          prevPage: response.prevPage || null,
        };
        
        setPagination(paginationInfo);
        
        console.log('✅ useCategories - Parsed:', {
          categoriesCount: fetchedCategories.length,
          pagination: paginationInfo
        });
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(response);
        }
        
        hasFetchedRef.current = true;
      } else {
        console.warn('⚠️ useCategories - Unexpected response structure:', response);
        setCategories([]);
        setPagination(null);
      }
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch categories');
      console.error('❌ useCategories - Error:', error);
      setError(error);
      setCategories([]);
      setPagination(null);
      
      // Call error callback if provided
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []); // Empty dependency array

  const refetch = useCallback(() => {
    hasFetchedRef.current = false;
    return fetchCategories(params);
  }, [fetchCategories, params]);

  const reset = useCallback(() => {
    setCategories([]);
    setPagination(null);
    setError(null);
    hasFetchedRef.current = false;
    isFetchingRef.current = false;
  }, []);

  // Auto-fetch on mount ONLY ONCE
  useEffect(() => {
    if (autoFetch && !hasFetchedRef.current) {
      console.log('🔄 useCategories - Initial fetch');
      fetchCategories(params);
    }
  }, [autoFetch]); // Only depend on autoFetch

  const hasMore = Boolean(pagination?.hasNextPage);
  const isEmpty = !isLoading && categories.length === 0;

  return {
    categories,
    pagination,
    isLoading,
    error,
    fetchCategories,
    refetch,
    reset,
    hasMore,
    isEmpty,
  };
};