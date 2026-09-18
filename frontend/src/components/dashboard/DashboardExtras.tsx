import React from 'react';
import { ArrowRight, Leaf, Users } from 'lucide-react';

export const BannerCard = ({ 
  title, subtitle, buttonText, icon, bgImage, color 
}: { 
  title: string, subtitle: string, buttonText: string, icon: React.ReactNode, bgImage: string, color: string 
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-sm group cursor-pointer h-full border border-slate-100 flex flex-col justify-end min-h-[130px]">
      <div 
        className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
        style={{ backgroundImage: `url("${bgImage}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent"></div>
      
      <div className="relative z-10 p-4 w-[85%]">
        <div className={`flex items-center mb-1 ${color}`}>
          {icon}
          <h4 className="font-extrabold text-slate-800 ml-2 text-sm">{title}</h4>
        </div>
        <p className="text-[11px] font-medium text-slate-500 mb-2 leading-snug">{subtitle}</p>
        <button className={`bg-[#145a32] hover:bg-[#27ae60] text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md flex items-center transition-colors shadow-sm w-fit`}>
          {buttonText} <ArrowRight size={10} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export const ExtrasRow = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <BannerCard 
        title="Farming Tips"
        subtitle="Small steps make a big difference."
        buttonText="Explore Tips"
        icon={<div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2v1"/><path d="M12 7v1"/><path d="M12 12v1"/><path d="M12 17v1"/><path d="m19 12-1 .5"/><path d="m19 17-1 .5"/><path d="m19 7-1 .5"/><path d="m19 2-1 .5"/><path d="m5 12 1 .5"/><path d="m5 17 1 .5"/><path d="m5 7 1 .5"/><path d="m5 2 1 .5"/></svg></div>}
        bgImage="https://images.unsplash.com/photo-1592982537447-6f2334cbdfa8?auto=format&fit=crop&w=400&q=80"
        color="text-amber-600"
      />
      <BannerCard 
        title="Sustainable Farming"
        subtitle="Use technology. Grow responsibly."
        buttonText="Learn More"
        icon={<Leaf size={16} className="text-[#27ae60]" />}
        bgImage="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=400&q=80"
        color="text-[#27ae60]"
      />
      <BannerCard 
        title="Join Our Community"
        subtitle="Share experiences, learn from others."
        buttonText="Join Now"
        icon={<Users size={16} className="text-[#145a32]" />}
        bgImage="https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=400&q=80"
        color="text-[#145a32]"
      />
    </div>
  );
};
