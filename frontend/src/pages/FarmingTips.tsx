import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lightbulb, Search, AlertCircle, Loader2, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface FarmingTip {
  id: string;
  category: string;
  crop: string;
  title: string;
  description: string;
  actionableAdvice: string;
}

export default function FarmingTips() {
  const { token } = useAuth();
  const [tips, setTips] = useState<FarmingTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchCategory, setSearchCategory] = useState('');
  const [searchCrop, setSearchCrop] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchTips = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (searchCategory) query.append('category', searchCategory);
      if (searchCrop) query.append('crop', searchCrop);
      
      const res = await fetch(`http://localhost:5000/api/farming-tips?${query.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 404) {
        setTips([]);
      } else if (!res.ok) {
        throw new Error('Failed to fetch farming tips.');
      } else {
        const data = await res.json();
        setTips(data);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTips();
  }, [token, searchCategory, searchCrop]);

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-12">
      <header className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center">
            <Lightbulb className="w-6 h-6 text-amber-500 mr-2" />
            Farming Tips
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Actionable agricultural guidance</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Filter by category (e.g., Irrigation)..." 
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Filter by crop (e.g., Tomato)..." 
              value={searchCrop}
              onChange={(e) => setSearchCrop(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading farming tips...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        ) : tips.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
            <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">No tips found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tips.map((t) => {
              const isExpanded = expandedId === t.id;
              return (
                <div key={t.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                  <div 
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                    onClick={() => setExpandedId(isExpanded ? null : t.id)}
                  >
                    <div className="pr-4">
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{t.category}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{t.crop}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-800">{t.title}</h3>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                  </div>
                  
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50">
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed">{t.description}</p>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                        <h4 className="text-xs font-bold text-emerald-800 mb-1">Actionable Advice:</h4>
                        <p className="text-sm text-emerald-700">{t.actionableAdvice}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
