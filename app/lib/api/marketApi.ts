// lib/api/marketApi.ts
import apiClient from './apiClient';

export interface Market {
  _id: string;
  name: string;
  description: string;
  state: string;
  city: string;
  address: string;
  vendorIds: string[];
  productIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarketResponse {
  success: boolean;
  message?: string;
  data: Market[];
  count?: number;
  state?: string;
  city?: string;
}

export interface StatesResponse {
  success: boolean;
  message?: string;
  data: {
    count: number;
    states: string[];
  };
}

export interface BaseResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

class MarketApi {
  // Get all available states with markets
  async getAvailableStates(): Promise<BaseResponse<{ count: number; states: string[] }>> {
    try {
      console.log('🏪 MarketApi: Getting available states...');
      const response = await apiClient.get('/markets/states');
      console.log('🏪 MarketApi: States response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🏪 MarketApi: States fetch error:', error);
      throw error;
    }
  }

  // Get markets by state
  async getMarketsByState(state: string): Promise<MarketResponse> {
    try {
      console.log('🏪 MarketApi: Getting markets by state:', state);
      const response = await apiClient.get(`/markets/state/${encodeURIComponent(state)}`);
      console.log('🏪 MarketApi: Markets by state response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🏪 MarketApi: Markets by state fetch error:', error);
      throw error;
    }
  }

  // Get markets by state and city
  async getMarketsByStateAndCity(state: string, city: string): Promise<MarketResponse> {
    try {
      console.log('🏪 MarketApi: Getting markets by state and city:', { state, city });
      const response = await apiClient.get(
        `/markets/state/${encodeURIComponent(state)}/city/${encodeURIComponent(city)}`
      );
      console.log('🏪 MarketApi: Markets by state and city response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🏪 MarketApi: Markets by state and city fetch error:', error);
      throw error;
    }
  }

  // Get all markets
  async getAllMarkets(): Promise<MarketResponse> {
    try {
      console.log('🏪 MarketApi: Getting all markets...');
      const response = await apiClient.get('/markets');
      console.log('🏪 MarketApi: All markets response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🏪 MarketApi: All markets fetch error:', error);
      throw error;
    }
  }

  // Create a new market (if needed)
  async createMarket(data: Partial<Market>): Promise<BaseResponse<Market>> {
    try {
      console.log('🏪 MarketApi: Creating market...', data);
      const response = await apiClient.post('/markets', data);
      console.log('🏪 MarketApi: Create market response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🏪 MarketApi: Create market error:', error);
      throw error;
    }
  }
}

export const marketApi = new MarketApi();