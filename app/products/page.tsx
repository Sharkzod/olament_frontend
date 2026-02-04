'use client'
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  MapPin, 
  Search, 
  Package, 
  ChevronRight, 
  Heart, 
  Filter, 
  SlidersHorizontal,
  Star, 
  ShoppingBag,
  Loader2,
  X,
  Grid2x2,
  List,
  ShieldCheck,
  ArrowLeft,
  Store,
  Tag,
  Percent,
  Clock
} from 'lucide-react';
import { useProducts } from '@/app/lib/hooks/useProducts';
import { productApi } from '../lib/api/productApi';

// Types
interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  discountPrice?: number;
  unit: string;
  images: string[];
  rating: number;
  reviewCount: number;
  inventory: {
    quantity: number;
    lowStockThreshold: number;
  };
  vendor: {
    _id: string;
    name: string;
    vendorProfile?: {
      businessName: string;
    };
  };
  tags: string[];
  isAvailable: boolean;
  isPublished: boolean;
  createdAt: string;
}

// Filter options
const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Groceries',
  'Clothing & Fashion',
  'Books & Stationery',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Health & Wellness',
  'Sports & Outdoors',
  'Automotive',
  'Other'
];

const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: 0 },
  { label: 'Under ₦1,000', min: 0, max: 1000 },
  { label: '₦1,000 - ₦5,000', min: 1000, max: 5000 },
  { label: '₦5,000 - ₦20,000', min: 5000, max: 20000 },
  { label: '₦20,000 - ₦50,000', min: 20000, max: 50000 },
  { label: 'Over ₦50,000', min: 50000, max: 0 },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function ProductListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get query parameters
  const shopId = searchParams?.get('shop');
  const shopName = searchParams?.get('shopName');
  const categoryParam = searchParams?.get('category');
  const stateParam = searchParams?.get('state');
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All Categories');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All Prices');
  const [selectedState, setSelectedState] = useState(stateParam || 'Lagos');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentShop, setCurrentShop] = useState<{ id: string; name: string } | null>(
    shopId && shopName ? { id: shopId, name: decodeURIComponent(shopName) } : null
  );
  
  // States data
  const states = [
    "Lagos", "Abuja", "Rivers", "Oyo", "Kano", "Kaduna", 
    "Edo", "Delta", "Ogun", "Ondo", "Enugu", "Plateau"
  ];

  // Fetch products
  const fetchProducts = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setPage(1);
        setLoading(true);
      }
      
      const params: any = {
        page: reset ? 1 : page,
        limit: 20,
        isAvailable: true,
        isPublished: true,
      };
      
      // Add filters
      if (currentShop) {
        params.vendorId = currentShop.id;
      }
      
      if (selectedCategory !== 'All Categories') {
        params.category = selectedCategory;
      }
      
      if (selectedPriceRange !== 'All Prices') {
        const priceRange = PRICE_RANGES.find(range => range.label === selectedPriceRange);
        if (priceRange) {
          if (priceRange.min > 0) params.minPrice = priceRange.min;
          if (priceRange.max > 0) params.maxPrice = priceRange.max;
        }
      }
      
      if (selectedState && selectedState !== 'all') {
        params.state = selectedState;
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      // Add sorting
      switch(sortBy) {
        case 'newest':
          params.sortBy = 'createdAt';
          params.order = 'desc';
          break;
        case 'price-low':
          params.sortBy = 'price';
          params.order = 'asc';
          break;
        case 'price-high':
          params.sortBy = 'price';
          params.order = 'desc';
          break;
        case 'rating':
          params.sortBy = 'rating';
          params.order = 'desc';
          break;
        case 'popular':
          params.sortBy = 'reviewCount';
          params.order = 'desc';
          break;
      }
      
      console.log('🛒 Fetching products with params:', params);
      
      // Replace with your actual API call
      const response = await productApi.getAllProducts(params);
      
      if (response.success && response.data) {
        const productsData = response.data.products || [];
        const total = response.data.total || 0;
        
        if (reset) {
          setProducts(productsData);
        } else {
          setProducts(prev => [...prev, ...productsData]);
        }
        
        setTotalProducts(total);
        setHasMore(productsData.length === 20);
        
        if (reset) {
          setFilteredProducts(productsData);
        }
      } else {
        setError(response.message || 'Failed to fetch products');
      }
    } catch (err: any) {
      console.error('❌ Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [page, selectedState, selectedCategory, selectedPriceRange, searchQuery, sortBy, currentShop]);

  // Initial fetch
  useEffect(() => {
    fetchProducts(true);
  }, [selectedState, selectedCategory, selectedPriceRange, sortBy, fetchProducts]);

  // Search effect with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== '') {
        fetchProducts(true);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery, fetchProducts]);

  // Filter products locally for instant search feedback
  useEffect(() => {
    if (!searchQuery && selectedCategory === 'All Categories' && selectedPriceRange === 'All Prices') {
      setFilteredProducts(products);
      return;
    }
    
    let results = products;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(product => 
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Category filter
    if (selectedCategory !== 'All Categories') {
      results = results.filter(product => 
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Price filter
    if (selectedPriceRange !== 'All Prices') {
      const priceRange = PRICE_RANGES.find(range => range.label === selectedPriceRange);
      if (priceRange) {
        results = results.filter(product => {
          const displayPrice = product.discountPrice || product.price;
          if (priceRange.max === 0) {
            return displayPrice >= priceRange.min;
          }
          return displayPrice >= priceRange.min && displayPrice <= priceRange.max;
        });
      }
    }
    
    setFilteredProducts(results);
  }, [products, searchQuery, selectedCategory, selectedPriceRange]);

  // Load more products
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory('All Categories');
    setSelectedPriceRange('All Prices');
    setSearchQuery('');
    setSortBy('newest');
    setShowFilters(false);
  };

  const clearShopFilter = () => {
    setCurrentShop(null);
    router.push('/products');
  };

  // Update header based on filters
  const getHeaderTitle = () => {
    if (currentShop) {
      return `Products from ${currentShop.name}`;
    }
    if (selectedCategory !== 'All Categories') {
      return `${selectedCategory} Products`;
    }
    return 'All Products';
  };

  const getHeaderSubtitle = () => {
    if (currentShop) {
      return 'Browse all products from this shop';
    }
    return 'Browse products from local shops and markets';
  };

  // Render product card (Grid view)
  const renderProductCard = (product: Product) => {
    const hasDiscount = product.discountPrice && product.discountPrice < product.price;
    const discountPercent = hasDiscount 
      ? Math.round(((product.price - (product.discountPrice || 0)) / product.price) * 100)
      : 0;
    
    const displayPrice = hasDiscount ? product.discountPrice : product.price;
    const isOutOfStock = product.inventory?.quantity === 0;
    const isLowStock = product.inventory?.quantity 
      ? product.inventory.quantity <= (product.inventory.lowStockThreshold || 5)
      : false;

    return (
      <div 
        key={product._id} 
        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => router.push(`/products/${product._id}`)}
      >
        <div className="relative">
          <div className="h-40 bg-gray-200">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <Package className="h-12 w-12 text-gray-300" />
              </div>
            )}
          </div>
          
          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discountPercent}%
            </div>
          )}
          
          {/* Stock status badge */}
          {isOutOfStock ? (
            <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              SOLD OUT
            </div>
          ) : isLowStock && (
            <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
              LOW STOCK
            </div>
          )}
          
          {/* Favorite button */}
          <button 
            className="absolute bottom-2 right-2 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-full p-1.5 shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Add to favorites:', product._id);
            }}
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
        
        <div className="p-3">
          {/* Category badge */}
          {product.category && (
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {product.category}
              </span>
            </div>
          )}
          
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          
          {/* Shop/Vendor info */}
          {product.vendor && (
            <div className="flex items-center gap-1 mt-1">
              <Store className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500 truncate">
                {typeof product.vendor === 'string' 
                  ? product.vendor 
                  : product.vendor.vendorProfile?.businessName || product.vendor.name}
              </span>
            </div>
          )}
          
          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-xs font-semibold">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({product.reviewCount})</span>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">
                  ₦{displayPrice?.toLocaleString() || '0'}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-gray-400 line-through">
                    ₦{product.price.toLocaleString()}
                  </span>
                )}
              </div>
              {product.unit && (
                <span className="text-xs text-gray-500">{product.unit}</span>
              )}
            </div>
            
            <button 
              className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                isOutOfStock 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
              disabled={isOutOfStock}
              onClick={(e) => {
                e.stopPropagation();
                if (!isOutOfStock) {
                  console.log('Add to cart:', product._id);
                }
              }}
            >
              <ShoppingBag className="h-3 w-3" />
              {isOutOfStock ? 'Sold Out' : 'Add'}
            </button>
          </div>
          
          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.tags.slice(0, 2).map(tag => (
                <span 
                  key={tag} 
                  className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {product.tags.length > 2 && (
                <span className="text-[10px] text-gray-400 px-1">
                  +{product.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render product row (List view)
  const renderProductRow = (product: Product) => {
    const hasDiscount = product.discountPrice && product.discountPrice < product.price;
    const discountPercent = hasDiscount 
      ? Math.round(((product.price - (product.discountPrice || 0)) / product.price) * 100)
      : 0;
    
    const displayPrice = hasDiscount ? product.discountPrice : product.price;
    const isOutOfStock = product.inventory?.quantity === 0;
    const isLowStock = product.inventory?.quantity 
      ? product.inventory.quantity <= (product.inventory.lowStockThreshold || 5)
      : false;

    return (
      <div 
        key={product._id} 
        className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow cursor-pointer"
        onClick={() => router.push(`/products/${product._id}`)}
      >
        <div className="flex gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <Package className="h-8 w-8 text-gray-300" />
                </div>
              )}
            </div>
            
            {/* Discount badge */}
            {hasDiscount && (
              <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                -{discountPercent}%
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                  {isOutOfStock && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600">{product.category}</span>
                  {isLowStock && !isOutOfStock && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                      Low Stock
                    </span>
                  )}
                </div>
              </div>
              
              <button 
                className="text-gray-400 hover:text-red-500 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Add to favorites:', product._id);
                }}
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>
            
            {/* Description */}
            {product.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {product.description}
              </p>
            )}
            
            {/* Vendor info */}
            {product.vendor && (
              <div className="flex items-center gap-1 mt-2">
                <Store className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {typeof product.vendor === 'string' 
                    ? product.vendor 
                    : product.vendor.vendorProfile?.businessName || product.vendor.name}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-gray-900">
                    ₦{displayPrice?.toLocaleString() || '0'}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-gray-400 line-through">
                      ₦{product.price.toLocaleString()}
                    </span>
                  )}
                </div>
                {product.unit && (
                  <span className="text-xs text-gray-500">{product.unit}</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Rating */}
                {product.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
                  </div>
                )}
                
                <button 
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                    isOutOfStock 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                  disabled={isOutOfStock}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isOutOfStock) {
                      console.log('Add to cart:', product._id);
                    }
                  }}
                >
                  <ShoppingBag className="h-4 w-4" />
                  {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                </button>
              </div>
            </div>
            
            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {product.tags.slice(0, 4).map(tag => (
                  <span 
                    key={tag} 
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {product.tags.length > 4 && (
                  <span className="text-xs text-gray-400 px-1">
                    +{product.tags.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-black">{getHeaderTitle()}</h1>
              <p className="text-xs text-gray-600">{getHeaderSubtitle()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Filter className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Shop Filter Banner */}
        {currentShop && (
          <div className="bg-blue-50 border-t border-blue-100 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Store className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-900">
                    Showing products from {currentShop.name}
                  </h3>
                  <p className="text-xs text-blue-700">
                    Only products from this shop are shown
                  </p>
                </div>
              </div>
              <button
                onClick={clearShopFilter}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 hover:bg-blue-100 rounded-lg transition-colors"
              >
                Show All Products
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="px-4 pb-20">
        {/* Search Bar */}
        <div className="sticky top-16 z-20 bg-gray-50 pt-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products by name, description, or tags..."
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Filters</h2>
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Reset All
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRICE_RANGES.map(range => (
                    <button
                      key={range.label}
                      onClick={() => setSelectedPriceRange(range.label)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium ${
                        selectedPriceRange === range.label
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* State Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {states.slice(0, 6).map(state => (
                    <button
                      key={state}
                      onClick={() => setSelectedState(state)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium ${
                        selectedState === state
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-black">{totalProducts}</span> products found
            {selectedCategory !== 'All Categories' && ` in ${selectedCategory}`}
            {selectedPriceRange !== 'All Prices' && ` (${selectedPriceRange})`}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid2x2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {(currentShop || selectedCategory !== 'All Categories' || selectedPriceRange !== 'All Prices' || searchQuery) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {currentShop && (
              <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
                <Store className="h-3 w-3" />
                <span>Shop: {currentShop.name}</span>
                <button onClick={clearShopFilter}>
                  <X className="h-3 w-3 ml-1" />
                </button>
              </div>
            )}
            
            {selectedCategory !== 'All Categories' && (
              <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm">
                <Tag className="h-3 w-3" />
                <span>{selectedCategory}</span>
                <button onClick={() => setSelectedCategory('All Categories')}>
                  <X className="h-3 w-3 ml-1" />
                </button>
              </div>
            )}
            
            {selectedPriceRange !== 'All Prices' && (
              <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm">
                <Percent className="h-3 w-3" />
                <span>Price: {selectedPriceRange}</span>
                <button onClick={() => setSelectedPriceRange('All Prices')}>
                  <X className="h-3 w-3 ml-1" />
                </button>
              </div>
            )}
            
            {searchQuery && (
              <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm">
                <Search className="h-3 w-3" />
                <span>Search: "{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')}>
                  <X className="h-3 w-3 ml-1" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-3" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && filteredProducts.length === 0 && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
            <p className="text-red-700 font-medium">Error loading products</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={() => fetchProducts(true)}
              className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 text-center mb-4 max-w-md">
              {searchQuery
                ? `No products match "${searchQuery}"`
                : `No products available${selectedCategory !== 'All Categories' ? ` in ${selectedCategory}` : ''}`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                Clear Filters
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Browse Shops
              </button>
            </div>
          </div>
        )}

        {/* Product List/Grid */}
        {filteredProducts.length > 0 && (
          <>
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-2 gap-4' 
              : 'space-y-4'
            }>
              {filteredProducts.map(product => (
                viewMode === 'grid' ? renderProductCard(product) : renderProductRow(product)
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && !loading && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Load More Products
                </button>
              </div>
            )}

            {loading && filteredProducts.length > 0 && (
              <div className="mt-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" />
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 flex justify-center gap-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex flex-col items-center gap-1 ${
            showFilters ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <SlidersHorizontal className="h-5 w-5" />
          <span className="text-xs font-medium">Filters</span>
        </button>
        
        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          className="flex flex-col items-center gap-1 text-gray-600"
        >
          {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid2x2 className="h-5 w-5" />}
          <span className="text-xs font-medium">
            {viewMode === 'grid' ? 'List' : 'Grid'}
          </span>
        </button>
        
        <button
          onClick={() => router.push('/')}
          className="flex flex-col items-center gap-1 text-gray-600"
        >
          <Package className="h-5 w-5" />
          <span className="text-xs font-medium">Home</span>
        </button>
      </nav>
    </div>
  );
}