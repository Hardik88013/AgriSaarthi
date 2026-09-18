import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LineChart, Search, AlertCircle, MapPin, Building, Calendar, Info, Loader2 } from 'lucide-react';

interface MarketPrice {
  id: string;
  crop: string;
  market: string;
  state: string;
  price: number;
  unit: string;
  source: string;
  lastUpdated: string;
}

export default function MarketPrices() {
  const { token } = useAuth();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchCrop, setSearchCrop] = useState('');
  const [searchState, setSearchState] = useState('');

  const fetchPrices = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (searchCrop) query.append('crop', searchCrop);
      if (searchState) query.append('state', searchState);
      
      const res = await fetch(`http://localhost:5000/api/market-prices?${query.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 404) {
        setPrices([]);
      } else if (!res.ok) {
        throw new Error('Failed to fetch market prices.');
      } else {
        const data = await res.json();
        setPrices(data);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPrices();
  }, [token, searchCrop, searchState]);

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-12">
      <header className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center">
            <LineChart className="w-6 h-6 text-[#27ae60] mr-2" />
            Market Prices
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Check commodity rates across mandis</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        
        {/* Important Disclaimer */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 shrink-0" />
          <div>
            <h4 className="font-bold text-blue-800 text-sm">Reference Market Prices</h4>
            <p className="text-xs text-blue-600 mt-1">Prices shown are reference data and may differ from current live mandi prices. This is not real-time data.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by crop (e.g., Wheat)..." 
              value={searchCrop}
              onChange={(e) => setSearchCrop(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#27ae60]/20 focus:border-[#27ae60]"
            />
          </div>
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Filter by state (e.g., Punjab)..." 
              value={searchState}
              onChange={(e) => setSearchState(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#27ae60]/20 focus:border-[#27ae60]"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#27ae60] animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading market prices...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        ) : prices.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
            <LineChart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">No prices found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your crop or state filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prices.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <LineChart className="w-16 h-16 text-[#27ae60]" />
                </div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{p.crop}</h3>
                    <div className="flex items-center text-xs text-slate-500 mt-1">
                      <Building className="w-3.5 h-3.5 mr-1" />
                      {p.market}, {p.state}
                    </div>
                  </div>
                </div>

                <div className="mt-2 mb-4 relative z-10">
                  <p className="text-3xl font-black text-[#145a32]">
                    ₹{p.price.toFixed(2)}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">
                    per {p.unit}
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 relative z-10">
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Updated: {new Date(p.lastUpdated).toLocaleDateString()}
                  </span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-medium">{p.source}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
