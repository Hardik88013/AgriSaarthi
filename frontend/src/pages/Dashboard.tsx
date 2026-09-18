import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { user } = useAuth();
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const [aiStatus, setAiStatus] = useState<string>('Checking...');

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => setApiStatus(data.status))
      .catch(() => setApiStatus('Offline'));

    fetch('http://localhost:8000/health')
      .then(res => res.json())
      .then(data => setAiStatus(data.status))
      .catch(() => setAiStatus('Offline'));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-[#145a32] mb-2">Welcome to AgriSaarthi, {user?.fullName}!</h2>
        <p className="text-slate-600">Your personalized AI-powered agricultural dashboard will be built here in future phases.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">System Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-medium text-slate-700">Web App (React)</span>
              <span className="flex items-center text-sm font-semibold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>Online
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-medium text-slate-700">Main API (.NET)</span>
              <span className={`flex items-center text-sm font-semibold ${apiStatus === 'Healthy' || apiStatus === 'ok' ? 'text-emerald-600' : 'text-amber-500'}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${apiStatus === 'Healthy' || apiStatus === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>{apiStatus}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-medium text-slate-700">AI Service (Python)</span>
              <span className={`flex items-center text-sm font-semibold ${aiStatus === 'ok' ? 'text-emerald-600' : 'text-amber-500'}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${aiStatus === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>{aiStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#145a32] text-white rounded-2xl shadow-sm p-6 border border-[#1e8449] flex flex-col justify-center items-center text-center">
            <h3 className="text-xl font-bold mb-2">Phase 3 Complete</h3>
            <p className="text-emerald-100">
              Secure authentication and user access have been established. 
              You can now safely manage your profile data!
            </p>
        </div>
      </div>
    </div>
  );
}
