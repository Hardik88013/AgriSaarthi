import React, { useState, useRef } from 'react';
import { Upload, X, AlertTriangle, Scan, CheckCircle, RotateCcw, Info, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const DiseaseDetection = () => {
  const { token } = useAuth();
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ predictedDisease: string, confidence: number } | null>(null);
  const [knowledge, setKnowledge] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setKnowledge(null);
      setError(null);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreviewUrl(null);
    setResult(null);
    setKnowledge(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePredict = async () => {
    if (!image) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    setKnowledge(null);

    const formData = new FormData();
    formData.append('image', image);

    try {
      const res = await fetch(`http://localhost:5000/api/disease-detection/predict`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        let msg = 'Failed to analyze image.';
        try {
          const errData = await res.json();
          if (errData.message) msg = errData.message;
        } catch { }
        throw new Error(msg);
      }

      const data = await res.json();
      setResult(data);

      // Fetch knowledge base info
      if (data.predictedDisease) {
        try {
          const kRes = await fetch(`http://localhost:5000/api/agri-knowledge/disease/${encodeURIComponent(data.predictedDisease)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (kRes.ok) {
            const kData = await kRes.json();
            setKnowledge(kData);
          }
        } catch (e) {
          console.warn("Could not load knowledge base data", e);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Scan className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Disease Detection</h2>
        </div>

        <p className="text-gray-600 mb-8">
          Upload a clear image of a crop leaf to detect potential diseases using our AI model. 
          For best results, ensure the leaf is well-lit and centered in the photo.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-xl flex items-start space-x-3 border border-red-100">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {!previewUrl ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-1">Click or drag image to upload</p>
                <p className="text-xs text-gray-400">JPG, PNG (max 10MB)</p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img src={previewUrl} alt="Leaf Preview" className="w-full h-64 object-cover" />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white shadow-sm transition-colors"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <button
              onClick={handlePredict}
              disabled={!image || loading}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 ${
                !image || loading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md'
              }`}
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Scan className="h-5 w-5" />
                  <span>Detect Disease</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex flex-col justify-start relative">
            {result ? (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-full mb-2">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">AI Prediction</h3>
                  <p className="text-2xl font-bold text-gray-800 capitalize">
                    {result.predictedDisease.replace(/___/g, ' - ').replace(/_/g, ' ')}
                  </p>
                  
                  <div className="mt-4 px-8">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Confidence</span>
                      <span className="font-medium text-gray-800">{(result.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${result.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {knowledge && knowledge.severity !== 'None' && (
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mt-4 text-sm text-left space-y-3">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5 border-b pb-2">
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                      Disease Information
                    </h4>
                    
                    {knowledge.symptoms && knowledge.symptoms.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-700 block mb-1">Symptoms:</span>
                        <ul className="list-disc pl-4 text-slate-600 text-xs space-y-0.5">
                          {knowledge.symptoms.map((s: string, i: number) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    )}
                    {knowledge.management && knowledge.management.length > 0 && (
                      <div>
                        <span className="font-semibold text-blue-700 block mb-1">Management:</span>
                        <ul className="list-disc pl-4 text-blue-600 text-xs space-y-0.5">
                          {knowledge.management.map((s: string, i: number) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    )}
                    <div className="pt-2 text-center">
                      <Link to="/pest-disease" className="text-xs text-[#27ae60] font-semibold hover:underline">
                        View full pest & disease intelligence
                      </Link>
                    </div>
                  </div>
                )}
                
                {knowledge && knowledge.severity === 'None' && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-green-800 text-sm text-center">
                    <p className="font-bold mb-1">Crop appears healthy!</p>
                    <p className="text-xs">Continue standard monitoring and maintenance.</p>
                  </div>
                )}

                <button
                  onClick={clearImage}
                  className="mt-6 flex items-center justify-center space-x-2 text-emerald-600 font-medium hover:text-emerald-700 mx-auto"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>New Scan</span>
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500 h-full flex flex-col justify-center">
                <Scan className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>Results will appear here after analysis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-amber-50 rounded-2xl shadow-sm p-5 text-sm text-amber-800 flex items-start gap-3 border border-amber-100">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Disclaimer:</strong> This is an AI Prediction. It provides automated analysis of leaf imagery based on patterns. 
          Use this result as an initial indication and consult a qualified agricultural expert for confirmation when needed.
        </p>
      </div>
    </div>
  );
};
