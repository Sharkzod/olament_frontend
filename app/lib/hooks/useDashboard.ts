import { useState, useCallback, useEffect } from 'react';
import { dashboardApi, CustomerDashboard, VendorDashboard } from '../api/dashboardApi';

export const useCustomerDashboard = () => {
  const [dashboard, setDashboard] = useState<CustomerDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardApi.getCustomerDashboard();
      if (result.success && result.dashboard) {
        setDashboard(result.dashboard);
      } else {
        setError(result.error || 'Failed to fetch dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { dashboard, loading, error, fetchDashboard };
};

export const useVendorDashboard = () => {
  const [dashboard, setDashboard] = useState<VendorDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardApi.getVendorDashboard();
      if (result.success && result.dashboard) {
        setDashboard(result.dashboard);
      } else {
        setError(result.error || 'Failed to fetch dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { dashboard, loading, error, fetchDashboard };
};
