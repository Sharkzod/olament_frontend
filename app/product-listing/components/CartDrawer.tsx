// components/CartDrawer.tsx
'use client';

import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart, type CartItem } from '../hooks/useCart';
import toast from 'react-hot-toast';

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

/**
 * CartDrawer Component
 * Slide-out drawer showing cart items with quantity controls
 * 
 * Features:
 * - Smooth slide-in animation from right
 * - Quantity increment/decrement buttons (+ / -)
 * - Remove item button (trash/bin icon)
 * - Empty state when cart is empty
 * - Total price calculation
 * - Backdrop overlay to close drawer
 */
interface CartDrawerProps {
  /** Control whether drawer is open */
  isOpen: boolean;
  
  /** Callback to close drawer */
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cartItems, cartTotal, incrementQuantity, decrementQuantity, removeFromCart, clearCart } = useCart();

  /**
   * Handle increment quantity
   */
  const handleIncrement = (item: CartItem) => {
    incrementQuantity(item.id);
  };

  /**
   * Handle decrement quantity
   */
  const handleDecrement = (item: CartItem) => {
    if (item.quantity <= 1) {
      // Remove item if quantity would be 0
      removeFromCart(item.id);
      toast.success(`${item.name} removed from cart`);
    } else {
      decrementQuantity(item.id);
    }
  };

  /**
   * Handle remove item
   */
  const handleRemove = (item: CartItem) => {
    removeFromCart(item.id);
    toast.success(`${item.name} removed from cart`);
  };

  /**
   * Handle clear all items
   */
  const handleClearCart = () => {
    clearCart();
    toast.success('Cart cleared');
  };

  /**
   * Handle checkout
   */
  const handleCheckout = () => {
    // TODO: Navigate to checkout page
    toast.success('Proceeding to checkout...');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart
            {cartItems.length > 0 && (
              <span className="text-sm font-normal text-gray-500">
                ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 text-sm mb-4">Add some products to get started!</p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-yellow-400 text-gray-900 font-medium rounded-lg hover:bg-yellow-300 transition-colors"
              >
                Browse Products
              </button>
            </div>
          ) : (
            // Cart items list
            <>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-gray-50 rounded-xl"
                >
                  {/* Product Image */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      by {item.vendor}
                    </p>
                    <p className="font-bold text-gray-900 mt-1">
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        {/* Decrement Button */}
                        <button
                          onClick={() => handleDecrement(item)}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5 text-gray-600" />
                        </button>

                        {/* Quantity Display */}
                        <span className="w-8 text-center font-semibold text-gray-900">
                          {item.quantity}
                        </span>

                        {/* Increment Button */}
                        <button
                          onClick={() => handleIncrement(item)}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5 text-gray-600" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove item from cart"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              {cartItems.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="w-full py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Cart
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer with Total and Checkout */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 p-4 space-y-4 bg-white">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(cartTotal)}
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-5 w-5" />
              Checkout ({formatPrice(cartTotal)})
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
