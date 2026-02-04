// types/product.ts

export interface ProductVendor {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  vendorProfile?: {
    businessName?: string;
    businessType?: string;
    businessAddress?: string;
    businessPhone?: string;
    businessEmail?: string;
    taxId?: string;
    verified?: boolean;
  };
}

export interface Product {
  _id: string;
  id?: string; // Alternative ID field
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  
  // Images
  images: string[];
  thumbnail?: string;
  
  // Inventory
  quantity: number;
  inStock: boolean;
  isAvailable: boolean;
  isPublished: boolean;
  
  // Vendor/Shop
  vendor?: string | ProductVendor;
  shopId?: string;
  
  // Ratings & Reviews
  rating?: number;
  ratings?: {
    average: number;
    count: number;
  };
  reviewCount?: number;
  totalReviews?: number;
  
  // Product Details
  status: 'draft' | 'published' | 'archived';
  condition: 'new' | 'used' | 'refurbished';
  tags: string[];
  specifications?: Array<{ key: string; value: string }> | Record<string, any>;
  
  // Dimensions & Weight
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit: string;
  };
  weight?: {
    value?: number;
    unit: string;
  };
  
  // Shipping
  shipping?: {
    isFree: boolean;
    cost: number;
    estimatedDays?: number;
  };
  
  // Inventory details
  inventory?: {
    sku?: string;
    quantity: number;
    lowStockThreshold?: number;
  };
  
  // Stats
  views?: number;
  favorites?: number;
  soldCount?: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  
  // Other
  unit?: string;
  brand?: string;
  model?: string;
  __v?: number;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  status?: 'draft' | 'published' | 'archived';
  vendor?: string;
  shopId?: string;
  isAvailable?: boolean;
  isPublished?: boolean;
  featured?: boolean;
  inStock?: boolean;
  condition?: 'new' | 'used' | 'refurbished';
  tags?: string[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalDocs: number;
  totalPages: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface ProductsResponse {
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

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  subcategory?: string;
  images: string[];
  quantity: number;
  tags?: string[];
  specifications?: Record<string, any>;
  condition?: 'new' | 'used' | 'refurbished';
  shopId?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  isAvailable?: boolean;
  isPublished?: boolean;
  status?: 'draft' | 'published' | 'archived';
}