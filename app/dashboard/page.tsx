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
} from 'lucide-react'

const markets = [
  {
    id: 1,
    name: 'Balogun Market',
    distance: '3 km',
    shops: 150,
    rating: 4.2,
    deliveryTime: '15-30 min',
    cover: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1200&auto=format&fit=crop',
    isFavorite: false,
  },
  {
    id: 2,
    name: 'Mile 12 Market',
    distance: '1 km',
    shops: 200,
    rating: 4.5,
    deliveryTime: '10-25 min',
    cover: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?q=80&w=1200&auto=format&fit=crop',
    isFavorite: true,
  },
  {
    id: 3,
    name: 'Computer Village',
    distance: '5.8 km',
    shops: 300,
    rating: 4.3,
    deliveryTime: '25-40 min',
    cover: 'https://images.unsplash.com/photo-1509377244-43ecf7a8f8b4?q=80&w=1200&auto=format&fit=crop',
    isFavorite: false,
  },
  {
    id: 4,
    name: 'Oshodi Market',
    distance: '2.5 km',
    shops: 180,
    rating: 4.0,
    deliveryTime: '12-28 min',
    cover: 'https://images.unsplash.com/photo-1560472355-536de3962603?q=80&w=1200&auto=format&fit=crop',
    isFavorite: false,
  },
]

const categories = [
  { id: 'groceries', name: 'Groceries', icon: '🛒' },
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'clothing', name: 'Clothing', icon: '👕' },
  { id: 'home', name: 'Home & Kitchen', icon: '🏠' },
  { id: 'beauty', name: 'Beauty', icon: '💄' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
]

const StarRow: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = useMemo(() => Array.from({ length: 5 }), [])
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i + 1 <= Math.round(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500'}`}
        />
      ))}
      <span className="ml-1 text-xs text-gray-400">{rating.toFixed(1)}</span>
    </div>
  )
}

