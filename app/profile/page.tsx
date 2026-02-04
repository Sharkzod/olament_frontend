'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Award,
  Calendar,
  Edit2,
  Save,
  X,
  Building,
  Store,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Star,
  Loader2
} from 'lucide-react';
import { useProfile, Address, BusinessAddress, UpdateProfileData } from '../lib/hooks/useProfile';

// ============================================================================
// TYPES
// ============================================================================

interface FormData {
  name: string;
  phone: string;
  address: Address;
  avatar: string;
  businessName: string;
  businessDescription: string;
  businessAddress: BusinessAddress;
  businessPhone: string;
  businessEmail: string;
  businessWebsite: string;
  taxId: string;
  businessRegistration: string;
  yearsInBusiness: number;
  businessLogo: string;
}

type TabType = 'personal' | 'business';

// ============================================================================
// CONSTANTS
// ============================================================================

const EMPTY_ADDRESS: Address = {
  street: '',
  city: '',
  state: '',
  country: '',
  zipCode: ''
};

const initialFormData: FormData = {
  name: '',
  phone: '',
  address: EMPTY_ADDRESS,
  avatar: '',
  businessName: '',
  businessDescription: '',
  businessAddress: EMPTY_ADDRESS,
  businessPhone: '',
  businessEmail: '',
  businessWebsite: '',
  taxId: '',
  businessRegistration: '',
  yearsInBusiness: 0,
  businessLogo: ''
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function ProfilePage() {
  const router = useRouter();
  const {
    profile,
    loading,
    error,
    updateProfile,
    clearError,
    formatAddress
  } = useProfile();

  // Local state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Initialize form data when profile loads or changes
  useEffect(() => {
    if (profile) {
      initializeFormData();
    }
  }, [profile]);

  // Auto-dismiss success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const initializeFormData = useCallback(() => {
    if (!profile) return;

    setFormData({
      // Personal info
      name: profile.name || '',
      phone: profile.phone || '',
      address: profile.address || EMPTY_ADDRESS,
      avatar: profile.avatar || '',
      
      // Business info - check both vendorProfile and root level
      businessName: profile.vendorProfile?.businessName || profile.businessName || '',
      businessDescription: profile.vendorProfile?.businessDescription || profile.businessDescription || '',
      businessAddress: profile.vendorProfile?.businessAddress || profile.address || EMPTY_ADDRESS,
      businessPhone: profile.vendorProfile?.businessPhone || profile.phone || '',
      businessEmail: profile.vendorProfile?.businessEmail || profile.email || '',
      businessWebsite: profile.vendorProfile?.businessWebsite || '',
      taxId: profile.vendorProfile?.taxId || '',
      businessRegistration: profile.vendorProfile?.businessRegistration || '',
      yearsInBusiness: profile.vendorProfile?.yearsInBusiness || 0,
      businessLogo: profile.vendorProfile?.businessLogo || profile.businessLogo || ''
    });
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleBusinessAddressChange = (field: keyof BusinessAddress, value: string) => {
    setFormData(prev => ({
      ...prev,
      businessAddress: {
        ...prev.businessAddress,
        [field]: value
      }
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      clearError();
      setSuccessMessage(null);

      // Build update payload
      const updateData: UpdateProfileData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        avatar: formData.avatar
      };

      // Add business info if user is a vendor
      if (profile.role === 'vendor') {
        updateData.businessInfo = {
          businessName: formData.businessName,
          businessDescription: formData.businessDescription,
          businessAddress: formData.businessAddress,
          businessPhone: formData.businessPhone,
          businessEmail: formData.businessEmail,
          businessWebsite: formData.businessWebsite,
          taxId: formData.taxId,
          businessRegistration: formData.businessRegistration,
          yearsInBusiness: formData.yearsInBusiness,
          businessLogo: formData.businessLogo
        };
      }

      // Call the hook's updateProfile function
      const result = await updateProfile(updateData);

      if (result.success) {
        setEditing(false);
        setSuccessMessage('Profile updated successfully!');
        // Form data will be re-initialized by the useEffect when profile updates
      } else {
        // Error is already set by the hook
        console.error('Update failed:', result.error);
      }
    } catch (err) {
      console.error('Unexpected error during profile update:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    initializeFormData();
    setEditing(false);
    clearError();
    setSuccessMessage(null);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderLoadingState = () => (
    <section className="mt-6 text-black px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12 sm:py-16">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    </section>
  );

  const renderErrorState = () => (
    <section className="mt-6 text-black px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
            <p className="text-red-700 text-sm flex-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium whitespace-nowrap"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderEmptyState = () => (
    <section className="mt-6 text-black px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12 sm:py-16 bg-white rounded-xl border border-gray-200">
          <User className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-700">No profile found</h3>
          <p className="text-gray-500 mt-2">Unable to load your profile information</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Reload Profile
          </button>
        </div>
      </div>
    </section>
  );

  const renderProfileOverview = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Avatar & Status */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-gray-400" />
            )}
          </div>
          {profile?.isVerified && (
            <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1 rounded-full">
              <CheckCircle className="h-5 w-5" />
            </div>
          )}
        </div>
        <h2 className="text-xl font-bold text-gray-900">{profile?.name}</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            profile?.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {profile?.isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {profile?.role.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Account Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Mail className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-900">{profile?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Member Since</p>
            <p className="text-sm font-medium text-gray-900">
              {profile?.createdAt ? formatDate(profile.createdAt) : 'N/A'}
            </p>
          </div>
        </div>

        {profile?.role === 'vendor' && (profile.vendorProfile || profile.shops) && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Store className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Active Shops</p>
              <p className="text-sm font-medium text-gray-900">
                {profile.vendorProfile?.shops?.length || profile.shops?.length || 0} shops
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <User className="h-5 w-5 text-gray-400" />
          Personal Information
        </h3>
        {!profile?.isVerified && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Not Verified
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          {editing ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-900">
              <User className="h-4 w-4 text-gray-400" />
              <p className="text-sm">{profile?.name}</p>
            </div>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          {editing ? (
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your phone number"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-900">
              <Phone className="h-4 w-4 text-gray-400" />
              <p className="text-sm">{profile?.phone || 'Not provided'}</p>
            </div>
          )}
        </div>

        {/* Address */}
        {editing ? (
          <>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter street address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="State"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
              <input
                type="text"
                value={formData.address.zipCode}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ZIP Code"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                value={formData.address.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Country"
              />
            </div>
          </>
        ) : (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <div className="flex items-start gap-2 text-gray-900">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{formatAddress(profile?.address)}</p>
            </div>
          </div>
        )}

        {/* Avatar */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture URL
          </label>
          {editing ? (
            <input
              type="url"
              name="avatar"
              value={formData.avatar}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter image URL for your profile picture"
            />
          ) : (
            <div className="text-sm text-gray-500">
              {profile?.avatar ? 'Custom avatar set' : 'Using default avatar'}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderBusinessInfo = () => {
    if (profile?.role !== 'vendor') return null;

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building className="h-5 w-5 text-gray-400" />
            Business Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name *
            </label>
            {editing ? (
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your business name"
                required
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-900">
                <Building className="h-4 w-4 text-gray-400" />
                <p className="text-sm font-medium">
                  {profile.vendorProfile?.businessName || profile.businessName || 'Not provided'}
                </p>
              </div>
            )}
          </div>

          {/* Business Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Description
            </label>
            {editing ? (
              <textarea
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleInputChange}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your business"
              />
            ) : (
              <p className="text-sm text-gray-600">
                {profile.vendorProfile?.businessDescription || profile.businessDescription || 'No description provided'}
              </p>
            )}
          </div>

          {/* Business Address */}
          {editing ? (
            <>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Street Address
                </label>
                <input
                  type="text"
                  value={formData.businessAddress.street}
                  onChange={(e) => handleBusinessAddressChange('street', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter street address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={formData.businessAddress.city}
                  onChange={(e) => handleBusinessAddressChange('city', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  value={formData.businessAddress.state}
                  onChange={(e) => handleBusinessAddressChange('state', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                <input
                  type="text"
                  value={formData.businessAddress.zipCode}
                  onChange={(e) => handleBusinessAddressChange('zipCode', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ZIP Code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  value={formData.businessAddress.country}
                  onChange={(e) => handleBusinessAddressChange('country', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Country"
                />
              </div>
            </>
          ) : (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Address
              </label>
              <div className="flex items-center gap-2 text-gray-900">
                <MapPin className="h-4 w-4 text-gray-400" />
                <p className="text-sm">
                  {formatAddress(profile.vendorProfile?.businessAddress) ||
                    formatAddress(profile.address) ||
                    'Not provided'}
                </p>
              </div>
            </div>
          )}

          {/* Other business fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Phone
            </label>
            {editing ? (
              <input
                type="tel"
                name="businessPhone"
                value={formData.businessPhone}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Business phone number"
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-900">
                <Phone className="h-4 w-4 text-gray-400" />
                <p className="text-sm">
                  {profile.vendorProfile?.businessPhone || profile.phone || 'Not provided'}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Email
            </label>
            {editing ? (
              <input
                type="email"
                name="businessEmail"
                value={formData.businessEmail}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Business email address"
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-900">
                <Mail className="h-4 w-4 text-gray-400" />
                <p className="text-sm">
                  {profile.vendorProfile?.businessEmail || profile.email || 'Not provided'}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            {editing ? (
              <input
                type="url"
                name="businessWebsite"
                value={formData.businessWebsite}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-900">
                <Globe className="h-4 w-4 text-gray-400" />
                <p className="text-sm">
                  {profile.vendorProfile?.businessWebsite || 'Not provided'}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years in Business
            </label>
            {editing ? (
              <input
                type="number"
                name="yearsInBusiness"
                value={formData.yearsInBusiness}
                onChange={handleNumberChange}
                min="0"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-900">
                <Award className="h-4 w-4 text-gray-400" />
                <p className="text-sm">{profile.vendorProfile?.yearsInBusiness || 0} years</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tax ID / VAT
            </label>
            {editing ? (
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tax identification number"
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-900">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <p className="text-sm">{profile.vendorProfile?.taxId || 'Not provided'}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registration Number
            </label>
            {editing ? (
              <input
                type="text"
                name="businessRegistration"
                value={formData.businessRegistration}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Business registration number"
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-900">
                <FileText className="h-4 w-4 text-gray-400" />
                <p className="text-sm">
                  {profile.vendorProfile?.businessRegistration || 'Not provided'}
                </p>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Logo URL
            </label>
            {editing ? (
              <input
                type="url"
                name="businessLogo"
                value={formData.businessLogo}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter image URL for your business logo"
              />
            ) : (
              <div className="text-sm text-gray-500">
                {profile.vendorProfile?.businessLogo || profile.businessLogo ? 'Custom logo set' : 'No logo uploaded'}
              </div>
            )}
          </div>
        </div>

        {/* Shops Section */}
        {(profile.vendorProfile?.shops || profile.shops) && (profile.vendorProfile?.shops?.length || profile.shops?.length || 0) > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Store className="h-5 w-5 text-gray-400" />
              My Shops ({profile.vendorProfile?.shops?.length || profile.shops?.length || 0})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(profile.vendorProfile?.shops || profile.shops || []).slice(0, 4).map(shop => (
                <div key={shop._id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                      <Store className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">{shop.name}</h5>
                      <p className="text-xs text-gray-500">{shop.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs font-medium">{shop.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      shop.isVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {shop.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  <button
                    onClick={() => router.push(`/shops/${shop._id}`)}
                    className="w-full mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Shop →
                  </button>
                </div>
              ))}
            </div>
            {(profile.vendorProfile?.shops?.length || profile.shops?.length || 0) > 4 && (
              <button
                onClick={() => router.push('/vendor/shops')}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all shops →
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (loading && !profile) {
    return renderLoadingState();
  }

  if (error && !profile) {
    return renderErrorState();
  }

  if (!profile) {
    return renderEmptyState();
  }

  return (
    <section className="mt-6 text-black px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">
                Manage your personal and business information
              </p>
            </div>
            <div className="flex gap-2">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <p className="text-green-700 text-sm flex-1">{successMessage}</p>
              <button
                onClick={() => setSuccessMessage(null)}
                className="ml-4 text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Overview */}
          <div className="lg:col-span-1">
            {renderProfileOverview()}
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2">
            {/* Tabs for Vendors */}
            {profile.role === 'vendor' && (
              <div className="mb-6">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab('personal')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'personal'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Personal Information
                    </button>
                    <button
                      onClick={() => setActiveTab('business')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'business'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Business Profile
                    </button>
                  </nav>
                </div>
              </div>
            )}

            {/* Content based on active tab */}
            {(activeTab === 'personal' || profile.role !== 'vendor') && renderPersonalInfo()}
            {profile.role === 'vendor' && activeTab === 'business' && renderBusinessInfo()}
          </div>
        </div>
      </div>
    </section>
  );
}