// components/ProductCard.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, Star, MessageCircle } from 'lucide-react';
import type { Product } from '../types/product';
import AddToCartButton from './AddToCartButton';

/**
 * ProductCard Component
 * Displays individual product in a sleek, modern card format
 * 
 * Props:
 * - product: Product object containing product details
 * - onClick: Optional click handler for product selection
 * 
 * TODO: Inject product data from API response
 */

interface ProductCardProps {
  /** Product data to display */
  product: Product;

  /** Optional click handler for navigation */
  onClick?: (product: Product) => void;

  /** Whether this product is in the user's wishlist */
  isFavorite?: boolean;

  /** Callback when the favorite button is toggled */
  onToggleFavorite?: (productId: string) => void;
}

/**
 * Format price to Naira currency
 */
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, isFavorite: isFavoriteProp, onToggleFavorite }) => {
  const [localFavorite, setLocalFavorite] = useState(false);
  const isFavorite = isFavoriteProp ?? localFavorite;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(product.id);
    } else {
      setLocalFavorite(!localFavorite);
    }
  };

  /**
   * Navigate to chat with pre-filled product message
   */
  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create pre-filled message about the product
    const message = `Hi, I'm interested in "${product.name}". Is this still available?`;
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Navigate to chat with query params
    window.location.href = `/chat?message=${encodedMessage}`;
  };

  /**
   * Handle product click
   * TODO: Navigate to product details page
   */
  const handleClick = () => {
    if (onClick) {
      onClick(product);
    } else {
      // TODO: Navigate to product details page
      console.log('Navigate to product:', product.id);
    }
  };

  /**
   * Calculate discount percentage
   */
  const discountPercentage = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <article
      className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:shadow-lg"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`View details for ${product.name}`}
    >
      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            -{discountPercentage}%
          </div>
        )}

        {/* New Badge (if product is new) */}
        {!discountPercentage && product.createdAt && (
          <div className="absolute top-3 left-3 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            New
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 backdrop-blur-sm ${
            isFavorite
              ? 'bg-red-50 text-red-500'
              : 'bg-white/80 text-gray-500 hover:text-red-500'
          } shadow-sm`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`h-4 w-4 transition-all duration-200 ${
              isFavorite ? 'fill-current scale-110' : ''
            }`}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-2">
        {/* Category */}
        {product.category && (
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {product.category}
          </span>
        )}

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 text-base line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* Vendor Name */}
        <p className="text-sm text-gray-500 truncate">
          by {product.vendor}
        </p>

        {/* Rating */}
        {product.rating && product.rating > 0 && (
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium text-gray-700">
              {product.rating.toFixed(1)}
            </span>
            {product.reviewCount && (
              <span className="text-sm text-gray-400">
                ({product.reviewCount})
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="pt-1">
          {product.inStock ? (
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              In Stock
            </span>
          ) : (
            <span className="text-xs text-red-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              Out of Stock
            </span>
          )}
        </div>

        {/* Action Buttons - Add to Cart & Chat */}
        <div className="pt-2 flex gap-2">
          {/* Add to Cart Button */}
          <div className="flex-1">
            <AddToCartButton product={product} />
          </div>

          {/* Chat with Vendor Button - More Conspicuous */}
          <button
            onClick={handleChatClick}
            className="flex-shrink-0 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-full transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
            aria-label={`Chat with ${product.vendor} about ${product.name}`}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">Chat</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
