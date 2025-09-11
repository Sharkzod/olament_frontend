'use client'
import React, { useMemo, useState, useEffect } from 'react'
import {
  MapPin,
  Bell,
  Search,
  Bike,
  Store,
  Package,
  ShoppingCart,
  Star,
  ChevronRight,
  Filter,
  Map,
  Clock,
  Heart,
  Menu,
  X,
  User,
  Zap,
  TrendingUp,
  Plus,
  ArrowRight,
} from 'lucide-react'

const markets = [
  {
    id: 1,
    name: 'Balogun Market',
    distance: '3 km',
    shops: 150,
    rating: 4.2,
    deliveryTime: '15-30 min',
    cover: '/she.jpg',
    isFavorite: false,
    isOpen: true,
    discount: '15% OFF',
  },
  {
    id: 2,
    name: 'Mile 12 Market',
    distance: '1 km',
    shops: 200,
    rating: 4.5,
    deliveryTime: '10-25 min',
    cover: '/banana.jpg',
    isFavorite: true,
    isOpen: true,
    discount: null,
  },
  {
    id: 3,
    name: 'Computer Village',
    distance: '5.8 km',
    shops: 300,
    rating: 4.3,
    deliveryTime: '25-40 min',
    cover: '/laptop.jpg',
    isFavorite: false,
    isOpen: true,
    discount: '20% OFF',
  },
  {
    id: 4,
    name: 'Oshodi Market',
    distance: '2.5 km',
    shops: 180,
    rating: 4.0,
    deliveryTime: '12-28 min',
    cover: '/wallet.jpg',
    isFavorite: false,
    isOpen: false,
    discount: null,
  },
]

const categories = [
  { id: 'groceries', name: 'Groceries', icon: '🛒', color: 'bg-green-500/20 text-green-400' },
  { id: 'electronics', name: 'Electronics', icon: '📱', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'clothing', name: 'Clothing', icon: '👕', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'home', name: 'Home', icon: '🏠', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'beauty', name: 'Beauty', icon: '💄', color: 'bg-pink-500/20 text-pink-400' },
  { id: 'sports', name: 'Sports', icon: '⚽', color: 'bg-red-500/20 text-red-400' },
]

const quickStats = [
  { label: 'Orders', value: '3', icon: Package, color: 'text-yellow-400' },
  { label: 'Saved', value: '24', icon: Heart, color: 'text-red-400' },
  { label: 'Spent', value: '₦45k', icon: TrendingUp, color: 'text-green-400' },
]

const StarRow: React.FC<{ rating: number; size?: 'sm' | 'md' }> = ({ rating, size = 'sm' }) => {
  const stars = useMemo(() => Array.from({ length: 5 }), [])
  const starSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {stars.map((_, i) => (
          <Star
            key={i}
            className={`${starSize} ${i + 1 <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`}
          />
        ))}
      </div>
      <span className={`${textSize} text-gray-400 font-medium ml-1`}>{rating.toFixed(1)}</span>
    </div>
  )
}

const SegmentedTabs: React.FC<{
  value: string
  onChange: (v: string) => void
}> = ({ value, onChange }) => {
  const tabs = [
    { id: 'products', label: 'Products', icon: ShoppingCart, shortLabel: 'Products' },
    { id: 'shops', label: 'Shops', icon: Store, shortLabel: 'Shops' },
    { id: 'markets', label: 'Markets', icon: Package, shortLabel: 'Markets' },
  ] as const

  return (
    <div className="grid grid-cols-3 rounded-xl bg-gray-800/50 border border-gray-700/50 p-1">
      {tabs.map((t) => {
        const ActiveIcon = t.icon
        const active = value === t.id
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
              active 
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <ActiveIcon className="h-4 w-4 flex-shrink-0" />
            <span className="hidden xs:inline text-xs sm:text-sm">{t.shortLabel}</span>
          </button>
        )
      })}
    </div>
  )
}

