
import { Sprout, CloudSun, LineChart, Beaker } from 'lucide-react';
import { WelcomeSection, SummaryCard, FarmOverview } from '../components/dashboard/DashboardCore';
import { WeatherAdvisory, DiseaseDetectionCard, CropRecommendationCard, AiSaarthiCard } from '../components/dashboard/DashboardWidgets';
import { MarketPrices, FarmingTips, SustainableFarming, CommunityCard } from '../components/dashboard/DashboardExtras';

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Top Welcome */}
      <WelcomeSection />

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Recommended Crop" 
          value="Pending" 
          subtitle="Waiting for soil data"
          icon={<Sprout size={24} />} 
          colorClass="bg-emerald-100 text-emerald-600"
        />
        <SummaryCard 
          title="Today's Weather" 
          value="--°C" 
          subtitle="Syncing location..."
          icon={<CloudSun size={24} />} 
          colorClass="bg-sky-100 text-sky-600"
        />
        <SummaryCard 
          title="Market Price (Wheat)" 
          value="₹2,275" 
          subtitle="+1.2% from yesterday"
          icon={<LineChart size={24} />} 
          colorClass="bg-indigo-100 text-indigo-600"
        />
        <SummaryCard 
          title="Soil Health Index" 
          value="Good" 
          subtitle="Based on last profile"
          icon={<Beaker size={24} />} 
          colorClass="bg-amber-100 text-amber-600"
        />
      </div>

      {/* Main Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Span 2 on Desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto md:h-64">
            <FarmOverview />
            <WeatherAdvisory />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto md:h-[400px]">
            <CropRecommendationCard />
            <DiseaseDetectionCard />
          </div>

          <div className="h-auto">
            <MarketPrices />
          </div>

        </div>

        {/* Right Column (Span 1 on Desktop) */}
        <div className="space-y-6 flex flex-col">
          
          <div className="h-auto md:h-64">
            <AiSaarthiCard />
          </div>

          <FarmingTips />

          <div className="grid grid-cols-1 gap-6 flex-1">
            <SustainableFarming />
            <CommunityCard />
          </div>

        </div>

      </div>

    </div>
  );
}
