import { CloudSun, UploadCloud, Sprout, Wind, Droplets, Zap, HelpCircle, Send } from 'lucide-react';

// -----------------------------
// Weather Advisory
// -----------------------------
export const WeatherAdvisory = () => (
  <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl border border-sky-100 p-6 h-full flex flex-col">
    <div className="flex justify-between items-start mb-6">
      <div>
        <h3 className="font-bold text-slate-800 flex items-center">
          <CloudSun size={18} className="text-sky-600 mr-2" />
          Weather Advisory
        </h3>
        <p className="text-sm text-slate-500 mt-1">Data from Weather API (Future Phase)</p>
      </div>
      <div className="text-3xl font-light text-slate-700">--°C</div>
    </div>
    
    <div className="grid grid-cols-3 gap-4 mt-auto">
      <div className="bg-white/60 p-3 rounded-xl backdrop-blur-sm text-center">
        <Droplets size={16} className="mx-auto text-sky-500 mb-1" />
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Humidity</p>
        <p className="font-medium text-slate-700">--%</p>
      </div>
      <div className="bg-white/60 p-3 rounded-xl backdrop-blur-sm text-center">
        <Wind size={16} className="mx-auto text-sky-500 mb-1" />
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Wind</p>
        <p className="font-medium text-slate-700">-- km/h</p>
      </div>
      <div className="bg-white/60 p-3 rounded-xl backdrop-blur-sm text-center">
        <CloudSun size={16} className="mx-auto text-sky-500 mb-1" />
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Rain</p>
        <p className="font-medium text-slate-700">--%</p>
      </div>
    </div>
  </div>
);

// -----------------------------
// Disease Detection
// -----------------------------
export const DiseaseDetectionCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col h-full items-center justify-center text-center">
    <h3 className="font-bold text-slate-800 w-full text-left mb-4">Quick Disease Check</h3>
    <div className="border-2 border-dashed border-slate-200 rounded-xl w-full flex-1 flex flex-col items-center justify-center p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
      <div className="bg-emerald-100 p-4 rounded-full mb-3 group-hover:scale-105 transition-transform">
        <UploadCloud size={24} className="text-[#27ae60]" />
      </div>
      <p className="font-medium text-slate-700">Upload a leaf photo</p>
      <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG (Coming Soon)</p>
    </div>
    <button disabled className="w-full mt-4 bg-[#145a32] text-white py-2.5 rounded-lg font-medium opacity-50 cursor-not-allowed">
      Analyze Image
    </button>
  </div>
);

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

// -----------------------------
// Crop Recommendation
// -----------------------------
export const CropRecommendationCard = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ recommendedCrop: string; confidence: number } | null>(null);
  
  const [formData, setFormData] = useState({
    n: '', p: '', k: '', temperature: '', humidity: '', ph: '', rainfall: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('http://localhost:5000/api/crop-advisory/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          n: Number(formData.n),
          p: Number(formData.p),
          k: Number(formData.k),
          temperature: Number(formData.temperature),
          humidity: Number(formData.humidity),
          ph: Number(formData.ph),
          rainfall: Number(formData.rainfall)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Unable to get crop recommendation. Please try again.');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Unable to get crop recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center">
          <Sprout size={18} className="text-[#27ae60] mr-2" />
          AI Crop Recommendation
        </h3>
      </div>
      
      <div className="p-4 flex-1 flex flex-col overflow-y-auto">
        {result ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="bg-emerald-100 p-6 rounded-full mb-2">
              <Sprout size={48} className="text-[#27ae60]" />
            </div>
            <div>
              <p className="text-slate-500 text-sm uppercase tracking-wider font-semibold">Recommended Crop</p>
              <h2 className="text-3xl font-bold text-[#145a32] capitalize mt-1">{result.recommendedCrop}</h2>
              {result.confidence > 0 && (
                <p className="text-[#27ae60] font-medium mt-2 text-sm bg-emerald-50 px-3 py-1 rounded-full inline-block">
                  {(result.confidence * 100).toFixed(1)}% Match
                </p>
              )}
            </div>
            <button 
              onClick={() => setResult(null)}
              className="mt-6 text-sm text-slate-500 hover:text-slate-700 underline"
            >
              Get another recommendation
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-semibold mb-1">Nitrogen (N)</label>
                <input required type="number" name="n" value={formData.n} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-semibold mb-1">Phosphorus (P)</label>
                <input required type="number" name="p" value={formData.p} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-semibold mb-1">Potassium (K)</label>
                <input required type="number" name="k" value={formData.k} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-semibold mb-1">Temperature (°C)</label>
                <input required type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-semibold mb-1">Humidity (%)</label>
                <input required type="number" step="0.1" name="humidity" value={formData.humidity} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-semibold mb-1">Soil pH</label>
                <input required type="number" step="0.1" name="ph" value={formData.ph} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-semibold mb-1">Rainfall (mm)</label>
                <input required type="number" step="0.1" name="rainfall" value={formData.rainfall} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-sm" />
              </div>
            </div>
            
            {error && <div className="text-red-500 text-xs mb-3 p-2 bg-red-50 rounded border border-red-100">{error}</div>}
            
            <button 
              type="submit" 
              disabled={loading}
              className="mt-auto w-full bg-[#27ae60] hover:bg-[#1e8449] text-white py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Analyzing Soil Data...' : 'Get Recommendation'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// -----------------------------
// AI Saarthi
// -----------------------------
export const AiSaarthiCard = () => (
  <div className="bg-[#145a32] rounded-2xl border border-[#1e8449] p-6 text-white h-full flex flex-col relative overflow-hidden">
    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
      <Zap size={120} />
    </div>
    
    <div className="relative z-10">
      <h3 className="font-bold text-xl mb-2 flex items-center">
        <HelpCircle size={20} className="mr-2 text-emerald-300" />
        Ask AI Saarthi
      </h3>
      <p className="text-emerald-100 text-sm mb-6">Your personal agricultural expert, available 24/7.</p>
      
      <div className="space-y-2 mb-6">
        <div className="bg-white/10 hover:bg-white/20 transition-colors py-2 px-3 rounded-lg text-sm text-emerald-50 cursor-pointer">
          "What fertilizer should I use for wheat?"
        </div>
        <div className="bg-white/10 hover:bg-white/20 transition-colors py-2 px-3 rounded-lg text-sm text-emerald-50 cursor-pointer">
          "How to prevent leaf rust?"
        </div>
      </div>
    </div>
    
    <div className="mt-auto relative z-10 flex">
      <input 
        disabled
        type="text" 
        placeholder="Type your question... (Coming Soon)" 
        className="flex-1 py-2.5 px-4 rounded-l-lg text-slate-800 text-sm focus:outline-none opacity-90 cursor-not-allowed" 
      />
      <button disabled className="bg-[#27ae60] p-2.5 rounded-r-lg opacity-90 cursor-not-allowed">
        <Send size={18} className="text-white" />
      </button>
    </div>
  </div>
);
