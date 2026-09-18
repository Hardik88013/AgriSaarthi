import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { 
  Cloud, Droplets, Wind, Calendar, 
  MapPin, AlertCircle, RefreshCw, Activity, Sun,
  CloudRain, CloudLightning, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';


interface WeatherData {
  location: string;
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
    condition: string;
    isDay: boolean;
  };
  forecast: Array<{
    date: string;
    maxTemperature: number;
    minTemperature: number;
    precipitationProbability: number;
    weatherCode: number;
    condition: string;
  }>;
  advisory: string;
}

interface RiskAdvisory {
  riskLevel: string;
  alerts: string[];
  recommendations: string[];
}

export default function Weather() {
  const { token } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [riskAdvisory, setRiskAdvisory] = useState<RiskAdvisory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWeather();
  }, [token]);

  const fetchWeather = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/weather`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 404) {
        setError('Please complete your farmer profile location to view weather.');
        setLoading(false);
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to fetch weather data');
      }
      const data = await res.json();
      setWeather(data);

      try {
        const advRes = await fetch(`${API_BASE_URL}/api/agri-knowledge/advisory`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (advRes.ok) {
          setRiskAdvisory(await advRes.json());
        }
      } catch(e) { console.warn("Failed to fetch risk advisory"); }

    } catch (err) {
      setError('Unable to load weather information.');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code: number, size = 24) => {
    // Basic mapping
    if (code === 0) return <Sun size={size} className="text-amber-500" />;
    if (code >= 1 && code <= 3) return <CloudSun size={size} className="text-slate-400" />;
    if (code >= 51 && code <= 67) return <CloudRain size={size} className="text-blue-400" />;
    if (code >= 95) return <CloudLightning size={size} className="text-purple-500" />;
    return <Cloud size={size} className="text-slate-400" />;
  };

  // SVG for CloudSun since lucide-react might not export it directly here if not imported properly
  const CloudSun = ({ size, className }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.93 4.93l1.41 1.41"></path><path d="M17.66 17.66l1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M6.34 17.66l-1.41 1.41"></path><path d="M19.07 4.93l-1.41 1.41"></path><path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"></path>
    </svg>
  );


  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27ae60]"></div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex flex-col items-center justify-center text-center h-[40vh] border border-red-100">
        <AlertCircle size={40} className="mb-4 text-red-400" />
        <p className="font-semibold text-lg">{error}</p>
        <button onClick={fetchWeather} className="mt-6 flex items-center text-sm font-bold bg-white text-red-600 px-4 py-2 rounded-lg shadow-sm border border-red-100 hover:bg-red-50">
          <RefreshCw size={16} className="mr-2" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <MapPin className="text-[#27ae60] mr-2" size={24} />
            {weather.location}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Live weather and agricultural advisory</p>
        </div>
        <button onClick={fetchWeather} className="text-slate-400 hover:text-[#27ae60] p-2 bg-white rounded-lg shadow-sm border border-slate-100 transition-colors">
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Weather Card */}
        <div className="bg-gradient-to-br from-[#27ae60] to-[#1e8449] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
            {getWeatherIcon(weather.current.weatherCode, 200)}
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                Current
              </span>
              <span className="text-sm font-medium opacity-90">{weather.current.condition}</span>
            </div>
            
            <div className="flex items-center mb-8">
              {getWeatherIcon(weather.current.weatherCode, 64)}
              <div className="ml-4">
                <div className="text-5xl font-bold tracking-tighter">
                  {Math.round(weather.current.temperature)}°<span className="text-3xl opacity-80">C</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-6">
              <div className="flex items-center">
                <Droplets className="opacity-70 mr-2" size={18} />
                <div>
                  <div className="text-xs opacity-70">Humidity</div>
                  <div className="font-bold">{weather.current.humidity}%</div>
                </div>
              </div>
              <div className="flex items-center">
                <Wind className="opacity-70 mr-2" size={18} />
                <div>
                  <div className="text-xs opacity-70">Wind</div>
                  <div className="font-bold">{weather.current.windSpeed} km/h</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agricultural Advisory */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <Activity className="text-[#27ae60] mr-2" size={20} />
              Agricultural Advisory
            </h3>
            <div className="bg-[#eefaf4] rounded-xl p-5 border border-emerald-100">
              <p className="text-[#145a32] text-sm md:text-base font-medium leading-relaxed">
                {weather.advisory}
              </p>
            </div>
          </div>

          {riskAdvisory && (
            <div className="mt-6 border-t border-slate-100 pt-5">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
                <ShieldAlert className={`w-4 h-4 mr-1.5 ${
                  riskAdvisory.riskLevel === 'High' ? 'text-red-500' :
                  riskAdvisory.riskLevel === 'Moderate' ? 'text-orange-500' :
                  'text-emerald-500'
                }`} />
                Pest & Disease Risk Advisory: {riskAdvisory.riskLevel}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <h4 className="text-xs font-semibold text-slate-600 uppercase mb-2">Active Alerts</h4>
                  <ul className="text-sm text-slate-700 space-y-1 pl-4 list-disc">
                    {riskAdvisory.alerts.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                  <h4 className="text-xs font-semibold text-emerald-800 uppercase mb-2">Recommendations</h4>
                  <ul className="text-sm text-emerald-700 space-y-1 pl-4 list-disc">
                    {riskAdvisory.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 7-Day Forecast full width below */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Calendar className="text-slate-400 mr-2" size={20} />
            7-Day Forecast
          </h3>
          <div className="overflow-x-auto pb-2">
            <div className="flex space-x-4 min-w-max">
              {weather.forecast.map((day, idx) => {
                const dateObj = new Date(day.date);
                const dayName = idx === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                return (
                  <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col items-center min-w-[120px]">
                    <span className="text-sm font-bold text-slate-700">{dayName}</span>
                    <span className="text-xs text-slate-400 mb-3">{dateStr}</span>
                    {getWeatherIcon(day.weatherCode, 28)}
                    <span className="text-xs font-semibold text-slate-600 mt-3 text-center h-8 flex items-center">{day.condition}</span>
                    <div className="flex items-center justify-between w-full mt-3 pt-3 border-t border-slate-200">
                      <span className="text-sm font-bold text-slate-800">{Math.round(day.maxTemperature)}°</span>
                      <span className="text-xs font-medium text-slate-400">{Math.round(day.minTemperature)}°</span>
                    </div>
                    {day.precipitationProbability > 20 && (
                      <div className="text-[10px] font-bold text-blue-500 mt-2 flex items-center">
                        <Droplets size={10} className="mr-1" />
                        {day.precipitationProbability}%
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
