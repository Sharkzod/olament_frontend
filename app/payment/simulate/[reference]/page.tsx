'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircle, XCircle, CreditCard, Loader2 } from 'lucide-react';

export default function SimulatePaymentPage() {
  const router = useRouter();
  const params = useParams();
  const reference = params.reference as string;
  const [processing, setProcessing] = useState(false);

  const handleSimulate = (success: boolean) => {
    setProcessing(true);

    setTimeout(() => {
      if (success) {
        router.push(
          `/wallet/fund/callback?transaction_id=sim_${Date.now()}&tx_ref=${reference}&status=successful`
        );
      } else {
        router.push(
          `/wallet/fund/callback?status=cancelled`
        );
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg p-8 max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-7 h-7 text-orange-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Payment Simulation</h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">DEV MODE ONLY</p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <p className="text-xs text-gray-500 mb-1">Transaction Reference</p>
          <p className="text-sm font-mono font-semibold text-gray-700 break-all">{reference}</p>
        </div>

        {processing ? (
          <div className="text-center py-4">
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Processing payment...</p>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => handleSimulate(false)}
              className="flex-1 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Fail
            </button>
            <button
              onClick={() => handleSimulate(true)}
              className="flex-1 py-3.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-2xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Pay
            </button>
          </div>
        )}
      </div>
    </div>
  );
}