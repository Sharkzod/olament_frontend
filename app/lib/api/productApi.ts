// lib/api/productApi.ts
import apiClient from './apiClient';


export const productApi = {
  getAllProducts: async (params?: any) => {
    try {
      const response = await apiClient.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
  
  getProductById: async (id: string) => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },
  
  getProductsByShop: async (shopId: string, params?: any) => {
    try {
      const response = await apiClient.get(`/products/shop/${shopId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching shop products:', error);
      throw error;
    }
  },
  
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
};