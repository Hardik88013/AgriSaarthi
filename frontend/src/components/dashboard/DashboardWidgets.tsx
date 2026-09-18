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

// -----------------------------
// Crop Recommendation
// -----------------------------
export const CropRecommendationCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden h-full flex flex-col">
    <div className="p-5 border-b border-slate-100 flex justify-between items-center">
      <h3 className="font-bold text-slate-800 flex items-center">
        <Sprout size={18} className="text-[#27ae60] mr-2" />
        Recommended Crops
      </h3>
      <span className="text-xs font-semibold text-[#27ae60] cursor-pointer">View All</span>
    </div>
    
    <div className="flex border-b border-slate-100">
      <button className="flex-1 py-2 text-sm font-semibold text-[#27ae60] border-b-2 border-[#27ae60]">Rabi</button>
      <button className="flex-1 py-2 text-sm font-medium text-slate-500 hover:text-slate-700">Kharif</button>
      <button className="flex-1 py-2 text-sm font-medium text-slate-500 hover:text-slate-700">Zaid</button>
    </div>

    <div className="p-5 flex-1 flex flex-col items-center justify-center text-center">
      <div className="bg-emerald-50 p-6 rounded-full mb-4">
        <Sprout size={32} className="text-[#27ae60] opacity-50" />
      </div>
      <p className="text-slate-500 text-sm">
        ML Crop Recommendations will appear here based on your soil type and location.
      </p>
    </div>
  </div>
);

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
