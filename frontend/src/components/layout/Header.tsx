import { Bell, Search, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  setSidebarOpen: (isOpen: boolean) => void;
}

export default function Header({ setSidebarOpen }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        
        {/* Left side: Mobile menu & Search */}
        <div className="flex items-center flex-1">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 mr-4 text-slate-500 hover:bg-slate-50 rounded-lg lg:hidden"
          >
            <Menu size={24} />
          </button>

          <div className="max-w-md w-full hidden sm:block relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Ask AgriSaarthi or search..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-full leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#27ae60] focus:ring-1 focus:ring-[#27ae60] sm:text-sm transition-colors"
            />
          </div>
        </div>

        {/* Right side: Notifications & Profile */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-slate-400 hover:text-[#145a32] transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          
          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-700">{user?.fullName}</span>
              <span className="text-xs text-slate-500">Farmer</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-[#e8f5e9] flex items-center justify-center border border-[#a5d6a7]">
              <span className="text-[#145a32] font-bold text-sm">
                {user?.fullName?.charAt(0).toUpperCase() || 'F'}
              </span>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors ml-2"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
