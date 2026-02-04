'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Store, MapPin, Star, Edit, Plus, Search, AlertCircle, MoreVertical, Trash2, Eye, Power } from 'lucide-react';
import { useShop } from '../lib/hooks/useShop';

interface Shop {
    _id: string;
    name: string;
    description: string;
    category: string;
    marketId?: {
        _id?: string;
        name?: string;
        city?: string;
        state?: string;
    };
    address: string;
    isActive: boolean;
    isVerified: boolean;
    rating: number;
    totalReviews: number;
    productsCount: number;
    imageUrl?: string;
    contactPhone?: string;
    contactEmail?: string;
    tags?: string[];
    verificationStatus?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface MyShopsProps {
    onToggleShopStatus: (shopId: string, isActive: boolean) => Promise<void>;
}

export default function MyShops({ onToggleShopStatus }: MyShopsProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState<string | null>(null);

    const {
        shops,
        loading,
        error,
        totalShops,
        getMyShops,
        deleteShop,
        clearError
    } = useShop();

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setMobileMenuOpen(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Fetch shops on component mount
    useEffect(() => {
        const fetchShops = async () => {
            await getMyShops();
        };
        fetchShops();
    }, [getMyShops]);

    // Filter shops based on search query
    const filteredShops = shops.filter(shop =>
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        false
    );

    const handleDeleteShop = async (shopId: string) => {
        if (window.confirm('Are you sure you want to delete this shop?')) {
            const result = await deleteShop(shopId);
            if (result.success) {
                // Refresh shops list
                await getMyShops();
            }
        }
    };

    // Format verification status
    const getVerificationStatus = (shop: Shop) => {
        if (shop.isVerified) return '✓ Verified';
        if (shop.verificationStatus === 'pending') return 'Pending';
        return 'Unverified';
    };

    // Get verification color
    const getVerificationColor = (shop: Shop) => {
        if (shop.isVerified) return 'text-green-600 bg-green-100';
        if (shop.verificationStatus === 'pending') return 'text-yellow-600 bg-yellow-100';
        return 'text-gray-600 bg-gray-100';
    };

    return (
        <section className="mt-6 text-black px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Shops</h2>
                    <button
                        onClick={() => router.push('/vendor/shops/new')}
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add New Shop
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search your shops by name, category, or tags..."
                        className="w-full rounded-lg border placeholder-gray-400 border-gray-300 py-3 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                            <p className="text-red-700 text-sm flex-1">{error}</p>
                            <button
                                onClick={clearError}
                                className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                {loading && shops.length === 0 ? (
                    <div className="text-center py-12 sm:py-16">
                        <div className="flex flex-col items-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 mb-3" />
                            <p className="text-gray-600">Loading shops...</p>
                        </div>
                    </div>
                ) : shops.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 bg-white rounded-xl border border-gray-200">
                        <Store className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg sm:text-xl font-bold text-gray-700">No shops yet</h3>
                        <p className="text-gray-500 mt-2 max-w-md mx-auto">
                            Create your first shop to start selling products
                        </p>
                        <button
                            onClick={() => router.push('/vendor/shops/new')}
                            className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                        >
                            Create First Shop
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Summary */}
                        <div className="mb-4 text-sm text-gray-600">
                            Showing {filteredShops.length} of {totalShops} shops
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            {filteredShops.map(shop => (
                                <div key={shop._id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                                    {/* Mobile Layout */}
                                    <div className="lg:hidden">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-start gap-3">
                                                <div className="relative flex-shrink-0">
                                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                                                        {shop.imageUrl ? (
                                                            <img
                                                                src={shop.imageUrl}
                                                                alt={shop.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <Store className="h-8 w-8 text-gray-400" />
                                                        )}
                                                    </div>
                                                    {!shop.isActive && (
                                                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                                            <span className="text-white text-xs font-semibold bg-red-500 px-1.5 py-0.5 rounded">INACTIVE</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 line-clamp-1">{shop.name}</h3>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{shop.category}</span>
                                                        <span className={`text-xs px-2 py-1 rounded ${getVerificationColor(shop)}`}>
                                                            {getVerificationStatus(shop)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setMobileMenuOpen(mobileMenuOpen === shop._id ? null : shop._id);
                                                    }}
                                                    className="text-gray-400 hover:text-gray-600 p-1"
                                                >
                                                    <MoreVertical className="h-5 w-5" />
                                                </button>
                                                {mobileMenuOpen === shop._id && (
                                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                                        <button
                                                            onClick={() => router.push(`/shops/${shop._id}`)}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            View Shop
                                                        </button>
                                                        <button
                                                            onClick={() => router.push(`/vendor/shops/edit/${shop._id}`)}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            Edit Shop
                                                        </button>
                                                        <button
                                                            onClick={() => onToggleShopStatus(shop._id, !shop.isActive)}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Power className="h-4 w-4" />
                                                            {shop.isActive ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteShop(shop._id)}
                                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete Shop
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <div className="flex items-center gap-1 text-gray-600 mb-2">
                                                <MapPin className="h-3.5 w-3.5" />
                                                <span className="text-xs">
                                                    {shop.marketId?.city || shop.marketId?.state || shop.address || 'No address'}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm line-clamp-2">{shop.description}</p>
                                        </div>

                                        {/* Tags - Mobile */}
                                        {shop.tags && shop.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {shop.tags.slice(0, 2).map((tag, index) => (
                                                    <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {shop.tags.length > 2 && (
                                                    <span className="text-xs text-gray-500">+{shop.tags.length - 2} more</span>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                <span className="text-sm font-semibold text-black">
                                                    {shop.rating.toFixed(1)}
                                                </span>
                                                <span className="text-xs text-gray-500 ml-1">({shop.totalReviews})</span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {shop.productsCount || 0} products
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => router.push(`/shops/${shop._id}`)}
                                                className="px-3 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => onToggleShopStatus(shop._id, !shop.isActive)}
                                                className="px-3 py-2 border border-gray-300 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                                disabled={loading}
                                            >
                                                {shop.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Desktop Layout */}
                                    <div className="hidden lg:flex gap-4">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                                                {shop.imageUrl ? (
                                                    <img
                                                        src={shop.imageUrl}
                                                        alt={shop.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <Store className="h-12 w-12 text-gray-400" />
                                                )}
                                            </div>
                                            {!shop.isActive && (
                                                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                                    <span className="text-white text-xs font-semibold bg-red-500 px-2 py-1 rounded">INACTIVE</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg">{shop.name}</h3>
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        <div className="flex items-center gap-1 text-gray-600">
                                                            <MapPin className="h-3.5 w-3.5" />
                                                            <span className="text-sm">
                                                                {shop.marketId?.city || shop.marketId?.state || shop.address || 'No address'}
                                                            </span>
                                                        </div>
                                                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">{shop.category}</span>
                                                        <span className={`text-sm px-2 py-1 rounded ${getVerificationColor(shop)}`}>
                                                            {getVerificationStatus(shop)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className={`px-3 py-1 rounded text-sm font-medium ${shop.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {shop.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                    </div>
                                                    <button
                                                        onClick={() => router.push(`/vendor/shops/edit/${shop._id}`)}
                                                        className="text-gray-400 hover:text-blue-500"
                                                        title="Edit shop"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 text-sm mt-2 line-clamp-2">{shop.description}</p>

                                            {/* Tags - Desktop */}
                                            {shop.tags && shop.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {shop.tags.slice(0, 3).map((tag, index) => (
                                                        <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {shop.tags.length > 3 && (
                                                        <span className="text-xs text-gray-500">+{shop.tags.length - 3} more</span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 mt-3">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                    <span className="text-sm font-semibold text-black">
                                                        {shop.rating.toFixed(1)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">({shop.totalReviews} reviews)</span>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {shop.productsCount || 0} products
                                                </div>
                                                {shop.contactPhone && (
                                                    <div className="text-sm text-gray-500">
                                                        📞 {shop.contactPhone}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => router.push(`/shops/${shop._id}`)}
                                                    className="flex-1 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                                                >
                                                    View Shop
                                                </button>
                                                <button
                                                    onClick={() => onToggleShopStatus(shop._id, !shop.isActive)}
                                                    className="px-4 py-2 border border-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Processing...' : shop.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteShop(shop._id)}
                                                    className="px-4 py-2 border border-red-300 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors"
                                                    disabled={loading}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty state for filtered results */}
                        {filteredShops.length === 0 && shops.length > 0 && (
                            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-700">No shops found</h3>
                                <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    Clear search
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}