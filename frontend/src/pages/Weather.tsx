import { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, AlertTriangle, MapPin, Calendar, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CurrentWeather {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
  condition: string;
}

interface DailyForecast {
  date: string;
  minTemperature: number;
  maxTemperature: number;
  precipitation: number;
  precipitationProbability: number;
  windSpeed: number;
  weatherCode: number;
  condition: string;
}

interface WeatherData {
  location: string;
  current: CurrentWeather;
  forecast: DailyForecast[];
  advisory: string;
}

export default function Weather() {
  const { token } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/weather', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
    } catch (err: any) {
      setError('Unable to load weather information. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [token]);

  const getWeatherIcon = (code: number, size = 24) => {
    if (code === 0) return <Cloud size={size} className="text-amber-500 fill-amber-100" />;
    if (code >= 1 && code <= 3) return <Cloud size={size} className="text-sky-400 fill-sky-100" />;
    if (code >= 51 && code <= 67) return <Droplets size={size} className="text-blue-500 fill-blue-100" />;
    if (code >= 95) return <Cloud size={size} className="text-slate-600 fill-slate-200" />;
    return <Cloud size={size} className="text-sky-400 fill-sky-100" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#27ae60]"></div>
        <span className="ml-3 text-slate-500 font-medium">Loading weather...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <AlertTriangle size={48} className="text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Weather Unavailable</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-6">{error}</p>
        <button 
          onClick={fetchWeather}
          className="bg-[#145a32] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1e8449] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <Cloud className="text-[#27ae60] mr-3" size={28} />
            Live Weather & Advisory
          </h1>
          <p className="text-slate-500 mt-1 flex items-center">
            <MapPin size={16} className="mr-1 text-slate-400" />
            {weather.location}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Current Weather Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-6 border border-sky-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-sky-600 uppercase tracking-wider">Current</span>
              {getWeatherIcon(weather.current.weatherCode, 40)}
            </div>
            <div className="mt-4">
              <h2 className="text-6xl font-extrabold text-slate-800">{Math.round(weather.current.temperature)}°C</h2>
              <p className="text-lg font-semibold text-slate-600 mt-2">{weather.current.condition}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-sky-100/50">
            <div className="flex items-center">
              <Droplets className="text-sky-400 mr-2" size={20} />
              <div>
                <p className="text-xs text-slate-500 font-medium">Humidity</p>
                <p className="text-sm font-bold text-slate-800">{weather.current.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center">
              <Wind className="text-sky-400 mr-2" size={20} />
              <div>
                <p className="text-xs text-slate-500 font-medium">Wind</p>
                <p className="text-sm font-bold text-slate-800">{weather.current.windSpeed} km/h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Agricultural Advisory */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Activity className="text-[#27ae60] mr-2" size={20} />
            Agricultural Advisory
          </h3>
          <div className="bg-[#eefaf4] rounded-xl p-5 border border-emerald-100">
            <p className="text-[#145a32] text-lg font-medium leading-relaxed">
              {weather.advisory}
            </p>
          </div>

          <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4 flex items-center">
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
