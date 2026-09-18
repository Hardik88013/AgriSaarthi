import { Link } from 'react-router-dom';
import { BookOpen, Sprout, Bug, Lightbulb, LineChart, CloudRain } from 'lucide-react';

export default function KnowledgeHub() {
  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-12">
      <header className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center">
            <BookOpen className="w-6 h-6 text-indigo-600 mr-2" />
            Knowledge Hub
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Your central resource for agricultural information</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Crops */}
          <Link to="/crop-recommendation" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group flex flex-col h-full">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sprout size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Crop Recommendation</h3>
            <p className="text-sm text-slate-500 flex-1 leading-relaxed">Discover the best crops for your specific soil type and climate using ML.</p>
            <div className="mt-4 text-emerald-600 font-bold text-sm flex items-center">
              Explore Crops &rarr;
            </div>
          </Link>

          {/* Pests & Diseases */}
          <Link to="/pest-disease" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-red-200 transition-all group flex flex-col h-full">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Bug size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Pests & Diseases</h3>
            <p className="text-sm text-slate-500 flex-1 leading-relaxed">Extensive encyclopedia of crop diseases, pests, symptoms, and treatments.</p>
            <div className="mt-4 text-red-500 font-bold text-sm flex items-center">
              View Encyclopedia &rarr;
            </div>
          </Link>

          {/* Farming Tips */}
          <Link to="/farming-tips" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-200 transition-all group flex flex-col h-full">
            <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Lightbulb size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Farming Tips</h3>
            <p className="text-sm text-slate-500 flex-1 leading-relaxed">Actionable advice on soil preparation, irrigation, sustainability, and more.</p>
            <div className="mt-4 text-amber-500 font-bold text-sm flex items-center">
              Read Tips &rarr;
            </div>
          </Link>

          {/* Market Prices */}
          <Link to="/market-prices" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-green-200 transition-all group flex flex-col h-full">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <LineChart size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Market Prices</h3>
            <p className="text-sm text-slate-500 flex-1 leading-relaxed">View reference commodity prices across different states and mandis.</p>
            <div className="mt-4 text-green-600 font-bold text-sm flex items-center">
              Check Prices &rarr;
            </div>
          </Link>

          {/* Weather */}
          <Link to="/weather" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-200 transition-all group flex flex-col h-full">
            <div className="w-12 h-12 bg-sky-100 text-sky-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CloudRain size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Weather Advisory</h3>
            <p className="text-sm text-slate-500 flex-1 leading-relaxed">Access localized weather forecasts and farming advisories.</p>
            <div className="mt-4 text-sky-500 font-bold text-sm flex items-center">
              View Forecast &rarr;
            </div>
          </Link>
          
        </div>
      </div>
    </div>
  );
}
