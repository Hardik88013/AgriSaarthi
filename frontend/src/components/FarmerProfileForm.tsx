import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

type FarmerProfileFormData = {
  location: string;
  state: string;
  district: string;
  farmSize: number | '';
  soilType: string;
  irrigationType: string;
  primaryCrop: string;
};

export default function FarmerProfileForm() {
  const { user, token } = useAuth();
  
  const [formData, setFormData] = useState<FarmerProfileFormData>({
    location: '', state: '', district: '', farmSize: '', soilType: '', irrigationType: '', primaryCrop: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load existing profile
  useEffect(() => {
    if (!user || !token) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/farmers/${user.id}/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setFormData({
            location: data.location || '',
            state: data.state || '',
            district: data.district || '',
            farmSize: data.farmSize || '',
            soilType: data.soilType || '',
            irrigationType: data.irrigationType || '',
            primaryCrop: data.primaryCrop || ''
          });
        }
      } catch (err) {
        console.error("Error loading profile", err);
      }
    };
    
    fetchProfile();
  }, [user, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'farmSize' ? (value ? Number(value) : '') : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;

    setLoading(true);
    setMessage(null);

    try {
      const profileResponse = await fetch(`${API_BASE_URL}/api/farmers/${user.id}/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to save profile details.');
      }

      setMessage({ text: 'Farmer profile saved successfully!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'An error occurred while saving.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-2xl font-bold text-[#145a32] mb-6 border-b pb-2">Agriculture Profile</h2>
      
      {message && (
        <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
            <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
            <input type="text" name="district" value={formData.district} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Specific Location / Village</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Farm Size (Acres)</label>
            <input type="number" step="0.1" name="farmSize" value={formData.farmSize} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Soil Type</label>
            <select name="soilType" value={formData.soilType} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
              <option value="">Select Soil Type</option>
              <option value="Alluvial">Alluvial</option>
              <option value="Black">Black</option>
              <option value="Red">Red</option>
              <option value="Laterite">Laterite</option>
              <option value="Sandy">Sandy</option>
              <option value="Clay">Clay</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Irrigation Type</label>
            <select name="irrigationType" value={formData.irrigationType} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
              <option value="">Select Irrigation</option>
              <option value="Rainfed">Rainfed</option>
              <option value="Canal">Canal</option>
              <option value="Tube Well">Tube Well</option>
              <option value="Drip">Drip</option>
              <option value="Sprinkler">Sprinkler</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Primary Crop</label>
            <input type="text" name="primaryCrop" value={formData.primaryCrop} onChange={handleChange} placeholder="e.g., Wheat, Rice, Cotton" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#27ae60] hover:bg-[#1e8449] text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4">
          {loading ? 'Saving Profile...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
