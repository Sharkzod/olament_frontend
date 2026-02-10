// app/products/[id]/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Star, 
  Heart, 
  ChevronLeft,
  MessageCircle,
  MapPin,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useProduct } from '@/app/lib/hooks/Useproduct';
import { useChat } from '@/app/lib/hooks/useChat';

const ProductPage = () => {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch product using the custom hook
  const { product, isLoading, error, refetch } = useProduct({
    productId,
    autoFetch: true,
  });

  // Chat hook
  const { createChat, isCreating, error: chatError } = useChat();

  // Handle Contact Seller button click
const handleContactSeller = async () => {
  if (!product || !product.vendor) {
    console.error('Product or vendor information not available');
    return;
  }

  try {
    // Create chat
    const chatResponse = await createChat({
      productId: product._id,
      vendorId: product.vendor._id,
    });

    console.log('Full chatResponse:', chatResponse);

    if (chatResponse && chatResponse.success && chatResponse.data) {
      // Navigate to chat page with the conversation ID as a query parameter
      router.push(`/chat?conversationId=${chatResponse.data._id}`);
      console.log('Chat created successfully, navigating to chat page:', chatResponse.data._id);
    }
  } catch (error: any) {
    console.error('Error in handleContactSeller:', error);
    
    // Show the actual error from the API
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred. Please try again.';
    alert(errorMessage);
  }
};
  // Format specification key for display
  const formatSpecKey = (key: string) => {
    // Convert camelCase to Title Case
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Prepare images array
  const allImages = product?.images || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border-2 border-red-200 p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Product</h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No product found
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border-2 border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/categories')}
            className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold rounded-xl transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  // Calculate discount if applicable
  const discount = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : product.discountPercentage || 0;

  const displayPrice = product.discountPrice || product.price;
  const originalPrice = product.discountPrice ? product.price : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-semibold">Back</span>
            </button>
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-gray-200">
              <img
                src={allImages[selectedImage]?.url || '/placeholder-product.jpg'}
                alt={allImages[selectedImage]?.altText || product.name}
                className="w-full h-full object-contain p-8"
              />
              {product.condition === 'new' && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    New
                  </span>
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    -{discount}% OFF
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {allImages.map((image, index) => (
                  <button
                    key={image._id || index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-yellow-400 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.altText || `${product.name} - Image ${index + 1}`}
                      className="w-full h-full object-contain p-2 bg-gray-50"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded-full">
                  {product.category}
                </span>
                {product.inStock ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    In Stock
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
              {product.sku && (
                <p className="text-sm text-gray-500 mt-2">SKU: {product.sku}</p>
              )}
            </div>

            {/* Rating */}
            {product.ratings && product.ratings.count > 0 && (
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.ratings.average)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-gray-900">
                  {product.ratings.average.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({product.ratings.count} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">
                  ${displayPrice.toFixed(2)}
                </span>
                {originalPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    ${originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {product.quantity && (
                <p className="text-sm text-gray-600 mt-2">
                  {product.quantity} units available
                </p>
              )}
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors cursor-default"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* CTA - Contact Seller Button */}
            <button 
              onClick={handleContactSeller}
              disabled={!product.inStock || isCreating}
              className="w-full px-8 py-4 bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 font-bold rounded-xl text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 disabled:transform-none"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Chat...
                </>
              ) : (
                <>
                  <MessageCircle className="h-5 w-5" />
                  {product.inStock ? 'Contact Seller' : 'Out of Stock'}
                </>
              )}
            </button>

            {/* Error message if chat creation fails */}
            {chatError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-red-800 text-sm">{chatError.message}</p>
              </div>
            )}

            {/* Vendor */}
            {product.vendor && (
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Sold by</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {product.vendor.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{product.vendor.name}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Lagos, Nigeria</span>
                    </div>
                  </div>
                  {product.vendor.accountStatus === 'active' && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.specifications.map((spec, index) => (
                <div
                  key={spec._id || index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-700">
                    {formatSpecKey(spec.key)}
                  </span>
                  <span className="text-gray-900 text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductPage;