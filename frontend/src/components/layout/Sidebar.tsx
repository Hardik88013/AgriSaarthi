import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, User, Sprout, Bug, CloudSun, 
  ShieldAlert, Lightbulb, LineChart, BookOpen, Settings, X 
} from 'lucide-react';
import logo from '../../assets/logo.jpg';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Farmer Profile', path: '/profile', icon: User },
  { name: 'Crop Recommendation', path: '/crop-recommendation', icon: Sprout },
  { name: 'Disease Detection', path: '/disease-detection', icon: ShieldAlert },
  { name: 'Weather Advisory', path: '/weather', icon: CloudSun },
  { name: 'Pest & Disease Info', path: '/pest-info', icon: Bug },
  { name: 'Farming Tips', path: '/tips', icon: Lightbulb },
  { name: 'Market Prices', path: '/market', icon: LineChart },
  { name: 'Knowledge Hub', path: '/hub', icon: BookOpen },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <Link to="/dashboard" className="flex items-center space-x-3" onClick={() => setIsOpen(false)}>
            <img src={logo} alt="AgriSaarthi Logo" className="h-10 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-[#145a32] tracking-tight leading-none">AgriSaarthi</h1>
            </div>
          </Link>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-colors duration-200",
                  isActive 
                    ? "bg-emerald-50 text-[#145a32]" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#27ae60]"
                )}
              >
                <Icon size={20} className={isActive ? "text-[#27ae60]" : "text-slate-400"} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 text-center">
          <p className="text-[10px] text-[#27ae60] font-bold uppercase tracking-wider">Know More Grow More</p>
        </div>
      </aside>
    </>
  );
}
