import { useState, useEffect } from 'react'
import logo from './assets/logo.jpg'

function App() {
  const [apiStatus, setApiStatus] = useState<string>('Checking...')
  const [aiStatus, setAiStatus] = useState<string>('Checking...')

  useEffect(() => {
    // Check .NET API Status
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => setApiStatus(data.status))
      .catch(() => setApiStatus('Offline'))

    // Check FastAPI Status
    fetch('http://localhost:8000/health')
      .then(res => res.json())
      .then(data => setAiStatus(data.status))
      .catch(() => setAiStatus('Offline'))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center border border-slate-100">
        <img 
          src={logo} 
          alt="AgriSaarthi Logo" 
          className="w-48 h-auto mx-auto mb-6 drop-shadow-sm"
        />
        
        <h1 className="text-3xl font-bold text-[#145a32] mb-2 tracking-tight">
          AgriSaarthi
        </h1>
        <p className="text-[#27ae60] font-medium mb-1">
          AI-Powered Crop Advisory & Farmer's Companion
        </p>
        <p className="text-sm text-slate-500 uppercase tracking-widest mb-8 border-b pb-4">
          Know More Grow More
        </p>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-medium text-slate-700">Web App (React)</span>
            <span className="flex items-center text-sm font-semibold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
              Online
            </span>
          </div>

          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-medium text-slate-700">Main API (.NET)</span>
            <span className={`flex items-center text-sm font-semibold ${apiStatus === 'Healthy' || apiStatus === 'ok' ? 'text-emerald-600' : 'text-amber-500'}`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${apiStatus === 'Healthy' || apiStatus === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              {apiStatus}
            </span>
          </div>

          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-medium text-slate-700">AI Service (Python)</span>
            <span className={`flex items-center text-sm font-semibold ${aiStatus === 'ok' ? 'text-emerald-600' : 'text-amber-500'}`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${aiStatus === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              {aiStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
