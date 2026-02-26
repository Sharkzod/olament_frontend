// app/lib/hooks/useFavorites.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuthApi';
import { favoritesApi } from '../api/favoritesApi';

export const useFavorites = () => {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await favoritesApi.getUserFavorites();
      // Backend returns { success, products, pagination }
      setFavorites(data.products || []);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch favorites:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const addFavorite = useCallback(async (productId: string) => {
    try {
      await favoritesApi.addToFavorites(productId);
      await fetchFavorites();
    } catch (err) {
      throw err;
    }
  }, [fetchFavorites]);

  const removeFavorite = useCallback(async (productId: string) => {
    try {
      await favoritesApi.removeFromFavorites(productId);
      setFavorites(prev => prev.filter(fav =>
        fav._id !== productId && fav.id !== productId
      ));
    } catch (err) {
      throw err;
    }
  }, []);

  // Toggle: check if in favorites, then add or remove
  const toggleFavorite = useCallback(async (productId: string) => {
    const isCurrentlyFavorite = favorites.some(
      fav => (fav._id || fav.id) === productId
    );

    try {
      if (isCurrentlyFavorite) {
        await favoritesApi.removeFromFavorites(productId);
        setFavorites(prev => prev.filter(fav =>
          fav._id !== productId && fav.id !== productId
        ));
      } else {
        await favoritesApi.addToFavorites(productId);
        await fetchFavorites();
      }
    } catch (err) {
      throw err;
    }
  }, [favorites, fetchFavorites]);

  const clearAllFavorites = useCallback(async () => {
    try {
      await favoritesApi.clearAllFavorites();
      setFavorites([]);
    } catch (err) {
      throw err;
    }
  }, []);

  const checkIfFavorite = useCallback(async (productId: string) => {
    try {
      const response = await favoritesApi.checkIfFavorite(productId);
      // Backend returns { success, inWishlist }
      return response.inWishlist;
    } catch (err) {
      console.error('Failed to check favorite status:', err);
      return false;
    }
  }, []);

  // Check locally if a product is in favorites (no API call)
  const isFavorite = useCallback((productId: string) => {
    return favorites.some(fav => (fav._id || fav.id) === productId);
  }, [favorites]);

  // Get unique categories from favorites
  const getCategories = useCallback(() => {
    const categoryMap = new Map();

    favorites.forEach(product => {
      const category = product.category;
      if (category) {
        const categoryId = category._id || category;
        const categoryName = category.name || category;

        if (categoryMap.has(categoryId)) {
          categoryMap.get(categoryId).count++;
        } else {
          categoryMap.set(categoryId, {
            id: categoryId,
            name: categoryName,
            count: 1
          });
        }
      }
    });

    return Array.from(categoryMap.values());
  }, [favorites]);

  // Calculate total value of favorites
  const getTotalValue = useCallback(() => {
    return favorites.reduce((sum, product) =>
      sum + (product.discountPrice || product.price || 0), 0
    );
  }, [favorites]);

  // Initial fetch
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    isLoading,
    error,
    fetchFavorites,
    refetch: fetchFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearAllFavorites,
    checkIfFavorite,
    isFavorite,
    getCategories,
    getTotalValue,
    totalCount: favorites.length,
    hasFavorites: favorites.length > 0
  };
};
