import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { ShieldAlert, Bug, Activity, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PestDisease() {
  const { token } = useAuth();
  const [crops, setCrops] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [diseases, setDiseases] = useState<any[]>([]);
  const [pests, setPests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCrops();
  }, [token]);

  useEffect(() => {
    if (selectedCrop) {
      fetchKnowledge(selectedCrop);
    } else {
      setDiseases([]);
      setPests([]);
    }
  }, [selectedCrop, token]);

  const fetchCrops = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/agri-knowledge/crops`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCrops(data);
        if (data.length > 0) setSelectedCrop(data[0].id);
      }
    } catch (err) {
      setError('Failed to load crop data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchKnowledge = async (cropId: string) => {
    setLoading(true);
    try {
      const dRes = await fetch(`${API_BASE_URL}/api/agri-knowledge/diseases?crop=${cropId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (dRes.ok) setDiseases(await dRes.json());

      const pRes = await fetch(`${API_BASE_URL}/api/agri-knowledge/pests?crop=${cropId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (pRes.ok) setPests(await pRes.json());
    } catch (err) {
      setError('Failed to load pest & disease knowledge.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !selectedCrop) return <div className="p-8 text-center text-slate-500">Loading knowledge base...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-[#27ae60]" />
            Pest & Disease Intelligence
          </h1>
          <p className="text-slate-500">Explore comprehensive knowledge about crop risks, prevention, and management.</p>
        </div>
        
        <div className="w-full md:w-64">
          <label className="block text-sm font-medium text-slate-700 mb-1">Select Crop</label>
          <select 
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#27ae60] focus:border-transparent outline-none bg-white"
          >
            {crops.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2">
          <Info className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diseases Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
            <Activity className="w-5 h-5 text-red-500" />
            Common Diseases
          </h2>
          {diseases.length === 0 && !loading && (
            <p className="text-slate-500 italic">No disease data found for this crop.</p>
          )}
          {diseases.map((d, i) => (
            <KnowledgeCard key={i} data={d} type="Disease" />
          ))}
        </div>

        {/* Pests Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
            <Bug className="w-5 h-5 text-orange-500" />
            Common Pests
          </h2>
          {pests.length === 0 && !loading && (
            <p className="text-slate-500 italic">No pest data found for this crop.</p>
          )}
          {pests.map((p, i) => (
            <KnowledgeCard key={i} data={p} type="Pest" />
          ))}
        </div>
      </div>
    </div>
  );
}

function KnowledgeCard({ data, type }: { data: any, type: string }) {
  if (data.severity === 'None') return null; // Skip "healthy" placeholders
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">{data.name}</h3>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full mt-1 inline-block ${
            data.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {type} • {data.severity} Severity
          </span>
        </div>
      </div>
      <div className="p-4 space-y-4 text-sm">
        {data.symptoms && data.symptoms.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-800 mb-1">Symptoms</h4>
            <ul className="list-disc pl-5 text-slate-600 space-y-1">
              {data.symptoms.map((s: string, i: number) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}
        
        {data.favorableConditions && data.favorableConditions.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-800 mb-1">Favorable Conditions</h4>
            <ul className="list-disc pl-5 text-slate-600 space-y-1">
              {data.favorableConditions.map((s: string, i: number) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {data.prevention && data.prevention.length > 0 && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <h4 className="font-semibold text-green-800 mb-1">Prevention</h4>
              <ul className="list-disc pl-4 text-green-700 space-y-1 text-xs">
                {data.prevention.map((s: string, i: number) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          
          {data.management && data.management.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-1">Management</h4>
              <ul className="list-disc pl-4 text-blue-700 space-y-1 text-xs">
                {data.management.map((s: string, i: number) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
