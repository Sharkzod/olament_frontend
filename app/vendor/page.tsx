// app/vendor/page.tsx
'use client';

import { useState, useEffect } from 'react';
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

export default function VendorPage() {
  const [activeTab, setActiveTab] = useState('business');
  const [editingProfile, setEditingProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    shops, 
    vendorProfile, 
    stats, 
    loading, 
    error, 
    getVendorProfile, 
    updateVendorProfile,
    getMyShops, 
    getVendorStats,
    toggleShopStatus,
    deleteShop,
    refreshVendorData
  } = useVendor();
  
  const { profile } = useProfile();
  
  const router = useRouter();

  useEffect(() => {
    const initializeData = async () => {
      await refreshVendorData();
    };
    
    initializeData();
  }, [refreshVendorData]);

  const handleToggleShopStatus = async (shopId: string, isActive: boolean) => {
    const result = await toggleShopStatus(shopId, isActive);
    if (result.success) {
      refreshVendorData();
    }
  };

  const handleDeleteShop = async (shopId: string) => {
    if (window.confirm('Are you sure you want to delete this shop?')) {
      const result = await deleteShop(shopId);
      if (result.success) {
        refreshVendorData();
      }
    }
  };

  const handleSaveProfile = async (formData: any) => {
    const result = await updateVendorProfile(formData);
    if (result.success) {
      setEditingProfile(false);
    }
  };

  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderBusinessProfile = () => {
    if (editingProfile) {
      return (
        <BusinessProfileEdit 
          profile={vendorProfile}
          onSave={handleSaveProfile}
          onCancel={() => setEditingProfile(false)}
          loading={loading}
        />
      );
    }

    return (
      <BusinessProfileView 
        profile={vendorProfile}
        onEdit={() => setEditingProfile(true)}
      />
    );
  };

  const renderMyShops = () => (
    <section className="mt-6 text-black">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-black">My Shops</h2>
        <button 
          onClick={() => router.push('/vendor/shops/new')}
          className="text-sm font-semibold text-blue-600 flex items-center gap-1"
        >
          Add New <Plus className="h-4 w-4" />
        </button>
      </div>

      {shops.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700">No shops yet</h3>
          <p className="text-gray-500 mt-2">Create your first shop to start selling</p>
          <button 
            onClick={() => router.push('/vendor/shops/new')}
            className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Create First Shop
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredShops.map(shop => (
            <div key={shop._id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                    {shop.imageUrl ? (
                      <img 
                        src={shop.imageUrl} 
                        alt={shop.name}
                        className="w-full h-full object-cover"
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
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{shop.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span className="text-xs">{shop.marketId?.city || shop.marketId?.state}</span>
                        </div>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{shop.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        shop.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {shop.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </div>
                      <button className="text-gray-400 hover:text-blue-500">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">{shop.description}</p>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-semibold text-black">{shop.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({shop.totalReviews})</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {shop.productsCount || 0} products
                    </div>
                    <div className="text-xs text-gray-500">
                      {shop.isVerified ? '✓ Verified' : 'Pending'}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={() => router.push(`/shops/${shop._id}`)}
                      className="flex-1 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      View Shop
                    </button>
                    <button 
                      onClick={() => handleToggleShopStatus(shop._id, !shop.isActive)}
                      className="px-4 py-2 border border-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {shop.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

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
                <p className="text-xs font-medium">2 days ago</p>
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
        return renderMyShops();
      case 'analytics':
        return renderAnalytics();
      default:
        return renderBusinessProfile();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Matching markets page */}
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
        {/* Tabs - Same style as markets page */}
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
                    className={`text-sm font-semibold capitalize justify-between w-full flex items-center justify-center gap-1 ${
                      activeTab === tab.id 
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
      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <ArrowLeft className="h-5 w-5" />
      <span className="text-sm font-medium">Back</span>
    </button>
        </div>

        {/* Search Bar - Same as markets page */}
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

        {/* Stats Banner - Similar to markets page */}
        {/* <div className="mt-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex gap-3 w-full h-[10vh]">
          <div className='w-[90%] flex items-center gap-3 justify-center m-auto'>
            <div className="rounded-lg p-2.5 bg-white/20">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-base font-bold mb-1 text-white">
                {stats?.totalShops || 0} Shops • {stats?.totalProducts || 0} Products
              </div>
              <div className="text-sm text-white/90">Manage your business</div>
            </div>
          </div>
        </div> */}

        {/* Error Alert */}
        {/* {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )} */}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-3" />
            <p className="text-gray-600">Loading vendor data...</p>
          </div>
        ) : (
          renderTabContent()
        )}
      </main>

      {/* Bottom Navigation - Same as markets page */}
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

// Business Profile View Component - Updated styling
function BusinessProfileView({ profile, onEdit }: { profile: any, onEdit: () => void }) {
  return (
    <section className="mt-6 text-black">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-black">Business Profile</h2>
        <button
          onClick={onEdit}
          className="text-sm font-semibold text-blue-600 flex items-center gap-1"
        >
          Edit <Edit className="h-4 w-4" />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {/* Business Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-gray-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900">{profile?.businessName || 'Your Business Name'}</h3>
            <p className="text-gray-600 text-sm mt-1">{profile?.businessDescription || 'Add a business description'}</p>
          </div>
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600">Business Address</p>
                <p className="font-medium text-sm">{profile?.businessAddress || 'Not provided'}</p>
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
                  <div className={`px-2 py-1 rounded text-xs ${
                    shop.isVerified 
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

// Business Profile Edit Component - Updated styling
function BusinessProfileEdit({ profile, onSave, onCancel, loading }: { 
  profile: any, 
  onSave: (data: any) => void,
  onCancel: () => void,
  loading: boolean 
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

  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-black">Edit Business Profile</h2>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-50"
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
            ) : 'Save Changes'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            required
            placeholder="Enter your business name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Description
          </label>
          <textarea
            value={formData.businessDescription}
            onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            rows={3}
            placeholder="Describe your business..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Phone
            </label>
            <input
              type="tel"
              value={formData.businessPhone}
              onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              placeholder="+234 801 234 5678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Email
            </label>
            <input
              type="email"
              value={formData.businessEmail}
              onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              placeholder="business@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Address
          </label>
          <textarea
            value={formData.businessAddress}
            onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            rows={2}
            placeholder="Full business address..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.businessWebsite}
              onChange={(e) => setFormData({ ...formData, businessWebsite: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tax ID
            </label>
            <input
              type="text"
              value={formData.taxId}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Registration
            </label>
            <input
              type="text"
              value={formData.businessRegistration}
              onChange={(e) => setFormData({ ...formData, businessRegistration: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
        </div>
      </form>
    </section>
  );
}