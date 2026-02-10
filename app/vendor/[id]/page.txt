'use client'
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  MapPin, 
  Store, 
  Star, 
  Package, 
  Phone, 
  Mail, 
  Globe, 
  Clock,
  ShieldCheck,
  Heart,
  ShoppingBag,
  ArrowLeft,
  Users,
  Truck,
  CheckCircle,
  Calendar,
  Share2,
  MessageCircle,
  Filter,
  Grid2x2,
  List
} from 'lucide-react';
import { shopApi } from '@/app/lib/api/shopApi';
import { productApi } from '@/app/lib/api/productApi';

interface VendorProfile {
  _id: string;
  name: string;
  businessName: string;
  category: string;
  description: string;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  isActive: boolean;
  status: 'open' | 'closed';
  imageUrl?: string;
  logo?: string;
  tags: string[];
  productsCount: number;
  deliveryFee?: number;
  minimumOrder?: number;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  marketId?: {
    _id: string;
    name: string;
    city: string;
  };
  joinedDate: string;
  totalSales: number;
  responseRate: number;
  averageResponseTime: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: string[];
  rating: number;
  unit: string;
  category: string;
}

export default function VendorPage() {
  const router = useRouter();
  const params = useParams();
  const vendorId = params.id as string;
  
  // State
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'info' | 'reviews'>('products');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch vendor data
  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        
        // Fetch vendor info
        const vendorResponse = await shopApi.getShopById(vendorId);
        
        if (vendorResponse.success && vendorResponse.data) {
          setVendor(vendorResponse.data);
          
          // Fetch vendor products
          const productsResponse = await productApi.getProductsByShop(vendorId, {
            limit: 20,
            page: 1,
            isAvailable: true,
            isPublished: true,
          });
          
          if (productsResponse.success && productsResponse.data) {
            setProducts(productsResponse.data.products || []);
          }
        } else {
          setError(vendorResponse.message || 'Failed to fetch vendor information');
        }
      } catch (err: any) {
        console.error('❌ Error fetching vendor data:', err);
        setError(err.message || 'Failed to load vendor information');
      } finally {
        setLoading(false);
      }
    };
    
    if (vendorId) {
      fetchVendorData();
    }
  }, [vendorId]);

  // Toggle favorite
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Here you would call your API to add/remove from favorites
    console.log(isFavorite ? 'Removing from favorites' : 'Adding to favorites');
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  // Calculate discount percentage
  const calculateDiscount = (price: number, discountPrice?: number) => {
    if (!discountPrice || discountPrice >= price) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendor information...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md text-center">
          <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vendor Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || 'The vendor information could not be loaded.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
            >
              Go Back
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Browse Shops
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOpen = vendor.isActive && vendor.status !== 'closed';

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
              <h1 className="text-lg font-bold text-black">{vendor.businessName || vendor.name}</h1>
              <p className="text-xs text-gray-600">{vendor.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleFavorite}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Share2 className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Vendor Hero Section */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600">
          {vendor.imageUrl ? (
            <img 
              src={vendor.imageUrl} 
              alt={vendor.businessName || vendor.name}
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>
        
        {/* Vendor Info Card */}
        <div className="px-4 -mt-12 relative z-10">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-lg">
            <div className="flex gap-4">
              {/* Logo */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border-4 border-white shadow-md">
                {vendor.logo ? (
                  <img 
                    src={vendor.logo} 
                    alt={vendor.businessName || vendor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <Store className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{vendor.businessName || vendor.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-semibold">{vendor.rating?.toFixed(1) || 'N/A'}</span>
                        <span className="text-xs text-gray-500">({vendor.totalReviews || 0} reviews)</span>
                      </div>
                      {vendor.isVerified && (
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-700 font-medium">Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isOpen ? 'OPEN NOW' : 'CLOSED'}
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Package className="h-4 w-4" />
                    <span>{vendor.productsCount || 0} products</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{vendor.totalSales || 0} sales</span>
                  </div>
                  {vendor.responseRate && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MessageCircle className="h-4 w-4" />
                      <span>{vendor.responseRate}% response rate</span>
                    </div>
                  )}
                </div>
                
                {/* Location */}
                {vendor.address && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{vendor.address}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Call to Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-gray-900 text-white text-sm font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Shop Now
              </button>
              <button className="px-4 bg-white border border-gray-300 text-gray-900 text-sm font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Chat
              </button>
              <button className="px-4 bg-white border border-gray-300 text-gray-900 text-sm font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Phone className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="px-4 pb-20">
        {/* Tabs */}
        <div className="sticky top-16 z-20 bg-gray-50 pt-4">
          <div className="flex border-b border-gray-200">
            {(['products', 'info', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'products' ? `Products (${products.length})` : tab}
                {tab === 'reviews' && ` (${vendor.totalReviews})`}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'products' && (
            <>
              {/* Products Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Available Products</h3>
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
                  <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">
                    <Filter className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Products Grid/List */}
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="font-bold text-gray-900 mb-2">No Products Available</h4>
                  <p className="text-gray-600">This vendor hasn't added any products yet.</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-4">
                  {products.map(product => {
                    const discount = calculateDiscount(product.price, product.discountPrice);
                    
                    return (
                      <div 
                        key={product._id}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(`/products/${product._id}`)}
                      >
                        <div className="h-32 bg-gray-200">
                          {product.images && product.images.length > 0 ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <Package className="h-8 w-8 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h4>
                          <div className="flex items-center justify-between mt-2">
                            <div>
                              <span className="font-bold text-gray-900">
                                ₦{(product.discountPrice || product.price).toLocaleString()}
                              </span>
                              {discount > 0 && (
                                <span className="text-xs text-gray-400 line-through ml-2">
                                  ₦{product.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {discount > 0 && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                -{discount}%
                              </span>
                            )}
                          </div>
                          {product.unit && (
                            <p className="text-xs text-gray-500 mt-1">{product.unit}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map(product => {
                    const discount = calculateDiscount(product.price, product.discountPrice);
                    
                    return (
                      <div 
                        key={product._id}
                        className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-sm transition-shadow cursor-pointer"
                        onClick={() => router.push(`/products/${product._id}`)}
                      >
                        <div className="flex gap-3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                            {product.images && product.images.length > 0 ? (
                              <img 
                                src={product.images[0]} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                <Package className="h-6 w-6 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{product.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-bold text-gray-900">
                                ₦{(product.discountPrice || product.price).toLocaleString()}
                              </span>
                              {discount > 0 && (
                                <>
                                  <span className="text-sm text-gray-400 line-through">
                                    ₦{product.price.toLocaleString()}
                                  </span>
                                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                    -{discount}%
                                  </span>
                                </>
                              )}
                            </div>
                            {product.unit && (
                              <p className="text-xs text-gray-500 mt-1">{product.unit}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === 'info' && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-6">
              {/* Description */}
              {vendor.description && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">About</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{vendor.description}</p>
                </div>
              )}

              {/* Contact Information */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-3">
                  {vendor.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Phone</p>
                        <a 
                          href={`tel:${vendor.phone}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {vendor.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {vendor.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <a 
                          href={`mailto:${vendor.email}`}
                          className="text-sm text-blue-600 hover:underline truncate"
                        >
                          {vendor.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {vendor.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Website</p>
                        <a 
                          href={vendor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline truncate"
                        >
                          {vendor.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Details */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Business Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="font-medium text-gray-900">{vendor.category}</p>
                  </div>
                  
                  {vendor.marketId && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Market</p>
                      <p className="font-medium text-gray-900">{vendor.marketId.name}</p>
                      <p className="text-xs text-gray-500">{vendor.marketId.city}</p>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Joined</p>
                    <p className="font-medium text-gray-900">{formatDate(vendor.joinedDate)}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Status</p>
                    <div className="flex items-center gap-1">
                      <div className={`h-2 w-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <p className="font-medium text-gray-900">{isOpen ? 'Open' : 'Closed'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              {(vendor.deliveryFee !== undefined || vendor.minimumOrder !== undefined) && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Delivery Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {vendor.deliveryFee !== undefined && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Truck className="h-4 w-4 text-gray-400" />
                          <p className="text-xs text-gray-500">Delivery Fee</p>
                        </div>
                        <p className="font-medium text-gray-900">₦{vendor.deliveryFee.toLocaleString()}</p>
                      </div>
                    )}
                    
                    {vendor.minimumOrder !== undefined && vendor.minimumOrder > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-gray-400" />
                          <p className="text-xs text-gray-500">Minimum Order</p>
                        </div>
                        <p className="font-medium text-gray-900">₦{vendor.minimumOrder.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Opening Hours */}
              {vendor.openingHours && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Opening Hours</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {Object.entries(vendor.openingHours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900 capitalize">{day}</span>
                          <span className="text-sm text-gray-600">{hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              {vendor.tags && vendor.tags.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {vendor.tags.map(tag => (
                      <span 
                        key={tag}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-center py-12">
              <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h4 className="font-bold text-gray-900 mb-2">Customer Reviews</h4>
              <p className="text-gray-600 mb-4">
                This vendor has {vendor.totalReviews || 0} reviews with an average rating of {vendor.rating?.toFixed(1) || 'N/A'}.
              </p>
              <p className="text-gray-500 text-sm">
                Reviews feature coming soon!
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-20">
        <button className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          <span className="font-semibold">Shop Now</span>
        </button>
      </div>
    </div>
  );
}