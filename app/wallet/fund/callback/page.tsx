import { Suspense } from 'react';
import FundCallbackContent from '@/app/components/FundCallbackContent';

export default function FundCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Processing payment...</p>
          </div>
        </div>
      </div>
    }>
      <FundCallbackContent />
    </Suspense>
  );
}