'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { walletApi } from '../lib/api/walletApi';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function FundCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('');
  const [amountCredited, setAmountCredited] = useState(0);

  useEffect(() => {
    const verify = async () => {
      const transactionId = searchParams.get('transaction_id');
      const txRef = searchParams.get('tx_ref');
      const flwStatus = searchParams.get('status');

      if (flwStatus === 'cancelled') {
        setStatus('failed');
        setMessage('Payment was cancelled');
        return;
      }

      if (!transactionId || !txRef) {
        setStatus('failed');
        setMessage('Missing payment information');
        return;
      }

      const result = await walletApi.verifyFunding(transactionId, txRef);

      if (result.success && result.data) {
        setStatus('success');
        setAmountCredited(result.data.amountCredited);
        setMessage(result.data.alreadyProcessed ? 'Payment was already processed' : 'Wallet funded successfully');
      } else {
        setStatus('failed');
        setMessage(result.error || 'Payment verification failed');
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg p-8 max-w-sm w-full text-center">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-16 h-16 text-yellow-400 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-sm text-gray-500">Please wait while we confirm your payment...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Payment Successful</h2>
            <p className="text-3xl font-bold text-gray-900 mb-1">&#x20A6;{amountCredited.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            <button
              onClick={() => router.push('/profile')}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-2xl text-sm font-bold transition-colors"
            >
              Back to Wallet
            </button>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/profile')}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-sm font-bold transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-2xl text-sm font-bold transition-colors"
              >
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}