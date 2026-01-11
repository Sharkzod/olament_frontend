// components/ProtectedRoute.jsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, refreshAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading && !isAuthenticated) {
        // Try to refresh token
        const refreshed = await refreshAuth();
        if (!refreshed) {
          router.push('/login');
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, isLoading, router, refreshAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
}