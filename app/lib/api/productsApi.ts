// lib/api/productApi.ts
import apiClient from './apiClient';

export const productApi = {
  // Get all products with optional filters
  getAllProducts: async (params?: any) => {
    try {
      const response = await apiClient.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
  
  // Get single product by ID
  getProductById: async (id: string) => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },
  
  // Get products by shop/vendor
  getProductsByShop: async (shopId: string, params?: any) => {
    try {
      const response = await apiClient.get(`/products/shop/${shopId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching shop products:', error);
      throw error;
    }
  },
  
  // Search products
  searchProducts: async (query: string, params?: any) => {
    try {
      const response = await apiClient.get(`/products/search`, { 
        params: { q: query, ...params } 
      });
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (categorySlug: string, params?: any) => {
    try {
      const response = await apiClient.get(`/products/categories/${categorySlug}/products`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching category products:', error);
      throw error;
    }
  },
};

// Also export individual functions for backwards compatibility
export const getAllProducts = productApi.getAllProducts;
export const getProductById = productApi.getProductById;
export const getProductsByShop = productApi.getProductsByShop;
export const searchProducts = productApi.searchProducts;
export const getProductsByCategory = productApi.getProductsByCategory;