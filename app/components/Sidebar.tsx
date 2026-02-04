'use client'
import React from 'react';
import { 
  Home, 
  Store, 
  ShoppingBag, 
  Heart, 
  User,
  Tag 
} from 'lucide-react';

interface BottomNavProps {
  onNavigate: (route: string) => void;
  activeRoute?: string;
  className?: string;
}

const BottomNav = ({ 
  onNavigate, 
  activeRoute = 'home', 
  className = '' 
}: BottomNavProps) => {
  
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Store },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'selling', label: 'Selling', icon: Tag },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 ${className}`}>
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
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