const OlamentDashboard: React.FC = () => {
  const [tab, setTab] = useState<'products' | 'shops' | 'markets' | 'profile'>('markets')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredMarkets, setFilteredMarkets] = useState(markets)
  const [activeCategory, setActiveCategory] = useState('all')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    let results = markets
    
    if (searchQuery) {
      results = results.filter(market => 
        market.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    if (activeCategory !== 'all') {
      results = results.filter(market => market.rating >= 4.0)
    }
    
    setFilteredMarkets(results)
  }, [searchQuery, activeCategory])

  const toggleFavorite = (marketId: number) => {
    setFilteredMarkets(prevMarkets => 
      prevMarkets.map(market => 
        market.id === marketId 
          ? { ...market, isFavorite: !market.isFavorite } 
          : market
      )
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white w-full">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-gray-700/50 bg-gray-900/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              className="lg:hidden text-gray-300 hover:text-white transition-colors p-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-lg">
                <div className="text-gray-900 font-bold text-sm sm:text-lg">O</div>
              </div>
              <div className="hidden xs:block">
                <div className="text-sm sm:text-lg font-bold leading-tight">Olament</div>
                <div className="text-xs leading-none text-gray-400 hidden sm:block">Your local market, online</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-gray-800/50 border border-gray-700/50 px-3 py-1.5 text-xs sm:text-sm text-gray-300">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" /> 
              <span className="font-medium">Lagos</span>
            </div>
            <button className="relative rounded-lg sm:rounded-xl p-2 text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all border border-gray-700/50">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute right-1 top-1 sm:right-1.5 sm:top-1.5 inline-block h-2 w-2 rounded-full bg-yellow-400" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0 p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            {quickStats.map((stat, idx) => (
              <div key={idx} className="rounded-xl bg-gray-800/50 border border-gray-700/50 p-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg bg-gray-700/50 p-2 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Categories */}
          <div className="rounded-xl bg-gray-800/50 border border-gray-700/50 p-5 mb-6">
            <h3 className="font-bold mb-4 text-white">Categories</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setActiveCategory('all')}
                  className={`w-full text-left rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    activeCategory === 'all' 
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 shadow-lg' 
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  All Categories
                </button>
              </li>
              {categories.map(category => (
                <li key={category.id}>
                  <button 
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-3 transition-all ${
                      activeCategory === category.id 
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 shadow-lg' 
                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Quick Actions */}
          <div className="rounded-xl bg-gray-800/50 border border-gray-700/50 p-5">
            <h3 className="font-bold mb-4 text-white">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { icon: Package, label: 'Track Order' },
                { icon: Store, label: 'My Shops' },
                { icon: Heart, label: 'Favorites' }
              ].map((action, idx) => (
                <button key={idx} className="w-full text-left rounded-xl bg-gray-700/50 border border-gray-600/50 px-4 py-3 text-sm flex items-center gap-3 hover:bg-gray-600/50 transition-all group">
                  <action.icon className="h-5 w-5 text-yellow-400" />
                  <span className="font-medium">{action.label}</span>
                  <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile menu overlay */}
        {isMenuOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-gray-900/90 backdrop-blur-sm lg:hidden" onClick={() => setIsMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-gray-900 border-r border-gray-700/50 lg:hidden overflow-y-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-lg">
                      <div className="text-gray-900 font-bold text-lg">O</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold leading-tight">Olament</div>
                      <div className="text-xs leading-none text-gray-400">Your local market</div>
                    </div>
                  </div>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-800 rounded-xl">
                    <X className="h-6 w-6 text-gray-300" />
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="mb-6">
                  <h3 className="font-bold mb-3 text-white">Quick Stats</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {quickStats.map((stat, idx) => (
                      <div key={idx} className="rounded-xl bg-gray-800/50 border border-gray-700/50 p-3">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-lg bg-gray-700/50 p-2 ${stat.color}`}>
                            <stat.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-bold">{stat.value}</div>
                            <div className="text-xs text-gray-400">{stat.label}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Categories */}
                <div className="mb-6">
                  <h3 className="font-bold mb-3 text-white">Categories</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => {setActiveCategory('all'); setIsMenuOpen(false);}}
                      className={`w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        activeCategory === 'all' 
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900' 
                          : 'bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/50'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => {setActiveCategory(category.id); setIsMenuOpen(false);}}
                        className={`w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium flex items-center gap-2 transition-all ${
                          activeCategory === category.id 
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900' 
                            : 'bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/50'
                        }`}
                      >
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div>
                  <h3 className="font-bold mb-3 text-white">Quick Actions</h3>
                  <div className="space-y-2">
                    {[
                      { icon: Package, label: 'Track Order' },
                      { icon: Store, label: 'My Shops' },
                      { icon: Heart, label: 'Favorites' }
                    ].map((action, idx) => (
                      <button key={idx} className="w-full text-left rounded-xl bg-gray-800/50 border border-gray-700/50 px-3 py-2.5 text-sm flex items-center gap-3 hover:bg-gray-700/50 transition-all">
                        <action.icon className="h-4 w-4 text-yellow-400" />
                        <span className="font-medium text-gray-300">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 px-3 pb-20 sm:px-4 lg:px-0 lg:pt-6 lg:pr-6">
          {/* Tabs */}
          <div className="mt-3 lg:mt-0">
            <SegmentedTabs value={tab} onChange={(v) => setTab(v as 'products' | 'shops' | 'markets')} />
          </div>

          {/* Search and Filter */}
          <div className="mt-4 flex gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search markets..."
                className="w-full rounded-xl border border-gray-700/50 bg-gray-800/50 py-3 pl-10 pr-3 text-sm text-white placeholder:text-gray-500 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all"
              />
            </div>
            <button className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-3 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all">
              <Filter className="h-4 w-4" />
            </button>
          </div>

          {/* Categories for mobile */}
          <div className="mt-4 lg:hidden">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all flex-shrink-0 ${
                  activeCategory === 'all' 
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900' 
                    : 'bg-gray-800/50 border border-gray-700/50 text-gray-300'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold flex items-center gap-1 transition-all flex-shrink-0 ${
                    activeCategory === category.id 
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900' 
                      : 'bg-gray-800/50 border border-gray-700/50 text-gray-300'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span className="hidden xs:inline">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Promo banner */}
          <div className="mt-4 rounded-xl bg-gradient-to-r from-yellow-500/20 via-yellow-400/20 to-orange-500/20 border border-yellow-400/30 p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="rounded-lg bg-yellow-400/20 p-2 sm:p-3">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm sm:text-lg font-bold leading-tight text-white mb-1">
                  Browse — Order — We deliver
                </div>
                <div className="text-xs sm:text-sm text-gray-300 mb-3">
                  Local markets to your door in minutes
                </div>
                <button className="rounded-lg bg-yellow-400 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-gray-900 hover:bg-yellow-300 transition-colors">
                  Start Shopping
                </button>
              </div>
            </div>
          </div>

          {/* Markets near you */}
          <section className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-white">Markets near you</h2>
              <button className="text-xs sm:text-sm font-semibold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 transition-colors">
                View all <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {filteredMarkets.length > 0 ? (
                filteredMarkets.map((m) => (
                  <article
                    key={m.id}
                    className="overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300"
                  >
                    <div className="relative">
                      <div className="aspect-[4/3] w-full bg-gradient-to-br from-gray-700 to-gray-800 relative overflow-hidden">
                        <img
                          src={m.cover}
                          alt={m.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>
                      
                      {/* Status badges */}
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-1 sm:gap-2">
                        <div className={`rounded-md px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-semibold ${
                          m.isOpen 
                            ? 'bg-green-500/90 text-white' 
                            : 'bg-red-500/90 text-white'
                        }`}>
                          {m.isOpen ? 'Open' : 'Closed'}
                        </div>
                        {m.discount && (
                          <div className="rounded-md bg-yellow-400/90 px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-semibold text-gray-900">
                            {m.discount}
                          </div>
                        )}
                      </div>
                      
                      {/* Distance */}
                      <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 rounded-md bg-gray-900/80 px-2 py-1 text-xs font-medium text-white">
                        {m.distance} away
                      </div>
                      
                      {/* Favorite button */}
                      <button 
                        onClick={() => toggleFavorite(m.id)}
                        className="absolute top-2 sm:top-3 right-2 sm:right-3 rounded-full bg-gray-900/80 p-1.5 sm:p-2 hover:bg-gray-900 transition-colors"
                      >
                        <Heart 
                          className={`h-3 w-3 sm:h-4 sm:w-4 transition-colors ${
                            m.isFavorite ? 'fill-red-400 text-red-400' : 'text-white hover:text-red-400'
                          }`} 
                        />
                      </button>
                    </div>
                    
                    <div className="p-3 sm:p-4">
                      <div className="mb-3">
                        <div className="text-base sm:text-lg font-bold text-white mb-2">{m.name}</div>
                        <div className="flex items-center justify-between mb-2">
                          <StarRow rating={m.rating} size="sm" />
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {m.deliveryTime}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">{m.shops} shops available</div>
                      </div>
                      
                      <div className="flex gap-2 sm:gap-3">
                        <button className="flex-1 rounded-lg bg-gray-700/50 border border-gray-600/50 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold hover:bg-gray-600/50 transition-all">
                          View Shops
                        </button>
                        <button className="rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-400 p-2 sm:p-2.5 text-gray-900 hover:from-yellow-400 hover:to-yellow-300 transition-all">
                          <Map className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <div className="mb-3 text-4xl opacity-50">🔍</div>
                  <div className="text-base font-semibold text-gray-300 mb-1">No markets found</div>
                  <div className="text-sm text-gray-500">Try adjusting your search</div>
                </div>
              )}
            </div>
          </section>

          {/* Quick Actions for mobile */}
          <section className="mt-6 lg:hidden">
            <h2 className="mb-4 text-lg font-bold">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Package, label: 'Track Order', desc: 'Order status', color: 'text-yellow-400' },
                { icon: Store, label: 'My Shops', desc: 'Favorite stores', color: 'text-blue-400' },
                { icon: Heart, label: 'Wishlist', desc: 'Saved items', color: 'text-red-400' },
                { icon: User, label: 'Profile', desc: 'Account settings', color: 'text-purple-400' },
              ].map((action, idx) => (
                <button key={idx} className="rounded-xl bg-gray-800/50 border border-gray-700/50 p-3 sm:p-4 text-left hover:bg-gray-700/50 transition-all">
                  <div className={`mb-2 rounded-lg bg-gray-700/50 p-2 inline-block ${action.color}`}>
                    <action.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="font-semibold text-white text-sm mb-1">{action.label}</div>
                  <div className="text-xs text-gray-400">{action.desc}</div>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-700/50 bg-gray-900/95 backdrop-blur-xl px-4 py-2 lg:hidden">
        <div className="grid grid-cols-4 gap-1 text-xs">
          {[
            { id: 'products', icon: ShoppingCart, label: 'Products' },
            { id: 'shops', icon: Store, label: 'Shops' },
            { id: 'markets', icon: Package, label: 'Markets' },
            { id: 'profile', icon: User, label: 'Profile' },
          ].map((item) => {
            const isActive = tab === item.id || (item.id === 'profile' && tab === 'profile')
            return (
              <button 
                key={item.id}
                onClick={() => item.id !== 'profile' && setTab(item.id as 'products' | 'shops' | 'markets')}
                className={`flex flex-col items-center gap-1 font-semibold transition-all p-2 rounded-lg relative ${
                  isActive 
                    ? 'text-yellow-400 bg-yellow-400/10' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-xs leading-tight">{item.label}</span>
                {isActive && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full" />}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default OlamentDashboard