// components/AddToCartButton.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import toast from 'react-hot-toast';
import type { Product } from '../types/product';

/**
 * AddToCartButton Component
 * Minimal button with sliding text animation
 * 
 * Features:
 * - Black background with white text
 * - Sliding text transition (Add to Cart ↔ Added)
 * - Green checkmark appears AFTER "Added!" text
 * - Only one state visible at a time
 */
interface AddToCartButtonProps {
  /** Product to add to cart */
  product: Product;
  
  /** Optional custom className */
  className?: string;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  className = '',
}) => {
  const { addToCart } = useCart();
  const [buttonState, setButtonState] = useState<'idle' | 'success'>('idle');

  /**
   * Handle button click
   */
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (buttonState === 'success') return;
    
    // Add to cart
    addToCart(product);
    
    // Show toast
    toast.success(`${product.name} added to cart!`, {
      duration: 2000,
      style: {
        background: '#111827',
        color: '#fff',
        borderRadius: '12px',
        padding: '12px 20px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      },
      iconTheme: {
        primary: '#22c55e',
        secondary: '#fff',
      },
    });
    
    // Show success state
    setButtonState('success');
    
    // Reset after 2 seconds
    setTimeout(() => {
      setButtonState('idle');
    }, 2000);
  }, [product, addToCart, buttonState]);

  return (
    <button
      onClick={handleClick}
      disabled={buttonState === 'success'}
      className={`
        relative overflow-hidden
        bg-black
        text-white
        font-bold
        px-6 py-3 rounded-xl
        transition-all duration-300 ease-out
        flex items-center justify-center gap-6
        cursor-pointer
        hover:bg-gray-800
        active:scale-[0.97]
        ${buttonState === 'success' ? 'bg-green-500 hover:bg-green-500' : ''}
        ${className}
      `}
      aria-label={`Add ${product.name} to cart`}
    >
      {/* Idle State - Shows icon and Add to Cart */}
      <div className={`
        flex items-center gap-6
        transition-all duration-300
        ${buttonState === 'success' ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}
      `}>
        <ShoppingBag className="h-4 w-4 flex-shrink-0" />
        <span>Add to Cart</span>
      </div>

      {/* Success State - Shows Added! and checkmark */}
      <div className={`
        absolute flex items-center gap-6
        transition-all duration-300
        ${buttonState === 'success' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
      `}>
        <span>Added!</span>
        <span className="bg-white rounded-full p-0.5">
          <Check className="h-5 w-5 text-green-500" />
        </span>
      </div>
    </button>
  );
};

export default AddToCartButton;
