'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '../lib/hooks/useProfile';
import { useCustomerDashboard, useVendorDashboard } from '../lib/hooks/useDashboard';
import {
  AlertCircle,
  Loader2,
  Wallet,
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Heart,
  BarChart3,
  Plus,
  Store,
  Edit2,
  LogOut,
  ChevronRight,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Box,
  RefreshCw,
} from 'lucide-react';
import BottomNav from '../components/Sidebar';

// ─── Stat Card ───

function StatCard({ icon: Icon, iconBg, label, value }: {
  icon: React.ElementType;
  iconBg: string;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-3.5 flex items-center gap-3 hover:shadow-md hover:border-yellow-200 transition-all duration-300">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-gray-500 uppercase tracking-wide font-medium truncate">{label}</p>
        <p className="text-[15px] font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─── Status Badge ───

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; dot: string }> = {
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-400' },
    processing: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
    shipped: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400' },
    delivered: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400' },
    completed: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
  };
  const c = config[status] || { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

// ─── Section Header ───

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      {action && (
        <button onClick={onAction} className="text-xs font-semibold text-yellow-600 hover:text-yellow-700 transition-colors">
          {action}
        </button>
      )}
    </div>
  );
}

// ─── Order Row ───

function OrderRow({ orderNumber, subtitle, amount, status, onClick }: {
  orderNumber: string;
  subtitle: string;
  amount: number;
  status: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3 hover:shadow-md hover:border-yellow-200 transition-all duration-300 group"
    >
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-yellow-50 transition-colors duration-300">
        <Package className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 transition-colors duration-300" />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-sm font-semibold text-gray-900">#{orderNumber}</p>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="text-right">
          <p className="text-sm font-bold text-gray-900">{'\u20A6'}{amount.toLocaleString()}</p>
          <StatusBadge status={status} />
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-yellow-500 transition-colors duration-300" />
      </div>
    </button>
  );
}

// ─── Quick Action Button ───

function QuickActionBtn({ icon: Icon, label, iconBg, onClick }: {
  icon: React.ElementType;
  label: string;
  iconBg: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-200 p-3.5 flex flex-col items-center gap-2.5 hover:shadow-md hover:border-yellow-300 transition-all duration-300 group"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
    </button>
  );
}

// ─── Customer Dashboard View ───

