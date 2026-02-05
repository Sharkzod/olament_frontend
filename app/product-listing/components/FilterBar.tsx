// components/FilterBar.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import type { ProductFilters } from '../types/product';

/**
 * FilterBar Component
 * Search input and filter dropdown for product listing
 * 
 * Props:
 * - filters: Current filter state
 * - onFilterChange: Callback when filters change
 * - onSearch: Callback for search submission
 * 
 * TODO: Connect filters to backend API via query parameters
 */

interface FilterBarProps {
  /** Current filter state */
  filters: ProductFilters;
  
  /** Callback when filters are updated */
  onFilterChange: (filters: ProductFilters) => void;
  
  /** Callback for search submission */
  onSearch: (query: string) => void;
  
  /** Optional: Total product count */
  totalCount?: number;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Available categories for filtering
 * TODO: Fetch from API endpoint /api/categories
 */
const CATEGORIES = [
  'All',
  'Electronics',
  'Fashion',
  'Groceries',
  'Home',
  'Sports',
  'Beauty',
  'Books',
];

/**
 * Available sort options
 * TODO: Connect to backend sorting parameters
 */
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onSearch,
  totalCount,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  /**
   * Handle search input change with debounce
   */
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // TODO: Implement debounced search (300-500ms)
    // For now, we update on change and parent handles debounce
    if (query.length >= 2 || query.length === 0) {
      onSearch(query);
    }
  }, [onSearch]);

  /**
   * Handle search form submission
   */
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  }, [searchQuery, onSearch]);

  /**
   * Handle category selection
   */
  const handleCategoryChange = useCallback((category: string) => {
    onFilterChange({
      ...filters,
      category: category === 'All' ? undefined : category,
    });
    setIsFilterOpen(false);
  }, [filters, onFilterChange]);

  /**
   * Handle sort option selection
   */
  const handleSortChange = useCallback((sortBy: string) => {
    onFilterChange({
      ...filters,
      sortBy: sortBy as ProductFilters['sortBy'],
    });
    setShowSortDropdown(false);
  }, [filters, onFilterChange]);

  /**
   * Clear all filters
   */
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    onFilterChange({});
    onSearch('');
  }, [onFilterChange, onSearch]);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = searchQuery || filters.category;

  /**
   * Get current sort label
   */
  const currentSortLabel = SORT_OPTIONS.find(
    opt => opt.value === filters.sortBy
  )?.label || 'Sort By';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search products..."
            className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
            aria-label="Search products"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                onSearch('');
              }}
              className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 text-sm font-medium rounded-lg transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Filter & Sort Bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: Category Filter & Results Count */}
        <div className="flex items-center gap-3 flex-1">
          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              aria-expanded={isFilterOpen}
              aria-haspopup="listbox"
            >
              <Filter className="h-4 w-4 text-gray-400" />
              <span>Category</span>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Category Dropdown Menu */}
            {isFilterOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsFilterOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        filters.category === category || (category === 'All' && !filters.category)
                          ? 'bg-yellow-50 text-yellow-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      role="option"
                      aria-selected={filters.category === category || (category === 'All' && !filters.category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Results Count */}
          {totalCount !== undefined && (
            <span className="text-sm text-gray-500">
              <span className="font-medium text-gray-900">{totalCount}</span> products found
            </span>
          )}
        </div>

        {/* Right: Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            aria-expanded={showSortDropdown}
            aria-haspopup="listbox"
          >
            <span>{currentSortLabel}</span>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Sort Dropdown Menu */}
          {showSortDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSortDropdown(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                      filters.sortBy === option.value
                        ? 'bg-yellow-50 text-yellow-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    role="option"
                    aria-selected={filters.sortBy === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Active Filters Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">Active filters:</span>
          
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              Search: &quot;{searchQuery}&quot;
              <button
                onClick={() => {
                  setSearchQuery('');
                  onSearch('');
                }}
                className="hover:text-blue-900"
                aria-label="Remove search filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {filters.category && filters.category !== 'All' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              {filters.category}
              <button
                onClick={() => handleCategoryChange('All')}
                className="hover:text-blue-900"
                aria-label="Remove category filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          
          <button
            onClick={handleClearFilters}
            className="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
