'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  HeartOff, 
  ShoppingBag, 
  Star, 
  Clock, 
  Tag, 
  ArrowRight, 
  Filter, 
  ChevronDown, 
  X, 
  Home,
  Trash2,
  ShoppingCart,
  MessageCircle,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { useFavorites } from '../lib/hooks/useFavorites';
import BottomNav from '../components/Sidebar';

// Sort options for favorites
const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently Added', icon: Clock },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated', icon: Star },
  { value: 'popular', label: 'Most Popular' },
];

// Category colors for favorites
const FAVORITE_CATEGORY_COLORS = [
  'bg-red-100 text-red-700 border-red-200',
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-green-100 text-green-700 border-green-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-yellow-100 text-yellow-700 border-yellow-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
];

// ProductCard Component for Favorites
interface FavoriteProductCardProps {
  product: any;
  onRemove: (productId: string) => void;
  onMoveToCart: (product: any) => void;
  onContactSeller: (productId: string) => void;
}

const FavoriteProductCard: React.FC<FavoriteProductCardProps> = ({
  product,
  onRemove,
  onMoveToCart,
  onContactSeller
}) => {
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
  const isOutOfStock = !product.isAvailable || product.quantity === 0;

  const handleCardClick = () => {
    router.push(`/product-listing/${productId}`);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Quick view modal logic here
    console.log('Quick view:', productId);
  };

  const handleRemoveFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(productId);
  };

  const handleMoveToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveToCart(product);
  };

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContactSeller(productId);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-xl hover:border-red-300 transition-all duration-300 cursor-pointer relative overflow-hidden"
    >
      {/* Remove button */}
      <button
        onClick={handleRemoveFavorite}
        className="absolute top-4 right-4 z-20 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        aria-label="Remove from favorites"
      >
        <HeartOff className="h-4 w-4 text-gray-400 hover:text-red-500" />
      </button>

      {/* Out of stock overlay */}
      {isOutOfStock && (
        <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <ShoppingBag className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">Out of Stock</p>
            <p className="text-xs text-gray-500 mt-1">Will notify when available</p>
          </div>
        </div>
      )}

      <div className="relative aspect-square w-full mb-4 rounded-xl overflow-hidden bg-gray-100">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded shadow-md">
            -{discount}%
          </span>
        )}

        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={handleQuickView}
            className="px-4 py-2 bg-white rounded-lg font-medium transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Quick View
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Category and brand */}
        <div className="flex items-center gap-2">
          <Tag className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {product.category?.name || product.category}
          </span>
          {product.brand && (
            <span className="text-xs text-gray-400">• {product.brand}</span>
          )}
        </div>

        {/* Product name */}
        <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-red-600 transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
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

        {/* Price */}
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

        {/* Vendor info */}
        {product.vendor && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200">
              {product.vendor.avatar && (
                <img 
                  src={product.vendor.avatar} 
                  alt={product.vendor.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <span className="text-xs text-gray-600">
              {product.vendor.name || product.vendor.vendorProfile?.businessName}
            </span>
            {product.vendor.vendorProfile?.isVerified && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                ✓ Verified
              </span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          {!isOutOfStock ? (
            <button
              onClick={handleMoveToCart}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-medium rounded-lg transition-colors text-sm hover:shadow-md"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
          ) : (
            <button
              onClick={handleContact}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors text-sm hover:shadow-md"
            >
              <MessageCircle className="h-4 w-4" />
              Notify Me
            </button>
          )}
          
          <button
            onClick={handleContact}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm hover:shadow-md"
          >
            Contact
          </button>
        </div>

        {/* Stock and date info */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
          <div className="flex items-center gap-1">
            <ShoppingBag className="h-3 w-3" />
            <span className={isOutOfStock ? 'text-red-500' : 'text-green-600'}>
              {isOutOfStock ? 'Out of stock' : 'In stock'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{new Date(product.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Category Filter Chip
interface CategoryFilterChipProps {
  category: any;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

const CategoryFilterChip: React.FC<CategoryFilterChipProps> = ({
  category,
  isSelected,
  onClick,
  index
}) => {
  const colorClass = FAVORITE_CATEGORY_COLORS[index % FAVORITE_CATEGORY_COLORS.length];
  
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full border transition-all duration-200 font-medium text-sm ${
        isSelected 
          ? colorClass
          : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
      }`}
    >
      {category.name}
      {category.count && (
        <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
          isSelected 
            ? 'bg-white' 
            : 'bg-gray-200 text-gray-700'
        }`}>
          {category.count}
        </span>
      )}
    </button>
  );
};

// Empty Favorites State
const EmptyFavorites = () => {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Heart className="h-12 w-12 text-red-300" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Your favorites list is empty
      </h2>
      <p className="text-gray-600 max-w-md mx-auto mb-8">
        Save products you love by clicking the heart icon. They'll appear here for easy access later.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/categories"
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingBag className="h-5 w-5" />
          Browse Products
        </Link>
        <Link
          href="/"
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Home className="h-5 w-5" />
          Go Home
        </Link>
      </div>
    </div>
  );
};

// Main Favorites Page
export default function FavoritesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('recent');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // Use the favorites hook
  const {
    favorites,
    isLoading,
    error,
    removeFavorite,
    clearAllFavorites,
    getCategories,
    getTotalValue,
    refetch
  } = useFavorites();

  // Filter favorites by category
  const filteredFavorites = React.useMemo(() => {
    let filtered = favorites;
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.category?.slug === selectedCategory || 
        product.category?.name === selectedCategory ||
        product.category === selectedCategory
      );
    }
    
    // Sort favorites
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'recent':
      default:
        // Already sorted by recent from API
        break;
    }
    
    return filtered;
  }, [favorites, selectedCategory, sortBy]);

  // Get unique categories from favorites
  const categories = React.useMemo(() => {
    const categoryMap = new Map();
    
    favorites.forEach(product => {
      const category = product.category;
      if (category) {
        const categoryId = category._id || category;
        const categoryName = category.name || category;
        const categorySlug = category.slug || categoryName?.toLowerCase().replace(/\s+/g, '-');
        
        if (categoryMap.has(categoryId)) {
          categoryMap.get(categoryId).count++;
        } else {
          categoryMap.set(categoryId, {
            id: categoryId,
            name: categoryName,
            slug: categorySlug,
            count: 1
          });
        }
      }
    });
    
    return Array.from(categoryMap.values());
  }, [favorites]);

  // Calculate stats
  const stats = React.useMemo(() => {
    const totalItems = favorites.length;
    const totalValue = favorites.reduce((sum, product) => 
      sum + (product.discountPrice || product.price), 0
    );
    const outOfStockCount = favorites.filter(product => 
      !product.isAvailable || product.quantity === 0
    ).length;
    const discountedItems = favorites.filter(product => 
      product.discountPrice || product.discountPercentage
    ).length;
    
    return {
      totalItems,
      totalValue,
      outOfStockCount,
      discountedItems,
      averagePrice: totalItems > 0 ? totalValue / totalItems : 0
    };
  }, [favorites]);

  const handleRemoveFavorite = async (productId: string) => {
    try {
      await removeFavorite(productId);
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  const handleMoveToCart = (product: any) => {
    // Implement add to cart logic
    console.log('Moving to cart:', product);
    // You might want to use a cart context or API here
  };

  const handleContactSeller = (productId: string) => {
    router.push(`/contact?product=${productId}`);
  };

  const handleClearAllFavorites = async () => {
    try {
      await clearAllFavorites();
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Failed to clear favorites:', error);
    }
  };

  const currentSortLabel = SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || 'Sort By';

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Heart className="h-16 w-16 text-red-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Favorites</h1>
          <p className="text-gray-600 mb-6">{error.message || 'Failed to load your favorites'}</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="h-5 w-5" />
                <span className="text-sm font-medium hidden sm:inline">Home</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500 fill-red-500" />
              <h1 className="text-xl font-bold text-gray-900">
                My Favorites
              </h1>
            </div>
            
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Summary */}
        {!isLoading && favorites.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 mb-8 border border-red-100">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Your Wishlist
                </h2>
                <p className="text-gray-600">
                  {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved for later
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalItems}
                  </div>
                  <div className="text-xs text-gray-500">Items</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">
                    ${stats.totalValue.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">Total Value</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.discountedItems}
                  </div>
                  <div className="text-xs text-gray-500">On Sale</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.outOfStockCount}
                  </div>
                  <div className="text-xs text-gray-500">Out of Stock</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters Bar */}
        {!isLoading && favorites.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Category Filters */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Filter by Category</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-full border transition-all duration-200 font-medium text-sm ${
                      !selectedCategory
                        ? 'bg-red-100 text-red-700 border-red-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    All
                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-white">
                      {favorites.length}
                    </span>
                  </button>
                  
                  {categories.map((category, index) => (
                    <CategoryFilterChip
                      key={category.id}
                      category={category}
                      isSelected={selectedCategory === category.slug}
                      onClick={() => setSelectedCategory(
                        selectedCategory === category.slug ? null : category.slug
                      )}
                      index={index}
                    />
                  ))}
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
                          onClick={() => {
                            setSortBy(option.value);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2 ${
                            sortBy === option.value
                              ? 'bg-red-50 text-red-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {option.icon && <option.icon className="h-4 w-4" />}
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Active filters */}
            {(selectedCategory || sortBy !== 'recent') && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">Active:</span>
                
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                    {categories.find(c => c.slug === selectedCategory)?.name}
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="hover:text-red-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {sortBy !== 'recent' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                    {currentSortLabel}
                    <button
                      onClick={() => setSortBy('recent')}
                      className="hover:text-red-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSortBy('recent');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* Clear All Button */}
        {!isLoading && favorites.length > 0 && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Clear All Favorites
            </button>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 animate-pulse">
                <div className="aspect-square w-full mb-4 bg-gray-200 rounded-xl" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded mb-4" />
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <EmptyFavorites />
        ) : filteredFavorites.length === 0 ? (
          <div className="text-center py-16">
            <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No favorites match your filters
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your category filter
            </p>
            <button
              onClick={() => setSelectedCategory(null)}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFavorites.map((product) => (
                <FavoriteProductCard
                  key={product._id || product.id}
                  product={product}
                  onRemove={handleRemoveFavorite}
                  onMoveToCart={handleMoveToCart}
                  onContactSeller={handleContactSeller}
                />
              ))}
            </div>

            {/* View All Categories CTA */}
            {selectedCategory && (
              <div className="mt-12 text-center">
                <div className="inline-flex flex-col items-center gap-4 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 max-w-2xl">
                  <Tag className="h-12 w-12 text-blue-500" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Explore More in {categories.find(c => c.slug === selectedCategory)?.name}
                    </h3>
                    <p className="text-gray-600">
                      Browse all products in this category
                    </p>
                  </div>
                  <Link
                    href={`/categories?category=${selectedCategory}`}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    View All Products
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            )}
          </>
        )}

        {/* Recently Viewed Section */}
        {!isLoading && favorites.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                You might also like
              </h3>
              <Link
                href="/categories"
                className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {/* This would typically come from a "recently viewed" API */}
              {categories.slice(0, 6).map((category, index) => (
                <Link
                  key={category.id}
                  href={`/categories?category=${category.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-red-300 hover:shadow-md transition-all group"
                >
                  <div className={`w-12 h-12 ${FAVORITE_CATEGORY_COLORS[index]} rounded-lg mx-auto mb-3 flex items-center justify-center`}>
                    <Tag className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
        <BottomNav/>
      </main>

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Clear All Favorites?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              This will remove all {favorites.length} items from your favorites list. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllFavorites}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}