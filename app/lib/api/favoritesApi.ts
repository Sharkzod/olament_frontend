// app/lib/api/favoritesApi.ts
import apiClient from '@/app/lib/api/apiClient';

export const favoritesApi = {
  // Get user's favorite products
  getUserFavorites: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    sortBy?: string;
  }) => {
    const response = await apiClient.get('/products/favorites', { params });
    return response.data;
  },

  // Add product to favorites
  addToFavorites: async (productId: string) => {
    const response = await apiClient.post(`/products/favorites/${productId}`);
    return response.data;
  },

  // Remove product from favorites
  removeFromFavorites: async (productId: string) => {
    const response = await apiClient.delete(`/products/favorites/${productId}`);
    return response.data;
  },

  // Toggle favorite status
  toggleFavorite: async (productId: string) => {
    const response = await apiClient.post(`/products/favorites/toggle/${productId}`);
    return response.data;
  },

  // Check if product is in favorites
  checkIfFavorite: async (productId: string) => {
    const response = await apiClient.get(`/products/favorites/check/${productId}`);
    return response.data;
  },

  // Clear all favorites
  clearAllFavorites: async () => {
    const response = await apiClient.delete('/products/favorites/clear');
    return response.data;
  },

  // Get most favorited products (public)
  getMostFavoritedProducts: async (params?: {
    limit?: number;
    days?: number;
  }) => {
    const response = await apiClient.get('/products/most-favorited', { params });
    return response.data;
  }
};