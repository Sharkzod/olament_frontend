'use client'
import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams  } from 'next/navigation';
import { 
  MapPin,
  Search,
  Store,
  ChevronRight,
  SlidersHorizontal,
  Star,
  Package,
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
  tags?: string[];
  productsCount: number;
  deliveryFee?: number;
  minimumOrder?: number;
  address?: string;
  marketId?: {
    _id?: string;
    name?: string;
    city?: string;
    state?: string;
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

function ShopListPageContent() {
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
      <div
        key={shop._id}
        onClick={() => router.push(`/shops/${shop._id}`)}
        className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors cursor-pointer"
      >
        <div className="relative">
          <div className="h-40 bg-gray-100">
            {shop.imageUrl || shop.logo ? (
              <img
                src={shop.imageUrl || shop.logo}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <Store className="h-10 w-10 text-gray-300" />
              </div>
            )}
          </div>

          {/* Status badge */}
          <div className={`absolute top-2.5 right-2.5 text-[10px] font-medium tracking-wide px-2 py-0.5 rounded-full border ${
            isOpen ? 'bg-white/90 border-gray-200 text-gray-700' : 'bg-white/90 border-gray-200 text-gray-400'
          }`}>
            {isOpen ? 'Open' : 'Closed'}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-gray-900 line-clamp-1">{shop.name}</h3>
            {shop.isVerified && (
              <ShieldCheck className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{shop.category}</p>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-gray-400 fill-current" />
              <span className="text-gray-700 font-medium">{shop.rating?.toFixed(1) || 'N/A'}</span>
            </span>
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{shop.marketId?.city || shop.address?.split(',')[0] || selectedState}</span>
            </span>
          </div>

          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
            <Package className="h-3.5 w-3.5" />
            <span>{shop.productsCount || 0} products</span>
            {shop.deliveryFee !== undefined && (
              <span className="ml-auto text-gray-500">₦{shop.deliveryFee?.toLocaleString() || '0'} delivery</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render shop row (List view)
  const renderShopRow = (shop: ShopProfile) => {
    const isOpen = shop.isActive && shop.status !== 'closed';
    
    return (
      <div
        key={shop._id}
        onClick={() => router.push(`/shops/${shop._id}`)}
        className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors cursor-pointer"
      >
        <div className="flex gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
              {shop.imageUrl || shop.logo ? (
                <img
                  src={shop.imageUrl || shop.logo}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <Store className="h-7 w-7 text-gray-300" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-gray-900 truncate">{shop.name}</h3>
              {shop.isVerified && (
                <ShieldCheck className="h-4 w-4 text-gray-400 flex-shrink-0" />
              )}
              <span className={`ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                isOpen ? 'border-gray-200 text-gray-600' : 'border-gray-200 text-gray-400'
              }`}>
                {isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{shop.category}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-gray-400 fill-current" />
                <span className="text-gray-700 font-medium">{shop.rating?.toFixed(1) || 'N/A'}</span>
                <span className="text-gray-400">({shop.totalReviews || 0})</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {shop.marketId?.city || shop.address?.split(',')[0] || selectedState}
              </span>
              <span className="flex items-center gap-1">
                <Package className="h-3.5 w-3.5" />
                {shop.productsCount || 0} products
              </span>
              {shop.deliveryFee !== undefined && (
                <span>Delivery ₦{shop.deliveryFee?.toLocaleString() || '0'}</span>
              )}
            </div>
          </div>

          <ChevronRight className="h-5 w-5 text-gray-300 self-center flex-shrink-0" />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3.5 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-gray-900 tracking-tight">{getHeaderTitle()}</h1>
              <p className="text-xs text-gray-500">{getHeaderSubtitle()}</p>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showFilters ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Market Filter Banner */}
        {currentMarket && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white border border-gray-200 rounded-lg">
                  <Building className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Showing shops in {currentMarket.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Only shops from this market are shown
                  </p>
                </div>
              </div>
              <button
                onClick={clearMarketFilter}
                className="text-xs text-gray-600 hover:text-gray-900 font-medium px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Show all
              </button>
            </div>
          </div>
        )}
      </header>


      <main className="px-4 pb-16 max-w-5xl mx-auto">
        {/* Search Bar */}
        <div className="sticky top-16 z-20 bg-gray-50 pt-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search shops by name or category"
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
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
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Filters</h2>
              <button
                onClick={resetFilters}
                className="text-sm text-gray-500 hover:text-gray-900 font-medium"
              >
                Reset all
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
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                        selectedState === state
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
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
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                        selectedCity === city
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
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
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
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
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
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
          <div className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{totalShops}</span> shops
            {selectedCategory !== 'All Categories' && ` in ${selectedCategory}`}
            {selectedCity !== 'all' && ` in ${selectedCity}`}
          </div>

          <div className="flex items-center rounded-lg border border-gray-200 p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Grid2x2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {(currentMarket || selectedCategory !== 'All Categories' || searchQuery || selectedCity !== 'all') && (
        <div className="flex flex-wrap gap-2 mb-4">
          {currentMarket && (
            <div className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
              <Building className="h-3 w-3" />
              <span>{currentMarket.name}</span>
              <button onClick={clearMarketFilter} className="text-gray-400 hover:text-gray-700">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {selectedCategory !== 'All Categories' && (
            <div className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
              <span>{selectedCategory}</span>
              <button onClick={() => setSelectedCategory('All Categories')} className="text-gray-400 hover:text-gray-700">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {searchQuery && (
            <div className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
              <span>"{searchQuery}"</span>
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-700">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {selectedCity !== 'all' && !currentMarket && (
            <div className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
              <span>{selectedCity}</span>
              <button onClick={() => setSelectedCity('all')} className="text-gray-400 hover:text-gray-700">
                <X className="h-3 w-3" />
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
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
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
    </div>
  );
}


export default function ShopListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading shops...</p>
        </div>
      </div>
    }>
      <ShopListPageContent />
    </Suspense>
  );
}