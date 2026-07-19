// lib/api/categoryApi.ts
import apiClient from './apiClient';

// Get all categories actually used by products (Product.category is a fixed
// enum, not the separate admin-curated Category collection).
export const getAllCategories = async () => {
  const response = await apiClient.get('/products/categories/distinct');
  return response.data;
};

// Get category by ID
export const getCategoryById = async (categoryId: string) => {
  const response = await apiClient.get(`/products/categories/${categoryId}`);
  return response.data;
};

// Get category products
export const getCategoryProducts = async (categoryId: string, params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}) => {
  const response = await apiClient.get(`/products/categories/${categoryId}/products`, { params });
  return response.data;
};