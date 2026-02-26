'use client';

import React, { useState } from 'react';
import { Tag, Check, X, RotateCcw, Loader2, ArrowRight } from 'lucide-react';

interface OfferData {
  offerId: string;
  price: number;
  quantity: number;
  status: string;
  initiatorName: string;
}

interface OfferCardProps {
  offerData: OfferData;
  isOutgoing: boolean;
  currentUserId: string;
  senderId: string;
  onAccept?: (offerId: string) => Promise<void>;
  onDecline?: (offerId: string) => Promise<void>;
  onCounter?: (offerId: string) => void;
  onWithdraw?: (offerId: string) => Promise<void>;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  accepted: { label: 'Accepted', color: 'text-green-700', bg: 'bg-green-100' },
  declined: { label: 'Declined', color: 'text-red-700', bg: 'bg-red-100' },
  countered: { label: 'Countered', color: 'text-blue-700', bg: 'bg-blue-100' },
  expired: { label: 'Expired', color: 'text-gray-700', bg: 'bg-gray-100' },
  withdrawn: { label: 'Withdrawn', color: 'text-gray-700', bg: 'bg-gray-100' },
};

const OfferCard: React.FC<OfferCardProps> = ({
  offerData,
  isOutgoing,
  currentUserId,
  senderId,
  onAccept,
  onDecline,
  onCounter,
  onWithdraw,
}) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { offerId, price, quantity, status, initiatorName } = offerData;
  const statusInfo = statusConfig[status] || statusConfig.pending;

  const isInitiator = senderId === currentUserId;
  const isRecipient = !isInitiator;
  const isPending = status === 'pending';
  const isCounterOffer = false; // Could check parentOffer if needed

  const handleAction = async (action: string, handler?: (id: string) => Promise<void>) => {
    if (!handler) return;
    setActionLoading(action);
    try {
      await handler(offerId);
    } catch (err) {
      console.error(`Error ${action}:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="w-full max-w-[280px]">
      <div className="border-2 border-yellow-400 rounded-2xl overflow-hidden bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-semibold text-gray-900">
              Price Offer
            </span>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Body */}
        <div className="px-4 py-3 space-y-2">
          {/* From */}
          <p className="text-xs text-gray-500">
            From <span className="font-medium text-gray-700">{initiatorName}</span>
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">
              ₦{price.toLocaleString()}
            </span>
            {quantity > 1 && (
              <span className="text-sm text-gray-500">× {quantity}</span>
            )}
          </div>

          {quantity > 1 && (
            <p className="text-xs text-gray-500">
              Total: ₦{(price * quantity).toLocaleString()}
            </p>
          )}
        </div>

        {/* Action Buttons - Only for recipient when pending */}
        {isRecipient && isPending && (
          <div className="px-4 pb-3 flex gap-2">
            <button
              onClick={() => handleAction('accept', onAccept)}
              disabled={actionLoading !== null}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {actionLoading === 'accept' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Accept
            </button>
            <button
              onClick={() => onCounter?.(offerId)}
              disabled={actionLoading !== null}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              <ArrowRight className="w-4 h-4" />
              Counter
            </button>
            <button
              onClick={() => handleAction('decline', onDecline)}
              disabled={actionLoading !== null}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {actionLoading === 'decline' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
              Decline
            </button>
          </div>
        )}

        {/* Withdraw - Only for initiator when pending */}
        {isInitiator && isPending && (
          <div className="px-4 pb-3">
            <button
              onClick={() => handleAction('withdraw', onWithdraw)}
              disabled={actionLoading !== null}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {actionLoading === 'withdraw' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              Withdraw Offer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferCard;
