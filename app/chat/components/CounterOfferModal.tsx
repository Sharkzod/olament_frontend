'use client';

import React, { useState } from 'react';
import { X, Loader2, ArrowRight } from 'lucide-react';

interface CounterOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offerId: string, price: number, quantity: number, message?: string) => Promise<void>;
  offerId: string;
  originalPrice: number;
  originalQuantity: number;
}

const CounterOfferModal: React.FC<CounterOfferModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  offerId,
  originalPrice,
  originalQuantity,
}) => {
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState(String(originalQuantity));
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price);
    const qtyNum = parseInt(quantity) || 1;

    if (!priceNum || priceNum <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSubmit(offerId, priceNum, qtyNum, message || undefined);
      setPrice('');
      setQuantity('1');
      setMessage('');
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send counter offer');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (val: string) => {
    return val.replace(/[^0-9.]/g, '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onMouseDown={onClose} />

      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl animate-in slide-in-from-bottom">
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Counter Offer</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Original Offer Reference */}
        <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b">
          <div>
            <p className="text-xs text-gray-500">Original offer</p>
            <p className="text-sm font-semibold text-gray-900">
              ₦{originalPrice.toLocaleString()} × {originalQuantity}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Counter Price (₦)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(formatPrice(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-lg font-semibold text-gray-900"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a note..."
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-gray-900 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !price}
            className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Counter Offer'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CounterOfferModal;
