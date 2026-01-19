// lib/api/productsApi.ts
import apiClient from './apiClient';

// Get all products
export const getAllProducts = async (params?: {
  shopId?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  featured?: boolean;
}) => {
  const response = await apiClient.get('/products', { params });
  return response.data;
};

// Get product by ID
export const getProductById = async (productId: string) => {
  const response = await apiClient.get(`/products/${productId}`);
  return response.data;
};

// Get shop products
export const getShopProducts = async (shopId: string, params?: {
  category?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await apiClient.get(`/shops/${shopId}/products`, { params });
  return response.data;
};

// Create product
export const createProduct = async (data: {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  subcategory?: string;
  images: string[];
  inventory: {
    sku: string;
    quantity: number;
    lowStockThreshold: number;
  };
  specifications?: Record<string, any>;
  tags?: string[];
}) => {
  const response = await apiClient.post('/products', data);
  return response.data;
};

// Update product
export const updateProduct = async (productId: string, data: {
  name?: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  category?: string;
  subcategory?: string;
  images?: string[];
  inventory?: {
    sku?: string;
    quantity?: number;
    lowStockThreshold?: number;
  };
  specifications?: Record<string, any>;
  tags?: string[];
}) => {
  const response = await apiClient.put(`/products/${productId}`, data);
  return response.data;
};

// Delete product
export const deleteProduct = async (productId: string) => {
  const response = await apiClient.delete(`/products/${productId}`);
  return response.data;
};

// Upload product images
export const uploadProductImages = async (productId: string, images: string[]) => {
  const response = await apiClient.post(`/products/${productId}/images`, { images });
  return response.data;
};