'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletBalance, useTransactions } from '../lib/hooks/useTransactions';
import type { WalletTransaction } from '../lib/api/walletApi';
import {
  ChevronLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  CreditCard,
  Lock,
  Unlock,
  RotateCcw,
  Ban,
  ChevronDown,
  Filter,
  X,
} from 'lucide-react';
import BottomNav from '../components/Sidebar';

// ─── Constants ───

const TYPE_FILTERS = [
  { value: '', label: 'All' },
  { value: 'funding', label: 'Funding' },
  { value: 'payment', label: 'Payment' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'refund', label: 'Refund' },
  { value: 'escrow_lock', label: 'Escrow Lock' },
  { value: 'escrow_release', label: 'Escrow Release' },
];

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  completed: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400' },
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  failed: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
  reversed: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
};

// ─── Helpers ───

function getTypeIcon(type: string) {
  switch (type) {
    case 'funding': return CreditCard;
    case 'payment': return Receipt;
    case 'withdrawal': return ArrowUpRight;
    case 'refund': return RotateCcw;
    case 'escrow_lock': return Lock;
    case 'escrow_release': return Unlock;
    case 'platform_fee': return Ban;
    case 'reversal': return RotateCcw;
    default: return Receipt;
  }
}

function getTypeLabel(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }
  if (diffDays === 1) {
    return `Yesterday, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }
  if (diffDays < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Transaction Item ───

function TransactionItem({ txn, onClick }: { txn: WalletTransaction; onClick: () => void }) {
  const Icon = getTypeIcon(txn.type);
  const isCredit = txn.direction === 'credit';
  const statusConf = STATUS_CONFIG[txn.status] || STATUS_CONFIG.pending;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-gray-50 transition-all duration-200 group"
    >
      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${
        isCredit
          ? 'bg-green-50 text-green-600 group-hover:bg-green-100'
          : 'bg-red-50 text-red-500 group-hover:bg-red-100'
      }`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900 truncate">{getTypeLabel(txn.type)}</p>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusConf.bg} ${statusConf.text}`}>
            <span className={`w-1 h-1 rounded-full ${statusConf.dot}`} />
            {txn.status}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          {txn.description || txn.counterparty?.name || txn.reference}
        </p>
      </div>

      {/* Amount + Date */}
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
          {isCredit ? '+' : '-'}{'\u20A6'}{txn.amount.toLocaleString()}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(txn.createdAt)}</p>
      </div>
    </button>
  );
}

// ─── Loading Skeleton ───

