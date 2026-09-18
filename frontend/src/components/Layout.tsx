import { Navigate, Outlet } from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpg';
import { Link } from 'react-router-dom';

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const AuthLayout = () => {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-slate-100 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3">
            <img src={logo} alt="AgriSaarthi" className="h-10 w-auto" />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-[#145a32] tracking-tight leading-none">AgriSaarthi</h1>
              <span className="text-[10px] text-[#27ae60] font-bold uppercase tracking-wider">Know More Grow More</span>
            </div>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-slate-600 hover:text-[#145a32] font-medium transition-colors">Dashboard</Link>
            <Link to="/profile" className="text-slate-600 hover:text-[#145a32] font-medium transition-colors">Profile</Link>
            <div className="h-6 w-px bg-slate-200"></div>
            <span className="text-sm text-slate-500 hidden md:block">Welcome, <span className="font-semibold text-slate-700">{user?.fullName}</span></span>
            <button 
              onClick={logout} 
              className="text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md font-medium transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow p-4 md:p-8 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};
