import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  MapPin, Cloud, Maximize, Target, Activity, Droplets, 
  ChevronRight, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

export const FarmOverviewCard = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <h3 className="font-bold text-slate-800 flex items-center text-sm">
          <LeafIcon className="w-4 h-4 text-[#27ae60] mr-2" />
          Your Farm Overview
        </h3>
        <button className="text-[10px] font-bold text-slate-500 hover:text-[#27ae60] border border-slate-200 bg-white px-2.5 py-1 rounded-md transition-colors">
          Edit Profile
        </button>
      </div>
      <div className="p-4 grid grid-cols-2 gap-y-5 gap-x-3 flex-1 content-center">
        <div className="flex items-start space-x-2.5">
          <div className="mt-0.5 text-slate-400"><MapPin size={16} /></div>
          <div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Village</p>
            <p className="text-[13px] font-bold text-slate-800">Rurka Kalan</p>
          </div>
        </div>
        <div className="flex items-start space-x-2.5">
          <div className="mt-0.5 text-slate-400"><MapPin size={16} /></div>
          <div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">District</p>
            <p className="text-[13px] font-bold text-slate-800">Jalandhar</p>
          </div>
        </div>
        <div className="flex items-start space-x-2.5">
          <div className="mt-0.5 text-[#27ae60]"><LeafIcon className="w-4 h-4" /></div>
          <div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Primary Crop</p>
            <p className="text-[13px] font-bold text-slate-800">Wheat</p>
          </div>
        </div>
        <div className="flex items-start space-x-2.5">
          <div className="mt-0.5 text-amber-700"><Target size={16} /></div>
          <div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Soil Type</p>
            <p className="text-[13px] font-bold text-slate-800">Loamy</p>
          </div>
        </div>
        <div className="flex items-start space-x-2.5">
          <div className="mt-0.5 text-slate-400"><Maximize size={16} /></div>
          <div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Farm Size</p>
            <p className="text-[13px] font-bold text-slate-800">5 Acres</p>
          </div>
        </div>
        <div className="flex items-start space-x-2.5">
          <div className="mt-0.5 text-blue-500"><Droplets size={16} /></div>
          <div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Irrigation Type</p>
            <p className="text-[13px] font-bold text-slate-800">Tube Well</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CropRecommendationSummaryCard = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <h3 className="font-bold text-slate-800 flex items-center text-sm">
          <LeafIcon className="w-4 h-4 text-[#27ae60] mr-2" />
          Crop Recommendation
        </h3>
        <button className="text-[10px] font-bold text-slate-500 hover:text-[#27ae60] uppercase px-2 transition-colors">
          View All
        </button>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        {/* Tabs */}
        <div className="flex bg-slate-50 rounded-lg p-1 mb-4 border border-slate-100">
          <button className="flex-1 py-1 text-xs font-semibold rounded-md text-slate-500 hover:text-slate-700">Kharif</button>
          <button className="flex-1 py-1 text-xs font-semibold rounded-md bg-[#145a32] text-white shadow-sm">Rabi</button>
          <button className="flex-1 py-1 text-xs font-semibold rounded-md text-slate-500 hover:text-slate-700">Zaid</button>
        </div>
        
        {/* Crop Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col group cursor-pointer border border-slate-100 rounded-xl p-2 bg-white hover:border-emerald-200 transition-colors">
            <div className="h-16 bg-slate-100 rounded-lg mb-2 overflow-hidden relative">
               <img src="https://images.pexels.com/photos/1036148/pexels-photo-1036148.jpeg?auto=compress&cs=tinysrgb&w=300" alt="Wheat" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h4 className="text-[13px] font-bold text-slate-800 leading-none">Wheat</h4>
            <p className="text-[9px] text-[#27ae60] font-bold mt-1">High Suitability</p>
            <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
              <span className="text-[11px] font-extrabold text-[#145a32]">95%</span>
              <ChevronRight size={12} className="text-[#27ae60]" />
            </div>
          </div>
          
          <div className="flex flex-col group cursor-pointer border border-slate-100 rounded-xl p-2 bg-white hover:border-emerald-200 transition-colors">
            <div className="h-16 bg-slate-100 rounded-lg mb-2 overflow-hidden relative">
               <img src="https://images.pexels.com/photos/5560867/pexels-photo-5560867.jpeg?auto=compress&cs=tinysrgb&w=300" alt="Mustard" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h4 className="text-[13px] font-bold text-slate-800 leading-none">Mustard</h4>
            <p className="text-[9px] text-amber-600 font-bold mt-1">Suitable</p>
            <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
              <span className="text-[11px] font-extrabold text-[#145a32]">78%</span>
              <ChevronRight size={12} className="text-[#27ae60]" />
            </div>
          </div>
          
          <div className="flex flex-col group cursor-pointer border border-slate-100 rounded-xl p-2 bg-white hover:border-emerald-200 transition-colors">
            <div className="h-16 bg-slate-100 rounded-lg mb-2 overflow-hidden relative">
               <img src="https://images.pexels.com/photos/6316524/pexels-photo-6316524.jpeg?auto=compress&cs=tinysrgb&w=300" alt="Gram" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h4 className="text-[13px] font-bold text-slate-800 leading-none">Gram</h4>
            <p className="text-[9px] text-amber-600 font-bold mt-1">Suitable</p>
            <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
              <span className="text-[11px] font-extrabold text-[#145a32]">72%</span>
              <ChevronRight size={12} className="text-[#27ae60]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WeatherCard = () => {
  const { token } = useAuth();
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/weather', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 404) throw new Error('Location unavailable.');
        if (!res.ok) throw new Error('Failed to load weather.');
        const data = await res.json();
        setWeather(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchWeather();
  }, [token]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <h3 className="font-bold text-slate-800 flex items-center text-sm">
          <Cloud className="w-4 h-4 text-sky-500 mr-2" />
          Weather Advisory
        </h3>
        <button 
          onClick={() => navigate('/weather')}
          className="text-[10px] font-bold text-slate-500 border border-slate-200 bg-white px-2.5 py-1 rounded-md transition-colors hover:text-[#27ae60]"
        >
          View Details
        </button>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500 mb-2"></div>
            <p className="text-xs text-slate-500">Loading weather...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center h-32 px-4">
            <p className="text-xs text-slate-500 mb-2">{error === 'Location unavailable.' ? 'Please complete your farmer profile location to view weather.' : error}</p>
          </div>
        ) : weather && weather.current ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-3xl font-extrabold text-slate-800">{Math.round(weather.current.temperature)}°C</h2>
                <Cloud className="w-8 h-8 text-sky-400 fill-sky-100" />
              </div>
              <div className="space-y-1.5 text-right">
                <p className="text-[11px] text-slate-500 flex justify-between w-[120px]"><span className="font-medium">Location</span> <span className="font-bold text-slate-800 truncate ml-2" title={weather.location}>{weather.location.split(',')[0]}</span></p>
                <p className="text-[11px] text-slate-500 flex justify-between w-[120px]"><span className="font-medium">Humidity</span> <span className="font-bold text-slate-800">{weather.current.humidity}%</span></p>
                <p className="text-[11px] text-slate-500 flex justify-between w-[120px]"><span className="font-medium">Wind</span> <span className="font-bold text-slate-800">{weather.current.windSpeed} km/h</span></p>
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-600 mt-1">{weather.current.condition}</p>
            
            <div className="mt-4 bg-[#eefaf4] rounded-xl p-3 flex items-start space-x-3 border border-emerald-100/50">
              <div className="mt-0.5 text-[#27ae60] shrink-0"><LeafIcon className="w-4 h-4" /></div>
              <p className="text-[11px] text-[#145a32] font-semibold leading-relaxed line-clamp-2" title={weather.advisory}>
                {weather.advisory}
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export const DiseaseDetectionCard = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <h3 className="font-bold text-slate-800 flex items-center text-sm">
          <Activity className="w-4 h-4 text-[#27ae60] mr-2" />
          Disease Detection
        </h3>
        <button className="text-[10px] font-bold text-slate-500 uppercase px-2 transition-colors">
          Upload Image
        </button>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-center items-center">
        <div className="w-full border-2 border-dashed border-emerald-200/60 rounded-xl p-5 flex flex-col items-center justify-center text-center bg-[#f8fbf9] hover:bg-[#eefaf4] transition-colors cursor-pointer group">
          <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-emerald-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <p className="text-[13px] font-bold text-slate-800 mb-1">Upload a leaf image</p>
          <p className="text-[10px] text-slate-500 mb-4 max-w-[200px] leading-relaxed">Get instant AI-powered disease detection and treatment suggestions.</p>
          <button className="bg-[#145a32] hover:bg-[#1e8449] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm flex items-center transition-colors">
            <ArrowUpRight size={14} className="mr-1.5" />
            Upload Image
          </button>
        </div>
      </div>
    </div>
  );
};

export const AiSaarthiChatCard = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <h3 className="font-bold text-slate-800 flex items-center text-sm">
          <div className="w-5 h-5 bg-[#145a32] rounded-full flex items-center justify-center text-white mr-2 text-[9px] font-bold">AI</div>
          AI Saarthi <span className="text-slate-400 font-normal ml-1 text-xs">(Your Assistant)</span>
        </h3>
        <button className="text-[10px] font-bold text-[#27ae60] uppercase px-2">
          Ask anything
        </button>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-start text-[12px] font-medium text-slate-600 hover:text-slate-900 cursor-pointer group">
            <div className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center mr-2.5 mt-0.5 group-hover:border-[#27ae60] shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#27ae60]"></span></div>
            Which crop is best for my soil?
          </div>
          <div className="flex items-start text-[12px] font-medium text-slate-600 hover:text-slate-900 cursor-pointer group">
            <div className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center mr-2.5 mt-0.5 group-hover:border-[#27ae60] shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#27ae60]"></span></div>
            How to control stem borer in paddy?
          </div>
          <div className="flex items-start text-[12px] font-medium text-slate-600 hover:text-slate-900 cursor-pointer group">
            <div className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center mr-2.5 mt-0.5 group-hover:border-[#27ae60] shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#27ae60]"></span></div>
            Suggest fertilizer schedule for wheat.
          </div>
          <div className="flex items-start text-[12px] font-medium text-slate-600 hover:text-slate-900 cursor-pointer group">
            <div className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center mr-2.5 mt-0.5 group-hover:border-[#27ae60] shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#27ae60]"></span></div>
            What is today's weather in my area?
          </div>
        </div>
        
        <div className="relative pt-2 border-t border-slate-50">
          <input 
            type="text" 
            placeholder="Type your question here..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-10 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#27ae60] focus:bg-white transition-all font-medium"
          />
          <button className="absolute right-1.5 top-[13.5px] w-7 h-7 bg-[#145a32] rounded flex items-center justify-center text-white hover:bg-[#27ae60] transition-colors">
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const MarketPricesTableCard = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <h3 className="font-bold text-slate-800 flex items-center text-sm">
          <LineChartIcon className="w-4 h-4 text-slate-700 mr-2" />
          Market Prices
        </h3>
        <button className="text-[10px] font-bold text-slate-500 border border-slate-200 bg-white px-2.5 py-1 rounded-md transition-colors">
          View More
        </button>
      </div>
      <div className="p-0 flex-1 overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="text-[10px] text-slate-400 bg-slate-50/50">
            <tr>
              <th className="px-4 py-2.5 font-bold">Crop</th>
              <th className="px-4 py-2.5 font-bold text-right">Price (₹/Quintal)</th>
              <th className="px-4 py-2.5 font-bold text-right">Change</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-50 hover:bg-slate-50/50">
              <td className="px-4 py-3 font-semibold text-slate-800">Wheat</td>
              <td className="px-4 py-3 font-medium text-right text-slate-600">2,425</td>
              <td className="px-4 py-3 font-bold text-right text-[#27ae60] flex items-center justify-end"><ArrowUpRight size={12} className="mr-0.5" /> +2.3%</td>
            </tr>
            <tr className="border-b border-slate-50 hover:bg-slate-50/50">
              <td className="px-4 py-3 font-semibold text-slate-800">Paddy</td>
              <td className="px-4 py-3 font-medium text-right text-slate-600">2,183</td>
              <td className="px-4 py-3 font-bold text-right text-[#27ae60] flex items-center justify-end"><ArrowUpRight size={12} className="mr-0.5" /> +1.1%</td>
            </tr>
            <tr className="border-b border-slate-50 hover:bg-slate-50/50">
              <td className="px-4 py-3 font-semibold text-slate-800">Maize</td>
              <td className="px-4 py-3 font-medium text-right text-slate-600">1,960</td>
              <td className="px-4 py-3 font-bold text-right text-red-500 flex items-center justify-end"><ArrowDownRight size={12} className="mr-0.5" /> -0.5%</td>
            </tr>
            <tr className="border-b border-slate-50 hover:bg-slate-50/50">
              <td className="px-4 py-3 font-semibold text-slate-800">Mustard</td>
              <td className="px-4 py-3 font-medium text-right text-slate-600">5,650</td>
              <td className="px-4 py-3 font-bold text-right text-[#27ae60] flex items-center justify-end"><ArrowUpRight size={12} className="mr-0.5" /> +3.2%</td>
            </tr>
            <tr className="hover:bg-slate-50/50">
              <td className="px-4 py-3 font-semibold text-slate-800">Gram</td>
              <td className="px-4 py-3 font-medium text-right text-slate-600">5,100</td>
              <td className="px-4 py-3 font-bold text-right text-[#27ae60] flex items-center justify-end"><ArrowUpRight size={12} className="mr-0.5" /> +1.8%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Icons missing in lucide-react standard imports or renamed for convenience
function LeafIcon(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;
}
function LineChartIcon(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7v10"/><path d="M11 7v10"/><path d="M15 7v10"/></svg>;
}
function ArrowRightIcon(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
}
