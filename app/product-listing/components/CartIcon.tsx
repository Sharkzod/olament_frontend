// components/CartIcon.tsx
'use client';

import React, { forwardRef } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart';

interface CartIconProps {
  /** Optional click handler */
  onClick?: () => void;
  
  /** Optional ref for animation targeting */
  cartRef?: React.RefObject<HTMLButtonElement>;
}

/**
 * CartIcon Component
 * Displays cart icon with item count badge in the header
 * 
 * Features:
 * - Animated bounce effect when items are added
 * - Badge shows total item count
 * - Pulsing animation when cart has items
 * - Accessible with proper ARIA labels
 */
export const CartIcon = forwardRef<HTMLButtonElement, CartIconProps>(
  ({ onClick, ...props }, ref) => {
    const { cartCount } = useCart();
    const [isAnimating, setIsAnimating] = React.useState(false);
    const [showBadge, setShowBadge] = React.useState(false);

    // Trigger animation when cart count changes
    React.useEffect(() => {
      if (cartCount > 0) {
        setShowBadge(true);
        setIsAnimating(true);
        const timer = setTimeout(() => {
          setIsAnimating(false);
        }, 600);
        return () => clearTimeout(timer);
      } else {
        setShowBadge(false);
      }
    }, [cartCount]);

    return (
      <button
        ref={ref}
        onClick={onClick}
        className={`relative p-2 rounded-full transition-all duration-200 ${
          cartCount > 0 
            ? 'bg-yellow-400 text-gray-900' 
            : 'bg-white/80 text-gray-600 hover:bg-white'
        } shadow-md hover:shadow-lg active:scale-95`}
        aria-label={`Shopping cart with ${cartCount} items`}
        {...props}
      >
        <ShoppingBag 
          className={`h-5 w-5 transition-transform duration-300 ${
            isAnimating ? 'scale-125' : 'scale-100'
          }`}
        />
        
        {/* Cart count badge */}
        {showBadge && (
          <span 
            className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1 transition-all duration-300 ${
              isAnimating ? 'scale-125' : 'scale-100'
            }`}
          >
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
        
        {/* Pulsing ring effect when animating */}
        {isAnimating && (
          <span className="absolute inset-0 rounded-full animate-ping bg-yellow-400/50" />
        )}
      </button>
    );
  }
);

CartIcon.displayName = 'CartIcon';

export default CartIcon;
