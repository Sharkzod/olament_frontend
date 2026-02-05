// components/LoadingSkeleton.tsx
'use client';

import React from 'react';

/**
 * LoadingSkeleton Component
 * Skeleton loader for product cards during loading state
 * 
 * Props:
 * - count: Number of skeleton cards to display
 * - className: Additional CSS classes
 * 
 * TODO: Replace skeleton with real products once API data loads
 */

interface LoadingSkeletonProps {
  /** Number of skeleton cards to display */
  count?: number;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Individual Product Card Skeleton
 */
const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-200" />
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="h-3 w-16 bg-gray-200 rounded" />
        
        {/* Product Name */}
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        
        {/* Vendor */}
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-12 bg-gray-200 rounded" />
          <div className="h-3 w-16 bg-gray-200 rounded" />
        </div>
        
        {/* Price */}
        <div className="flex items-center gap-2 pt-1">
          <div className="h-5 w-20 bg-gray-200 rounded" />
          <div className="h-3 w-12 bg-gray-200 rounded" />
        </div>
        
        {/* Stock Status */}
        <div className="h-3 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  );
};

/**
 * Loading Grid Skeleton Component
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 8,
  className = '',
}) => {
  return (
    <div
      className={`
        grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4
        gap-4 md:gap-6
        ${className}
      `}
      role="status"
      aria-label="Loading products"
    >
      {/* TODO: Replace skeleton with real products once API data loads */}
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
      
      {/* Screen reader announcement */}
      <span className="sr-only">
        Loading products, please wait...
      </span>
    </div>
  );
};

/**
 * Inline Loading Spinner Component
 */
export const LoadingSpinner: React.FC<{ className?: string }> = ({ 
  className = 'h-8 w-8' 
}) => {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`${className} border-4 border-gray-200 border-t-yellow-400 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

/**
 * Inline Loading Dots Component
 */
export const LoadingDots: React.FC<{ className?: string }> = ({ 
  className = 'text-gray-500' 
}) => {
  return (
    <div className={`flex items-center justify-center gap-1 ${className}`} role="status">
      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Button Loading State Component
 */
export const ButtonLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      <span>Loading...</span>
    </div>
  );
};

export default LoadingSkeleton;
