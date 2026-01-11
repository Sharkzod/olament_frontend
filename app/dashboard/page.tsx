'use client'
import { useState, useEffect } from 'react';
import { MapPin, Search, Bike, Store, Package, ChevronRight, Heart, Plus, ShoppingBag, User, Star, Clock } from 'lucide-react';

const markets = [
  { id: 1, name: 'Balogun Market', distance: '3 km', cover: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80'},
  { id: 2, name: 'Mile 12 Market', distance: '1 km', cover: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80'},
  { id: 3, name: 'Computer Village', distance: '5.8 km', cover: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80'},
  { id: 4, name: 'Oshodi Market', distance: '2.5 km', cover: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80'},
];

const shops = [
  { id: 1, name: 'Tech Gadgets Hub', category: 'Electronics', rating: 4.7, deliveryTime: '30-45 min', open: true, image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w-800&q=80' },
  { id: 2, name: 'Fresh Grocery Store', category: 'Groceries', rating: 4.5, deliveryTime: '20-35 min', open: true, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80' },
  { id: 3, name: 'Fashion Boutique', category: 'Clothing', rating: 4.3, deliveryTime: '45-60 min', open: false, image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80' },
  { id: 4, name: 'Book Haven', category: 'Books & Stationery', rating: 4.8, deliveryTime: '25-40 min', open: true, image: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=800&q=80' },
];

const products = [
  { id: 1, name: 'Fresh Tomatoes', price: '₦1,200', unit: 'per kg', shop: 'Fresh Grocery', rating: 4.5, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80' },
  { id: 2, name: 'iPhone 14 Pro', price: '₦850,000', unit: '', shop: 'Tech Gadgets Hub', rating: 4.8, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80' },
  { id: 3, name: 'Designer T-Shirt', price: '₦15,000', unit: '', shop: 'Fashion Boutique', rating: 4.3, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80' },
  { id: 4, name: 'Organic Bananas', price: '₦800', unit: 'per bunch', shop: 'Fresh Grocery', rating: 4.6, image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800&q=80' },
];

export default function App() {
  const [tab, setTab] = useState('markets');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortedMarkets, setSortedMarkets] = useState(markets);
  const [filteredShops, setFilteredShops] = useState(shops);
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    // Filter markets
    const parseDistance = (distanceStr: string) => {
      return parseFloat(distanceStr.replace(' km', ''));
    };

    const sortedMarketsList = [...markets].sort((a, b) => {
      return parseDistance(a.distance) - parseDistance(b.distance);
    });

    const marketsResults = searchQuery
      ? sortedMarketsList.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : sortedMarketsList;
    
    setSortedMarkets(marketsResults);

    // Filter shops
    const shopsResults = searchQuery
      ? shops.filter(s => 
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : shops;
    
    setFilteredShops(shopsResults);

    // Filter products
    const productsResults = searchQuery
      ? products.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.shop.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : products;
    
    setFilteredProducts(productsResults);
  }, [searchQuery]);

  const renderMarketsTab = () => (
    <section className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-black">Markets near you</h2>
        <button className="text-sm font-semibold text-gray-600 flex items-center gap-1">
          View all <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {sortedMarkets.map(m => (
          <article key={m.id} className="rounded-2xl">
            <div className='bg-white rounded-xl h-[35vh] w-full border border-gray-200'>
              <div className="relative pt-[20px]">
                <div className="rounded-2xl overflow-hidden bg-gray-200 w-[90%] flex justify-center items-center m-auto">
                  <img src={m.cover} alt={m.name} className="w-full h-full bg-center object-cover" />
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className='flex w-full justify-between'>
                    <h3 className="font-bold text-lg text-gray-900">{m.name}</h3>
                    <div className="flex items-center mt-1 text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{m.distance}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  const renderShopsTab = () => (
    <section className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-black">Shops & Stores</h2>
        <button className="text-sm font-semibold text-gray-600 flex items-center gap-1">
          View all <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {filteredShops.map(shop => (
          <article key={shop.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200">
                  <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
                </div>
                {!shop.open && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-semibold bg-red-500 px-2 py-1 rounded">CLOSED</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{shop.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{shop.category}</p>
                  </div>
                  <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <Heart className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold text-black">{shop.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-[10px] text-gray-600 w-[100%]">{shop.deliveryTime}</span>
                  </div>
                  <div className={`text-[10px] w-[40%] font-semibold px-2 py-1 rounded-full ${shop.open ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {shop.open ? 'OPEN NOW' : 'CLOSED'}
                  </div>
                </div>
                
                <button className="mt-4 w-full bg-gray-900 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
                  Visit Shop
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  const renderProductsTab = () => (
    <section className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-black">Popular Products</h2>
        <button className="text-sm font-semibold text-gray-600 flex items-center gap-1">
          View all <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filteredProducts.map(product => (
          <article key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="relative">
              <div className="h-40 bg-gray-200">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors">
                <Heart className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-xs font-semibold">{product.rating}</span>
              </div>
              
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{product.name}</h3>
              <p className="text-xs text-gray-600 mt-1">{product.shop}</p>
              
              <div className="flex items-center justify-between mt-3">
                <div>
                  <span className="font-bold text-gray-900">{product.price}</span>
                  {product.unit && <span className="text-xs text-gray-600 ml-1">{product.unit}</span>}
                </div>
                <button className="bg-gray-900 text-white text-xs font-semibold px-2 py-1 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1">
                  <ShoppingBag className="h-3 w-3" />
                  Add
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  const renderTabContent = () => {
    switch(tab) {
      case 'markets':
        return renderMarketsTab();
      case 'shops':
        return renderShopsTab();
      case 'products':
        return renderProductsTab();
      default:
        return renderMarketsTab();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gray-900 flex items-center justify-center">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-black">Orlament</div>
              <div className="text-xs text-gray-600">Your local market, online</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">Lagos, Nigeria</span>
          </div>
        </div>
      </header>

      <main className="px-4 pb-20 bg-gray-50">
        <div className="">
          <div className="flex bg-gray-100">
            <div className='h-11 w-full flex items-center justify-center'>
              {['products', 'shops', 'markets'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`text-sm font-semibold capitalize justify-between w-full ${tab === t ? 'text-gray-900 bg-white rounded-lg py-2' : 'text-gray-500'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products, shops, or markets..."
            className="w-full rounded-lg border placeholder-gray-400 border-gray-300 py-3 pl-10 pr-3 text-sm focus:outline-none"
          />
        </div>

        <div className="mt-4 rounded-2xl bg-yellow-400 flex gap-3 w-full h-[12vh]">
          <div className='w-[90%] flex items-center gap-3 justify-center m-auto'>
            <div className="rounded-lg p-2.5">
              <Bike className="h-8 w-8 text-black" />
            </div>
            <div>
              <div className="text-base font-bold mb-1 text-black">Browse shops → Order → We deliver</div>
              <div className="text-sm text-gray-800">Local markets brought to your door</div>
            </div>
          </div>
        </div>

        {renderTabContent()}
      </main>

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-1 bg-gray-900 rounded-full px-2 py-2 shadow-lg">
          <button className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
            <span className="text-white text-lg">↻</span>
          </button>
          <button className="px-6 py-2 text-white text-sm font-medium hover:bg-gray-800 rounded-full transition-colors">
            Chat
          </button>
          <button className="px-6 py-2 bg-white text-gray-900 text-sm font-medium rounded-full hover:bg-gray-100 transition-colors">
            Preview
          </button>
          <button className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors">
            <Plus className="h-5 w-5 text-white" />
          </button>
        </div>
      </nav>
    </div>
  );
}