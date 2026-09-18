import { Search, Bell, Mic, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const initials = user?.fullName ? getInitials(user.fullName) : 'F';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-[#f3f7f5] lg:bg-transparent px-4 md:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-3xl flex items-center group order-2 md:order-1">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400 group-focus-within:text-[#27ae60] transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Ask AgriSaarthi anything... (e.g. best crop for my soil, today's weather)"
          className="block w-full pl-11 pr-12 py-3 md:py-2.5 bg-white border-0 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] rounded-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#27ae60]/20"
        />
        <button className="absolute inset-y-0 right-2 flex items-center justify-center px-2">
          <Mic size={18} className="text-[#27ae60]" />
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center justify-end space-x-4 md:space-x-6 shrink-0 order-1 md:order-2">
        <button className="relative p-2 text-slate-500 hover:bg-white hover:shadow-sm rounded-full transition-all">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#f3f7f5]"></span>
        </button>
        
        <div className="flex items-center space-x-3 p-1.5 rounded-full hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
          <div className="w-9 h-9 rounded-full bg-[#e8f3ee] flex items-center justify-center overflow-hidden border border-[#27ae60]/30 text-[#145a32] font-bold text-sm">
             {initials}
          </div>
          <div className="hidden lg:block text-right">
            <p className="text-sm font-bold text-slate-800 leading-tight">{user?.fullName || 'Farmer'}</p>
            <p className="text-xs text-slate-500 font-medium">Farmer</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-red-600 transition-colors ml-1 bg-white md:bg-transparent rounded-full shadow-sm md:shadow-none border border-slate-100 md:border-transparent"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
}
