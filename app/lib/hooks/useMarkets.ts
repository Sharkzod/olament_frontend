// lib/hooks/useMarkets.ts - OPTIMIZED TO PREVENT INFINITE LOOPS
import { useState, useCallback, useEffect, useRef } from 'react';
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

  // Refs to prevent duplicate requests
  const isFetchingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const lastStateRef = useRef<string>('');
  const lastCityRef = useRef<string>('');

  // Get available states
  const getAvailableStates = useCallback(async (): Promise<{ success: boolean; states?: string[]; error?: string }> => {
    if (isFetchingRef.current) {
      console.log('⏸️ useMarkets: Skipping duplicate states request');
      return { success: false, error: 'Already fetching' };
    }

    setLoading(true);
    setError(null);
    isFetchingRef.current = true;
    
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
      isFetchingRef.current = false;
    }
  }, []); // Empty deps - stable function

  // Helper function to extract market data from various response formats
  const extractMarketData = useCallback((response: any): Market[] => {
    if (Array.isArray(response)) {
      return response;
    }
    
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    if (response?.data?.markets && Array.isArray(response.data.markets)) {
      return response.data.markets;
    }
    
    if (response?.markets && Array.isArray(response.markets)) {
      return response.markets;
    }
    
    const data = response?.data;
    if (data && typeof data === 'object' && 'markets' in data && Array.isArray((data as any).markets)) {
      return (data as any).markets;
    }
    
    return [];
  }, []);

  // Get markets by state
  const getMarketsByState = useCallback(async (state: string): Promise<{ success: boolean; markets?: Market[]; error?: string }> => {
    if (isFetchingRef.current) {
      console.log('⏸️ useMarkets: Skipping duplicate markets request');
      return { success: false, error: 'Already fetching' };
    }

    setLoading(true);
    setError(null);
    isFetchingRef.current = true;
    
    try {
      console.log('🏪 useMarkets: Getting markets by state:', state);
      const response = await marketApi.getMarketsByState(state);
      
      console.log('🏪 useMarkets: Raw API response:', response);
      
      if (response?.success === false) {
        const errorMsg = response.message || 'No markets found';
        setError(errorMsg);
        setMarkets([]);
        return { success: false, error: errorMsg };
      }
      
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
      isFetchingRef.current = false;
    }
  }, [extractMarketData]); // Only depend on extractMarketData

  // Get markets by state and city
  const getMarketsByStateAndCity = useCallback(async (state: string, city: string): Promise<{ success: boolean; markets?: Market[]; error?: string }> => {
    if (isFetchingRef.current) {
      console.log('⏸️ useMarkets: Skipping duplicate markets request');
      return { success: false, error: 'Already fetching' };
    }

    setLoading(true);
    setError(null);
    isFetchingRef.current = true;
    
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
      isFetchingRef.current = false;
    }
  }, [extractMarketData]);

  // Get all markets
  const getAllMarkets = useCallback(async (): Promise<{ success: boolean; markets?: Market[]; error?: string }> => {
    if (isFetchingRef.current) {
      console.log('⏸️ useMarkets: Skipping duplicate markets request');
      return { success: false, error: 'Already fetching' };
    }

    setLoading(true);
    setError(null);
    isFetchingRef.current = true;
    
    try {
      console.log('🏪 useMarkets: Getting all markets...');
      const response = await marketApi.getAllMarkets();
      
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
      isFetchingRef.current = false;
    }
  }, [extractMarketData]);

  // Refresh markets based on current selections
  const refreshMarkets = useCallback(async () => {
    if (selectedCity && selectedCity.toLowerCase() !== 'all') {
      await getMarketsByStateAndCity(selectedState, selectedCity);
    } else {
      await getMarketsByState(selectedState);
    }
  }, [selectedState, selectedCity, getMarketsByState, getMarketsByStateAndCity]);

  // Initialize states on mount ONLY ONCE
  useEffect(() => {
    if (hasInitializedRef.current) {
      console.log('⏸️ useMarkets: Already initialized, skipping');
      return;
    }

    const initializeData = async () => {
      console.log('🔄 useMarkets: Initializing data...');
      hasInitializedRef.current = true;
      
      await getAvailableStates();
      await getMarketsByState(initialState);
    };
    
    initializeData();
  }, []); // Empty deps - only run once on mount

  // Fetch markets when selected state or city changes (but not on initial mount)
  useEffect(() => {
    // Skip if not initialized yet
    if (!hasInitializedRef.current) {
      return;
    }

    // Skip if state/city haven't actually changed
    if (selectedState === lastStateRef.current && selectedCity === lastCityRef.current) {
      return;
    }

    console.log('🔄 useMarkets: State/City changed, fetching markets...', {
      from: { state: lastStateRef.current, city: lastCityRef.current },
      to: { state: selectedState, city: selectedCity }
    });

    // Update refs
    lastStateRef.current = selectedState;
    lastCityRef.current = selectedCity;

    // Fetch markets
    if (selectedCity && selectedCity.toLowerCase() !== 'all') {
      getMarketsByStateAndCity(selectedState, selectedCity);
    } else {
      getMarketsByState(selectedState);
    }
  }, [selectedState, selectedCity]); // Only depend on state/city changes

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