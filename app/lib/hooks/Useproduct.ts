// hooks/useProduct.ts
import { useState, useEffect, useCallback } from 'react';
import { productApi } from '../api/productApi';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  quantity: number;
  isAvailable: boolean;
  isPublished: boolean;
  category: string;
  tags: string[];
  images: Array<{
    url: string;
    altText: string;
    isPrimary: boolean;
    order: number;
    _id: string;
  }>;
  specifications: Array<{
    key: string;
    value: string;
    _id: string;
  }>;
  vendor: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
    fullAddress: string;
    accountStatus: string;
  };
  brand: string;
  condition: string;
  views: number;
  favorites: number;
  status: string;
  ratings: {
    average: number;
    count: number;
  };
  discountPrice?: number;
  discountPercentage: number;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UseProductOptions {
  productId: string;
  autoFetch?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseProductReturn {
  product: Product | null;
  isLoading: boolean;
  error: Error | null;
  fetchProduct: () => Promise<void>;
  refetch: () => Promise<void>;
  reset: () => void;
  isEmpty: boolean;
}

export const useProduct = ({
  productId,
  autoFetch = true,
  onSuccess,
  onError,
}: UseProductOptions): UseProductReturn => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      console.warn('⚠️ useProduct - No product ID provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔍 Fetching product: ${productId}`);
      const response = await productApi.getProductById(productId);

      console.log('✅ useProduct - Raw API response:', response);

      if (response && response.success && response.product) {
        setProduct(response.product);

        // Call success callback if provided
        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        console.warn('⚠️ useProduct - Unexpected response structure:', response);
        setProduct(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch product');
      console.error('❌ useProduct - Error:', error);
      setError(error);
      setProduct(null);

      // Call error callback if provided
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [productId, onSuccess, onError]);

  const refetch = useCallback(() => {
    return fetchProduct();
  }, [fetchProduct]);

  const reset = useCallback(() => {
    setProduct(null);
    setError(null);
    setIsLoading(false);
  }, []);

  // Auto-fetch on mount or when productId changes
  useEffect(() => {
    if (autoFetch && productId) {
      fetchProduct();
    }
  }, [autoFetch, productId, fetchProduct]);

  const isEmpty = !isLoading && !product;

  return {
    product,
    isLoading,
    error,
    fetchProduct,
    refetch,
    reset,
    isEmpty,
  };
};