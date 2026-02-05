// hooks/useProductListing.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Product, ProductFilters, PaginationState } from '../types/product';

/**
 * Mock product data for development
 * TODO: Replace with actual API call to /api/products once backend is ready
 */
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 25000,
    comparePrice: 30000,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w-800&q=80',
    vendor: 'Tech Gadgets Hub',
    vendorId: 'v1',
    category: 'Electronics',
    rating: 4.5,
    reviewCount: 128,
    inStock: true,
    discountPercentage: 17,
  },
  {
    id: '2',
    name: 'Luxury Leather Handbag',
    description: 'Genuine leather handbag with premium finish',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w-800&q=80',
    vendor: 'Fashion Boutique',
    vendorId: 'v2',
    category: 'Fashion',
    rating: 4.8,
    reviewCount: 89,
    inStock: true,
  },
  {
    id: '3',
    name: 'Smart Fitness Watch',
    description: 'Track your health and fitness goals',
    price: 15000,
    comparePrice: 20000,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w-800&q=80',
    vendor: 'Tech Gadgets Hub',
    vendorId: 'v1',
    category: 'Electronics',
    rating: 4.3,
    reviewCount: 256,
    inStock: true,
    discountPercentage: 25,
  },
  {
    id: '4',
    name: 'Organic Green Tea Set',
    description: 'Premium organic green tea collection',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w-800&q=80',
    vendor: 'Fresh Grocery Store',
    vendorId: 'v3',
    category: 'Groceries',
    rating: 4.6,
    reviewCount: 67,
    inStock: true,
  },
  {
    id: '5',
    name: 'Designer Sunglasses',
    description: 'UV protection with stylish design',
    price: 12000,
    comparePrice: 15000,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w-800&q=80',
    vendor: 'Fashion Boutique',
    vendorId: 'v2',
    category: 'Fashion',
    rating: 4.4,
    reviewCount: 45,
    inStock: true,
    discountPercentage: 20,
  },
  {
    id: '6',
    name: 'Portable Bluetooth Speaker',
    description: 'Powerful sound in a compact design',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w-800&q-80',
    vendor: 'Tech Gadgets Hub',
    vendorId: 'v1',
    category: 'Electronics',
    rating: 4.2,
    reviewCount: 189,
    inStock: true,
  },
  {
    id: '7',
    name: 'Fresh Organic Avocados',
    description: 'Pack of 6 premium organic avocados',
    price: 2800,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w-800&q=80',
    vendor: 'Fresh Grocery Store',
    vendorId: 'v3',
    category: 'Groceries',
    rating: 4.7,
    reviewCount: 234,
    inStock: true,
  },
  {
    id: '8',
    name: 'Running Shoes Pro',
    description: 'Professional running shoes for athletes',
    price: 35000,
    comparePrice: 42000,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w-800&q=80',
    vendor: 'Sports World',
    vendorId: 'v4',
    category: 'Sports',
    rating: 4.6,
    reviewCount: 167,
    inStock: true,
    discountPercentage: 17,
  },
  {
    id: '9',
    name: 'Ceramic Coffee Mug Set',
    description: 'Set of 4 handmade ceramic mugs',
    price: 5500,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w-800&q-80',
    vendor: 'Home & Living',
    vendorId: 'v5',
    category: 'Home',
    rating: 4.4,
    reviewCount: 78,
    inStock: true,
  },
  {
    id: '10',
    name: 'Wireless Charging Pad',
    description: 'Fast wireless charger for all devices',
    price: 4500,
    comparePrice: 6000,
    image: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w-800&q-80',
    vendor: 'Tech Gadgets Hub',
    vendorId: 'v1',
    category: 'Electronics',
    rating: 4.1,
    reviewCount: 312,
    inStock: true,
    discountPercentage: 25,
  },
  {
    id: '11',
    name: 'Vintage Leather Wallet',
    description: 'Handcrafted genuine leather wallet',
    price: 7800,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w-800&q-80',
    vendor: 'Fashion Boutique',
    vendorId: 'v2',
    category: 'Fashion',
    rating: 4.5,
    reviewCount: 156,
    inStock: true,
  },
  {
    id: '12',
    name: 'Organic Honey Collection',
    description: 'Three varieties of pure organic honey',
    price: 4200,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w-800&q-80',
    vendor: 'Fresh Grocery Store',
    vendorId: 'v3',
    category: 'Groceries',
    rating: 4.8,
    reviewCount: 89,
    inStock: true,
  },
];

