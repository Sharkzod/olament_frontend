// app/components/ProtectedRoute.tsx - UPDATED VERSION
'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../lib/contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    console.log('🛡️ ProtectedRoute: Auth state updated', {
      isAuthenticated,
      isLoading,
      timestamp: new Date().toISOString()
    });

    // Only check when loading is complete
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log('🛡️ ProtectedRoute: Not authenticated after loading, redirecting');
        router.replace('/login');
      } else {
        console.log('🛡️ ProtectedRoute: Authenticated, rendering children');
        setShouldRender(true);
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Only render children when authenticated AND loading is complete
  return shouldRender ? <>{children}</> : null;
}