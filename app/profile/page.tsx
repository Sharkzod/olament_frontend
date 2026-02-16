'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '../lib/hooks/useProfile';
import { compressImage, validateImageFile, uploadToCloudinary } from '../lib/utils/imageUpload';
import {
  ChevronLeft,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Camera,
  AlertCircle,
  CheckCircle,
  Clock,
  Heart,
  Package,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  Loader2,
  Upload,
  X
} from 'lucide-react';
import BottomNav from '../components/Sidebar';

/**
 * User Profile Page Component with Image Upload
 */
export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'activity'>('info');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Use the profile hook
  const {
    profile,
    loading,
    error,
    getProfile,
    uploadAvatar,
    formatAddress,
    clearError
  } = useProfile();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== 'undefined' ? 
        localStorage.getItem('authToken') ||
        localStorage.getItem('token') ||
        localStorage.getItem('accessToken') :
        null;
      
      console.log('🔍 Profile check - Token found:', !!token);
      
      if (!token) {
        console.log('❌ No token found, redirecting to login...');
        router.push('/login');
        return;
      }
      
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  const handleBack = () => {
    router.push('/');
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    router.push('/login');
  };

  // Refresh profile on mount if needed
  useEffect(() => {
    if (!profile && !loading && !isCheckingAuth) {
      getProfile();
    }
  }, [profile, loading, isCheckingAuth, getProfile]);

  // Handle avatar upload button click
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection with validation
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      // Compress image before preview
      setUploadProgress(20);
      const compressedImage = await compressImage(file, 800, 800, 0.85);
      
      setSelectedImage(compressedImage);
      setSelectedFile(file);
      setShowAvatarModal(true);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
      setUploadProgress(0);
    }
  };

  // Handle avatar upload
  const handleUploadAvatar = async () => {
    if (!selectedImage) return;

    setUploadingAvatar(true);
    setUploadProgress(30);

    try {
      // Option 1: Upload to Cloudinary (recommended)
      // Uncomment this if you have Cloudinary configured
      /*
      const uploadResult = await uploadToCloudinary(selectedImage);
      
      if (!uploadResult.success) {
        alert(uploadResult.error || 'Failed to upload image');
        return;
      }

      setUploadProgress(70);

      // Update profile with Cloudinary URL
      const result = await uploadAvatar(uploadResult.url!);
      */

      // Option 2: Send base64 directly to backend (current implementation)
      // This works but is not recommended for production
      setUploadProgress(50);
      const result = await uploadAvatar(selectedImage);
      
      setUploadProgress(90);

      if (result.success) {
        console.log('✅ Avatar uploaded successfully');
        setShowAvatarModal(false);
        setSelectedImage(null);
        setSelectedFile(null);
        setUploadProgress(100);
        
        // Refresh profile to get updated avatar
        await getProfile();
        
        // Reset progress after a short delay
        setTimeout(() => setUploadProgress(0), 500);
      } else {
        alert(result.error || 'Failed to upload avatar');
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar. Please try again.');
      setUploadProgress(0);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Cancel avatar upload
  const handleCancelUpload = () => {
    setShowAvatarModal(false);
    setSelectedImage(null);
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Determine account status
  const getAccountStatus = () => {
    if (!profile) return 'unknown';
    if (profile.isVerified) return 'verified';
    if (!profile.address || formatAddress(profile.address) === 'No address provided') {
      return 'pending_verification';
    }
    return 'active';
  };

  const getStatusBadge = () => {
    const status = getAccountStatus();
    
    switch (status) {
      case 'pending_verification':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
            <Clock className="w-3.5 h-3.5" />
            Pending Verification
          </div>
        );
      case 'verified':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            Verified
          </div>
        );
      case 'active':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            Active
          </div>
        );
      default:
        return null;
    }
  };

  // Check if profile is completed
  const isProfileCompleted = () => {
    if (!profile) return false;
    const hasAddress = profile.address && formatAddress(profile.address) !== 'No address provided';
    const hasPhone = profile.phone && profile.phone !== '';
    return hasAddress && hasPhone;
  };

  const menuItems = [
    { icon: Heart, label: 'Wishlist', value: '0 items', href: '/wishlist' },
    { icon: Package, label: 'My Orders', value: 'View all', href: '/orders' },
    { icon: MessageSquare, label: 'Messages', value: 'Chat history', href: '/chats' },
    { icon: Settings, label: 'Settings', value: 'Preferences', href: '/settings' },
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upload Profile Picture</h3>
              <button
                onClick={handleCancelUpload}
                disabled={uploadingAvatar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Image Preview */}
            <div className="mb-6">
              <div className="aspect-square w-full max-w-xs mx-auto rounded-2xl overflow-hidden bg-gray-100 relative">
                {selectedImage && (
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Upload Progress Overlay */}
                {uploadingAvatar && uploadProgress > 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                      <p className="text-white text-sm font-medium">{uploadProgress}%</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* File Info */}
              {selectedFile && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500">
                    {selectedFile.name} • {(selectedFile.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelUpload}
                disabled={uploadingAvatar}
                className="flex-1 px-4 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadAvatar}
                disabled={uploadingAvatar}
                className="flex-1 px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploadingAvatar ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 shrink-0">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[15px] font-semibold text-gray-900 ml-2">Profile</h1>
      </header>

      {/* Checking Authentication */}
      {isCheckingAuth ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-600">Checking authentication...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Error Alert */}
          {error && (
            <div className="mx-4 mt-4">
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Error</p>
                  <p className="text-xs text-red-700 mt-0.5">{error}</p>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && !profile ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-600">Loading profile...</p>
              </div>
            </div>
          ) : !profile ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-4">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">No profile data</p>
                <p className="text-xs text-gray-600 mb-4">Unable to load your profile information</p>
                <button
                  onClick={() => getProfile()}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Content */}
              <div className="flex-1 overflow-y-auto pb-20">
                {/* Profile Header Section */}
                <div className="bg-white border-b border-gray-100">
                  <div className="px-4 pt-6 pb-4">
                    {/* Avatar and Edit Button */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="relative">
                        {profile.avatar && profile.avatar !== 'default-avatar.png' ? (
                          <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-100"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold ring-2 ring-gray-100">
                            {profile.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <button 
                          onClick={handleAvatarClick}
                          disabled={uploadingAvatar}
                          className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ring-2 ring-white"
                          title="Change profile picture"
                        >
                          {uploadingAvatar ? (
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4 text-white" />
                          )}
                        </button>
                      </div>
                      
                      <button
                        onClick={handleEditProfile}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    </div>

                    {/* Name and Status */}
                    <div className="mb-3">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">{profile.name}</h2>
                      {getStatusBadge()}
                    </div>

                    {/* Account Status Alert */}
                    {!isProfileCompleted() && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-yellow-900">Complete your profile</p>
                          <p className="text-xs text-yellow-700 mt-0.5">
                            {!profile.address ? 'Add your address' : ''}
                            {!profile.address && !profile.phone ? ' and ' : ''}
                            {!profile.phone ? 'add your phone number' : ''}
                            {' '}to unlock all features
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tabs */}
                  <div className="flex border-t border-gray-100">
                    <button
                      onClick={() => setActiveTab('info')}
                      className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                        activeTab === 'info'
                          ? 'text-yellow-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Personal Info
                      {activeTab === 'info' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('activity')}
                      className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                        activeTab === 'activity'
                          ? 'text-yellow-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Activity
                      {activeTab === 'activity' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'info' ? (
                  <div className="p-4 space-y-4">
                    {/* Contact Information */}
                    <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
                        
                        <div className="space-y-3">
                          {/* Email */}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                              <Mail className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 mb-0.5">Email</p>
                              <p className="text-sm text-gray-900 truncate">{profile.email}</p>
                              {!profile.isVerified && (
                                <button className="text-xs text-yellow-600 hover:text-yellow-700 font-medium mt-1">
                                  Verify email
                                </button>
                              )}
                            </div>
                            {profile.isVerified ? (
                              <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                            )}
                          </div>

                          {/* Phone */}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                              <Phone className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                              {profile.phone ? (
                                <p className="text-sm text-gray-900">{profile.phone}</p>
                              ) : (
                                <>
                                  <p className="text-sm text-gray-400 italic">Not provided</p>
                                  <button 
                                    onClick={handleEditProfile}
                                    className="text-xs text-yellow-600 hover:text-yellow-700 font-medium mt-1"
                                  >
                                    Add phone number
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Address */}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                              <MapPin className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 mb-0.5">Address</p>
                              {profile.address && formatAddress(profile.address) !== 'No address provided' ? (
                                <p className="text-sm text-gray-900">{formatAddress(profile.address)}</p>
                              ) : (
                                <>
                                  <p className="text-sm text-gray-400 italic">Not provided</p>
                                  <button 
                                    onClick={handleEditProfile}
                                    className="text-xs text-yellow-600 hover:text-yellow-700 font-medium mt-1"
                                  >
                                    Add address
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Account Details */}
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Account Details</h3>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Role</span>
                          <span className="text-gray-900 font-medium capitalize">{profile.role}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Account Status</span>
                          <span className="text-gray-900 font-medium">
                            {profile.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Member Since</span>
                          <span className="text-gray-900 font-medium">
                            {new Date(profile.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    {/* Quick Access Menu */}
                    <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
                      {menuItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => router.push(item.href)}
                          className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                            <item.icon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.value}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                      ))}
                    </div>

                    {/* Logout Button */}
                    <button 
                      onClick={handleLogout}
                      className="w-full mt-4 p-4 bg-white hover:bg-red-50 border border-gray-100 hover:border-red-100 rounded-xl flex items-center justify-center gap-2 text-red-600 font-medium transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
      <BottomNav />
    </div>
  );
}