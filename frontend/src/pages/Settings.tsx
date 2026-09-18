import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Palette, Info, LogOut, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Notification preference state (local storage only)
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('agrisaarthi_notifications');
    return saved !== 'disabled'; // default to enabled if not explicitly disabled
  });

  const toggleNotifications = () => {
    const newVal = !notificationsEnabled;
    setNotificationsEnabled(newVal);
    localStorage.setItem('agrisaarthi_notifications', newVal ? 'enabled' : 'disabled');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 pb-12">
      <div className="pt-4">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center">
          <SettingsIcon className="w-6 h-6 text-[#27ae60] mr-2" />
          Settings
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage your preferences and application settings</p>
      </div>

      <div className="space-y-6">
        
        {/* Account Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center bg-slate-50/50">
            <User className="w-5 h-5 text-[#27ae60] mr-2" />
            <h2 className="text-lg font-bold text-slate-800">Account</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">{user?.fullName || 'Farmer Name'}</p>
                <p className="text-sm text-slate-500">{user?.email || 'No email provided'}</p>
              </div>
              <Link
                to="/profile"
                className="inline-flex items-center justify-center px-4 py-2 border border-[#27ae60] text-[#27ae60] font-semibold rounded-lg hover:bg-[#27ae60] hover:text-white transition-colors text-sm"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center bg-slate-50/50">
            <Palette className="w-5 h-5 text-[#27ae60] mr-2" />
            <h2 className="text-lg font-bold text-slate-800">Appearance</h2>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Theme</p>
              <p className="text-sm text-slate-500">Currently using the default application theme.</p>
            </div>
            <div className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
              Light
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center bg-slate-50/50">
            <Bell className="w-5 h-5 text-[#27ae60] mr-2" />
            <h2 className="text-lg font-bold text-slate-800">Notifications</h2>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div className="pr-4">
              <p className="text-sm font-semibold text-slate-800">In-App Alerts</p>
              <p className="text-sm text-slate-500">Enable local alerts for weather and disease intelligence.</p>
            </div>
            <button
              onClick={toggleNotifications}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#27ae60] focus:ring-offset-2 ${
                notificationsEnabled ? 'bg-[#27ae60]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Application Info Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center bg-slate-50/50">
            <Info className="w-5 h-5 text-[#27ae60] mr-2" />
            <h2 className="text-lg font-bold text-slate-800">Application Information</h2>
          </div>
          <div className="p-6 space-y-2">
            <h3 className="text-lg font-black text-[#145a32]">AgriSaarthi</h3>
            <p className="text-sm font-semibold text-slate-800">AI-Powered Crop Advisory & Farmer’s Companion</p>
            <p className="text-sm text-[#27ae60] font-bold tracking-wide">KNOW MORE GROW MORE</p>
            <p className="text-xs text-slate-500 mt-4">Version: 1.0</p>
          </div>
        </div>

        {/* Logout Section */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden mt-8">
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-red-600">Sign Out</p>
              <p className="text-sm text-slate-500">Log out of your current session on this device.</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
