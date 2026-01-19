// lib/hooks/useMarkets.ts - SIMPLIFIED FIX
import { useState, useCallback, useEffect } from 'react';
import { marketApi, Market, MarketResponse, StatesResponse } from '../api/marketApi';

interface UseMarketsReturn {
  // Data
  markets: Market[];
  states: string[];
  selectedState: string;
  selectedCity: string;
  loading: boolean;
  error: string | null;
  
  // Actions
  getAvailableStates: () => Promise<{ success: boolean; states?: string[]; error?: string }>;
  getMarketsByState: (state: string) => Promise<{ success: boolean; markets?: Market[]; error?: string }>;
  getMarketsByStateAndCity: (state: string, city: string) => Promise<{ success: boolean; markets?: Market[]; error?: string }>;
  getAllMarkets: () => Promise<{ success: boolean; markets?: Market[]; error?: string }>;
  setSelectedState: (state: string) => void;
  setSelectedCity: (city: string) => void;
  refreshMarkets: () => Promise<void>;
}

export const useMarkets = (initialState = "Lagos"): UseMarketsReturn => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>(initialState);
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get available states
  const getAvailableStates = useCallback(async (): Promise<{ success: boolean; states?: string[]; error?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏪 useMarkets: Getting available states...');
      const response = await marketApi.getAvailableStates();
      
      if (response.success) {
        console.log('🏪 useMarkets: States fetched successfully:', response.data?.states);
        const statesList = response.data?.states || [];
        setStates(statesList);
        return { success: true, states: statesList };
      } else {
        const errorMsg = response.message || 'Failed to fetch states';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('🏪 useMarkets: Error fetching states:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch states';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper function to extract market data from various response formats
  const extractMarketData = (response: any): Market[] => {
    // If response is already an array of markets
    if (Array.isArray(response)) {
      return response;
    }
    
    // If response has data property that's an array
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    // If response has data.markets
    if (response?.data?.markets && Array.isArray(response.data.markets)) {
      return response.data.markets;
    }
    
    // If response has markets property directly
    if (response?.markets && Array.isArray(response.markets)) {
      return response.markets;
    }
    
    // If response.data is an object with markets (using type assertion to bypass TypeScript)
    const data = response?.data;
    if (data && typeof data === 'object' && 'markets' in data && Array.isArray((data as any).markets)) {
      return (data as any).markets;
    }
    
    return [];
  };

  // Get markets by state
  const getMarketsByState = useCallback(async (state: string): Promise<{ success: boolean; markets?: Market[]; error?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏪 useMarkets: Getting markets by state:', state);
      const response = await marketApi.getMarketsByState(state);
      
      console.log('🏪 useMarkets: Raw API response:', response);
      
      if (response?.success === false) {
        // If markets not found but API returns success: false with message
        const errorMsg = response.message || 'No markets found';
        setError(errorMsg);
        setMarkets([]);
        return { success: false, error: errorMsg };
      }
      
      // Extract market data using helper function
      const marketData = extractMarketData(response);
      
      console.log('🏪 useMarkets: Extracted market data:', marketData);
      
      if (marketData.length > 0) {
        console.log('🏪 useMarkets: Markets fetched successfully:', marketData.length, 'markets');
        setMarkets(marketData);
        return { success: true, markets: marketData };
      } else {
        const errorMsg = response?.message || 'No markets found in this state';
        setError(errorMsg);
        setMarkets([]);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('🏪 useMarkets: Error fetching markets by state:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch markets';
      setError(errorMessage);
      setMarkets([]);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get markets by state and city
  const getMarketsByStateAndCity = useCallback(async (state: string, city: string): Promise<{ success: boolean; markets?: Market[]; error?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏪 useMarkets: Getting markets by state and city:', { state, city });
      const response = await marketApi.getMarketsByStateAndCity(state, city);
      
      console.log('🏪 useMarkets: Raw API response:', response);
      
      if (response?.success === false) {
        const errorMsg = response.message || 'No markets found';
        setError(errorMsg);
        setMarkets([]);
        return { success: false, error: errorMsg };
      }
      
      // Extract market data using helper function
      const marketData = extractMarketData(response);
      
      if (marketData.length > 0) {
        console.log('🏪 useMarkets: Markets fetched successfully:', marketData.length, 'markets');
        setMarkets(marketData);
        return { success: true, markets: marketData };
      } else {
        const errorMsg = response?.message || 'No markets found';
        setError(errorMsg);
        setMarkets([]);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('🏪 useMarkets: Error fetching markets by state and city:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch markets';
      setError(errorMessage);
      setMarkets([]);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all markets
  const getAllMarkets = useCallback(async (): Promise<{ success: boolean; markets?: Market[]; error?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏪 useMarkets: Getting all markets...');
      const response = await marketApi.getAllMarkets();
      
      // Extract market data using helper function
      const marketData = extractMarketData(response);
      
      if (marketData.length > 0) {
        console.log('🏪 useMarkets: All markets fetched successfully:', marketData.length, 'markets');
        setMarkets(marketData);
        return { success: true, markets: marketData };
      } else {
        const errorMsg = response?.message || 'No markets found';
        setError(errorMsg);
        setMarkets([]);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      console.error('🏪 useMarkets: Error fetching all markets:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch markets';
      setError(errorMessage);
      setMarkets([]);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh markets based on current selections
  const refreshMarkets = useCallback(async () => {
    if (selectedCity && selectedCity.toLowerCase() !== 'all') {
      await getMarketsByStateAndCity(selectedState, selectedCity);
    } else {
      await getMarketsByState(selectedState);
    }
  }, [selectedState, selectedCity, getMarketsByState, getMarketsByStateAndCity]);

  // Initialize states on mount
  useEffect(() => {
    const initializeData = async () => {
      await getAvailableStates();
      await getMarketsByState(selectedState);
    };
    
    initializeData();
  }, [getAvailableStates, getMarketsByState, selectedState]);

  // Fetch markets when selected state or city changes
  useEffect(() => {
    refreshMarkets();
  }, [selectedState, selectedCity, refreshMarkets]);

  return {
    markets,
    states,
    selectedState,
    selectedCity,
    loading,
    error,
    getAvailableStates,
    getMarketsByState,
    getMarketsByStateAndCity,
    getAllMarkets,
    setSelectedState,
    setSelectedCity,
    refreshMarkets,
  };
};