import { API_BASE_URL } from '../config';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sprout } from 'lucide-react';

export default function CropRecommendation() {
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
      const res = await fetch(`${API_BASE_URL}/api/crop-advisory/recommend`, {
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
    <div className="p-4 md:p-6 max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#145a32]">Crop Recommendation ML</h1>
        <p className="text-slate-500">Get AI-powered crop recommendations based on soil health and climate parameters.</p>
      </div>
      
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex-1 flex flex-col shadow-sm">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center">
            <Sprout size={18} className="text-[#27ae60] mr-2" />
            AI Crop Recommendation
          </h3>
        </div>
        
        <div className="p-4 md:p-8 flex-1 flex flex-col overflow-y-auto">
          {result ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="bg-emerald-100 p-8 rounded-full mb-2">
                <Sprout size={64} className="text-[#27ae60]" />
              </div>
              <div>
                <p className="text-slate-500 text-sm uppercase tracking-wider font-semibold">Recommended Crop</p>
                <h2 className="text-4xl font-bold text-[#145a32] capitalize mt-2">{result.recommendedCrop}</h2>
                {result.confidence > 0 && (
                  <p className="text-[#27ae60] font-medium mt-3 text-sm bg-emerald-50 px-4 py-1.5 rounded-full inline-block border border-emerald-100">
                    {(result.confidence * 100).toFixed(1)}% Match
                  </p>
                )}
              </div>
              <button 
                onClick={() => setResult(null)}
                className="mt-4 text-sm text-slate-500 hover:text-slate-700 underline"
              >
                Get another recommendation
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs uppercase text-slate-500 font-semibold mb-1.5">Nitrogen (N)</label>
                  <input required type="number" name="n" value={formData.n} onChange={handleChange} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#27ae60] outline-none" />
                </div>
                <div>
                  <label className="block text-xs uppercase text-slate-500 font-semibold mb-1.5">Phosphorus (P)</label>
                  <input required type="number" name="p" value={formData.p} onChange={handleChange} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#27ae60] outline-none" />
                </div>
                <div>
                  <label className="block text-xs uppercase text-slate-500 font-semibold mb-1.5">Potassium (K)</label>
                  <input required type="number" name="k" value={formData.k} onChange={handleChange} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#27ae60] outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs uppercase text-slate-500 font-semibold mb-1.5">Temperature (°C)</label>
                  <input required type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#27ae60] outline-none" />
                </div>
                <div>
                  <label className="block text-xs uppercase text-slate-500 font-semibold mb-1.5">Humidity (%)</label>
                  <input required type="number" step="0.1" name="humidity" value={formData.humidity} onChange={handleChange} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#27ae60] outline-none" />
                </div>
                <div>
                  <label className="block text-xs uppercase text-slate-500 font-semibold mb-1.5">Soil pH</label>
                  <input required type="number" step="0.1" name="ph" value={formData.ph} onChange={handleChange} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#27ae60] outline-none" />
                </div>
                <div>
                  <label className="block text-xs uppercase text-slate-500 font-semibold mb-1.5">Rainfall (mm)</label>
                  <input required type="number" step="0.1" name="rainfall" value={formData.rainfall} onChange={handleChange} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#27ae60] outline-none" />
                </div>
              </div>
              
              {error && <div className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-lg border border-red-100">{error}</div>}
              
              <button 
                type="submit" 
                disabled={loading}
                className="mt-6 w-full bg-[#27ae60] hover:bg-[#1e8449] text-white py-3 rounded-xl text-base font-semibold transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Analyzing Soil Data...' : 'Get Recommendation'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