function TransactionSkeleton() {
  return (
    <div className="divide-y divide-gray-100">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3.5 px-4 py-3.5">
          <div className="w-11 h-11 rounded-xl bg-gray-100 animate-pulse shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-gray-100 rounded-lg w-28 mb-2 animate-pulse" />
            <div className="h-3 bg-gray-100 rounded-lg w-40 animate-pulse" />
          </div>
          <div className="text-right">
            <div className="h-4 bg-gray-100 rounded-lg w-20 mb-2 animate-pulse ml-auto" />
            <div className="h-3 bg-gray-100 rounded-lg w-16 animate-pulse ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ───

function EmptyState({ hasFilter, onClear }: { hasFilter: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Receipt className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        {hasFilter ? 'No matching transactions' : 'No transactions yet'}
      </h3>
      <p className="text-sm text-gray-500 max-w-xs">
        {hasFilter
          ? 'Try changing your filters to see more results.'
          : 'Your transaction history will appear here once you make your first transaction.'}
      </p>
      {hasFilter && (
        <button
          onClick={onClear}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-xl text-sm font-semibold transition-colors hover:shadow-md"
        >
          <X className="w-4 h-4" />
          Clear Filters
        </button>
      )}
    </div>
  );
}

// ─── Transaction Detail Sheet ───

function TransactionDetail({ txn, onClose }: { txn: WalletTransaction; onClose: () => void }) {
  const Icon = getTypeIcon(txn.type);
  const isCredit = txn.direction === 'credit';
  const statusConf = STATUS_CONFIG[txn.status] || STATUS_CONFIG.pending;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 pb-8 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5 sm:hidden" />

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
            isCredit ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
          }`}>
            <Icon className="w-7 h-7" />
          </div>
          <p className={`text-3xl font-bold ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
            {isCredit ? '+' : '-'}{'\u20A6'}{txn.amount.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">{getTypeLabel(txn.type)}</p>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mt-2 ${statusConf.bg} ${statusConf.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
            {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
          </span>
        </div>

        {/* Details rows */}
        <div className="space-y-0 divide-y divide-gray-100">
          {[
            { label: 'Reference', value: txn.reference },
            { label: 'Description', value: txn.description || '—' },
            txn.counterparty ? { label: 'Counterparty', value: txn.counterparty.name } : null,
            txn.order ? { label: 'Order', value: `#${txn.order.orderNumber}` } : null,
            { label: 'Balance Before', value: `\u20A6${txn.balanceBefore.toLocaleString()}` },
            { label: 'Balance After', value: `\u20A6${txn.balanceAfter.toLocaleString()}` },
            { label: 'Date', value: new Date(txn.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) },
          ]
            .filter(Boolean)
            .map((row) => (
              <div key={row!.label} className="flex items-center justify-between py-3">
                <span className="text-xs text-gray-500 font-medium">{row!.label}</span>
                <span className="text-sm text-gray-900 font-medium text-right max-w-[60%] truncate">{row!.value}</span>
              </div>
            ))}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="mt-5 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-sm font-semibold transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───

export default function TransactionsPage() {
  const router = useRouter();
  const { balance, loading: balanceLoading } = useWalletBalance();
  const {
    transactions,
    pagination,
    loading,
    loadingMore,
    error,
    filters,
    fetchTransactions,
    loadMore,
    applyFilters,
  } = useTransactions({ page: 1, limit: 15 });

  const [selectedTxn, setSelectedTxn] = useState<WalletTransaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const activeType = filters.type || '';
  const activeDirection = filters.direction || '';
  const hasActiveFilters = !!activeType || !!activeDirection;

  const clearFilters = () => {
    applyFilters({ type: undefined, direction: undefined, status: undefined });
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 shrink-0">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-gray-900 ml-2">Transactions</h1>
        <div className="flex-1" />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-xl transition-all duration-200 ${
            showFilters || hasActiveFilters
              ? 'text-yellow-600 bg-yellow-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
          aria-label="Filter"
        >
          <Filter className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Wallet Summary */}
        {!balanceLoading && balance && (
          <div className="px-4 pt-4">
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-lg">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-yellow-400/10" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-yellow-400/5" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Wallet Balance</span>
                </div>
                <p className="text-3xl font-bold tracking-tight">{'\u20A6'}{balance.balance.toLocaleString()}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 bg-white/10 rounded-xl px-3 py-2">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Income</p>
                    <p className="text-sm font-semibold text-green-400">{'\u20A6'}{balance.totalFunded.toLocaleString()}</p>
                  </div>
                  <div className="flex-1 bg-white/10 rounded-xl px-3 py-2">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Spent</p>
                    <p className="text-sm font-semibold text-red-400">{'\u20A6'}{balance.totalSpent.toLocaleString()}</p>
                  </div>
                  <div className="flex-1 bg-white/10 rounded-xl px-3 py-2">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Refunds</p>
                    <p className="text-sm font-semibold">{'\u20A6'}{balance.totalRefunded.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Panel */}
        {showFilters && (
          <div className="px-4 mt-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              {/* Direction toggles */}
              <p className="text-[11px] text-gray-500 uppercase tracking-wide font-medium mb-2">Direction</p>
              <div className="flex gap-2 mb-4">
                {[
                  { value: '', label: 'All', icon: null },
                  { value: 'credit', label: 'Money In', icon: ArrowDownLeft },
                  { value: 'debit', label: 'Money Out', icon: ArrowUpRight },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => applyFilters({ direction: opt.value || undefined })}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      activeDirection === opt.value
                        ? 'bg-yellow-400 text-gray-900 shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.icon && <opt.icon className="w-3.5 h-3.5" />}
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Type filter chips */}
              <p className="text-[11px] text-gray-500 uppercase tracking-wide font-medium mb-2">Type</p>
              <div className="flex flex-wrap gap-2">
                {TYPE_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => applyFilters({ type: f.value || undefined })}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      activeType === f.value
                        ? 'bg-yellow-400 text-gray-900 shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Clear */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-3 text-xs font-medium text-gray-500 hover:text-gray-700 underline underline-offset-2"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Active filter pills (when panel is closed) */}
        {!showFilters && hasActiveFilters && (
          <div className="px-4 mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Filters:</span>
            {activeType && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-semibold border border-yellow-200">
                {getTypeLabel(activeType)}
                <button onClick={() => applyFilters({ type: undefined })} className="hover:text-yellow-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeDirection && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-semibold border border-yellow-200">
                {activeDirection === 'credit' ? 'Money In' : 'Money Out'}
                <button onClick={() => applyFilters({ direction: undefined })} className="hover:text-yellow-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button onClick={clearFilters} className="text-[11px] text-gray-400 hover:text-gray-600 underline underline-offset-2">
              Clear
            </button>
          </div>
        )}

        {/* Content */}
        {loading && transactions.length === 0 ? (
          <div className="mt-3">
            <TransactionSkeleton />
          </div>
        ) : error && transactions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-base font-semibold text-gray-900 mb-1">Failed to load transactions</p>
              <p className="text-sm text-gray-500 mb-5">{error}</p>
              <button
                onClick={fetchTransactions}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-xl text-sm font-semibold transition-colors hover:shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState hasFilter={hasActiveFilters} onClear={clearFilters} />
        ) : (
          <>
            {/* Transaction count */}
            <div className="px-4 mt-4 mb-1">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">
                {pagination?.totalDocs ?? transactions.length} transaction{(pagination?.totalDocs ?? transactions.length) !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Transaction list */}
            <div className="bg-white border-y border-gray-200 divide-y divide-gray-100">
              {transactions.map((txn) => (
                <TransactionItem
                  key={txn._id}
                  txn={txn}
                  onClick={() => setSelectedTxn(txn)}
                />
              ))}
            </div>

            {/* Load More */}
            {pagination?.hasNextPage && (
              <div className="px-4 py-4 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:border-yellow-300 hover:shadow-md text-gray-700 rounded-2xl text-sm font-semibold transition-all duration-300 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Load More
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Transaction Detail Sheet */}
      {selectedTxn && (
        <TransactionDetail txn={selectedTxn} onClose={() => setSelectedTxn(null)} />
      )}

      {/* <BottomNav /> */}
    </div>
  );
}
