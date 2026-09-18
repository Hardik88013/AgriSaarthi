import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './dashboard/Sidebar';
import Header from './dashboard/Header';
import { Home, Leaf, ScanLine, IndianRupee, Menu } from 'lucide-react';

export const ProtectedRoute = () => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export const AppLayout = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-[#f3f7f5] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-[280px] flex-shrink-0 z-20">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="z-10">
          <Header />
        </header>

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around items-center h-16 px-2 safe-area-bottom">
          <Link to="/dashboard" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/dashboard') ? 'text-[#145a32]' : 'text-slate-500'}`}>
            <Home size={20} className={isActive('/dashboard') ? 'fill-current' : ''} />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link to="/crop-recommendation" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/crop-recommendation') ? 'text-[#145a32]' : 'text-slate-500'}`}>
            <Leaf size={20} className={isActive('/crop-recommendation') ? 'fill-current' : ''} />
            <span className="text-[10px] font-medium">Advisory</span>
          </Link>
          <Link to="/disease-detection" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/disease-detection') ? 'text-[#145a32]' : 'text-slate-500'}`}>
            <ScanLine size={20} />
            <span className="text-[10px] font-medium">Scan</span>
          </Link>
          <Link to="/market-prices" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/market-prices') ? 'text-[#145a32]' : 'text-slate-500'}`}>
            <IndianRupee size={20} />
            <span className="text-[10px] font-medium">Prices</span>
          </Link>
          <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500">
            <Menu size={20} />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </div>
    </div>
  );
};
