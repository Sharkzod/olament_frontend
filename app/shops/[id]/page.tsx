'use client'

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Search, Package, Store, Loader2, Heart, X } from 'lucide-react';
import { shopApi, ShopProfile } from '@/app/lib/api/shopApi';
import { useProducts } from '@/app/lib/hooks/useProducts';

export default function ShopDetailPage() {
  const router = useRouter();
  const params = useParams();
  const shopId = params?.id as string;

  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [shopLoading, setShopLoading] = useState(true);
  const [shopError, setShopError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch the shop
  useEffect(() => {
    if (!shopId) return;
    let cancelled = false;

    setShopLoading(true);
    setShopError(null);

    shopApi.getShopById(shopId)
      .then(res => {
        if (cancelled) return;
        if (res.success && res.data) {
          setShop(res.data);
        } else {
          setShopError(res.message || 'Shop not found');
        }
      })
      .catch(err => {
        if (!cancelled) setShopError(err.message || 'Failed to load shop');
      })
      .finally(() => {
        if (!cancelled) setShopLoading(false);
      });

    return () => { cancelled = true; };
  }, [shopId]);

  const { products, isLoading: productsLoading, error: productsError } = useProducts({
    filters: {
      shopId,
      isAvailable: true,
      isPublished: true,
      limit: 50,
    },
    autoFetch: !!shopId,
    useCategoryEndpoint: false,
  });

  const productCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(product => { if (product.category) set.add(product.category); });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let results = products;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      results = results.filter(product => product.category === selectedCategory);
    }

    return results;
  }, [products, searchQuery, selectedCategory]);

  const isOpen = shop ? shop.isActive && shop.status !== 'closed' : false;
  const cityLabel = shop?.marketId?.city || shop?.address?.split(',')[0];

  if (shopLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (shopError || !shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <Store className="h-16 w-16 text-gray-300 mb-4" />
        <h1 className="text-lg font-bold text-gray-900 mb-2">Shop not found</h1>
        <p className="text-gray-600 mb-4">{shopError || 'This shop may have been removed.'}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 cursor-pointer"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
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
              <h1 className="text-base font-bold text-gray-900 truncate">{shop.name}</h1>
              <p className="text-xs text-gray-500 truncate">
                {[cityLabel, isOpen ? 'open now' : 'closed'].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 cursor-pointer">
            <Heart className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="px-4 max-w-5xl mx-auto">
        {/* Shop identity card */}
        {/* <div className="bg-white rounded-2xl border border-gray-200 p-4 mt-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center flex-shrink-0">
            {shop.imageUrl || shop.logo ? (
              <img src={shop.imageUrl || shop.logo} alt={shop.name} className="w-full h-full object-cover" />
            ) : (
              <Store className="h-7 w-7 text-yellow-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900 truncate">{shop.name}</h2>
              <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                isOpen ? 'bg-yellow-400 text-gray-900' : 'bg-gray-100 text-gray-500'
              }`}>
                {isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate">
              {shop.category}{cityLabel ? ` · ${cityLabel}` : ''}
            </p>
            <p className="text-sm text-gray-700 mt-1 flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
              <span className="font-medium">{shop.rating?.toFixed(1) || 'N/A'}</span>
              <span className="text-gray-400">({shop.totalReviews || 0})</span>
              <span className="text-gray-400">· {shop.productsCount || products.length} products</span>
            </p>
          </div>
        </div> */}

        {/* {shop.description && (
          <p className="text-sm text-gray-600 mt-3">{shop.description}</p>
        )} */}

        {/* Search + Category pills */}
        <div className="sticky top-16 z-20 bg-gray-50 pt-4 pb-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products in this shop"
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

          {productCategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pt-3 pb-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === 'all' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {productCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === category ? 'bg-yellow-400 text-gray-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 mt-3 mb-3">
          {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'}
        </p>

        {/* Loading */}
        {productsLoading && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-3" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        )}

        {/* Error */}
        {productsError && filteredProducts.length === 0 && !productsLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
            <p className="text-red-700 font-medium">Error loading products</p>
            <p className="text-red-600 text-sm mt-1">{productsError.message}</p>
          </div>
        )}

        {/* Empty */}
        {!productsLoading && filteredProducts.length === 0 && !productsError && (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">No products listed yet</p>
            <p className="text-gray-500 text-sm mt-1">Check back later for new arrivals</p>
          </div>
        )}

        {/* Product grid */}
        {filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-6">
            {filteredProducts.map(product => {
              const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
              const displayPrice = hasDiscount ? (product.discountPrice as number) : product.price;
              const isOutOfStock = !product.isAvailable || product.inventory?.quantity === 0;

              return (
                <article
                  key={product._id}
                  onClick={() => router.push(`/product-listing/${product._id}`)}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:border-gray-300 transition-colors relative"
                >
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 z-10 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
                      -{Math.round(((product.price - displayPrice) / product.price) * 100)}%
                    </span>
                  )}
                  <div className="h-32 sm:h-36 bg-gray-900 flex items-center justify-center">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Package className="h-7 w-7 text-gray-600" strokeWidth={1.5} />
                        <span className="text-[10px] text-gray-500">Image fallback state</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-bold text-gray-900 text-sm">₦{displayPrice?.toLocaleString()}</span>
                      {hasDiscount && (
                        <span className="text-xs text-gray-400 line-through">₦{product.price.toLocaleString()}</span>
                      )}
                    </div>
                    {isOutOfStock && (
                      <span className="inline-block mt-1.5 text-xs font-semibold text-gray-400">Out of stock</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
