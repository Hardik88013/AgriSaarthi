import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, User, Leaf, ShieldAlert, CloudSun, Bug, 
  LineChart, Lightbulb, Bot, BookOpen, Users, Settings, LogOut 
} from 'lucide-react';
import logoUrl from '../../assets/logo.jpg';

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={18} /> },
    { name: 'Farmer Profile', path: '/profile', icon: <User size={18} /> },
    { name: 'Crop Recommendation', path: '/crop-recommendation', icon: <Leaf size={18} /> },
    { name: 'Disease Detection', path: '/disease-detection', icon: <ShieldAlert size={18} /> },
    { name: 'Weather Advisory', path: '/weather', icon: <CloudSun size={18} /> },
    { name: 'Pest & Disease Info', path: '/pest-info', icon: <Bug size={18} /> },
    { name: 'Market Prices', path: '/market-prices', icon: <LineChart size={18} /> },
    { name: 'Farming Tips', path: '/farming-tips', icon: <Lightbulb size={18} /> },
    { name: 'AI Assistant', path: '/ai-assistant', icon: <Bot size={18} /> },
    { name: 'Knowledge Hub', path: '/knowledge', icon: <BookOpen size={18} /> },
    { name: 'Community', path: '/community', icon: <Users size={18} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="h-full bg-white flex flex-col border-r border-slate-100 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
      {/* Logo */}
      <div className="p-6 flex items-center justify-center border-b border-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-2 overflow-hidden border border-emerald-100 p-1">
             <img src={logoUrl} alt="AgriSaarthi Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <h1 className="text-xl font-bold text-[#145a32] tracking-tight">AgriSaarthi</h1>
          <p className="text-[9px] text-[#27ae60] uppercase tracking-wider font-semibold mt-0.5 text-center leading-tight">AI-Powered Crop Advisory<br/>& Farmer's Companion</p>
          <div className="h-[1px] w-8 bg-[#27ae60] mt-1.5 opacity-50"></div>
          <p className="text-[7px] text-slate-400 tracking-widest mt-1">KNOW MORE GROW MORE</p>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-emerald-50 text-[#145a32] font-semibold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-[#27ae60]'
                  }`}
                >
                  <span className={`mr-3 ${isActive ? 'text-[#27ae60]' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Need Help Card */}
      <div className="p-4">
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Bot size={48} className="text-[#145a32]" />
          </div>
          <h4 className="font-bold text-[#145a32] text-sm relative z-10">Need Help?</h4>
          <p className="text-xs text-[#27ae60] mb-3 relative z-10">Our AI is here for you</p>
          <button className="w-full bg-[#145a32] hover:bg-[#1e8449] text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-between relative z-10">
            <span>Chat with AgriSaarthi</span>
            <span>&rarr;</span>
          </button>
        </div>
        
        <button
          onClick={handleLogout}
          className="mt-4 flex items-center px-4 py-2 text-sm text-slate-500 hover:text-red-600 transition-colors w-full"
        >
          <LogOut size={18} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}
