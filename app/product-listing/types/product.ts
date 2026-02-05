// types/product.ts
/**
 * Product type definition for the Explore Page
 * TODO: Replace with actual API response type when backend is connected
 */

export interface Product {
  /** Unique product identifier */
  id: string;
  
  /** Product display name */
  name: string;
  
  /** Product description */
  description?: string;
  
  /** Current selling price in Naira */
  price: number;
  
  /** Original price (for showing discount) */
  comparePrice?: number;
  
  /** Product image URL */
  image: string;
  
  /** Product images array for gallery */
  images?: string[];
  
  /** Vendor/Shop name */
  vendor: string;
  
  /** Vendor ID for navigation */
  vendorId?: string;
  
  /** Product category */
  category?: string;
  
  /** Product rating (0-5) */
  rating?: number;
  
  /** Number of reviews */
  reviewCount?: number;
  
  /** Stock availability status */
  inStock?: boolean;
  
  /** Discount percentage (calculated) */
  discountPercentage?: number;
  
  /** Product tags for filtering */
  tags?: string[];
  
  /** Creation timestamp */
  createdAt?: string;
}

/**
 * Filter state for product listing
 * TODO: Connect to backend API via query parameters
 */
export interface ProductFilters {
  /** Search query string */
  search?: string;
  
  /** Selected category */
  category?: string;
  
  /** Price range minimum */
  minPrice?: number;
  
  /** Price range maximum */
  maxPrice?: number;
  
  /** Sort option */
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'rating' | 'popular';
}

/**
 * Pagination state for infinite scroll
 */
export interface PaginationState {
  /** Current page number */
  page: number;
  
  /** Items per page */
  limit: number;
  
  /** Total items count */
  total: number;
  
  /** Total pages */
  totalPages: number;
  
  /** Has more items to load */
  hasMore: boolean;
}

/**
 * API response wrapper for products
 * TODO: Replace with actual API response structure
 */
export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  };
}
