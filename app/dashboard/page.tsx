'use client'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search, Bike, Store, Package, ChevronRight, Heart, Plus, ShoppingBag, User, Star, Clock, Loader2, X } from 'lucide-react';
import { useMarkets } from '../lib/hooks/useMarkets';
import { useShop } from '../lib/hooks/useShop';
import { useProducts } from '../lib/hooks/useProducts';
import { shopApi } from '../lib/api/shopApi';
import BottomNav from '../components/Sidebar';

const shops = [
  { id: 1, name: 'Tech Gadgets Hub', category: 'Electronics', rating: 4.7, deliveryTime: '30-45 min', open: true, image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w-800&q=80' },
  { id: 2, name: 'Fresh Grocery Store', category: 'Groceries', rating: 4.5, deliveryTime: '20-35 min', open: true, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w-800&q=80' },
  { id: 3, name: 'Fashion Boutique', category: 'Clothing', rating: 4.3, deliveryTime: '45-60 min', open: false, image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w-800&q=80' },
  { id: 4, name: 'Book Haven', category: 'Books & Stationery', rating: 4.8, deliveryTime: '25-40 min', open: true, image: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w-800&q=80' },
];

const products = [
  { id: 1, name: 'Fresh Tomatoes', price: '₦1,200', unit: 'per kg', shop: 'Fresh Grocery', rating: 4.5, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w-800&q=80' },
  { id: 2, name: 'iPhone 14 Pro', price: '850,000', unit: '', shop: 'Tech Gadgets Hub', rating: 4.8, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w-800&q=80' },
  { id: 3, name: 'Designer T-Shirt', price: '15,000', unit: '', shop: 'Fashion Boutique', rating: 4.3, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w-800&q=80' },
  { id: 4, name: 'Organic Bananas', price: '800', unit: 'per bunch', shop: 'Fresh Grocery', rating: 4.6, image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w-800&q=80' },
];

// Fallback states in case API fails
const FALLBACK_STATES = [
  "Lagos", "Abuja", "Rivers", "Oyo", "Kano", "Kaduna", 
  "Edo", "Delta", "Ogun", "Ondo", "Enugu", "Plateau"
];

export default function App() {
  const [tab, setTab] = useState('markets');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPromo, setShowPromo] = useState(true);
  
  // Use the markets hook
  const {
    markets,
    states: apiStates,
    selectedState,
    selectedCity,
    loading,
    error,
    setSelectedState,
    setSelectedCity,
    refreshMarkets,
    getMarketsByState,
    getAvailableStates,
  } = useMarkets("Lagos");

  const {
    shops: apiShops,
    loading: shopsLoading,
    error: shopsError,
    totalShops,
    getAllShops,
  } = useShop();

  // Use the products hook
  const {
    products: apiProducts,
    isLoading: productsLoading,
    error: productsError,
    fetchProducts,
    refetch: refetchProducts,
    isEmpty: productsIsEmpty,
  } = useProducts({
    filters: {
      page: 1,
      limit: 20,
      isAvailable: true,
      isPublished: true,
    },
    autoFetch: false, // We'll fetch manually when tab is active
  });

  // Use fallback if API states are empty
  const states = apiStates.length > 0 ? apiStates : FALLBACK_STATES;
  
  const [sortedMarkets, setSortedMarkets] = useState(markets);
  const [filteredShops, setFilteredShops] = useState(shops);
  const [filteredProducts, setFilteredProducts] = useState(products);
  
  // MOVED FROM renderShopsTab: Shops state at top level
  const [shopsFiltered, setShopsFiltered] = useState<ShopProfile[]>([]);
  const [shopsLoadingLocal, setShopsLoadingLocal] = useState(false);
  const [shopsErrorLocal, setShopsErrorLocal] = useState<string | null>(null);

  // Products state at top level
  const [productsFiltered, setProductsFiltered] = useState<Product[]>([]);
  const [productsLoadingLocal, setProductsLoadingLocal] = useState(false);
  const [productsErrorLocal, setProductsErrorLocal] = useState<string | null>(null);
  
  // Ref to track if products have been fetched for current tab
  const productsFetchedRef = useRef(false);

  const router = useRouter();
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 Component State:', {
      states,
      statesLength: states.length,
      selectedState,
      marketsCount: markets.length,
      loading,
      error
    });
  }, [states, selectedState, markets, loading, error]);

  // Manual function to fetch states
  const handleFetchStates = async () => {
    console.log('🔄 Manually fetching states...');
    try {
      const result = await getAvailableStates();
      console.log('📦 States fetch result:', result);
    } catch (err) {
      console.error('❌ Error fetching states:', err);
    }
  };

  // Manual function to fetch markets
  const handleFetchMarkets = async (state: string) => {
    console.log('🔄 Manually fetching markets for:', state);
    try {
      const result = await getMarketsByState(state);
      console.log('📦 Markets fetch result:', result);
    } catch (err) {
      console.error('❌ Error fetching markets:', err);
    }
  };

  // MOVED FROM renderShopsTab: Fetch shops callbacks at top level
  const fetchShopsByState = useCallback(async () => {
    if (!selectedState || selectedState === '') return;
    
    setShopsLoadingLocal(true);
    setShopsErrorLocal(null);
    
    try {
      console.log('🛍️ Fetching shops by state:', selectedState);
      
      const params: any = {
        city: selectedCity !== 'all' ? selectedCity : undefined,
        category: undefined,
        isActive: true,
        limit: 20,
        page: 1,
        sort: '-rating'
      };
      
      // Clean up undefined params
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
      
      // Use your API client to fetch shops
      const response = await shopApi.getAllShops({ ...params, state: selectedState });
      console.log('🛍️ Shops by state response:', response);
      
      if (response.success && response.data) {
        const shopsData = response.data.shops || [];
        console.log(`🛍️ Found ${shopsData.length} shops in ${selectedState}`);
        setShopsFiltered(shopsData);
      } else {
        setShopsErrorLocal(response.message || 'Failed to fetch shops');
        setShopsFiltered([]);
      }
    } catch (error: any) {
      console.error('🛍️ Error fetching shops by state:', error);
      setShopsErrorLocal(error.message || 'Failed to fetch shops');
      setShopsFiltered([]);
    } finally {
      setShopsLoadingLocal(false);
    }
  }, [selectedState, selectedCity]);

  // MOVED FROM renderShopsTab: Effect to fetch shops when state/city changes
  useEffect(() => {
    if (tab === 'shops' && selectedState) {
      fetchShopsByState();
    }
  }, [tab, selectedState, selectedCity, fetchShopsByState]);

  // Fetch products callback at top level
  const fetchProductsByFilters = useCallback(async () => {
    setProductsLoadingLocal(true);
    setProductsErrorLocal(null);
    
    try {
      console.log('🛒 Fetching products with filters:', {
        search: searchQuery,
        state: selectedState,
      });
      
      const filters: any = {
        page: 1,
        limit: 20,
        isAvailable: true,
        isPublished: true,
        sortBy: 'createdAt',
        order: 'desc' as const,
      };
      
      // Add search filter if query exists
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      await fetchProducts(filters);
      
      console.log(`🛒 Products fetch completed`);
      
    } catch (error: any) {
      console.error('🛒 Error fetching products:', error);
      setProductsErrorLocal(error.message || 'Failed to fetch products');
    } finally {
      setProductsLoadingLocal(false);
    }
  }, [searchQuery, selectedState, fetchProducts]);

  // Effect to fetch products when tab changes to products
  useEffect(() => {
    if (tab === 'products' && !productsFetchedRef.current && !productsLoadingLocal) {
      productsFetchedRef.current = true;
      fetchProductsByFilters();
    } else if (tab !== 'products') {
      // Reset the ref when leaving products tab
      productsFetchedRef.current = false;
    }
  }, [tab]); // Only depend on tab change

  // REMOVED: Conflicting effect that was causing infinite loop
  // Update productsFiltered when apiProducts changes from the hook
  useEffect(() => {
    if (apiProducts.length > 0) {
      setProductsFiltered(apiProducts);
    }
  }, [apiProducts]);

  // MOVED FROM renderShopsTab: Memoized search filtering
  const searchFilteredShops = useMemo(() => {
    if (!searchQuery) return shopsFiltered;
    
    return shopsFiltered.filter(shop => 
      shop.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [shopsFiltered, searchQuery]);

  // Memoized search filtering for products - use apiProducts from hook
  const searchFilteredProducts = useMemo(() => {
    const productsToFilter = apiProducts.length > 0 ? apiProducts : productsFiltered;
    
    if (!searchQuery) return productsToFilter;
    
    return productsToFilter.filter(product => 
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [apiProducts, productsFiltered, searchQuery]);

  const NavigateVendor = () => {
    router.push(`/vendor`);
  }

  const NavigateProfile = () => {
    router.push(`/profile`);
  }

  const handleNavClick = (route: string) => {
    console.log('📍 Navigating to:', route);
    switch (route) {
      case 'explore':
        router.push('/product-listing');
        break;
      case 'chat':
        router.push('/chat');
        break;
      case 'profile':
        router.push('/profile');
        break;
      case 'home':
        router.push('/dashboard');
        break;
      default:
        console.log('Navigation not implemented:', route);
    }
  }

  const handleViewAllProductsClick = () => {
  console.log('📦 Navigating to all products');
  router.push(`/products`);
};


  // Filter markets based on search query
  useEffect(() => {
    const marketsResults = searchQuery
      ? markets.filter(m => 
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.city && m.city.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : markets;
    
    setSortedMarkets(marketsResults);

    // Filter shops (kept as static for now)
    const shopsResults = searchQuery
      ? shops.filter(s => 
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : shops;
    
    setFilteredShops(shopsResults);

    // Filter products (kept as static for now)
    const productsResults = searchQuery
      ? products.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.shop.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : products;
    
    setFilteredProducts(productsResults);
  }, [searchQuery, markets]);

  const renderMarketsTab = () => {
  console.log('🔄 renderMarketsTab called:', { 
    marketsCount: sortedMarkets.length, 
    loading, 
    error,
    selectedState 
  });

  if (loading && sortedMarkets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-3" />
        <p className="text-gray-600">Loading markets in {selectedState}...</p>
      </div>
    );
  }

  if (error && sortedMarkets.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
        <p className="text-red-700 font-medium">Error loading markets</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={refreshMarkets}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => handleFetchMarkets(selectedState)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Debug Fetch
          </button>
        </div>
      </div>
    );
  }

  if (sortedMarkets.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Store className="h-12 w-12 text-gray-300 mb-3" />
        <p className="text-gray-600 font-medium">No markets found in {selectedState}</p>
        <p className="text-gray-500 text-sm mt-1">Try selecting a different state or check back later</p>
        <button
          onClick={() => handleFetchMarkets(selectedState)}
          className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  console.log('🎯 Rendering markets:', sortedMarkets);

  // Function to handle market click
  const handleMarketClick = (marketId: string, marketName: string) => {
    console.log('🛍️ Navigating to shops in market:', marketId, marketName);
    // Navigate to shop list page with market ID as query parameter
    router.push(`/shops?market=${marketId}&marketName=${encodeURIComponent(marketName)}`);
  };

  // Function to handle "View all" click
  const handleViewAllMarketsClick = () => {
    console.log('📋 Navigating to all markets shops');
    router.push(`/shops?state=${selectedState}&city=${selectedCity || 'all'}`);
  };

  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-black">
          Markets in {selectedState}
          {selectedCity && selectedCity.toLowerCase() !== 'all' && `, ${selectedCity}`}
          <span className="text-sm font-normal text-gray-600 ml-2">
            ({sortedMarkets.length} {sortedMarkets.length === 1 ? 'market' : 'markets'})
          </span>
        </h2>
        <button 
          className="text-sm font-semibold text-gray-600 flex items-center gap-1 hover:text-gray-900 cursor-pointer"
          onClick={handleViewAllMarketsClick}
        >
          View all <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {sortedMarkets.map((market) => (
          <article 
            key={market._id} 
            className="rounded-2xl cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleMarketClick(market._id, market.name)}
          >
            <div className='bg-white rounded-xl min-h-[35vh] w-full border border-gray-200 hover:border-gray-300'>
              <div className="relative pt-[20px]">
                <div className="rounded-2xl overflow-hidden bg-gray-200 w-[90%] flex justify-center items-center m-auto h-48">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                    <Store className="h-16 w-16 text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className='flex w-full justify-between'>
                    <h3 className="font-bold text-lg text-gray-900">{market.name}</h3>
                    <div className="flex items-center mt-1 text-gray-600">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="text-sm">
                        {market.city && market.city !== 'Nill' ? market.city : selectedState}
                      </span>
                    </div>
                  </div>
                </div>
                {market.description && (
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">{market.description}</p>
                )}
                <div className="mt-3 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {market.vendorIds?.length || 0} vendors • {market.productIds?.length || 0} products
                  </div>
                  <div className="text-xs text-gray-500">
                    {market.address ? `${market.address.substring(0, 20)}...` : 'No address'}
                  </div>
                </div>
                <button 
                  className="mt-4 w-full bg-gray-900 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent double navigation
                    handleMarketClick(market._id, market.name);
                  }}
                >
                  Explore Market Shops
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};


  // SIMPLIFIED: renderShopsTab now uses state from top level
  const renderShopsTab = () => {
    const isLoading = shopsLoadingLocal || shopsLoading;
    const errorToShow = shopsErrorLocal || shopsError;

    if (isLoading && searchFilteredShops.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-3" />
          <p className="text-gray-600">Loading shops in {selectedState}...</p>
        </div>
      );
    }

    if (errorToShow && searchFilteredShops.length === 0) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
          <p className="text-red-700 font-medium">Error loading shops</p>
          <p className="text-red-600 text-sm mt-1">{errorToShow}</p>
          <button
            onClick={fetchShopsByState}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    if (searchFilteredShops.length === 0 && !isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Store className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-600 font-medium">No shops found</p>
          <p className="text-gray-500 text-sm mt-1">
            {selectedCity && selectedCity !== 'all' 
              ? `Try ${selectedState} state or a different city` 
              : 'Check back later or try a different state'}
          </p>
          {searchQuery && (
            <p className="text-gray-500 text-sm mt-2">
              No results for "{searchQuery}"
            </p>
          )}
        </div>
      );
    }

    return (
      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-black">
            Shops in {selectedState}
            {selectedCity && selectedCity !== 'all' && `, ${selectedCity}`}
            <span className="text-sm font-normal text-gray-600 ml-2">
              ({searchFilteredShops.length} {searchFilteredShops.length === 1 ? 'shop' : 'shops'})
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
          </h2>
          <button className="text-sm font-semibold text-gray-600 flex items-center gap-1 cursor-pointer">
            View all <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {searchFilteredShops.map(shop => {
            const isOpen = shop.isActive && shop.status !== 'closed';
            
            return (
              <article key={shop._id} className="bg-white rounded-xl border border-gray-200 p-4">
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
                        <h3 className="font-bold text-gray-900">{shop.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">{shop.category}</span>
                          {shop.isVerified && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
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
                          ({shop.totalReviews || 0} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-xs text-gray-600">
                          {shop.marketId?.city || shop.address?.split(',')[0] || selectedState}
                        </span>
                      </div>
                      <div className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                        isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isOpen ? 'OPEN NOW' : 'CLOSED'}
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
                        className="flex-1 bg-gray-900 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/vendor/${shop._id}`);
                        }}
                      >
                        Visit Vendor
                      </button>
                      <button className="px-4 bg-white border border-gray-300 text-gray-900 text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 cursor-pointer">
                        <ShoppingBag className="h-4 w-4" />
                        Shop
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  };

  const renderProductsTab = () => {
    const isLoading = productsLoadingLocal || productsLoading;
    const errorToShow = productsErrorLocal || (productsError ? productsError.message : null);

    if (isLoading && searchFilteredProducts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-3" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      );
    }

    if (errorToShow && searchFilteredProducts.length === 0) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
          <p className="text-red-700 font-medium">Error loading products</p>
          <p className="text-red-600 text-sm mt-1">{errorToShow}</p>
          <button
            onClick={fetchProductsByFilters}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    if (searchFilteredProducts.length === 0 && !isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-600 font-medium">No products found</p>
          <p className="text-gray-500 text-sm mt-1">
            Check back later or try a different search
          </p>
          {searchQuery && (
            <p className="text-gray-500 text-sm mt-2">
              No results for "{searchQuery}"
            </p>
          )}
        </div>
      );
    }

    return (
      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-black">
            {searchQuery ? 'Search Results' : 'Popular Products'}
            <span className="text-sm font-normal text-gray-600 ml-2">
              ({searchFilteredProducts.length} {searchFilteredProducts.length === 1 ? 'product' : 'products'})
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
          </h2>
          <button className="text-sm font-semibold text-gray-600 flex items-center gap-1 cursor-pointer">
            View all <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {searchFilteredProducts.map(product => {
            // Calculate discount percentage
            const hasDiscount = product.discountPrice && product.discountPrice < product.price;
            const discountPercent = hasDiscount 
              ? Math.round(((product.price - (product.discountPrice || 0)) / product.price) * 100)
              : 0;
            
            // Get display price
            const displayPrice = hasDiscount ? product.discountPrice : product.price;
            
            // Check stock status
            const isOutOfStock = product.inventory?.quantity === 0;
            const isLowStock = product.inventory?.quantity 
              ? product.inventory.quantity <= (product.inventory.lowStockThreshold || 5)
              : false;

            return (
              <article 
                key={product._id} 
                className="bg-white rounded-xl border border-gray-200 overflow-hidden relative"
              >
                {/* Discount badge */}
                {hasDiscount && (
                  <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    -{discountPercent}%
                  </div>
                )}
                
                {/* Out of stock overlay */}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                    <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded">
                      OUT OF STOCK
                    </span>
                  </div>
                )}
                
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
                  <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-full p-1.5 shadow-md cursor-pointer">
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
                      {isLowStock && !isOutOfStock && (
                        <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                          Low Stock
                        </span>
                      )}
                    </div>
                  )}
                  
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  
                  {/* Shop/Vendor info */}
                  {product.vendor && (
                    <p className="text-xs text-gray-500 mt-1">
                      {typeof product.vendor === 'string' 
                        ? product.vendor 
                        : product.vendor.vendorProfile?.businessName || product.vendor.name}
                    </p>
                  )}
                  
                  {/* Rating if available */}
                  {product.rating && product.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs font-semibold">{product.rating.toFixed(1)}</span>
                      {product.reviewCount && (
                        <span className="text-xs text-gray-500">({product.reviewCount})</span>
                      )}
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
                          : 'bg-gray-900 text-white hover:bg-gray-800 cursor-pointer'
                      }`}
                      disabled={isOutOfStock}
                      onClick={() => {
                        if (!isOutOfStock) {
                          // Add to cart logic
                          console.log('Add to cart:', product._id);
                        }
                      }}
                    >
                      <ShoppingBag className="h-3 w-3" />
                      {isOutOfStock ? 'Sold Out' : 'Add'}
                    </button>
                  </div>
                  
                  {/* Stock indicator */}
                  {!isOutOfStock && product.inventory?.quantity && (
                    <div className="mt-2 text-xs text-gray-500">
                      {product.inventory.quantity} in stock
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  };

  const renderTabContent = () => {
    switch(tab) {
      case 'markets':
        return renderMarketsTab();
      case 'shops':
        return renderShopsTab();
      case 'products':
        return renderProductsTab();
      default:
        return renderMarketsTab();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 w-full">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gray-900 flex items-center justify-center">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-black">Olament</div>
              <div className="text-xs text-gray-600">Your local market, online</div>
            </div>
          </div>
          <div className="flex text-sm text-gray-600 justify-end items-center">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-gray-500">Loading...</span>
              </div>
            ) : (
              <select 
                className="appearance-none bg-transparent border-none font-medium text-gray-800 cursor-pointer focus:outline-none focus:ring-0 min-w-[40px]"
                value={selectedState}
                onChange={(e) => {
                  const newState = e.target.value;
                  console.log('🔄 State changed from', selectedState, 'to', newState);
                  setSelectedState(newState);
                  setSelectedCity('all');
                  handleFetchMarkets(newState);
                }}
              >
                {states.length === 0 ? (
                  <option value="">No states</option>
                ) : (
                  <>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </>
                )}
              </select>
            )}
            
            <button 
              onClick={handleFetchStates}
              className="ml-2 text-xs text-blue-600 hover:text-blue-700 underline hidden"
            >
              Debug
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 pb-20 bg-gray-50">
        <div className="">
          <div className="flex bg-gray-100">
            <div className='h-11 w-full flex items-center justify-center'>
              {['products', 'shops', 'markets'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`text-sm font-semibold capitalize justify-between w-full cursor-pointer ${tab === t ? 'text-gray-900 bg-white rounded-lg py-2' : 'text-gray-500'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search ${tab}...`}
            className="w-full rounded-lg border placeholder-gray-400 border-gray-300 py-3 pl-10 pr-3 text-sm focus:outline-none"
          />
        </div>

        {/* Promo Banner with Dismiss Button */}
        {showPromo && (
          <div className="mt-4 rounded-2xl bg-yellow-400 flex gap-3 w-full h-[12vh] min-h-[80px] relative">
            <div className='flex items-center gap-3 justify-center m-auto pr-12'>
              <div className="rounded-lg p-2.5 flex-shrink-0">
                <Bike className="h-8 w-8 text-black" />
              </div>
              <div>
                <div className="text-base font-bold mb-1 text-black">Browse shops → Order → We deliver</div>
                <div className="text-sm text-gray-800">Local markets brought to your door</div>
              </div>
            </div>
            {/* X Button to dismiss - Yellow background, black X, square border */}
            <button
              onClick={() => setShowPromo(false)}
              className="absolute top-2 right-2 w-8 h-8 bg-yellow-400 border-2 border-black rounded-lg flex items-center justify-center cursor-pointer hover:bg-yellow-500 transition-colors flex-shrink-0"
              aria-label="Dismiss banner"
            >
              <X className="h-5 w-5 text-black" />
            </button>
          </div>
        )}

        {renderTabContent()}
      </main>

      <BottomNav
        onNavigate={handleNavClick}
        activeRoute="home"
      />
        
    </div>
  );
}
