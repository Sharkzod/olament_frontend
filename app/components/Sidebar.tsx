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
  
  // Determine active route from pathname
  useEffect(() => {
    if (propActiveRoute) {
      setActiveRoute(propActiveRoute);
      return;
    }

    // More specific path matching
    if (pathname === '/dashboard' || pathname === '/') {
      setActiveRoute('home');
    } else if (pathname?.startsWith('/categories') || pathname?.startsWith('/product-listing')) {
      setActiveRoute('explore');
    } else if (pathname?.startsWith('/chat')) {
      setActiveRoute('chat');
    } else if (pathname?.startsWith('/orders')) {
      setActiveRoute('orders');
    } else if (pathname?.startsWith('/favorites')) {
      setActiveRoute('favorites');
    } else if (pathname?.startsWith('/vendor') || pathname?.startsWith('/selling')) {
      setActiveRoute('selling');
    } else if (pathname?.startsWith('/profile')) {
      setActiveRoute('profile');
    } else {
      setActiveRoute('home');
    }
  }, [pathname, propActiveRoute]);
  
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Store },
    // { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'favorites', label: 'Wishlist', icon: Heart },
    // { id: 'selling', label: 'Selling', icon: Tag },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleNavClick = useCallback((routeId: string) => {
    // Prevent double-clicks during navigation
    if (isNavigating) return;
    
    // Immediately update active state for instant visual feedback
    setActiveRoute(routeId);
    setIsNavigating(true);
    
    // Call parent's onNavigate if provided
    if (onNavigate) {
      onNavigate(routeId);
    }
    
    // Navigate to the appropriate route
    switch (routeId) {
      case 'explore':
        router.push('/categories');
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
      case 'favorites':
        router.push('/favorites');
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
              className={`
                flex flex-col items-center justify-center 
                w-14 h-14 rounded-lg 
                transition-all duration-300 ease-in-out
                cursor-pointer relative
                ${isActive 
                  ? 'text-blue-600 bg-blue-50 scale-105' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 hover:scale-105'
                } 
                ${isNavigating ? 'pointer-events-none opacity-50' : ''}
              `}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon 
                className={`
                  h-5 w-5 mb-1 
                  transition-colors duration-300
                  ${isActive ? 'text-blue-600' : 'text-gray-500'}
                `} 
              />
              <span 
                className={`
                  text-xs font-medium 
                  transition-colors duration-300
                  ${isActive ? 'text-blue-600' : 'text-gray-600'}
                `}
              >
                {item.label}
              </span>
              
              {/* Active indicator dot */}
              {isActive && (
                <div 
                  className="
                    absolute -top-1 
                    w-1.5 h-1.5 
                    bg-blue-600 rounded-full
                    animate-pulse
                  "
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;