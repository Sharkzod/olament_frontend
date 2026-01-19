// app/profile/page.tsx - Complete Integrated Version
'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { 
  User, Store, Camera, Save, MapPin, Phone, Mail, Globe, 
  Upload, Edit, CheckCircle, X, LogOut, Shield, Clock,
  Package, ShoppingBag, TrendingUp, Star
} from 'lucide-react';
import { useAuth } from '../lib/hooks/useAuthApi';
import { useProfile } from '../lib/hooks/useProfile';
import { useShop } from '../lib/hooks/useShop';
import ProtectedRoute from '@/app/components/ProtectedRoute';

interface ShopProfile {
  _id?: string;
  shopName: string;
  description: string;
  category: string;
  logo: string;
  coverImage: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  businessHours: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };
  deliveryOptions: {
    deliveryAvailable: boolean;
    pickupAvailable: boolean;
    deliveryRadius: number;
    deliveryFee: number;
    minOrderAmount: number;
  };
  status: 'open' | 'closed' | 'busy';
  verificationStatus: 'verified' | 'pending' | 'unverified';
}

const categories = [
  'Electronics',
  'Groceries',
  'Clothing & Fashion',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Books & Stationery',
  'Sports & Fitness',
  'Automotive',
  'Health & Wellness',
  'Food & Beverages',
  'Pets & Animals',
  'Toys & Games'
];