/**
 * Custom hook for fetching products with pagination and filtering
 * TODO: Replace mock implementation with actual API call
 * 
 * @param filters - ProductFilters object containing search, category, price range, etc.
 * @returns Product listing state and helper functions
 */
export function useProductListing(initialFilters: ProductFilters = {}) {
  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasMore: true,
  });
  
  // Filter state
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  
  // Refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /**
   * Fetch products from API
   * TODO: Connect to backend API endpoint
   * API Endpoint: GET /api/products
   * Query params: page, limit, search, category, minPrice, maxPrice, sortBy
   */
  const fetchProducts = useCallback(async (resetList = false) => {
    const currentPage = resetList ? 1 : pagination.page;
    
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // TODO: Replace with actual API call
      // const response = await fetch(
      //   `/api/products?page=${currentPage}&limit=${pagination.limit}&${new URLSearchParams(filters as Record<string, string>)}`
      // );
      // const data = await response.json();
      // if (data.success) { ... }

      // Mock data filtering simulation
      let filteredProducts = [...mockProducts];
      
      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(
          p => p.name.toLowerCase().includes(searchLower) ||
               p.vendor.toLowerCase().includes(searchLower) ||
               p.category?.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply category filter
      if (filters.category && filters.category !== 'All') {
        filteredProducts = filteredProducts.filter(
          p => p.category === filters.category
        );
      }
      
      // Apply price filter
      if (filters.minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(
          p => p.price >= filters.minPrice!
        );
      }
      if (filters.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(
          p => p.price <= filters.maxPrice!
        );
      }
      
      // Apply sorting
      switch (filters.sortBy) {
        case 'price-low':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'newest':
        default:
          filteredProducts.sort((a, b) => 
            (b.createdAt || '').localeCompare(a.createdAt || '')
          );
      }

      // Simulate pagination
      const total = filteredProducts.length;
      const totalPages = Math.ceil(total / pagination.limit);
      const startIndex = (currentPage - 1) * pagination.limit;
      const paginatedProducts = filteredProducts.slice(
        startIndex,
        startIndex + pagination.limit
      );

      // Update state
      if (resetList) {
        setProducts(paginatedProducts);
      } else {
        setProducts(prev => [...prev, ...paginatedProducts]);
      }

      setPagination(prev => ({
        ...prev,
        page: currentPage,
        total,
        totalPages,
        hasMore: currentPage < totalPages,
      }));
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  /**
   * Load more products (for infinite scroll)
   */
  const loadMore = useCallback(() => {
    if (!isLoading && pagination.hasMore) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [isLoading, pagination.hasMore]);

  /**
   * Update filters and refresh products
   */
  const updateFilters = useCallback((newFilters: ProductFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    setRefreshTrigger(prev => prev + 1);
  }, []);

  /**
   * Reset all filters
   */
  const resetFilters = useCallback(() => {
    setFilters({});
    setPagination(prev => ({ ...prev, page: 1 }));
    setRefreshTrigger(prev => prev + 1);
  }, []);

  /**
   * Refresh products when filters or pagination change
   */
  useEffect(() => {
    fetchProducts(true);
  }, [filters, pagination.page, refreshTrigger]);

  return {
    products,
    isLoading,
    error,
    pagination,
    filters,
    loadMore,
    updateFilters,
    resetFilters,
    refetch: () => fetchProducts(true),
  };
}

/**
 * Hook for single product details
 * TODO: Connect to GET /api/products/:id
 */
export function useProductDetails(productId: string | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // TODO: Replace with actual API call
        // const response = await fetch(`/api/products/${productId}`);
        // const data = await response.json();
        // if (data.success) setProduct(data.data);

        const found = mockProducts.find(p => p.id === productId);
        if (found) setProduct(found);
        else setError('Product not found');
      } catch (err) {
        setError('Failed to fetch product details');
        console.error('Error fetching product:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, isLoading, error };
}
