import { useState, useEffect } from 'react'
import logo from './assets/logo.jpg'
import FarmerProfileForm from './components/FarmerProfileForm'

function App() {
  const [apiStatus, setApiStatus] = useState<string>('Checking...')
  const [aiStatus, setAiStatus] = useState<string>('Checking...')
  const [activeTab, setActiveTab] = useState<'status' | 'profile'>('profile') // Defaulting to profile for Phase 2

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => setApiStatus(data.status))
      .catch(() => setApiStatus('Offline'))

    fetch('http://localhost:8000/health')
      .then(res => res.json())
      .then(data => setAiStatus(data.status))
      .catch(() => setAiStatus('Offline'))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      {/* Header / Nav */}
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-sm p-6 text-center border border-slate-100 mb-6 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src={logo} alt="AgriSaarthi Logo" className="w-16 h-auto drop-shadow-sm" />
          <div className="text-left">
            <h1 className="text-2xl font-bold text-[#145a32] tracking-tight">AgriSaarthi</h1>
            <p className="text-xs text-[#27ae60] font-medium uppercase tracking-wider">Know More Grow More</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'profile' ? 'bg-[#145a32] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            Farmer Profile
          </button>
          <button 
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'status' ? 'bg-[#145a32] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            System Status
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl w-full">
        {activeTab === 'profile' && <FarmerProfileForm />}
        
        {activeTab === 'status' && (
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100 max-w-md mx-auto mt-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">System Health</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-medium text-slate-700">Web App (React)</span>
                <span className="flex items-center text-sm font-semibold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>Online
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-medium text-slate-700">Main API (.NET)</span>
                <span className={`flex items-center text-sm font-semibold ${apiStatus === 'Healthy' || apiStatus === 'ok' ? 'text-emerald-600' : 'text-amber-500'}`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${apiStatus === 'Healthy' || apiStatus === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>{apiStatus}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-medium text-slate-700">AI Service (Python)</span>
                <span className={`flex items-center text-sm font-semibold ${aiStatus === 'ok' ? 'text-emerald-600' : 'text-amber-500'}`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${aiStatus === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>{aiStatus}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
