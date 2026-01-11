'use client'
import { useState, useEffect } from 'react';
import { MapPin, Search, Bike, Store, Package, ChevronRight, Heart, Plus } from 'lucide-react';

const markets = [
  { id: 1, name: 'Balogun Market', distance: '3 km', cover: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80'},
  { id: 2, name: 'Mile 12 Market', distance: '1 km', cover: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80'},
  { id: 3, name: 'Computer Village', distance: '5.8 km', cover: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80'},
  { id: 4, name: 'Oshodi Market', distance: '2.5 km', cover: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80'},
];

export default function App() {
  const [tab, setTab] = useState('markets');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortedMarkets, setSortedMarkets] = useState([]);

  useEffect(() => {
    // Convert distance strings to numbers for sorting
    const parseDistance = (distanceStr) => {
      return parseFloat(distanceStr.replace(' km', ''));
    };

    // Sort markets by distance (shortest first)
    const sorted = [...markets].sort((a, b) => {
      return parseDistance(a.distance) - parseDistance(b.distance);
    });

    // Filter based on search query
    const results = searchQuery
      ? sorted.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : sorted;
    
    setSortedMarkets(results);
  }, [searchQuery]);

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
        <div className=''>
        <div className="flex bg-gray-100">
          <div className='h-11 w-full flex items-center justify-center'>
          {['products', 'shops', 'markets'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={` text-sm  font-semibold capitalize justify-between w-full ${tab === t ? 'text-gray-900 bg-white rounded-lg py-2' : 'text-gray-500'}`}
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
                  {/* Market Info Section */}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className='flex w-full justify-between'>
                        <h3 className="font-bold text-lg text-gray-900">{m.name}</h3>
                        <div className="flex items-center mt-1 text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{m.distance}</span>
                        </div>
                      </div>
                      {/* <div className="flex items-center gap-2">
                        <button className="text-gray-400 hover:text-red-500 transition-colors">
                          <Heart className="h-5 w-5" />
                        </button>
                        <button className="bg-gray-900 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                          Visit
                        </button>
                      </div> */}
                    </div>
                    {/* Distance indicator */}
                    {/* <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Distance</span>
                        <span className="font-semibold">{m.distance}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{
                            width: `${Math.min(100, (parseFloat(m.distance.replace(' km', '')) / 10) * 100)}%`
                          }}
                        ></div>
                      </div>
                    </div> */}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
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