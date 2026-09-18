import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Cloud, Maximize, Target, Activity, Droplets, 
  ArrowUpRight, Leaf, ShieldAlert
} from 'lucide-react';

export const FarmOverviewCard = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user?.id || !token) return;
        const res = await fetch(`http://localhost:5000/api/farmers/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, token]);
  
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <h3 className="font-bold text-slate-800 flex items-center text-sm">
          <Leaf className="w-4 h-4 text-[#27ae60] mr-2" />
          Your Farm Overview
        </h3>
        <Link to="/profile" className="text-[10px] font-bold text-slate-500 hover:text-[#27ae60] border border-slate-200 bg-white px-2.5 py-1 rounded-md transition-colors">
          Edit Profile
        </Link>
      </div>
      <div className="p-4 grid grid-cols-2 gap-y-5 gap-x-3 flex-1 content-center">
        {loading ? (
          <div className="col-span-2 flex justify-center py-4">
             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#27ae60]"></div>
          </div>
        ) : (
          <>
            <div className="flex items-start space-x-2.5">
              <div className="mt-0.5 text-slate-400"><MapPin size={16} /></div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Village</p>
                <p className="text-[13px] font-bold text-slate-800 truncate max-w-[100px]" title={profile?.village || 'Not set'}>{profile?.village || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-2.5">
              <div className="mt-0.5 text-slate-400"><MapPin size={16} /></div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">District</p>
                <p className="text-[13px] font-bold text-slate-800 truncate max-w-[100px]" title={profile?.district || 'Not set'}>{profile?.district || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-2.5">
              <div className="mt-0.5 text-[#27ae60]"><LeafIcon className="w-4 h-4" /></div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Primary Crop</p>
                <p className="text-[13px] font-bold text-slate-800 truncate max-w-[100px]" title={profile?.primaryCrop || 'Not set'}>{profile?.primaryCrop || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-2.5">
              <div className="mt-0.5 text-amber-700"><Target size={16} /></div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Soil Type</p>
                <p className="text-[13px] font-bold text-slate-800 truncate max-w-[100px]" title={profile?.soilType || 'Not set'}>{profile?.soilType || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-2.5">
              <div className="mt-0.5 text-slate-400"><Maximize size={16} /></div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Farm Size</p>
                <p className="text-[13px] font-bold text-slate-800 truncate max-w-[100px]" title={profile?.farmSize ? `${profile.farmSize} Acres` : 'Not set'}>{profile?.farmSize ? `${profile.farmSize} Acres` : 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-2.5">
              <div className="mt-0.5 text-blue-500"><Droplets size={16} /></div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Irrigation</p>
                <p className="text-[13px] font-bold text-slate-800 truncate max-w-[100px]" title={profile?.irrigationType || 'Not set'}>{profile?.irrigationType || 'Not set'}</p>
              </div>
            </div>
          </>
        )}
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
        <Link to="/crop-recommendation" className="text-[10px] font-bold text-slate-500 hover:text-[#27ae60] border border-slate-200 bg-white px-2.5 py-1 rounded-md transition-colors">
          View ML Tool
        </Link>
      </div>
      
      <div className="p-5 flex-1 flex flex-col justify-center items-center text-center">
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
          <Target className="w-6 h-6 text-[#27ae60]" />
        </div>
        <h4 className="text-sm font-bold text-slate-800 mb-2">Get AI Recommendations</h4>
        <p className="text-xs text-slate-500 max-w-[220px] mb-4">
          Use our machine learning model to find the best crop based on your soil and climate.
        </p>
        <Link 
          to="/crop-recommendation"
          className="bg-[#145a32] hover:bg-[#1e8449] text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors w-full"
        >
          Get Recommendation
        </Link>
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
            <p className="text-xs text-slate-500 mb-2">{error === 'Location unavailable.' ? 'Please complete your farmer profile location to view weather.' : 'Unable to load weather information. Please check again later.'}</p>
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
        <Link to="/disease-detection" className="text-[10px] font-bold text-slate-500 uppercase px-2 transition-colors hover:text-[#27ae60]">
          Scan
        </Link>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-center items-center relative">
        <Link to="/disease-detection" className="w-full border-2 border-dashed border-emerald-200/60 rounded-xl p-5 flex flex-col items-center justify-center text-center bg-[#f8fbf9] hover:bg-[#eefaf4] transition-colors cursor-pointer group">
          <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-emerald-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <p className="text-[13px] font-bold text-slate-800 mb-1">Upload a leaf image</p>
          <p className="text-[10px] text-slate-500 mb-4 max-w-[200px] leading-relaxed">Get instant AI-powered disease detection.</p>
          <div className="bg-[#145a32] hover:bg-[#1e8449] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm flex items-center transition-colors">
            <ArrowUpRight size={14} className="mr-1.5" />
            Upload Image
          </div>
        </Link>
      </div>
    </div>
  );
};

export const PestDiseaseAlertsCard = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <h3 className="font-bold text-slate-800 flex items-center text-sm">
          <ShieldAlert className="w-4 h-4 text-orange-500 mr-2" />
          Pest & Disease Alerts
        </h3>
        <Link to="/pest-disease" className="text-[10px] font-bold text-slate-500 uppercase px-2 transition-colors hover:text-[#27ae60]">
          View All
        </Link>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-center items-center">
        <div className="bg-orange-50 text-orange-700 p-4 rounded-xl text-center w-full">
          <p className="text-sm font-semibold mb-1">No major advisory at this time.</p>
          <p className="text-xs opacity-80">Continue standard monitoring of your fields.</p>
        </div>
      </div>
    </div>
  );
};

export const KnowledgeHubCard = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <h3 className="font-bold text-slate-800 flex items-center text-sm">
          <div className="w-5 h-5 bg-[#145a32] rounded-full flex items-center justify-center text-white mr-2 text-[9px] font-bold">KH</div>
          Knowledge Hub
        </h3>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-center items-center text-center space-y-4">
        <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
          Explore a centralized repository of agricultural information, farming tips, and market prices.
        </p>
        <Link to="/knowledge-hub" className="bg-[#145a32] hover:bg-[#1e8449] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center w-full justify-center">
          Explore Knowledge Hub
          <ArrowUpRight size={14} className="ml-1.5" />
        </Link>
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
        <Link to="/market-prices" className="text-[10px] font-bold text-slate-500 border border-slate-200 bg-white px-2.5 py-1 rounded-md transition-colors hover:text-[#27ae60]">
          View Reference Prices
        </Link>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-center items-center">
        <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-center w-full">
          <p className="text-sm font-semibold mb-1">Check Reference Prices</p>
          <p className="text-xs opacity-80">View commodity rates across different mandis.</p>
        </div>
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

