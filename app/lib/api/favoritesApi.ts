// app/lib/api/favoritesApi.ts
import apiClient from '@/app/lib/api/apiClient';

export const favoritesApi = {
  // Get user's wishlist products
  getUserFavorites: async (params?: {
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/wishlist', { params });
    return response.data;
  },

  // Add product to wishlist
  addToFavorites: async (productId: string) => {
    const response = await apiClient.post(`/wishlist/product/${productId}`);
    return response.data;
  },

  // Remove product from wishlist
  removeFromFavorites: async (productId: string) => {
    const response = await apiClient.delete(`/wishlist/product/${productId}`);
    return response.data;
  },

  // Check if product is in wishlist
  checkIfFavorite: async (productId: string) => {
    const response = await apiClient.get(`/wishlist/product/${productId}/status`);
    return response.data;
  },

  // Clear all favorites
  clearAllFavorites: async () => {
    const response = await apiClient.delete('/wishlist/clear');
    return response.data;
  },
};
