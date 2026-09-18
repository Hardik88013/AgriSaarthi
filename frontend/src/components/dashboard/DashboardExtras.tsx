
import { TrendingUp, TrendingDown, Minus, BookOpen, Leaf, Users } from 'lucide-react';

// -----------------------------
// Market Prices
// -----------------------------
export const MarketPrices = () => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
    <div className="p-5 border-b border-slate-100">
      <h3 className="font-bold text-slate-800">Current Market Prices</h3>
      <p className="text-xs text-slate-400 mt-1">Demo Data (API integration in future phase)</p>
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <th className="p-4 font-medium">Crop</th>
            <th className="p-4 font-medium">Price/Qtl</th>
            <th className="p-4 font-medium text-right">Trend</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
          <tr className="hover:bg-slate-50/50">
            <td className="p-4 font-medium">Wheat</td>
            <td className="p-4">₹2,275</td>
            <td className="p-4 flex justify-end text-emerald-600"><TrendingUp size={16} /></td>
          </tr>
          <tr className="hover:bg-slate-50/50">
            <td className="p-4 font-medium">Rice (Paddy)</td>
            <td className="p-4">₹2,183</td>
            <td className="p-4 flex justify-end text-emerald-600"><TrendingUp size={16} /></td>
          </tr>
          <tr className="hover:bg-slate-50/50">
            <td className="p-4 font-medium">Cotton</td>
            <td className="p-4">₹6,620</td>
            <td className="p-4 flex justify-end text-red-500"><TrendingDown size={16} /></td>
          </tr>
          <tr className="hover:bg-slate-50/50">
            <td className="p-4 font-medium">Maize</td>
            <td className="p-4">₹2,090</td>
            <td className="p-4 flex justify-end text-slate-400"><Minus size={16} /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

// -----------------------------
// Farming Tips
// -----------------------------
export const FarmingTips = () => (
  <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6 flex items-start space-x-4">
    <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
      <BookOpen size={24} />
    </div>
    <div>
      <h3 className="font-bold text-amber-900 mb-1">Tip of the Day</h3>
      <p className="text-amber-800 text-sm">
        Rotating legumes with cereals can improve soil nitrogen levels naturally, reducing the need for synthetic fertilizers.
      </p>
    </div>
  </div>
);

// -----------------------------
// Sustainable Farming
// -----------------------------
export const SustainableFarming = () => (
  <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6 flex flex-col items-center text-center justify-center h-full">
    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full mb-3">
      <Leaf size={24} />
    </div>
    <h3 className="font-bold text-emerald-900 mb-2">Sustainable Practices</h3>
    <p className="text-emerald-800 text-sm">
      Embrace modern agriculture to preserve water and maintain soil health for generations.
    </p>
  </div>
);

// -----------------------------
// Community Card
// -----------------------------
export const CommunityCard = () => (
  <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-6 flex flex-col items-center text-center justify-center h-full">
    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full mb-3">
      <Users size={24} />
    </div>
    <h3 className="font-bold text-indigo-900 mb-2">Farmer Community</h3>
    <p className="text-indigo-800 text-sm mb-4">
      Join discussions, share experiences, and learn from local farmers.
    </p>
    <button disabled className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed">
      Coming Soon
    </button>
  </div>
);
