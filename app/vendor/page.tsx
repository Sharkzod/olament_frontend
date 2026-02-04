// app/vendor/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Store, MapPin, Package, ShoppingBag, DollarSign,
  Star, TrendingUp, Users, Clock, CheckCircle,
  XCircle, Edit, Plus, Phone, Mail, Globe,
  FileText, Calendar, Shield, Award, Loader2,
  AlertCircle, ExternalLink, ChevronRight, User,
  BarChart3, Settings, Building2, Tag, Image as ImageIcon,
  Upload, Heart, ShoppingCart, Search, ArrowLeft
} from 'lucide-react';
import { useVendor } from '../lib/hooks/useVendor';
import { useProfile } from '../lib/hooks/useProfile';
// import { useShop } from '../lib/hooks/useShop';
import MyShops from '../components/MyShops';

// Add this interface to your types
interface VendorProfile {
  _id?: string;
  userId?: string;
  businessName: string;
  businessDescription: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessWebsite: string;
  taxId: string;
  businessRegistration: string;
  yearsInBusiness: number;
  shopIds: string[];
  shops?: Shop[];
  createdAt?: string;
  updatedAt?: string;
}

// Update your API response type
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}


export default function VendorPage() {
  const [activeTab, setActiveTab] = useState('business');
  const [editingProfile, setEditingProfile] = useState(false);
  const [isProfileEmpty, setIsProfileEmpty] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    shops,
    vendorProfile,
    stats,
    loading,
    error,
    getVendorProfile,
    updateVendorProfile,
    getShopsByOwnerId,
    getVendorStats,
    toggleShopStatus,
    deleteShop,
    refreshVendorData
  } = useVendor();

  const { profile } = useProfile();
  const router = useRouter();




  // Get vendor data on initial load
  // Update your useEffect to properly initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Get vendor profile
        const profileResult = await getVendorProfile();

        console.log('Profile result:', profileResult);

        // // If we have a profile and shops, get the shops
        // if (profileResult.success && profileResult.profile) {
        //   // Option 1: If shops are already included in the profile
        //   if (profileResult.profile.shops && profileResult.profile.shops.length > 0) {
        //     setShops(profileResult.profile.shops);
        //   }
        //   // Option 2: If you need to fetch shops separately
        //   else if (profileResult.profile.shopIds && profileResult.profile.shopIds.length > 0) {
        //     // You'll need to implement getShopsByOwnerId
        //     const shopsResult = await getShopsByOwnerId(profileResult.profile._id);
        //     if (shopsResult.success) {
        //       setShops(shopsResult.shops);
        //     }
        //   }

        //   // Get stats if we have shops
        //   if (profileResult.profile.shopIds?.length > 0) {
        //     await getVendorStats();
        //   }
        // }
      } catch (err) {
        console.error('Failed to initialize vendor data:', err);
      }
    };

    initializeData();
  }, []);


  const handleToggleShopStatus = async (shopId: string, isActive: boolean) => {
    const result = await toggleShopStatus(shopId, isActive);
    if (result.success) {
      // Refresh shops and stats
      const profileResult = await getVendorProfile();
      if (profileResult.success && profileResult.profile) {
        await getShopsByOwnerId(profileResult.profile._id || '');
      }
      await getVendorStats();
    }
  };

  const handleDeleteShop = async (shopId: string) => {
    if (window.confirm('Are you sure you want to delete this shop?')) {
      const result = await deleteShop(shopId);
      if (result.success) {
        // Refresh data
        await getVendorStats();
      }
    }
  };

  const handleSaveProfile = async (formData: any) => {
    const result = await updateVendorProfile(formData);
    if (result.success) {
      setEditingProfile(false);
      // Refresh data
      await Promise.all([
        getVendorProfile(),
        getVendorStats()
      ]);
    }
  };


  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper function to format address


  const renderBusinessProfile = () => {
    if (editingProfile) {
      return (
        <BusinessProfileEdit
          profile={vendorProfile}
          onSave={handleSaveProfile}
          onCancel={() => setEditingProfile(false)}
          loading={loading}
          isNewVendor={!vendorProfile}
        />
      );
    }

    return (
      <BusinessProfileView
        profile={vendorProfile}
        onEdit={() => setEditingProfile(true)}
        isNewVendor={!vendorProfile}
      />
    );
  };



  const renderAnalytics = () => (
    <section className="mt-6 text-black">
      <h2 className="text-lg font-bold text-black mb-4">Business Analytics</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold mt-1">₦{(stats?.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-xl font-bold mt-1">{stats?.totalOrders || 0}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Shops</p>
              <p className="text-xl font-bold mt-1">{stats?.activeShops || 0}/{stats?.totalShops || 0}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Store className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-xl font-bold mt-1">{stats?.averageRating?.toFixed(1) || '0.0'}/5</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-xl font-bold mt-1">{stats?.totalProducts || 0}</p>
            </div>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Package className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month Revenue</p>
              <p className="text-xl font-bold mt-1">₦{(stats?.thisMonthRevenue || 0).toLocaleString()}</p>
            </div>
            <div className="p-2 bg-pink-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="font-bold mb-3">Recent Activity</h3>
        <div className="space-y-3">
          {shops.slice(0, 3).map(shop => (
            <div key={shop._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Store className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">{shop.name}</p>
                  <p className="text-xs text-gray-600">{shop.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Last updated</p>
                <p className="text-xs font-medium">
                  {new Date(shop.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'business':
        return renderBusinessProfile();
      case 'shops':
        return <MyShops onToggleShopStatus={handleToggleShopStatus} />;
      case 'analytics':
        return renderAnalytics();
      default:
        return renderBusinessProfile();
    }
  };

  // Handle loading state
  if (loading && !vendorProfile && !shops.length) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-3" />
          <p className="text-gray-600">Loading vendor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 w-full">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gray-900 flex items-center justify-center">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-black">Vendor Center</div>
              <div className="text-xs text-gray-600">Manage your business</div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 pb-20">
        {/* Tabs */}
        <div className="mt-4">
          <div className="flex bg-gray-100 rounded-lg">
            <div className='h-11 w-full flex items-center justify-center'>
              {[
                { id: 'business', label: 'Business', icon: Building2 },
                { id: 'shops', label: 'My Shops', icon: Store },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`text-sm font-semibold capitalize justify-between w-full flex items-center justify-center gap-1 ${activeTab === tab.id
                      ? 'text-gray-900 bg-white rounded-lg py-2'
                      : 'text-gray-500'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mt-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Search Bar */}
        {activeTab === 'shops' && (
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search your shops..."
              className="w-full rounded-lg border placeholder-gray-400 border-gray-300 py-3 pl-10 pr-3 text-sm focus:outline-none"
            />
          </div>
        )}

        {/* Content */}
        {renderTabContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-1 bg-gray-900 rounded-full px-2 py-2 shadow-lg">
          <button
            onClick={() => router.push('/profile')}
            className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
          >
            <User className="h-5 w-5 text-white" />
          </button>
          <button className="px-6 py-2 text-white text-sm font-medium hover:bg-gray-800 rounded-full transition-colors">
            Orders
          </button>
          <button className="px-6 py-2 bg-white text-gray-900 text-sm font-medium rounded-full hover:bg-gray-100 transition-colors">
            Dashboard
          </button>
          <button
            onClick={() => router.push('/vendor/shops/new')}
            className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors"
          >
            <Plus className="h-5 w-5 text-white" />
          </button>
        </div>
      </nav>
    </div>
  );
}

// Business Profile View Component
function BusinessProfileView({ profile, onEdit, isNewVendor }: {
  profile: any,
  onEdit: () => void,
  isNewVendor: boolean
}) {

  const formatAddress = (address: any): string => {
    if (!address) return '';

    // If address is already a string, return it
    if (typeof address === 'string') return address;

    // If address is an object, format it
    if (typeof address === 'object') {
      const parts = [
        address.street,
        address.city,
        address.state,
        address.country,
        address.zipCode
      ].filter(Boolean); // Remove empty/null/undefined parts

      return parts.join(', ');
    }

    return '';
  };

  if (isNewVendor) {
    return (
      <section className="mt-6 text-black">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-black">Welcome to Vendor Center</h2>
          <p className="text-gray-600 text-sm">Complete your business profile to start selling</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-gray-700">No Business Profile Found</h3>
          <p className="text-gray-500 mt-2">Create your business profile to start selling on our platform</p>
          <div className="mt-8 space-y-4 max-w-md mx-auto text-left">
            <div className="flex items-start gap-3">
              <Store className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Create Shops</p>
                <p className="text-xs text-gray-600">Set up multiple shops in different markets</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShoppingBag className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Sell Products</p>
                <p className="text-xs text-gray-600">List and manage your products</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BarChart3 className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Track Analytics</p>
                <p className="text-xs text-gray-600">Monitor sales and performance</p>
              </div>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="mt-8 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Create Business Profile
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 text-black">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-black">Business Profile</h2>
          <p className="text-sm text-gray-600">Manage your business information</p>
        </div>
        <button
          onClick={onEdit}
          className="text-sm font-semibold text-blue-600 flex items-center gap-1"
        >
          Edit <Edit className="h-4 w-4" />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {/* Business Header with Business Name */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-gray-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900">
              {profile?.businessName || 'No Business Name'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">Vendor</span>
              {profile?.shops?.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {profile.shops.length} {profile.shops.length === 1 ? 'Shop' : 'Shops'}
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm mt-2">
              {profile?.businessDescription || 'No business description added'}
            </p>
          </div>
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600">Business Address</p>
                <p className="font-medium text-sm">
                  {formatAddress(profile?.businessAddress) || 'Not provided'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600">Business Phone</p>
                <p className="font-medium text-sm">{profile?.businessPhone || 'Not provided'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600">Business Email</p>
                <p className="font-medium text-sm">{profile?.businessEmail || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600">Website</p>
                <p className="font-medium text-sm">{profile?.businessWebsite || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-bold text-sm mb-3">Business Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-600">Tax ID</p>
                <p className="font-medium text-sm">{profile?.taxId || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-600">Years in Business</p>
                <p className="font-medium text-sm">{profile?.yearsInBusiness || 0} years</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Summary */}
        {profile?.shops && profile.shops.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-sm">Your Shops ({profile.shops.length})</h4>
              <button className="text-xs text-blue-600">View all →</button>
            </div>
            <div className="space-y-2">
              {profile.shops.slice(0, 3).map((shop: any) => (
                <div key={shop._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Store className="h-3 w-3 text-gray-500" />
                    <span className="text-sm font-medium">{shop.name}</span>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${shop.isVerified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {shop.isVerified ? '✓ Verified' : 'Pending'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Business Profile Edit Component
// BusinessProfileEdit Component - CORRECTED VERSION
function BusinessProfileEdit({ profile, onSave, onCancel, loading, isNewVendor }: {
  profile: any,
  onSave: (data: any) => void,
  onCancel: () => void,
  loading: boolean,
  isNewVendor: boolean
}) {
  const [formData, setFormData] = useState({
    businessName: profile?.businessName || '',
    businessDescription: profile?.businessDescription || '',
    businessAddress: profile?.businessAddress || '',
    businessPhone: profile?.businessPhone || '',
    businessEmail: profile?.businessEmail || '',
    businessWebsite: profile?.businessWebsite || '',
    taxId: profile?.taxId || '',
    businessRegistration: profile?.businessRegistration || '',
    yearsInBusiness: profile?.yearsInBusiness || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const formatAddress = (address: any): string => {
    if (!address) return '';

    // If address is already a string, return it
    if (typeof address === 'string') return address;

    // If address is an object, format it
    if (typeof address === 'object') {
      const parts = [
        address.street,
        address.city,
        address.state,
        address.country,
        address.zipCode
      ].filter(Boolean); // Remove empty/null/undefined parts

      return parts.join(', ');
    }

    return '';
  };

  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-black">
            {isNewVendor ? 'Create Business Profile' : 'Edit Business Profile'}
          </h2>
          {isNewVendor && (
            <p className="text-sm text-gray-600">Complete your profile to become a vendor</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border text-black border-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (isNewVendor ? 'Create Profile' : 'Save Changes')}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        {/* Welcome message for new vendors */}
        {isNewVendor && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Welcome to Vendor Center!</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Complete your business profile to start selling. You'll be able to create shops, list products, and manage orders.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* BUSINESS NAME - Most Important Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            className="w-full px-4 py-2 placeholder-gray-400 text-black border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            required
            placeholder="Enter your business name"
          />
          <p className="text-xs text-gray-500 mt-1">This will be displayed to customers</p>
        </div>

        {/* BUSINESS DESCRIPTION */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Description
          </label>
          <textarea
            value={formData.businessDescription}
            onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
            className="w-full px-4 py-2 placeholder-gray-400 text-black border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            rows={3}
            placeholder="Describe your business..."
          />
        </div>

        {/* CONTACT INFORMATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Phone *
            </label>
            <input
              type="tel"
              value={formData.businessPhone}
              onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
              className="w-full px-4 py-2 placeholder-gray-400 text-black border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              required
              placeholder="+234 801 234 5678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Email *
            </label>
            <input
              type="email"
              value={formData.businessEmail}
              onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
              className="w-full px-4 py-2 placeholder-gray-400 text-black border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              required
              placeholder="business@example.com"
            />
          </div>
        </div>

        {/* BUSINESS ADDRESS */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Address *
          </label>
          <textarea
            value={typeof formData.businessAddress === 'string'
              ? formData.businessAddress
              : formatAddress(formData.businessAddress)}
            onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
            className="w-full px-4 py-2 placeholder-gray-400 text-black border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            rows={2}
            required
            placeholder="Full business address..."
          />
        </div>
        {/* WEBSITE & YEARS IN BUSINESS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.businessWebsite}
              onChange={(e) => setFormData({ ...formData, businessWebsite: e.target.value })}
              className="w-full px-4 py-2 placeholder-gray-400 text-black border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years in Business
            </label>
            <input
              type="number"
              value={formData.yearsInBusiness}
              onChange={(e) => setFormData({ ...formData, yearsInBusiness: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 placeholder-gray-400 text-black border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              min="0"
            />
          </div>
        </div>

        {/* BUSINESS REGISTRATION DETAILS */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Business Registration Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax ID Number
              </label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full px-4 py-2 placeholder-gray-400 text-black border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="Tax identification number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Registration Number
              </label>
              <input
                type="text"
                value={formData.businessRegistration}
                onChange={(e) => setFormData({ ...formData, businessRegistration: e.target.value })}
                className="w-full px-4 py-2 placeholder-gray-400 text-black border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="Business registration number"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-800">
                <span className="font-medium">Note:</span> Business registration details are required for verification and payout processing.
              </p>
            </div>
          </div>
        </div>

        {/* Form actions at bottom */}
        <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border text-black border-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (isNewVendor ? 'Create Business Profile' : 'Save Changes')}
          </button>
        </div>
      </form>
    </section>
  );
}