// app/product-listing/page.tsx
'use client';

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, ArrowLeft } from 'lucide-react';
import FilterBar from './components/FilterBar';
import ProductGrid from './components/ProductGrid';
import LoadingSkeleton from './components/LoadingSkeleton';
import { LoadingSpinner } from './components/LoadingSkeleton';
import { useProductListing } from './hooks/useProductListing';
import { CartProvider } from './hooks/useCart';
import BottomNav from '../components/Sidebar';
import CartIcon from './components/CartIcon';
import CartDrawer from './components/CartDrawer';
import type { Product, ProductFilters } from './types/product';

/**
 * Product Listing Content Component
 * Inner component that uses cart context
 */
function ProductListingContent() {
  const router = useRouter();
  
  // Cart drawer state
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Use the product listing hook
  const {
    products,
    isLoading,
    error,
    pagination,
    filters,
    loadMore,
    updateFilters,
    refetch,
  } = useProductListing();

  // Intersection observer ref for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  /**
   * Handle cart icon click - open drawer
   */
  const handleCartClick = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  /**
   * Handle cart drawer close
   */
  const handleCartClose = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  /**
   * Handle product card click
   * TODO: Navigate to product details page
   */
  const handleProductClick = useCallback((product: Product) => {
    console.log('Product clicked:', product.id);
    // TODO: router.push(`/products/${product.id}`);
  }, []);

  /**
   * Handle search query
   */
  const handleSearch = useCallback((query: string) => {
    updateFilters({ ...filters, search: query });
  }, [filters, updateFilters]);

  /**
   * Handle filter changes
   */
  const handleFilterChange = useCallback((newFilters: ProductFilters) => {
    updateFilters(newFilters);
  }, [updateFilters]);

  /**
   * Setup intersection observer for infinite scroll
   */
  useEffect(() => {
    if (pagination.hasMore && loadMoreRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting && !isLoading && pagination.hasMore) {
            loadMore();
          }
        },
        {
          rootMargin: '200px',
          threshold: 0.1,
        }
      );

      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [pagination.hasMore, isLoading, loadMore]);

  /**
   * Handle retry on error
   */
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={handleCartClose} />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-400 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">O</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Explore</h1>
                <p className="text-xs text-gray-500">Discover amazing products</p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Cart Icon with count badge */}
              <CartIcon onClick={handleCartClick} />
              
              {/* Search Icon (mobile) */}
              <button
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors md:hidden"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-3 mb-4 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 group w-fit"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            All Products
          </h2>
          <p className="text-gray-600 mt-1">
            Browse our collection of products from trusted vendors
          </p>
        </div>

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          totalCount={pagination.total}
        />

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 my-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Something went wrong
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading State (Initial) */}
        {isLoading && products.length === 0 && (
          <div className="mt-8">
            <LoadingSkeleton count={8} />
          </div>
        )}

        {/* Product Grid */}
        {!error && !isLoading && (
          <ProductGrid
            products={products}
            onProductClick={handleProductClick}
            emptyMessage="No products found"
          />
        )}

        {/* Load More Trigger / Loading More Indicator */}
        {products.length > 0 && (
          <div ref={loadMoreRef} className="mt-8 py-8">
            {isLoading && pagination.page > 1 && (
              <div className="flex justify-center py-4">
                <LoadingSpinner className="h-8 w-8" />
              </div>
            )}
            
            {!pagination.hasMore && products.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  You{String.fromCharCode(39)}ve seen all {pagination.total} products
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick Categories (Optional Enhancement) */}
        {products.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Popular Categories
              </h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: 'Electronics', count: 234, image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w-400&q=80' },
                { name: 'Fashion', count: 567, image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w-400&q=80' },
                { name: 'Groceries', count: 189, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w-400&q=80' },
                { name: 'Home & Living', count: 145, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w-400&q=80' },
              ].map((category) => (
                <button
                  key={category.name}
                  className="group relative overflow-hidden rounded-xl aspect-[4/3] bg-gray-100"
                  onClick={() => handleFilterChange({ category: category.name })}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h4 className="font-semibold">{category.name}</h4>
                    <p className="text-sm text-gray-200">{category.count} products</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer Spacing (for bottom nav on mobile) */}
      <div className="h-20" />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

/**
 * Explore Page (Product Listing)
 * Main entry point for browsing all products
 * 
 * Features:
 * - Responsive product grid (mobile: 1 col, tablet: 2 cols, desktop: 3-4 cols)
 * - Search and filter functionality
 * - Infinite scroll pagination
 * - Loading skeletons
 * - Empty states
 * - Haptic micro-bounce add-to-cart button
 * - Cart drawer with quantity controls
 * 
 * TODO: Connect to backend API for real data
 */
export default function ProductListingPage() {
  return (
    <CartProvider>
      <ProductListingContent />
    </CartProvider>
  );
}