const SegmentedTabs: React.FC<{
  value: string
  onChange: (v: string) => void
}> = ({ value, onChange }) => {
  const tabs = [
    { id: 'products', label: 'Products', icon: ShoppingCart },
    { id: 'shops', label: 'Shops', icon: Store },
    { id: 'markets', label: 'Markets', icon: Package },
  ] as const

  return (
    <div className="grid grid-cols-3 rounded-xl bg-gray-800 p-1">
      {tabs.map((t) => {
        const ActiveIcon = t.icon
        const active = value === t.id
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              active 
                ? 'bg-gray-700 shadow-sm text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ActiveIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}

const OrlamentDashboard: React.FC = () => {
  const [tab, setTab] = useState<'products' | 'shops' | 'markets'>('products')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredMarkets, setFilteredMarkets] = useState(markets)
  const [activeCategory, setActiveCategory] = useState('all')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    // Filter markets based on search query and active category
    let results = markets
    
    if (searchQuery) {
      results = results.filter(market => 
        market.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    if (activeCategory !== 'all') {
      // In a real app, you would filter by actual category
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button 
              className="lg:hidden text-gray-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
            {/* Logo avatar */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500">
              <div className="h-5 w-5 text-gray-900 font-bold">O</div>
            </div>
            <div className="hidden sm:block">
              <div className="text-base font-semibold leading-tight">Orlament</div>
              <div className="text-[11px] leading-none text-gray-400">Your local market, online</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 rounded-full bg-gray-800 px-3 py-1.5 text-sm text-gray-300">
              <MapPin className="h-4 w-4" /> Lagos, Nigeria
            </div>
            <button className="relative rounded-full p-2 text-gray-300 hover:bg-gray-800">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 inline-block h-2 w-2 rounded-full bg-yellow-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar for larger screens */}
      <div className="container mx-auto lg:px-6">
        <div className="flex">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0 pr-6 pt-6">
            <div className="rounded-xl bg-gray-800 p-4 mb-6">
              <h3 className="font-semibold mb-3">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setActiveCategory('all')}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm ${
                      activeCategory === 'all' 
                        ? 'bg-gray-700 text-white' 
                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map(category => (
                  <li key={category.id}>
                    <button 
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full text-left rounded-lg px-3 py-2 text-sm flex items-center gap-2 ${
                        activeCategory === category.id 
                          ? 'bg-gray-700 text-white' 
                          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <span>{category.icon}</span>
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="rounded-xl bg-gray-800 p-4">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left rounded-lg bg-gray-700 px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-600">
                  <Package className="h-4 w-4 text-yellow-500" />
                  Track Order
                </button>
                <button className="w-full text-left rounded-lg bg-gray-700 px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-600">
                  <Store className="h-4 w-4 text-yellow-500" />
                  My Shops
                </button>
                <button className="w-full text-left rounded-lg bg-gray-700 px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-600">
                  <Heart className="h-4 w-4 text-yellow-500" />
                  Favorites
                </button>
              </div>
            </div>
          </aside>

          {/* Mobile menu overlay */}
          {isMenuOpen && (
            <div className="fixed inset-0 z-20 bg-gray-900 bg-opacity-90 lg:hidden">
              <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500">
                      <div className="h-5 w-5 text-gray-900 font-bold">O</div>
                    </div>
                    <div>
                      <div className="text-base font-semibold leading-tight">Orlament</div>
                      <div className="text-[11px] leading-none text-gray-400">Your local market, online</div>
                    </div>
                  </div>
                  <button onClick={() => setIsMenuOpen(false)}>
                    <X className="h-6 w-6 text-gray-300" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-gray-300">Categories</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => {setActiveCategory('all'); setIsMenuOpen(false);}}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        activeCategory === 'all' 
                          ? 'bg-yellow-500 text-gray-900' 
                          : 'bg-gray-800 text-gray-300'
                      }`}
                    >
                      All
                    </button>
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => {setActiveCategory(category.id); setIsMenuOpen(false);}}
                        className={`rounded-lg px-3 py-2 text-sm flex items-center gap-1 ${
                          activeCategory === category.id 
                            ? 'bg-yellow-500 text-gray-900' 
                            : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        <span>{category.icon}</span>
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 text-gray-300">Quick Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left rounded-lg bg-gray-800 px-3 py-2 text-sm flex items-center gap-2 text-gray-300">
                      <Package className="h-4 w-4 text-yellow-500" />
                      Track Order
                    </button>
                    <button className="w-full text-left rounded-lg bg-gray-800 px-3 py-2 text-sm flex items-center gap-2 text-gray-300">
                      <Store className="h-4 w-4 text-yellow-500" />
                      My Shops
                    </button>
                    <button className="w-full text-left rounded-lg bg-gray-800 px-3 py-2 text-sm flex items-center gap-2 text-gray-300">
                      <Heart className="h-4 w-4 text-yellow-500" />
                      Favorites
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main content */}
          <main className="flex-1 px-4 pb-20 lg:px-0 lg:pt-6">
            {/* Tabs */}
            <div className="mt-4 lg:mt-0">
              <SegmentedTabs value={tab} onChange={(v) => setTab(v as any)} />
            </div>

            {/* Search and Filter */}
            <div className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, shops, or markets..."
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 pl-10 pr-3 text-[15px] outline-none ring-yellow-500/30 placeholder:text-gray-500 focus:ring-2 text-white"
                />
              </div>
              <button className="rounded-xl border border-gray-700 bg-gray-800 p-3 text-gray-300 hover:bg-gray-700">
                <Filter className="h-5 w-5" />
              </button>
            </div>

            {/* Categories for mobile */}
            <div className="mt-4 overflow-x-auto lg:hidden">
              <div className="flex space-x-2 pb-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                    activeCategory === 'all' 
                      ? 'bg-yellow-500 text-gray-900' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium flex items-center gap-1 ${
                      activeCategory === category.id 
                        ? 'bg-yellow-500 text-gray-900' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span>{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Yellow promo banner */}
            <div className="mt-4 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-yellow-500/60 p-2">
                  <Bike className="h-5 w-5 text-yellow-900" />
                </div>
                <div>
                  <div className="text-[15px] font-semibold leading-5 text-white">
                    Browse shops — Order — We deliver
                  </div>
                  <div className="mt-1 text-sm text-gray-300">
                    Local markets brought to your door in minutes
                  </div>
                </div>
              </div>
            </div>

            {/* Markets near you */}
            <section className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[17px] font-semibold">Markets near you</h2>
                <button className="text-sm font-medium text-gray-400 hover:text-white flex items-center">
                  View all <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 pb-2">
                {filteredMarkets.length > 0 ? (
                  filteredMarkets.map((m) => (
                    <article
                      key={m.id}
                      className="overflow-hidden rounded-xl border border-gray-800 bg-gray-800 relative"
                    >
                      <button 
                        onClick={() => toggleFavorite(m.id)}
                        className="absolute top-2 right-2 z-10 rounded-full bg-gray-900/70 p-1.5 backdrop-blur-sm hover:bg-gray-900"
                      >
                        <Heart 
                          className={`h-4 w-4 ${m.isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                        />
                      </button>
                      
                      <div className="relative h-48 w-full overflow-hidden">
                        <img
                          src={m.cover}
                          alt={m.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute bottom-2 left-2 rounded-md bg-gray-900/80 px-2 py-1 text-xs text-white">
                          {m.distance} away
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-semibold">{m.name}</div>
                            <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {m.deliveryTime}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{m.shops} shops</div>
                          </div>
                          <StarRow rating={m.rating} />
                        </div>
                        
                        <div className="mt-3 flex gap-2">
                          <button className="flex-1 rounded-lg bg-gray-700 py-2 text-xs font-medium hover:bg-gray-600">
                            View Shops
                          </button>
                          <button className="rounded-lg bg-yellow-500 py-2 px-3 text-xs font-medium text-gray-900 hover:bg-yellow-400">
                            <Map className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="col-span-full py-10 text-center text-gray-400">
                    No markets found matching your criteria
                  </div>
                )}
              </div>
            </section>

            {/* Quick Actions for mobile */}
            <section className="mt-8 lg:hidden">
              <h2 className="mb-3 text-[17px] font-semibold">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <button className="rounded-xl bg-gray-800 p-4 text-left hover:bg-gray-700">
                  <div className="mb-2 rounded-lg bg-yellow-500/20 p-2 inline-block">
                    <Package className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="font-medium">Track Order</div>
                  <div className="text-xs text-gray-400">See your order status</div>
                </button>
                <button className="rounded-xl bg-gray-800 p-4 text-left hover:bg-gray-700">
                  <div className="mb-2 rounded-lg bg-yellow-500/20 p-2 inline-block">
                    <Store className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="font-medium">My Shops</div>
                  <div className="text-xs text-gray-400">Favorite stores</div>
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-800 bg-gray-900/95 px-4 py-3 lg:hidden">
        <div className="grid grid-cols-4 gap-4 text-xs">
          <button className={`flex flex-col items-center gap-1 font-medium ${tab === 'products' ? 'text-yellow-500' : 'text-gray-400'}`}>
            <ShoppingCart className="h-5 w-5" />
            <span>Products</span>
          </button>
          <button className={`flex flex-col items-center gap-1 font-medium ${tab === 'shops' ? 'text-yellow-500' : 'text-gray-400'}`}>
            <Store className="h-5 w-5" />
            <span>Shops</span>
          </button>
          <button className={`flex flex-col items-center gap-1 font-medium ${tab === 'markets' ? 'text-yellow-500' : 'text-gray-400'}`}>
            <Package className="h-5 w-5" />
            <span>Markets</span>
          </button>
          <button className="flex flex-col items-center gap-1 font-medium text-gray-400">
            <div className="h-5 w-5 rounded-full bg-gray-700"></div>
            <span>Profile</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default OrlamentDashboard