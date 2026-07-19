'use client'
import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams  } from 'next/navigation';
import {
  Search,
  Store,
  ChevronRight,
  Star,
  Loader2,
  X,
  ArrowLeft,
} from 'lucide-react';
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

function ShopListPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get query parameters
  const marketId = searchParams?.get('market');
  const marketName = searchParams?.get('marketName');
  const stateParam = searchParams?.get('state');
  const cityParam = searchParams?.get('city');
  const openParam = searchParams?.get('open');

  // State
  const [shops, setShops] = useState<ShopProfile[]>([]);
  const [filteredShops, setFilteredShops] = useState<ShopProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedState, setSelectedState] = useState(stateParam || 'Lagos');
  const [selectedCity, setSelectedCity] = useState(cityParam || 'all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalShops, setTotalShops] = useState(0);
  const [currentMarket, setCurrentMarket] = useState<{ id: string; name: string } | null>(
    marketId && marketName ? { id: marketId, name: decodeURIComponent(marketName) } : null
  );

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
        sort: '-rating',
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
  }, [page, selectedState, selectedCity, selectedCategory, searchQuery, currentMarket]);

  // Initial fetch
  useEffect(() => {
    fetchShops(true);
  }, [selectedState, selectedCity, selectedCategory]);

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

  // Categories actually present among the loaded shops (drives the filter pills)
  const shopCategories = useMemo(() => {
    const set = new Set<string>();
    shops.forEach(shop => { if (shop.category) set.add(shop.category); });
    return Array.from(set);
  }, [shops]);

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
  };

  const clearMarketFilter = () => {
    setCurrentMarket(null);
    // Update URL without market parameter
    router.push('/shops');
  };

  // Render shop row
  const renderShopRow = (shop: ShopProfile) => {
    const isOpen = shop.isActive && shop.status !== 'closed';
    const hasActivity = (shop.productsCount || 0) > 0 || (shop.totalReviews || 0) > 0;

    return (
      <div
        key={shop._id}
        onClick={() => router.push(`/shops/${shop._id}`)}
        className="bg-white rounded-xl border border-gray-200 p-3 hover:border-gray-300 transition-colors cursor-pointer flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center flex-shrink-0">
          {shop.imageUrl || shop.logo ? (
            <img
              src={shop.imageUrl || shop.logo}
              alt={shop.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Store className="h-5 w-5 text-yellow-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{shop.name}</h3>
            <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
              isOpen ? 'bg-yellow-400 text-gray-900' : 'bg-gray-100 text-gray-500'
            }`}>
              {isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
          <p className="text-sm text-gray-500 truncate">{shop.category}</p>
          {hasActivity ? (
            <p className="text-xs text-gray-500 mt-0.5">
              <Star className="h-3 w-3 text-yellow-400 fill-current inline -mt-0.5 mr-1" />
              <span className="font-medium text-gray-700">{shop.rating?.toFixed(1) || 'N/A'}</span>
              <span> ({shop.totalReviews || 0}) · {shop.productsCount || 0} products</span>
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-0.5">New shop</p>
          )}
        </div>

        <ChevronRight className="h-5 w-5 text-gray-300 flex-shrink-0" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between gap-3 px-4 py-3.5 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg flex-shrink-0 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-gray-900 truncate">
                {currentMarket ? currentMarket.name : 'All Shops'}
              </h1>
              {/* <p className="text-xs text-gray-500 truncate">
                {currentMarket
                  ? [cityParam, openParam === 'false' ? 'closed' : 'open now'].filter(Boolean).join(' · ')
                  : 'Browse local shops and markets'}
              </p> */}
            </div>
          </div>
          {currentMarket && (
            <button
              onClick={clearMarketFilter}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 flex-shrink-0 cursor-pointer"
            >
              All shops
            </button>
          )}
        </div>
      </header>

      <main className="px-4 pb-16 max-w-5xl mx-auto">
        {/* Search Bar */}
        <div className="sticky top-16 z-20 bg-gray-50 pt-4 pb-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search shops or categories"
              className="w-full rounded-full border-none bg-gray-100 py-3 pl-11 pr-10 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pt-3 pb-1">
            <button
              onClick={() => setSelectedCategory('All Categories')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'All Categories'
                  ? 'bg-yellow-400 text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {shopCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-yellow-400 text-gray-900'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Shop count */}
        <p className="text-sm text-gray-500 mt-3 mb-3">
          {totalShops} shop{totalShops === 1 ? '' : 's'}
        </p>

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

        {/* Shop List */}
        {filteredShops.length > 0 && (
          <>
            <div className="space-y-3">
              {filteredShops.map(shop => renderShopRow(shop))}
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
