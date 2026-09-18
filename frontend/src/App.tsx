import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout, ProtectedRoute } from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FarmerProfileForm from './components/FarmerProfileForm';
import PlaceholderPage from './pages/PlaceholderPage';
import CropRecommendation from './pages/CropRecommendation';
import Weather from './pages/Weather';
import { DiseaseDetection } from './pages/DiseaseDetection';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<FarmerProfileForm />} />
              <Route path="/crop-recommendation" element={<CropRecommendation />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/disease-detection" element={<DiseaseDetection />} />
              <Route path="*" element={<PlaceholderPage />} />
            </Route>
          </Route>

          {/* Fallback to Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
