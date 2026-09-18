import { HardHat } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function PlaceholderPage() {
  const location = useLocation();
  const pageName = location.pathname.substring(1).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="bg-emerald-50 p-6 rounded-full mb-6">
        <HardHat size={64} className="text-[#27ae60]" />
      </div>
      <h2 className="text-3xl font-bold text-[#145a32] mb-4">{pageName} (Coming Soon)</h2>
      <p className="text-slate-600 max-w-md mx-auto mb-8 text-lg">
        This feature is currently under development and will be released in a future phase of AgriSaarthi.
      </p>
      <div className="inline-block bg-white px-6 py-3 rounded-lg shadow-sm border border-slate-100 text-[#27ae60] font-semibold">
        Check back later!
      </div>
    </div>
  );
}
