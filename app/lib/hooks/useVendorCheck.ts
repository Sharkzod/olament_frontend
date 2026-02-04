import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuthApi';

export interface VendorStatus {
  isVendor: boolean;
  isApproved: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useVendorCheck = () => {
  const router = useRouter();
  const { user, token } = useAuth();
  const [vendorStatus, setVendorStatus] = useState<VendorStatus>({
    isVendor: false,
    isApproved: false,
    isLoading: true,
    error: null
  });

  const checkVendorStatus = useCallback(async (): Promise<VendorStatus> => {
    if (!user || !token) {
      return { isVendor: false, isApproved: false, isLoading: false, error: 'Not authenticated' };
    }

    try {
      // First check user role from auth context
      if (user.role === 'vendor') {
        // If user is vendor, check if they have a vendor profile
        const response = await fetch('/api/vendors/status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          return {
            isVendor: true,
            isApproved: data.status === 'approved',
            isLoading: false,
            error: null
          };
        }
      }

      return {
        isVendor: false,
        isApproved: false,
        isLoading: false,
        error: null
      };
    } catch (error) {
      console.error('Error checking vendor status:', error);
      return {
        isVendor: false,
        isApproved: false,
        isLoading: false,
        error: 'Failed to check vendor status'
      };
    }
  }, [user, token]);

  useEffect(() => {
    const initializeCheck = async () => {
      const status = await checkVendorStatus();
      setVendorStatus(status);
      
      // Redirect if already a vendor
      if (status.isVendor && status.isApproved) {
        router.push('/vendor/dashboard');
      }
    };

    if (user && token) {
      initializeCheck();
    } else {
      setVendorStatus(prev => ({ ...prev, isLoading: false }));
    }
  }, [user, token, router, checkVendorStatus]);

  return {
    ...vendorStatus,
    checkVendorStatus
  };
};