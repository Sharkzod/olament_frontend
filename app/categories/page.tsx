// app/categories/page.tsx - UPDATED WITH PRODUCT COUNT FIX
'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, X, ChevronDown, Grid2X2, ArrowLeft, Home, Tag, Star, ShoppingBag, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useProducts } from '../lib/hooks/useProducts';
import { useCategories } from '../lib/hooks/useCategories';
import { getProductsByCategory } from '../lib/api/productsApi';
import { Product, ProductFilters } from '@/types/product';
import BottomNav from '../components/Sidebar';

// Category colors for visual variety
const CATEGORY_COLORS = [
  'bg-blue-500',
  'bg-pink-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-red-500',
  'bg-purple-500',
  'bg-indigo-500',
  'bg-yellow-500',
  'bg-teal-500',
  'bg-cyan-500',
];

// Sort options
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

// Map frontend sort values to backend sortBy values
const SORT_MAPPING: Record<string, { sortBy: string; order: 'asc' | 'desc' }> = {
  'newest': { sortBy: 'createdAt', order: 'desc' },
  'price-low': { sortBy: 'price', order: 'asc' },
  'price-high': { sortBy: 'price', order: 'desc' },
  'rating': { sortBy: 'ratings.average', order: 'desc' },
  'popular': { sortBy: 'views', order: 'desc' },
};

