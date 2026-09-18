import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const WelcomeSection = () => {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] || 'Farmer';
  const [greeting, setGreeting] = useState('Welcome');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl mb-6 shadow-sm border border-emerald-100 bg-[#e8f3ee]">
      {/* Background Image full width */}
      <div 
        className="absolute inset-0 w-full h-full opacity-80"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center right' }}
      ></div>
      
      {/* Smooth Gradient Overlay: Solid on left, smoothly blending to transparent on right */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#e8f3ee] from-30% via-[#e8f3ee]/80 via-60% to-transparent"></div>
      
      {/* Content */}
      <div className="relative z-10 px-6 py-8 md:px-8 md:py-10 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#145a32] mb-1.5 flex items-center drop-shadow-sm">
            {greeting}, {firstName}! <span className="ml-2 text-2xl">👋</span>
          </h2>
          <p className="text-[#27ae60] font-bold text-sm md:text-base max-w-xl drop-shadow-sm">
            "Better Information. Healthier Crops. A Prosperous Tomorrow."
          </p>
        </div>
        
        {/* Glassmorphism card for text readability on the right side */}
        <div className="hidden md:flex mt-4 md:mt-0 flex-col items-end bg-white/50 backdrop-blur-md px-5 py-3 rounded-2xl shadow-sm border border-white/60 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
          <p className="text-[#145a32] font-serif italic font-extrabold tracking-wide text-lg text-right drop-shadow-sm">
            Healthy Farms<br/>Brighter Tomorrows
          </p>
        </div>
      </div>
    </div>
  );
};

export const SummaryCard = ({ 
  title, value, subtitle, icon, colorClass, isTrendUp 
}: { 
  title: string, value: string, subtitle: string, icon: React.ReactNode, colorClass: string, isTrendUp?: boolean 
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-colors cursor-pointer relative overflow-hidden">
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">{title}</p>
          <h3 className="text-lg font-bold text-slate-800 leading-tight">{value}</h3>
          <p className="text-[11px] text-slate-500 font-medium mt-1 flex items-center">
            {isTrendUp && <span className="text-[#27ae60] mr-1">↑</span>}
            {subtitle}
          </p>
        </div>
      </div>
      <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#145a32] group-hover:text-white transition-colors">
        <ArrowRight size={14} />
      </div>
    </div>
  );
};