function CustomerDashboardView() {
  const router = useRouter();
  const { dashboard, loading, error, fetchDashboard } = useCustomerDashboard();

  if (loading && !dashboard) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-base font-semibold text-gray-900 mb-1">Something went wrong</p>
          <p className="text-sm text-gray-500 mb-5">{error}</p>
          <button
            onClick={fetchDashboard}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-xl text-sm font-semibold transition-colors hover:shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const { profile, orderSummary, wallet, activeOrders, recentOrders, wishlistCount } = dashboard;

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Profile Card */}
      <div className="bg-white px-4 pt-5 pb-5">
        <div className="flex items-center gap-4">
          {profile.avatar && profile.avatar !== 'default-avatar.png' ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-[60px] h-[60px] rounded-2xl object-cover ring-2 ring-gray-100 shadow-sm"
            />
          ) : (
            <div className="w-[60px] h-[60px] bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-sm ring-2 ring-yellow-200">
              {profile.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 truncate">{profile.name}</h2>
              <button
                onClick={() => router.push('/profile/edit')}
                className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200 shrink-0"
                aria-label="Edit Profile"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500 truncate">{profile.email}</p>
            <p className="text-[11px] text-gray-400 mt-1 font-medium">
              Member since {new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="px-4 mt-3">
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-lg">
          {/* Decorative circles */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-yellow-400/10" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-yellow-400/5" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Wallet Balance</span>
            </div>
            <p className="text-3xl font-bold tracking-tight">{'\u20A6'}{wallet.balance.toLocaleString()}</p>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1 bg-white/10 rounded-xl px-3 py-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Available</p>
                <p className="text-sm font-semibold">{'\u20A6'}{wallet.availableBalance.toLocaleString()}</p>
              </div>
              <div className="flex-1 bg-white/10 rounded-xl px-3 py-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total Spent</p>
                <p className="text-sm font-semibold">{'\u20A6'}{wallet.totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary Grid */}
      <div className="px-4 mt-5">
        <SectionHeader title="Order Summary" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <StatCard icon={Clock} iconBg="bg-yellow-50 text-yellow-600" label="Pending" value={orderSummary.pendingOrders} />
          <StatCard icon={Loader2} iconBg="bg-blue-50 text-blue-600" label="Processing" value={orderSummary.processingOrders} />
          <StatCard icon={Truck} iconBg="bg-purple-50 text-purple-600" label="Shipped" value={orderSummary.shippedOrders} />
          <StatCard icon={Package} iconBg="bg-indigo-50 text-indigo-600" label="Delivered" value={orderSummary.deliveredOrders} />
          <StatCard icon={CheckCircle} iconBg="bg-green-50 text-green-600" label="Completed" value={orderSummary.completedOrders} />
          <StatCard icon={XCircle} iconBg="bg-red-50 text-red-600" label="Cancelled" value={orderSummary.cancelledOrders} />
          <StatCard icon={ShoppingBag} iconBg="bg-gray-100 text-gray-600" label="Total Orders" value={orderSummary.totalOrders} />
          <StatCard icon={DollarSign} iconBg="bg-emerald-50 text-emerald-600" label="Total Spent" value={`\u20A6${orderSummary.totalSpent.toLocaleString()}`} />
        </div>
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="px-4 mt-6">
          <SectionHeader title="Active Orders" />
          <div className="space-y-2.5">
            {activeOrders.map((order) => (
              <OrderRow
                key={order._id}
                orderNumber={order.orderNumber}
                subtitle={order.vendor?.name || 'Vendor'}
                amount={order.totalAmount}
                status={order.status}
                onClick={() => router.push(`/orders/${order._id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="px-4 mt-6">
          <SectionHeader title="Recent Orders" action="View All" onAction={() => router.push('/orders')} />
          <div className="space-y-2.5">
            {recentOrders.slice(0, 5).map((order) => (
              <OrderRow
                key={order._id}
                orderNumber={order.orderNumber}
                subtitle={new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                amount={order.totalAmount}
                status={order.status}
                onClick={() => router.push(`/orders/${order._id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 mt-6 mb-4">
        <SectionHeader title="Quick Actions" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <QuickActionBtn icon={ShoppingBag} label="Orders" iconBg="bg-blue-50 text-blue-600" onClick={() => router.push('/orders')} />
          <QuickActionBtn icon={DollarSign} label="Transactions" iconBg="bg-green-50 text-green-600" onClick={() => router.push('/transactions')} />
          <QuickActionBtn icon={Heart} label="Wishlist" iconBg="bg-pink-50 text-pink-600" onClick={() => router.push('/favorites')} />
          <QuickActionBtn icon={Store} label="Explore" iconBg="bg-yellow-50 text-yellow-600" onClick={() => router.push('/categories')} />
        </div>
      </div>
    </div>
  );
}

// ─── Vendor Dashboard View ───

function VendorDashboardView({ profile }: { profile: any }) {
  const router = useRouter();
  const { dashboard, loading, error, fetchDashboard } = useVendorDashboard();

  if (loading && !dashboard) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading vendor dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-base font-semibold text-gray-900 mb-1">Something went wrong</p>
          <p className="text-sm text-gray-500 mb-5">{error}</p>
          <button
            onClick={fetchDashboard}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-xl text-sm font-semibold transition-colors hover:shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const { stats, recentOrders, lowStockProducts } = dashboard;

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Profile Card */}
      <div className="bg-white px-4 pt-5 pb-5">
        <div className="flex items-center gap-4">
          {profile?.avatar && profile.avatar !== 'default-avatar.png' ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-[60px] h-[60px] rounded-2xl object-cover ring-2 ring-gray-100 shadow-sm"
            />
          ) : (
            <div className="w-[60px] h-[60px] bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-sm ring-2 ring-yellow-200">
              {profile?.name?.charAt(0).toUpperCase() || 'V'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 truncate">{profile?.name || 'Vendor'}</h2>
              <button
                onClick={() => router.push('/profile/edit')}
                className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200 shrink-0"
                aria-label="Edit Profile"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500 truncate">{profile?.email}</p>
            {profile?.createdAt && (
              <p className="text-[11px] text-gray-400 mt-1 font-medium">
                Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="px-4 mt-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-lg">
          {/* Decorative circles */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-green-400/10" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-green-400/5" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-green-400" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Vendor Wallet</span>
            </div>
            <p className="text-3xl font-bold tracking-tight">{'\u20A6'}{stats.wallet.balance.toLocaleString()}</p>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 bg-white/10 rounded-xl px-3 py-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Escrow</p>
                <p className="text-sm font-semibold">{'\u20A6'}{stats.wallet.escrowBalance.toLocaleString()}</p>
              </div>
              <div className="flex-1 bg-white/10 rounded-xl px-3 py-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Available</p>
                <p className="text-sm font-semibold">{'\u20A6'}{stats.wallet.availableBalance.toLocaleString()}</p>
              </div>
              <div className="flex-1 bg-white/10 rounded-xl px-3 py-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Earned</p>
                <p className="text-sm font-semibold">{'\u20A6'}{stats.wallet.totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Stats Grid */}
      <div className="px-4 mt-5">
        <SectionHeader title="Order Stats" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <StatCard icon={ShoppingBag} iconBg="bg-blue-50 text-blue-600" label="Orders" value={stats.orders.totalOrders} />
          <StatCard icon={DollarSign} iconBg="bg-green-50 text-green-600" label="Revenue" value={`\u20A6${stats.orders.totalRevenue.toLocaleString()}`} />
          <StatCard icon={Clock} iconBg="bg-yellow-50 text-yellow-600" label="Pending" value={stats.orders.pendingOrders} />
          <StatCard icon={Truck} iconBg="bg-purple-50 text-purple-600" label="Shipping" value={stats.orders.shippingOrders} />
          <StatCard icon={Package} iconBg="bg-indigo-50 text-indigo-600" label="Delivered" value={stats.orders.deliveredOrders} />
          <StatCard icon={CheckCircle} iconBg="bg-emerald-50 text-emerald-600" label="Completed" value={stats.orders.completedOrders} />
        </div>
      </div>

      {/* Product Stats */}
      <div className="px-4 mt-5">
        <SectionHeader title="Product Stats" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatCard icon={Box} iconBg="bg-blue-50 text-blue-600" label="Products" value={stats.products.totalProducts} />
          <StatCard icon={Eye} iconBg="bg-gray-100 text-gray-600" label="Views" value={stats.products.totalViews.toLocaleString()} />
          <StatCard icon={Heart} iconBg="bg-pink-50 text-pink-600" label="Favorites" value={stats.products.totalFavorites} />
          <StatCard icon={TrendingUp} iconBg="bg-emerald-50 text-emerald-600" label="Inventory" value={`\u20A6${stats.products.inventoryValue.toLocaleString()}`} />
        </div>
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="px-4 mt-6">
          <SectionHeader title="Recent Orders" action="View All" onAction={() => router.push('/orders')} />
          <div className="space-y-2.5">
            {recentOrders.slice(0, 5).map((order) => (
              <OrderRow
                key={order._id}
                orderNumber={order.orderNumber}
                subtitle={order.customer?.name || 'Customer'}
                amount={order.totalAmount}
                status={order.status}
                onClick={() => router.push(`/orders/${order._id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="px-4 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Low Stock Alerts</h3>
          </div>
          <div className="space-y-2">
            {lowStockProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl border border-orange-200 p-4 flex items-center justify-between hover:shadow-md transition-all duration-300"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{'\u20A6'}{product.price.toLocaleString()}</p>
                </div>
                <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-3 py-1.5 rounded-xl shrink-0 border border-orange-200">
                  {product.quantity} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 mt-6 mb-4">
        <SectionHeader title="Quick Actions" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <QuickActionBtn icon={Plus} label="Product" iconBg="bg-green-50 text-green-600" onClick={() => router.push('/vendor/products/new')} />
          <QuickActionBtn icon={ShoppingBag} label="Orders" iconBg="bg-blue-50 text-blue-600" onClick={() => router.push('/orders')} />
          <QuickActionBtn icon={BarChart3} label="Analytics" iconBg="bg-purple-50 text-purple-600" onClick={() => router.push('/vendor/analytics')} />
          <QuickActionBtn icon={Store} label="Shops" iconBg="bg-indigo-50 text-indigo-600" onClick={() => router.push('/shops')} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Account Page ───

export default function AccountPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { profile, loading: profileLoading, getProfile } = useProfile();

  useEffect(() => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('accessToken')
      : null;

    if (!token) {
      router.push('/login');
      return;
    }
    setIsCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    if (!profile && !profileLoading && !isCheckingAuth) {
      getProfile();
    }
  }, [profile, profileLoading, isCheckingAuth, getProfile]);

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

  if (isCheckingAuth || (profileLoading && !profile)) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">{isCheckingAuth ? 'Checking authentication...' : 'Loading...'}</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-base font-semibold text-gray-900 mb-1">Unable to load account</p>
            <p className="text-sm text-gray-500 mb-5">Please try again</p>
            <button
              onClick={() => getProfile()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-xl text-sm font-semibold transition-colors hover:shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const isVendor = profile.role === 'vendor';

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
        <h1 className="text-base font-bold text-gray-900">
          {isVendor ? 'Vendor Dashboard' : 'My Account'}
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-medium transition-all duration-200"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      {isVendor ? <VendorDashboardView profile={profile} /> : <CustomerDashboardView />}

      <BottomNav />
    </div>
  );
}
