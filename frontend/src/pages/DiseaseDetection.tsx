import React, { useState, useRef } from 'react';
import { Upload, X, AlertTriangle, Scan, CheckCircle, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DiseaseDetection = () => {
  const { token } = useAuth();
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ predictedDisease: string, confidence: number } | null>(null);
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
      setError(null);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePredict = async () => {
    if (!image) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

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
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
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

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex flex-col justify-center">
            {result ? (
              <div className="space-y-6 animate-fade-in text-center">
                <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-full mb-2">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Detection Result</h3>
                  <p className="text-2xl font-bold text-gray-800 capitalize">
                    {result.predictedDisease.replace(/_/g, ' ')}
                  </p>
                </div>
                <div>
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
                <button
                  onClick={clearImage}
                  className="mt-6 flex items-center justify-center space-x-2 text-emerald-600 font-medium hover:text-emerald-700 mx-auto"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>New Scan</span>
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Scan className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>Results will appear here after analysis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm p-6 text-sm text-gray-500">
        <p><strong>Disclaimer:</strong> This AI prediction system provides automated analysis of leaf imagery. It should be used as an advisory tool and is not a substitute for professional agricultural or agronomical diagnosis.</p>
      </div>
    </div>
  );
};