function ProfilePageContent() {
  const { 
    isAuthenticated, 
    isLoading: authLoading,
    logout 
  } = useAuth();
  
  const { 
    profile,
    loading: profileLoading,
    error: profileError,
    updateProfile,
    uploadAvatar,
    getProfile
  } = useProfile();
  
  const { 
  shop, 
  loading: shopLoading, // ✅ FIXED: changed from isLoading to loading
  getMyShop, 
  createShop, 
  updateShop,
  uploadShopImages, // ✅ Added this missing function
  error: shopError 
} = useShop();
  
  const [activeSection, setActiveSection] = useState<'user' | 'shop'>('user');
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isEditingShop, setIsEditingShop] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [shopLogo, setShopLogo] = useState<string | null>(null);
  const [shopCover, setShopCover] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // User profile form state
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    role: 'Buyer',
    joinDate: new Date().toISOString().split('T')[0],
    emailVerified: false,
    phoneVerified: false
  });

  const [shopProfile, setShopProfile] = useState<ShopProfile | null>(null);
  const router = useRouter();

  // Initialize user form data when profile loads
  useEffect(() => {
    if (profile) {
      console.log('👤 Profile Page: Profile data received:', profile);
      setUserFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        avatar: profile.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        role: profile.role?.charAt(0).toUpperCase() + profile.role?.slice(1) || 'Buyer',
        joinDate: new Date(profile.createdAt).toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        emailVerified: profile.emailVerified || false,
        phoneVerified: profile.phoneVerified || false
      });
      setProfileImage(profile.avatar);
    }
  }, [profile]);

  // Fetch shop data when user is a seller
  useEffect(() => {
    if (profile?.role === 'seller') {
      console.log('🏪 Profile Page: Fetching shop data for seller');
      getMyShop();
    }
  }, [profile?.role, getMyShop]);

  // Update shop profile when shop data changes
  useEffect(() => {
    if (shop) {
      console.log('🏪 Profile Page: Shop data received:', shop);
      setShopProfile(shop);
      setShopLogo(shop.logo);
      setShopCover(shop.coverImage);
    } else {
      console.log('🏪 Profile Page: No shop data');
      setShopProfile(null);
    }
  }, [shop]);

  // Handle user input changes
  const handleUserInputChange = (field: keyof typeof userFormData, value: string) => {
    setUserFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Shop-related handlers (same as your original)
  const handleShopInputChange = (field: keyof ShopProfile, value: any) => {
    if (shopProfile) {
      setShopProfile(prev => ({
        ...prev!,
        [field]: value
      }));
    }
  };

  const handleAddressChange = (field: keyof ShopProfile['address'], value: string) => {
    if (shopProfile) {
      setShopProfile(prev => ({
        ...prev!,
        address: {
          ...prev!.address,
          [field]: value
        }
      }));
    }
  };

  const handleContactChange = (field: keyof ShopProfile['contact'], value: string) => {
    if (shopProfile) {
      setShopProfile(prev => ({
        ...prev!,
        contact: {
          ...prev!.contact,
          [field]: value
        }
      }));
    }
  };

  const handleBusinessHoursChange = (day: keyof ShopProfile['businessHours'], type: 'open' | 'close', value: string) => {
    if (shopProfile) {
      setShopProfile(prev => ({
        ...prev!,
        businessHours: {
          ...prev!.businessHours,
          [day]: {
            ...prev!.businessHours[day],
            [type]: value
          }
        }
      }));
    }
  };

  const handleDeliveryOptionChange = (field: keyof ShopProfile['deliveryOptions'], value: any) => {
    if (shopProfile) {
      setShopProfile(prev => ({
        ...prev!,
        deliveryOptions: {
          ...prev!.deliveryOptions,
          [field]: value
        }
      }));
    }
  };

  // Handle image upload
 

  // Handle save user profile
  const handleSaveUserProfile = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const updateData = {
        firstName: userFormData.firstName,
        lastName: userFormData.lastName,
        email: userFormData.email,
        phone: userFormData.phone,
        avatar: profileImage || userFormData.avatar
      };

      console.log('💾 Saving user profile:', updateData);
      const result = await updateProfile(updateData);
      
      if (result.success) {
        setSuccessMessage('Profile updated successfully!');
        setIsEditingUser(false);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // In your profile page, update the handleSaveShopProfile function:
const handleSaveShopProfile = async () => {
    if (!shopProfile) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      console.log('💾 Saving shop profile:', shopProfile);
      let result;
      
      if (shopProfile._id) {
        // Update existing shop
        result = await updateShop(shopProfile._id, {
          shopName: shopProfile.shopName,
          description: shopProfile.description,
          category: shopProfile.category,
          logo: shopLogo || shopProfile.logo,
          coverImage: shopCover || shopProfile.coverImage,
          address: shopProfile.address,
          contact: shopProfile.contact,
          businessHours: shopProfile.businessHours,
          deliveryOptions: shopProfile.deliveryOptions,
          status: shopProfile.status,
          verificationStatus: shopProfile.verificationStatus
        });
      } else {
        // Create new shop
        result = await createShop({
          shopName: shopProfile.shopName,
          description: shopProfile.description,
          category: shopProfile.category,
          logo: shopProfile.logo,
          coverImage: shopProfile.coverImage,
          address: shopProfile.address,
          contact: shopProfile.contact,
          businessHours: shopProfile.businessHours,
          deliveryOptions: shopProfile.deliveryOptions
        });
      }
      
      if (result.success) {
        setSuccessMessage(shopProfile._id ? 'Shop updated successfully!' : 'Shop created successfully!');
        setIsEditingShop(false);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error || 'Failed to save shop');
      }
    } catch (err: any) {
      console.error('Error saving shop profile:', err);
      setError(err.message || 'Failed to save shop');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        
        if (type === 'profile') {
          setProfileImage(base64Image);
          try {
            const result = await uploadAvatar(base64Image);
            if (result.success) {
              setSuccessMessage('Profile image updated!');
              setTimeout(() => setSuccessMessage(null), 3000);
            } else {
              setError(result.error || 'Failed to upload image');
            }
          } catch (err: any) {
            setError('Failed to upload image');
          }
        } else if (type === 'logo' && shopProfile?._id) {
          // Upload shop logo
          try {
            const result = await uploadShopImages(shopProfile._id, { logo: base64Image });
            if (result.success) {
              setShopLogo(base64Image);
              setSuccessMessage('Shop logo updated!');
              setTimeout(() => setSuccessMessage(null), 3000);
            } else {
              setError(result.error || 'Failed to upload logo');
            }
          } catch (err: any) {
            setError('Failed to upload logo');
          }
        } else if (type === 'cover' && shopProfile?._id) {
          // Upload shop cover
          try {
            const result = await uploadShopImages(shopProfile._id, { coverImage: base64Image });
            if (result.success) {
              setShopCover(base64Image);
              setSuccessMessage('Cover image updated!');
              setTimeout(() => setSuccessMessage(null), 3000);
            } else {
              setError(result.error || 'Failed to upload cover image');
            }
          } catch (err: any) {
            setError('Failed to upload cover image');
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error reading file:', err);
      setError('Failed to upload image');
    }
  };

  const handleCreateShop = () => {
    const newShop: ShopProfile = {
      shopName: `${userFormData.firstName}'s Shop`,
      description: 'Welcome to my shop!',
      category: categories[0],
      logo: 'https://cdn-icons-png.flaticon.com/512/891/891419.png',
      coverImage: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=80',
      address: {
        street: '',
        city: '',
        state: '',
        country: 'Nigeria',
        zipCode: ''
      },
      contact: {
        phone: userFormData.phone || '',
        email: userFormData.email || '',
        website: ''
      },
      businessHours: {
        monday: { open: '08:00', close: '20:00' },
        tuesday: { open: '08:00', close: '20:00' },
        wednesday: { open: '08:00', close: '20:00' },
        thursday: { open: '08:00', close: '20:00' },
        friday: { open: '08:00', close: '21:00' },
        saturday: { open: '09:00', close: '18:00' },
        sunday: { open: '10:00', close: '16:00' }
      },
      deliveryOptions: {
        deliveryAvailable: false,
        pickupAvailable: false,
        deliveryRadius: 5,
        deliveryFee: 0,
        minOrderAmount: 0
      },
      status: 'open',
      verificationStatus: 'unverified'
    };
    
    setShopProfile(newShop);
    setActiveSection('shop');
    setIsEditingShop(true);
  };

  const getStatusColor = (status: ShopProfile['status']) => {
    switch (status) {
      case 'open': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-red-600 bg-red-100';
      case 'busy': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getVerificationColor = (status: ShopProfile['verificationStatus']) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'unverified': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Show loading state
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="black" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-lg font-medium text-gray-900">Profile Settings</h1>
                  <p className="text-xs text-gray-500">Welcome, {userFormData.firstName}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error and Success Messages */}
      {(error || successMessage || shopError || profileError) && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {shopError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
              <span>{shopError}</span>
              <button onClick={() => {}} className="text-red-700 hover:text-red-900">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {profileError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
              <span>{profileError}</span>
              <button onClick={() => {}} className="text-red-700 hover:text-red-900">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
              <span>{successMessage}</span>
              <button onClick={() => setSuccessMessage(null)} className="text-green-700 hover:text-green-900">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8">
        {/* Tab Navigation */}
        <div className="block md:block mb-6 md:mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 lg:space-x-8">
              <button
                onClick={() => setActiveSection('user')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeSection === 'user'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="h-4 w-4 inline-block mr-2" />
                Personal Profile
              </button>
              <button
                onClick={() => setActiveSection('shop')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeSection === 'shop'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Store className="h-4 w-4 inline-block mr-2" />
                Shop Profile
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* Left Column - User Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
              <div className="text-center mb-6">
                <div className="h-24 w-24 md:h-32 md:w-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
                  <img 
                    src={profileImage || userFormData.avatar} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {userFormData.firstName} {userFormData.lastName}
                </h3>
                <p className="text-sm text-gray-600 capitalize">{userFormData.role.toLowerCase()}</p>
                <p className="text-xs text-gray-500 mt-1">Joined {userFormData.joinDate}</p>
              </div>

              {/* User Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-blue-500 mr-3" />
                    <span className="text-sm text-gray-700">Total Orders</span>
                  </div>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <ShoppingBag className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-sm text-gray-700">Active Listings</span>
                  </div>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-3" />
                    <span className="text-sm text-gray-700">Reviews</span>
                  </div>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-purple-500 mr-3" />
                    <span className="text-sm text-gray-700">Total Sales</span>
                  </div>
                  <span className="font-semibold">₦0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Dynamic Content */}
          <div className="lg:col-span-2">
            {activeSection === 'user' ? (
              /* User Profile Section */
              <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-gray-900">Personal Information</h2>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">Update your personal details</p>
                    </div>
                    <button
                      onClick={() => isEditingUser ? handleSaveUserProfile() : setIsEditingUser(true)}
                      disabled={isSaving || profileLoading}
                      className="flex items-center justify-center gap-2 bg-gray-900 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base w-full sm:w-auto"
                    >
                      {isSaving ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          {isEditingUser ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                          {isEditingUser ? 'Save Changes' : 'Edit Profile'}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 md:p-6">
                  <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                    {/* Profile Picture */}
                    <div className="lg:w-1/3">
                      <div className="space-y-4">
                        <div className="relative group mx-auto max-w-[200px] lg:max-w-none">
                          <div className="h-40 w-40 md:h-48 md:w-48 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                            <img 
                              src={profileImage || userFormData.avatar} 
                              alt="Profile" 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          {isEditingUser && (
                            <label className="absolute inset-0 h-40 w-40 md:h-48 md:w-48 mx-auto rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, 'profile')}
                              />
                              <div className="text-white text-center p-2">
                                <Camera className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-1 md:mb-2" />
                                <span className="text-xs md:text-sm">Change Photo</span>
                              </div>
                            </label>
                          )}
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Shield className={`h-4 w-4 ${userFormData.emailVerified ? 'text-green-500' : 'text-gray-400'}`} />
                            <span className={`text-xs ${userFormData.emailVerified ? 'text-green-600' : 'text-gray-500'}`}>
                              {userFormData.emailVerified ? 'Email Verified' : 'Email Not Verified'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Profile Form */}
                    <div className="lg:w-2/3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">First Name *</label>
                          <input
                            type="text"
                            value={userFormData.firstName}
                            onChange={(e) => handleUserInputChange('firstName', e.target.value)}
                            disabled={!isEditingUser}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Last Name *</label>
                          <input
                            type="text"
                            value={userFormData.lastName}
                            onChange={(e) => handleUserInputChange('lastName', e.target.value)}
                            disabled={!isEditingUser}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-2">
                          <label className="text-sm font-medium text-gray-700">Email Address *</label>
                          <div className="relative">
                            <input
                              type="email"
                              value={userFormData.email}
                              onChange={(e) => handleUserInputChange('email', e.target.value)}
                              disabled={!isEditingUser}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                            {userFormData.emailVerified && (
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                                <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="sm:col-span-2 space-y-2">
                          <label className="text-sm font-medium text-gray-700">Phone Number</label>
                          <div className="relative">
                            <input
                              type="tel"
                              value={userFormData.phone}
                              onChange={(e) => handleUserInputChange('phone', e.target.value)}
                              disabled={!isEditingUser}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                            {userFormData.phoneVerified && (
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                                <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Shop Profile Section */
              <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-gray-900">Shop Information</h2>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">
                        {shopProfile ? 'Manage your shop details' : 'Create your shop to start selling'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {shopProfile ? (
                        <button
                          onClick={() => isEditingShop ? handleSaveShopProfile() : setIsEditingShop(true)}
                          disabled={isSaving || shopLoading}
                          className="flex items-center justify-center gap-2 bg-gray-900 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                        >
                          {isSaving ? (
                            <>
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              {isEditingShop ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                              {isEditingShop ? 'Save Changes' : 'Edit Shop'}
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={handleCreateShop}
                          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
                        >
                          <Store className="h-4 w-4" />
                          Create Shop
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {shopProfile ? (
                  <div className="p-4 md:p-6">
                    {/* Shop Images */}
                    <div className="space-y-4 md:space-y-6">
                      {/* Cover Image */}
                      <div className="relative group">
                        <div className="h-36 md:h-48 lg:h-64 rounded-xl overflow-hidden bg-gray-200">
                          <img 
                            src={shopCover || shopProfile.coverImage} 
                            alt="Shop Cover" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {isEditingShop && (
                          <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, 'cover')}
                            />
                            <div className="text-white text-center p-2 md:p-4">
                              <Upload className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-1 md:mb-2" />
                              <span className="text-xs md:text-sm">Change Cover Photo</span>
                            </div>
                          </label>
                        )}
                      </div>

                      {/* Logo */}
                      <div className="flex items-end -mt-12 md:-mt-16 ml-4 md:ml-6 relative z-10">
                        <div className="relative group">
                          <div className="h-24 w-24 md:h-32 md:w-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-white">
                            <img 
                              src={shopLogo || shopProfile.logo} 
                              alt="Shop Logo" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {isEditingShop && (
                            <label className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, 'logo')}
                              />
                              <div className="text-white text-center p-1 md:p-2">
                                <Camera className="h-4 w-4 md:h-6 md:w-6 mx-auto mb-1" />
                                <span className="text-xs">Change Logo</span>
                              </div>
                            </label>
                          )}
                        </div>

                        {/* Shop Status Badge */}
                        <div className="ml-4 mb-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(shopProfile.status)}`}>
                            {shopProfile.status.charAt(0).toUpperCase() + shopProfile.status.slice(1)}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ml-2 ${getVerificationColor(shopProfile.verificationStatus)}`}>
                            {shopProfile.verificationStatus.charAt(0).toUpperCase() + shopProfile.verificationStatus.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Shop Details Form */}
                    <div className="mt-6 md:mt-8 space-y-4 md:space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Shop Name *</label>
                          <input
                            type="text"
                            value={shopProfile.shopName}
                            onChange={(e) => handleShopInputChange('shopName', e.target.value)}
                            disabled={!isEditingShop}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Category *</label>
                          <select
                            value={shopProfile.category}
                            onChange={(e) => handleShopInputChange('category', e.target.value)}
                            disabled={!isEditingShop}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100"
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <label className="text-sm font-medium text-gray-700">Description</label>
                          <textarea
                            value={shopProfile.description}
                            onChange={(e) => handleShopInputChange('description', e.target.value)}
                            disabled={!isEditingShop}
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100 resize-none"
                          />
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div>
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Phone</label>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                              <input
                                type="tel"
                                value={shopProfile.contact.phone}
                                onChange={(e) => handleContactChange('phone', e.target.value)}
                                disabled={!isEditingShop}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                              <input
                                type="email"
                                value={shopProfile.contact.email}
                                onChange={(e) => handleContactChange('email', e.target.value)}
                                disabled={!isEditingShop}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Website</label>
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                              <input
                                type="url"
                                value={shopProfile.contact.website}
                                onChange={(e) => handleContactChange('website', e.target.value)}
                                disabled={!isEditingShop}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Street Address</label>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                              <input
                                type="text"
                                value={shopProfile.address.street}
                                onChange={(e) => handleAddressChange('street', e.target.value)}
                                disabled={!isEditingShop}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">City</label>
                            <input
                              type="text"
                              value={shopProfile.address.city}
                              onChange={(e) => handleAddressChange('city', e.target.value)}
                              disabled={!isEditingShop}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">State</label>
                            <input
                              type="text"
                              value={shopProfile.address.state}
                              onChange={(e) => handleAddressChange('state', e.target.value)}
                              disabled={!isEditingShop}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">ZIP Code</label>
                            <input
                              type="text"
                              value={shopProfile.address.zipCode}
                              onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                              disabled={!isEditingShop}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Delivery Options */}
                      <div>
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Delivery Options</h3>
                        <div className="space-y-3 md:space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={shopProfile.deliveryOptions.deliveryAvailable}
                                onChange={(e) => handleDeliveryOptionChange('deliveryAvailable', e.target.checked)}
                                disabled={!isEditingShop}
                                className="h-4 w-4 text-blue-600 rounded"
                              />
                              <span className="ml-2 text-sm font-medium text-gray-700">Delivery Available</span>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={shopProfile.deliveryOptions.pickupAvailable}
                                onChange={(e) => handleDeliveryOptionChange('pickupAvailable', e.target.checked)}
                                disabled={!isEditingShop}
                                className="h-4 w-4 text-blue-600 rounded"
                              />
                              <span className="ml-2 text-sm font-medium text-gray-700">Pickup Available</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Delivery Radius (km)</label>
                              <input
                                type="number"
                                value={shopProfile.deliveryOptions.deliveryRadius}
                                onChange={(e) => handleDeliveryOptionChange('deliveryRadius', parseInt(e.target.value))}
                                disabled={!isEditingShop}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Delivery Fee (₦)</label>
                              <input
                                type="number"
                                value={shopProfile.deliveryOptions.deliveryFee}
                                onChange={(e) => handleDeliveryOptionChange('deliveryFee', parseInt(e.target.value))}
                                disabled={!isEditingShop}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Min Order (₦)</label>
                              <input
                                type="number"
                                value={shopProfile.deliveryOptions.minOrderAmount}
                                onChange={(e) => handleDeliveryOptionChange('minOrderAmount', parseInt(e.target.value))}
                                disabled={!isEditingShop}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:bg-gray-100"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Shop Status */}
                      <div>
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Shop Status</h3>
                        <div className="flex flex-wrap gap-3 md:gap-4">
                          {(['open', 'closed', 'busy'] as const).map(status => (
                            <label key={status} className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name="shopStatus"
                                value={status}
                                checked={shopProfile.status === status}
                                onChange={(e) => handleShopInputChange('status', e.target.value)}
                                disabled={!isEditingShop}
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
                                {status}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Create Shop CTA */
                  <div className="p-8 md:p-12 text-center">
                    <div className="max-w-md mx-auto">
                      <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Shop Yet</h3>
                      <p className="text-gray-600 mb-6">
                        Create your shop to start selling products and reach more customers.
                      </p>
                      <button
                        onClick={handleCreateShop}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        <Store className="h-5 w-5" />
                        Create Your Shop
                      </button>
                      <p className="text-xs text-gray-500 mt-4">
                        You'll become a seller after creating your shop
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Main export with ProtectedRoute wrapper
export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}