// FilterBar Component - SAME AS BEFORE
interface FilterBarProps {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
  onSearch: (query: string) => void;
  totalCount?: number;
  categories: any[];
  availableFilters?: any;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onSearch,
  totalCount,
  categories,
  availableFilters,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length >= 2 || query.length === 0) {
      onSearch(query);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleSortChange = (sortBy: string) => {
    onFilterChange({
      ...filters,
      sortBy: sortBy as ProductFilters['sortBy'],
    });
    setShowSortDropdown(false);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    onFilterChange({});
    onSearch('');
  };

  const hasActiveFilters = searchQuery || filters.category;
  const currentSortLabel = SORT_OPTIONS.find(
    opt => opt.value === filters.sortBy
  )?.label || 'Sort By';

  const priceRange = availableFilters?.priceRange?.[0];

  return (
    <div className={`space-y-4 ${className}`}>
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

      <div className="flex items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
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

            {isFilterOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsFilterOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-2 max-h-80 overflow-y-auto">
                  <button
                    onClick={() => {
                      onFilterChange({ ...filters, category: undefined });
                      setIsFilterOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                      !filters.category
                        ? 'bg-yellow-50 text-yellow-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category._id || category.id}
                      onClick={() => {
                        onFilterChange({
                          ...filters,
                          category: category.slug || category.name,
                        });
                        setIsFilterOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        filters.category === (category.slug || category.name)
                          ? 'bg-yellow-50 text-yellow-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {totalCount !== undefined && (
            <span className="text-sm text-gray-500">
              <span className="font-medium text-gray-900">{totalCount}</span> products found
            </span>
          )}

          {priceRange && (
            <span className="text-xs text-gray-500">
              ${priceRange.min?.toFixed(2)} - ${priceRange.max?.toFixed(2)}
            </span>
          )}

          {availableFilters?.brands && availableFilters.brands.length > 0 && (
            <span className="text-xs text-gray-500">
              {availableFilters.brands.length} brands
            </span>
          )}
        </div>

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

          {showSortDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSortDropdown(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-2">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                      filters.sortBy === option.value
                        ? 'bg-yellow-50 text-yellow-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

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
          
          {filters.category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              {filters.category}
              <button
                onClick={() => onFilterChange({ ...filters, category: undefined })}
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

// ProductCard Component - SAME AS BEFORE (keeping it brief)
interface ProductCardProps {
  product: any;
}

interface ProductCardProps {
  product: any;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  
  const discount = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : product.discountPercentage || 0;

  const displayPrice = product.discountPrice || product.price;
  const originalPrice = product.discountPrice ? product.price : undefined;
  
  const primaryImage = product.images?.find((img: any) => img.isPrimary)?.url || 
                       product.images?.[0]?.url || 
                       product.images?.[0] ||
                       '/placeholder-product.jpg';

  const productId = product._id || product.id;

  // Handle card click - navigate to product page
  const handleCardClick = () => {
    router.push(`/product-listing/${productId}`);
  };

  // Handle button click - prevent event bubbling to card
  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // You can add contact seller logic here
    console.log('Contact seller for product:', productId);
    // Or navigate to a contact page:
    // router.push(`/contact?product=${productId}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-xl hover:border-yellow-300 transition-all duration-300 cursor-pointer"
    >
      <div className="relative aspect-square w-full mb-4 rounded-xl overflow-hidden bg-gray-100">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.isFeatured && (
            <span className="px-2 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded shadow-md">
              Featured
            </span>
          )}
          {discount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded shadow-md">
              -{discount}%
            </span>
          )}
          {product.condition === 'new' && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded shadow-md">
              New
            </span>
          )}
        </div>

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="px-4 py-2 bg-white rounded-lg font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg">
            View Details
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Tag className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {product.category}
          </span>
          {product.brand && (
            <span className="text-xs text-gray-400">• {product.brand}</span>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-yellow-600 transition-colors">
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-2">
          {product.description}
        </p>

        {product.ratings?.average !== undefined && product.ratings?.average > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.ratings.average || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              ({product.ratings.count || 0})
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">
              ${displayPrice.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <button 
            onClick={handleContactClick}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-medium rounded-lg transition-colors text-sm hover:shadow-md z-10 relative"
          >
            Contact Seller
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <ShoppingBag className="h-3 w-3" />
            <span>
              {product.inStock || product.isAvailable
                ? product.quantity > 0 
                  ? `${product.quantity} in stock` 
                  : 'In stock'
                : 'Out of stock'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Added {new Date(product.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};


// ProductGrid Component
interface ProductGridProps {
  products: any[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id || product.id} product={product} />
      ))}
    </div>
  );
};

// CategoryCard Component - FIXED
interface CategoryCardProps {
  category: any;
  onClick: () => void;
  colorClass: string;
  productCount?: number; // Optional product count
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick, colorClass, productCount }) => {
  // Use passed productCount if available, otherwise use category.productCount
  const displayCount = productCount !== undefined ? productCount : category.productCount;
  
  return (
    <button
      onClick={onClick}
      className="group relative bg-white border border-gray-200 rounded-2xl p-6 text-left hover:border-yellow-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
      aria-label={`Browse ${category.name} category`}
    >
      <div 
        className={`absolute top-0 right-0 w-24 h-24 ${colorClass} opacity-10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500`}
      />
      
      <div className={`w-16 h-16 ${colorClass} rounded-2xl flex items-center justify-center mb-6 relative z-10`}>
        <Tag className="h-8 w-8 text-white" />
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10">
        {category.name}
      </h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2 relative z-10">
        {category.description || 'Explore our collection'}
      </p>

      <div className="flex items-center justify-between mt-8 relative z-10">
        {/* Show product count if available, otherwise show generic text */}
        {displayCount !== undefined && displayCount !== null ? (
          <span className="text-sm font-medium text-gray-500">
            {displayCount.toLocaleString()} {displayCount === 1 ? 'product' : 'products'}
          </span>
        ) : (
          <span className="text-sm font-medium text-gray-500">
            Browse products
          </span>
        )}
        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-yellow-500 transition-all" />
      </div>

      <div className="absolute inset-0 border-2 border-transparent group-hover:border-yellow-300 rounded-2xl transition-colors" />
    </button>
  );
};

// Skeleton Loader
const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div 
      className={`bg-gray-200 animate-pulse rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
};

// Main Categories Page
export default function CategoriesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'categories' | 'products'>('categories');
  
  const [filters, setFilters] = useState<ProductFilters>({
    category: undefined,
    search: '',
    sortBy: 'popular',
    page: 1,
    limit: 20,
  });

  // NEW: State for category product counts
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(false);

  // Fetch categories from API
  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();

  // Use the products hook with filters
  const {
    products,
    pagination,
    isLoading: productsLoading,
    error: productsError,
    fetchProducts,
    isEmpty,
    categoryInfo,
    breadcrumb,
    availableFilters,
  } = useProducts({
    filters: {
      ...filters,
      ...(filters.sortBy && SORT_MAPPING[filters.sortBy] ? SORT_MAPPING[filters.sortBy] : {}),
    },
    autoFetch: viewMode === 'products' && !!selectedCategory,
    useCategoryEndpoint: true,
  });

  // NEW: Fetch product counts for all categories
// In your useEffect for fetching category counts, update this part:

useEffect(() => {
  const fetchCategoryCounts = async () => {
    if (categories.length === 0 || loadingCounts) return;
    
    setLoadingCounts(true);
    const counts: Record<string, number> = {};
    
    try {
      // Fetch counts for all categories in parallel (limit to prevent server overload)
      const countPromises = categories.map(async (category) => {
        try {
          const response = await getProductsByCategory(
            category.slug || category.name,
            { limit: 1, page: 1 } // Only need pagination info
          );
          
          // Use a more reliable identifier - prioritize slug over ID
          const categoryKey = category.slug || category.name || category._id || category.id;
          
          if (categoryKey) {
            counts[categoryKey] = response.totalDocs || response.totalCategoryProducts || 0;
          }
        } catch (error) {
          console.error(`Failed to fetch count for ${category.name}:`, error);
          const categoryKey = category.slug || category.name || category._id || category.id;
          if (categoryKey) {
            counts[categoryKey] = 0;
          }
        }
      });
      
      await Promise.all(countPromises);
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error fetching category counts:', error);
    } finally {
      setLoadingCounts(false);
    }
  };
  
  // Only fetch counts when viewing categories and categories are loaded
  if (!categoriesLoading && categories.length > 0 && viewMode === 'categories') {
    fetchCategoryCounts();
  }
}, [categories, categoriesLoading, viewMode]);

  // Assign colors to categories
  const categoriesWithColors = useMemo(() => {
    return categories.map((cat, index) => ({
      ...cat,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));
  }, [categories]);

  // Get category from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    const sortParam = searchParams.get('sort');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      setViewMode('products');
      setFilters(prev => ({
        ...prev,
        category: categoryParam,
        search: searchParam || '',
        sortBy: (sortParam as ProductFilters['sortBy']) || 'popular',
        page: 1,
      }));
    } else {
      setSelectedCategory(null);
      setViewMode('categories');
      setFilters(prev => ({
        ...prev,
        category: undefined,
        search: '',
        page: 1,
      }));
    }
  }, [searchParams]);

  const handleCategorySelect = (categorySlug: string) => {
    router.push(`/categories?category=${encodeURIComponent(categorySlug)}`);
  };

  const handleBackToCategories = () => {
    router.push('/categories');
  };

  const handleFilterChange = (newFilters: ProductFilters) => {
    const updatedFilters = { ...newFilters, page: 1 };
    setFilters(updatedFilters);
    
    if (selectedCategory) {
      const params = new URLSearchParams();
      if (updatedFilters.category) params.set('category', updatedFilters.category);
      if (updatedFilters.search) params.set('search', updatedFilters.search);
      if (updatedFilters.sortBy) params.set('sort', updatedFilters.sortBy);
      router.push(`/categories?${params.toString()}`);
    }
  };

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query, page: 1 }));
    
    if (selectedCategory) {
      const params = new URLSearchParams();
      params.set('category', selectedCategory);
      if (query) params.set('search', query);
      if (filters.sortBy) params.set('sort', filters.sortBy);
      router.push(`/categories?${params.toString()}`);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      category: selectedCategory || undefined,
      search: '',
      sortBy: 'popular',
      page: 1,
      limit: 20,
    });
    if (selectedCategory) {
      router.push(`/categories?category=${selectedCategory}`);
    }
  };

  const currentCategory = categoriesWithColors.find(
    cat => (cat.slug || cat.name) === selectedCategory
  ) || categoryInfo;
  
  const totalProducts = pagination?.totalDocs || 0;

  // Categories View
  if (viewMode === 'categories') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* <div className="flex items-center gap-4">
                <Link 
                  href="/"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Home className="h-5 w-5" />
                  <span className="text-sm font-medium">Home</span>
                </Link>
              </div> */}
              
              <div className="flex items-center gap-2">
                {/* <Tag className="h-5 w-5 text-yellow-500" /> */}
                <h1 className="text-xl font-bold text-gray-900">
                  All Categories
                </h1>
              </div>
              
              <div className="w-24"></div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Browse by Category
              </h2>
              <p className="text-gray-600 text-lg">
                Discover products across various categories. Find exactly what you're looking for.
              </p>
            </div>

            {categoriesError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-800 mb-4">Error loading categories: {categoriesError.message}</p>
                <button
                  onClick={refetchCategories}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {categoriesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-2xl" />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-16">
                <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No categories available
                </h3>
                <p className="text-gray-600">
                  Categories will appear here once they're added.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {!categoriesLoading && categories.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {categoriesWithColors.map((category, index) => {
                        // Safely get the category ID for the productCount lookup
                        const categoryId = category._id || category.id;
                        const productCount = categoryId ? categoryCounts[categoryId] : undefined;
                        
                        return (
                          <CategoryCard
                            key={category._id || category.id || index}
                            category={category}
                            colorClass={category.color}
                            productCount={productCount}
                            onClick={() => handleCategorySelect(category.slug || category.name)}
                          />
                        );
                      })}
                    </div>
                  )}
              </div>
            )}
          </div>
          <BottomNav/>
        </main>
      </div>
    );
  }

  // Products View - KEEP REST AS BEFORE
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading categories...</p>
        </div>
      </div>
    }>
    <div className="min-h-screen bg-gray-50">
      {/* ... Rest of the products view code stays the same ... */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* <div className="flex items-center gap-4"> */}
              {/* <Link 
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="h-5 w-5" />
                <span className="text-sm font-medium">Home</span>
              </Link> */}
              {/*
            </div> */}
            
            <div className="flex items-center gap-2">
               <button
                onClick={handleBackToCategories}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                {/* <span className="text-sm font-medium">All Categories</span> */}
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {currentCategory?.name || selectedCategory}
              </h1>
            </div>
            
            <button
              onClick={() => setViewMode('categories')}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              <Grid2X2 className="h-4 w-4" />
              Category View
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {currentCategory?.name || selectedCategory}
                </h2>
                <p className="text-gray-600 max-w-2xl">
                  {currentCategory?.description || 'Browse our collection of products.'}
                </p>
                
                {breadcrumb && breadcrumb.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                    {breadcrumb.map((crumb, index) => (
                      <React.Fragment key={crumb.id}>
                        {index > 0 && <span>/</span>}
                        <span className="hover:text-gray-700 cursor-pointer">
                          {crumb.name}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">
                  {totalProducts} Products
                </span>
                <button
                  onClick={handleBackToCategories}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-full text-sm font-medium text-gray-700 shadow-sm transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Categories
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              totalCount={totalProducts}
              categories={categories}
              availableFilters={availableFilters}
            />
          </div>

          {productsError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-800">Error loading products: {productsError.message}</p>
              <button
                onClick={() => fetchProducts()}
                className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-2xl" />
              ))}
            </div>
          ) : isEmpty ? (
            <div className="text-center py-16">
              <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-medium rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <ProductGrid products={products} />
              
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (pagination.hasPrevPage) {
                          setFilters(prev => ({ ...prev, page: pagination.page - 1 }));
                        }
                      }}
                      disabled={!pagination.hasPrevPage}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <span className="px-4 py-2 text-sm text-gray-600">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    
                    <button
                      onClick={() => {
                        if (pagination.hasNextPage) {
                          setFilters(prev => ({ ...prev, page: pagination.page + 1 }));
                        }
                      }}
                      disabled={!pagination.hasNextPage}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {!categoriesLoading && categories.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Related Categories
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {categoriesWithColors
                  .filter(cat => (cat.slug || cat.name) !== selectedCategory)
                  .slice(0, 6)
                  .map((category, index) => (
                    <button
                      key={category._id || category.id || index}
                      onClick={() => handleCategorySelect(category.slug || category.name)}
                      className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-yellow-300 hover:shadow-md transition-all group"
                    >
                      <div className={`w-12 h-12 ${category.color} rounded-lg mx-auto mb-3 flex items-center justify-center`}>
                        <Tag className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 group-hover:text-yellow-600 transition-colors">
                        {category.name}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
        
      </main>

    </div>
    </Suspense>
  );
}