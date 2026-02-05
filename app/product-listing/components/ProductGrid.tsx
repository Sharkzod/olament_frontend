// components/ProductGrid.tsx
'use client';

import React from 'react';
import { ProductCard } from './ProductCard';
import type { Product } from '../types/product';

/**
 * ProductGrid Component
 * Responsive grid wrapper for product cards
 * 
 * Responsive Breakpoints:
 * - Mobile (default): 1 column
 * - sm: 2 columns
 * - md: 2-3 columns
 * - lg: 3-4 columns
 * - xl: 4 columns
 */

interface ProductGridProps {
  /** Array of products to display */
  products: Product[];
  
  /** Loading state indicator */
  isLoading?: boolean;
  
  /** Empty state message */
  emptyMessage?: string;
  
  /** Optional click handler for product selection */
  onProductClick?: (product: Product) => void;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Default empty message when no products found
 */
const DEFAULT_EMPTY_MESSAGE = 'No products found';

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  onProductClick,
  className = '',
}) => {
  // Don't show empty state while loading
  if (isLoading) {
    return null;
  }

  // Show empty state
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-500 text-sm text-center max-w-sm">
          Try adjusting your search or filter criteria to find what you&apos;re looking for.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`
        grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4
        gap-4 md:gap-6
        ${className}
      `}
      role="list"
      aria-label="Product listing"
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={onProductClick}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
