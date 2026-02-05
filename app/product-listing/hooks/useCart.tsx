// hooks/useCart.tsx
'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import type { Product } from '../types/product';

/**
 * Cart Item Interface with quantity
 */
export interface CartItem extends Product {
  quantity: number;
}

/**
 * Cart Context Interface
 * Defines the shape of cart state and actions
 */
interface CartContextType {
  /** Array of cart items with quantity */
  cartItems: CartItem[];
  
  /** Total number of items in cart */
  cartCount: number;
  
  /** Add product to cart (defaults to quantity 1) */
  addToCart: (product: Product) => void;
  
  /** Update item quantity */
  updateQuantity: (productId: string, quantity: number) => void;
  
  /** Increment item quantity by 1 */
  incrementQuantity: (productId: string) => void;
  
  /** Decrement item quantity by 1 */
  decrementQuantity: (productId: string) => void;
  
  /** Remove product from cart by ID */
  removeFromCart: (productId: string) => void;
  
  /** Clear all items from cart */
  clearCart: () => void;
  
  /** Check if product is in cart */
  isInCart: (productId: string) => boolean;
  
  /** Calculate total price */
  cartTotal: number;
}

/**
 * Cart Context
 * Provides cart state and actions throughout the app
 */
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Cart Provider Component
 * Wraps app components to provide cart functionality
 * 
 * TODO: Replace localStorage persistence with backend API calls
 * TODO: Replace mock addToCart with actual API call to cart endpoint
 */
interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount (client-side only)
  useEffect(() => {
    const savedCart = localStorage.getItem('olament-cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('olament-cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  /**
   * Add product to cart (defaults to quantity 1)
   * TODO: Replace with actual API call:
   * await fetch('/api/cart/add', {
   *   method: 'POST',
   *   body: JSON.stringify({ productId: product.id, quantity: 1 }),
   *   headers: { 'Content-Type': 'application/json' },
   * });
   */
  const addToCart = useCallback((product: Product) => {
    setCartItems((prev) => {
      // Check if product already exists in cart
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      
      if (existingIndex >= 0) {
        // Increment quantity if product already exists
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      
      // Add new item with quantity 1
      return [...prev, { ...product, quantity: 1 }];
    });
    
    console.log('Added to cart:', product.name);
  }, []);

  /**
   * Update item quantity
   * TODO: Replace with actual API call
   */
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      // Remove item if quantity would be less than 1
      removeFromCart(productId);
      return;
    }
    
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
    console.log('Updated quantity:', productId, quantity);
  }, []);

  /**
   * Increment item quantity by 1
   * TODO: Replace with actual API call
   */
  const incrementQuantity = useCallback((productId: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }, []);

  /**
   * Decrement item quantity by 1
   * TODO: Replace with actual API call
   */
  const decrementQuantity = useCallback((productId: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ).filter((item) => item.quantity > 0)
    );
  }, []);

  /**
   * Remove product from cart by ID
   * TODO: Replace with actual API call
   */
  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
    console.log('Removed from cart:', productId);
  }, []);

  /**
   * Clear all items from cart
   * TODO: Replace with actual API call
   */
  const clearCart = useCallback(() => {
    setCartItems([]);
    console.log('Cart cleared');
  }, []);

  /**
   * Check if product is in cart
   */
  const isInCart = useCallback((productId: string) => {
    return cartItems.some((item) => item.id === productId);
  }, [cartItems]);

  /**
   * Calculate total price of all items in cart
   */
  const cartTotal = React.useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  /**
   * Calculate total number of items in cart (sum of quantities)
   */
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        updateQuantity,
        incrementQuantity,
        decrementQuantity,
        removeFromCart,
        clearCart,
        isInCart,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/**
 * useCart Hook
 * Custom hook to access cart functionality in components
 * 
 * @throws Error if used outside of CartProvider
 */
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default useCart;
