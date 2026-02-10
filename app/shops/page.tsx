'use client'
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams  } from 'next/navigation';
import { 
  MapPin, 
  Search, 
  Store, 
  ChevronRight, 
  Heart, 
  Filter, 
  SlidersHorizontal,
  Star, 
  Package, 
  ShoppingBag,
  Loader2,
  X,
  ArrowLeft,
  Grid2x2,
  List,
  ShieldCheck,
  Building
} from 'lucide-react';
import { useShop } from '@/app/lib/hooks/useShop';
import { shopApi } from '@/app/lib/api/shopApi';

// Types
// Update the ShopProfile interface to match the API response
interface ShopProfile {
  _id: string;
  name: string;
  category: string;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  isActive: boolean;
  status?: 'open' | 'closed' | 'busy';
  imageUrl?: string;
  logo?: string;
  tags?: string[]; // Changed from tags: string[] to tags?: string[]
  productsCount: number;
  deliveryFee?: number;
  minimumOrder?: number;
  address?: string;
  marketId?: {
    city: string;
    name: string;
  };
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

const SORT_OPTIONS = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'productsCount', label: 'Most Products' },
  { value: 'newest', label: 'Newest First' },
  { value: 'name', label: 'Alphabetical' },
];

export default function ShopListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get query parameters
  const marketId = searchParams?.get('market');
  const marketName = searchParams?.get('marketName');
  const stateParam = searchParams?.get('state');
  const cityParam = searchParams?.get('city');
  
  // State
  const [shops, setShops] = useState<ShopProfile[]>([]);
  const [filteredShops, setFilteredShops] = useState<ShopProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedState, setSelectedState] = useState(stateParam || 'Lagos');
  const [selectedCity, setSelectedCity] = useState(cityParam || 'all');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalShops, setTotalShops] = useState(0);
  const [currentMarket, setCurrentMarket] = useState<{ id: string; name: string } | null>(
    marketId && marketName ? { id: marketId, name: decodeURIComponent(marketName) } : null
  );
  // States data (you can fetch this from API or use static)
  const states = [
    "Lagos", "Abuja", "Rivers", "Oyo", "Kano", "Kaduna", 
    "Edo", "Delta", "Ogun", "Ondo", "Enugu", "Plateau"
  ];
  
  // Cities data (simplified - in real app, fetch based on selected state)
  const cities = {
    Lagos: ['all', 'Lekki', 'Victoria Island', 'Ikeja', 'Surulere', 'Yaba', 'Apapa'],
    Abuja: ['all', 'Garki', 'Wuse', 'Maitama', 'Asokoro', 'Gwarinpa'],
    Rivers: ['all', 'Port Harcourt', 'Borokiri', 'Rumuola', 'Trans-Amadi'],
  };

  // Fetch shops
   const fetchShops = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setPage(1);
        setLoading(true);
      }
      
      const params: any = {
        page: reset ? 1 : page,
        limit: 20,
        isActive: true,
        sort: sortBy === 'newest' ? '-createdAt' : `-${sortBy}`,
      };
      
      // Add filters
      if (currentMarket) {
        params.marketId = currentMarket.id;
      } else {
        if (selectedState && selectedState !== 'all') {
          params.state = selectedState;
        }
        if (selectedCity && selectedCity !== 'all') {
          params.city = selectedCity;
        }
      }
      
      if (selectedCategory && selectedCategory !== 'All Categories') {
        params.category = selectedCategory;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      console.log('🛍️ Fetching shops with params:', params);
      
      const response = await shopApi.getAllShops(params);
      
      if (response.success && response.data) {
        const shopsData = response.data.shops || [];
        const total = response.data.total || 0;
        
        if (reset) {
          setShops(shopsData);
        } else {
          setShops(prev => [...prev, ...shopsData]);
        }
        
        setTotalShops(total);
        setHasMore(shopsData.length === 20);
        
        if (reset) {
          setFilteredShops(shopsData);
        }
      } else {
        setError(response.message || 'Failed to fetch shops');
      }
    } catch (err: any) {
      console.error('❌ Error fetching shops:', err);
      setError(err.message || 'Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  }, [page, selectedState, selectedCity, selectedCategory, searchQuery, sortBy, currentMarket]);

  // Initial fetch
  useEffect(() => {
    fetchShops(true);
  }, [selectedState, selectedCity, selectedCategory, sortBy]);

  // Search effect with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== '') {
        fetchShops(true);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter shops locally for instant search feedback
  useEffect(() => {
    if (!searchQuery && selectedCategory === 'All Categories') {
      setFilteredShops(shops);
      return;
    }
    
    let results = shops;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(shop => 
        shop.name?.toLowerCase().includes(query) ||
        shop.category?.toLowerCase().includes(query) ||
        shop.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Category filter
    if (selectedCategory !== 'All Categories') {
      results = results.filter(shop => 
        shop.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    setFilteredShops(results);
  }, [shops, searchQuery, selectedCategory]);

  // Load more shops
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory('All Categories');
    setSearchQuery('');
    setSortBy('rating');
    setShowFilters(false);
  };

  const clearMarketFilter = () => {
    setCurrentMarket(null);
    // Update URL without market parameter
    router.push('/shops');
  };

  // Update header based on market filter
  const getHeaderTitle = () => {
    if (currentMarket) {
      return `Shops in ${currentMarket.name}`;
    }
    if (selectedCity !== 'all') {
      return `Shops in ${selectedCity}, ${selectedState}`;
    }
    return 'All Shops';
  };

  const getHeaderSubtitle = () => {
    if (currentMarket) {
      return 'Browse shops in this market';
    }
    return 'Browse local shops and markets';
  };

  // Render shop card (Grid view)
  const renderShopCard = (shop: ShopProfile) => {
    const isOpen = shop.isActive && shop.status !== 'closed' && shop.status !== 'busy';

    
    return (
      <div key={shop._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative">
          <div className="h-40 bg-gray-200">
            {shop.imageUrl || shop.logo ? (
              <img 
                src={shop.imageUrl || shop.logo} 
                alt={shop.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <Store className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Status badge */}
          <div className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-1 rounded-full ${
            isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {isOpen ? 'OPEN' : 'CLOSED'}
          </div>
          
          {/* Favorite button */}
          <button className="absolute top-2 left-2 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-full p-1.5 shadow-md">
            <Heart className="h-4 w-4" />
          </button>
          
          {/* Verified badge */}
          {shop.isVerified && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
              <ShieldCheck className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium text-green-700">Verified</span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 line-clamp-1">{shop.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">{shop.category}</span>
              </div>
            </div>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-semibold text-black">
              {shop.rating?.toFixed(1) || 'N/A'}
            </span>
            <span className="text-xs text-gray-500">
              ({shop.totalReviews || 0})
            </span>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-1 mt-2 text-gray-600">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="text-xs truncate">
              {shop.marketId?.city || shop.address?.split(',')[0] || selectedState}
            </span>
          </div>
          
          {/* Stats */}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              <span>{shop.productsCount || 0} products</span>
            </div>
            {shop.deliveryFee !== undefined && (
              <span className="font-medium">
                ₦{shop.deliveryFee?.toLocaleString() || '0'} delivery
              </span>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => router.push(`/shops/${shop._id}`)}
              className="flex-1 bg-gray-900 text-white text-sm font-semibold py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Visit Shop
            </button>
            <button className="px-3 bg-white border border-gray-300 text-gray-900 text-sm font-semibold py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <ShoppingBag className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render shop row (List view)
  const renderShopRow = (shop: ShopProfile) => {
    const isOpen = shop.isActive && shop.status !== 'closed';
    
    return (
      <div key={shop._id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
        <div className="flex gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200">
              {shop.imageUrl || shop.logo ? (
                <img 
                  src={shop.imageUrl || shop.logo} 
                  alt={shop.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                  <Store className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            {!isOpen && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-semibold bg-red-500 px-2 py-1 rounded">CLOSED</span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900">{shop.name}</h3>
                  {shop.isVerified && (
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600">{shop.category}</span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-red-500 transition-colors">
                <Heart className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-semibold text-black">
                  {shop.rating?.toFixed(1) || 'N/A'}
                </span>
                <span className="text-xs text-gray-500">
                  ({shop.totalReviews || 0})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-600">
                  {shop.marketId?.city || shop.address?.split(',')[0] || selectedState}
                </span>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
              <Package className="h-3 w-3" />
              <span>{shop.productsCount || 0} products</span>
              {shop.deliveryFee !== undefined && (
                <>
                  <span>•</span>
                  <span>Delivery: ₦{shop.deliveryFee?.toLocaleString() || '0'}</span>
                </>
              )}
              {shop.minimumOrder !== undefined && shop.minimumOrder > 0 && (
                <>
                  <span>•</span>
                  <span>Min: ₦{shop.minimumOrder?.toLocaleString() || '0'}</span>
                </>
              )}
            </div>
            
            {shop.tags && shop.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {shop.tags.slice(0, 3).map(tag => (
                  <span 
                    key={tag} 
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {shop.tags.length > 3 && (
                  <span className="text-xs text-gray-400 px-1">
                    +{shop.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
            
            <div className="flex gap-2 mt-4">
              <button 
                onClick={() => router.push(`/shops/${shop._id}`)}
                className="flex-1 bg-gray-900 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Visit Shop
              </button>
              <button className="px-4 bg-white border border-gray-300 text-gray-900 text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1">
                <ShoppingBag className="h-4 w-4" />
                Shop
              </button>
            </div>
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
        
        {/* Market Filter Banner */}
        {currentMarket && (
          <div className="bg-blue-50 border-t border-blue-100 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-900">
                    Showing shops in {currentMarket.name}
                  </h3>
                  <p className="text-xs text-blue-700">
                    Only shops from this market are shown
                  </p>
                </div>
              </div>
              <button
                onClick={clearMarketFilter}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 hover:bg-blue-100 rounded-lg transition-colors"
              >
                Show All Shops
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
              placeholder="Search shops by name, category, or tags..."
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

              {/* City Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <div className="flex flex-wrap gap-2">
                  {(cities[selectedState as keyof typeof cities] || ['all']).map(city => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium ${
                        selectedCity === city
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {city === 'all' ? 'All Cities' : city}
                    </button>
                  ))}
                </div>
              </div>

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
            <span className="font-semibold text-black">{totalShops}</span> shops found
            {selectedCategory !== 'All Categories' && ` in ${selectedCategory}`}
            {selectedCity !== 'all' && ` in ${selectedCity}`}
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
        {(currentMarket || selectedCategory !== 'All Categories' || searchQuery || selectedCity !== 'all') && (
        <div className="flex flex-wrap gap-2 mb-4">
          {currentMarket && (
            <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
              <Building className="h-3 w-3" />
              <span>Market: {currentMarket.name}</span>
              <button onClick={clearMarketFilter}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </div>
          )}
          
          {selectedCategory !== 'All Categories' && (
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm">
              <span>{selectedCategory}</span>
              <button onClick={() => setSelectedCategory('All Categories')}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </div>
          )}
          
          {searchQuery && (
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm">
              <span>Search: "{searchQuery}"</span>
              <button onClick={() => setSearchQuery('')}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </div>
          )}
          
          {selectedCity !== 'all' && !currentMarket && (
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm">
              <span>City: {selectedCity}</span>
              <button onClick={() => setSelectedCity('all')}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </div>
          )}
        </div>
      )}


        {/* Loading State */}
        {loading && filteredShops.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-3" />
            <p className="text-gray-600">Loading shops...</p>
          </div>
        )}

        {/* Error State */}
        {error && filteredShops.length === 0 && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
            <p className="text-red-700 font-medium">Error loading shops</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={() => fetchShops(true)}
              className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredShops.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-12">
            <Store className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No shops found</h3>
            <p className="text-gray-600 text-center mb-4 max-w-md">
              {searchQuery
                ? `No shops match "${searchQuery}" in ${selectedState}${selectedCity !== 'all' ? `, ${selectedCity}` : ''}`
                : `No shops available in ${selectedState}${selectedCity !== 'all' ? `, ${selectedCity}` : ''}`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setSelectedState('Lagos')}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Try Lagos
              </button>
            </div>
          </div>
        )}

        {/* Shop List/Grid */}
        {filteredShops.length > 0 && (
          <>
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-2 gap-4' 
              : 'space-y-4'
            }>
              {filteredShops.map(shop => (
                viewMode === 'grid' ? renderShopCard(shop) : renderShopRow(shop)
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
                  Load More Shops
                </button>
              </div>
            )}

            {loading && filteredShops.length > 0 && (
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
          <Store className="h-5 w-5" />
          <span className="text-xs font-medium">Home</span>
        </button>
      </nav>
    </div>
  );
}