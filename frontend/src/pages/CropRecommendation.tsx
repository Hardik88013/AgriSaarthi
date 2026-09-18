import { CropRecommendationCard } from '../components/dashboard/DashboardWidgets';

export default function CropRecommendation() {
  return (
    <div className="p-6 max-w-4xl mx-auto h-[800px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#145a32]">Crop Recommendation ML</h1>
        <p className="text-slate-500">Get AI-powered crop recommendations based on soil health and climate parameters.</p>
      </div>
      <div className="h-[600px]">
        <CropRecommendationCard />
      </div>
    </div>
  );
}
