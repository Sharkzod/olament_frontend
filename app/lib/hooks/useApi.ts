// hooks/useApi.ts
import { useState, useCallback } from 'react';
import apiClient from '../api/apiClient';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface UseApiOptions<T> {
  method?: HttpMethod;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export function useApi<T = any>(
  url: string,
  options: UseApiOptions<T> = {}
) {
  const { method = 'GET', onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (body?: any, params?: any) => {
      setIsLoading(true);
      setError(null);

      try {
        const config: any = {};
        if (body) config.data = body;
        if (params) config.params = params;

        const response = await apiClient({
          url,
          method,
          ...config,
        });

        setData(response.data);
        onSuccess?.(response.data);
        return { success: true, data: response.data };
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
        setError(errorMessage);
        onError?.(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [url, method, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  };
}