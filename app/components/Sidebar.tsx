'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation'; 
import { 
  Home, 
  Store, 
  ShoppingBag, 
  Heart, 
  User,
  Tag,
  MessageCircle
} from 'lucide-react';

interface BottomNavProps {
  onNavigate?: (route: string) => void;
  className?: string;
  activeRoute?: string;
}

const BottomNav = ({ 
  onNavigate, 
  className = '',
  activeRoute: propActiveRoute 
}: BottomNavProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [activeRoute, setActiveRoute] = useState('home');
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Use prop or determine from pathname
  useEffect(() => {
    if (propActiveRoute) {
      setActiveRoute(propActiveRoute);
    } else if (pathname?.includes('/product-listing')) {
      setActiveRoute('explore');
    } else if (pathname?.includes('/profile')) {
      setActiveRoute('profile');
    } else if (pathname?.includes('/vendor')) {
      setActiveRoute('selling');
    } else if (pathname?.includes('/orders')) {
      setActiveRoute('orders');
    } else if (pathname?.includes('/wishlist')) {
      setActiveRoute('wishlist');
    } else if (pathname?.includes('/chat')) {
      setActiveRoute('chat');
    } else {
      setActiveRoute('home');
    }
  }, [pathname, propActiveRoute]);
  
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Store },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'selling', label: 'Selling', icon: Tag },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleNavClick = useCallback((routeId: string) => {
    // Prevent double-clicks during navigation
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    // Call parent's onNavigate if provided
    if (onNavigate) {
      onNavigate(routeId);
    }
    
    // Navigate to the appropriate route
    switch (routeId) {
      case 'explore':
        router.push('/product-listing');
        break;
      case 'chat':
        router.push('/chat');
        break;
      case 'profile':
        router.push('/profile');
        break;
      case 'selling':
        router.push('/vendor');
        break;
      case 'orders':
        router.push('/orders');
        break;
      case 'wishlist':
        router.push('/wishlist');
        break;
      case 'home':
      default:
        router.push('/dashboard');
        break;
    }
    
    // Reset navigating state after a short delay
    setTimeout(() => setIsNavigating(false), 500);
  }, [router, onNavigate, isNavigating]);
  
  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 ${className}`}>
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              disabled={isNavigating}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-all duration-200 cursor-pointer relative ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              } ${isNavigating ? 'pointer-events-none opacity-50' : ''}`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                {item.label}
              </span>
              
              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute -top-1 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
