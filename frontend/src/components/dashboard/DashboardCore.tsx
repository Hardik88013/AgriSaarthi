import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

// -----------------------------
// Welcome Section
// -----------------------------
export const WelcomeSection = () => {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] || 'Farmer';
  
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Good Morning, {firstName}!</h2>
      <p className="text-slate-500 mt-1">KNOW MORE GROW MORE. Here's what's happening on your farm today.</p>
    </div>
  );
};

// -----------------------------
// Summary Card
// -----------------------------
interface SummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  colorClass: string;
}

export const SummaryCard = ({ title, value, subtitle, icon, colorClass }: SummaryCardProps) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start space-x-4">
    <div className={`p-3 rounded-xl ${colorClass}`}>
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      <div className="text-2xl font-bold text-slate-800 mt-1">{value}</div>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </div>
  </div>
);

// -----------------------------
// Farm Overview
// -----------------------------
export const FarmOverview = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user && token) {
      fetch(`http://localhost:5000/api/farmers/${user.id}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(() => {}); // handle silently for now
    }
  }, [user, token]);

  if (!profile) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-bold text-slate-800 flex items-center">
          <MapPin size={18} className="text-[#27ae60] mr-2" />
          Your Farm Overview
        </h3>
        <Link to="/profile" className="text-xs font-semibold text-[#27ae60] hover:text-[#145a32]">Edit Profile</Link>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Location</p>
            <p className="font-semibold text-slate-700">{profile.location || 'Not set'}, {profile.district || 'Not set'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Farm Size</p>
            <p className="font-semibold text-slate-700">{profile.farmSize ? `${profile.farmSize} Acres` : 'Not set'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Soil Type</p>
            <p className="font-semibold text-slate-700">{profile.soilType || 'Not set'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Primary Crop</p>
            <p className="font-semibold text-slate-700">{profile.primaryCrop || 'Not set'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
