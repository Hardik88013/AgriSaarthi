import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      return setError('Invalid phone number. Please enter a valid 10-digit mobile number.');
    }

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          // Parse ASP.NET Core ModelState errors
          const firstErrorKey = Object.keys(data.errors)[0];
          throw new Error(data.errors[firstErrorKey][0]);
        }
        throw new Error(data.message || 'Registration failed. Please check your inputs.');
      }

      login(data.token, { id: data.farmerId, email: data.email, fullName: data.fullName });
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Branding (Hidden on mobile, 50% width on desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0f3d22] items-center justify-center overflow-hidden">
        {/* Subtle background image overlay */}
        <div 
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center' }}
        ></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center p-12 w-full max-w-lg">
          <div className="w-full max-w-[360px] aspect-square bg-white rounded-[40px] flex items-center justify-center shadow-[0_0_60px_rgba(0,0,0,0.3)] p-6 border-[8px] border-white/20 transition-transform duration-500 hover:scale-105">
            <img src={logo} alt="AgriSaarthi Logo" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-24 bg-white relative max-h-screen overflow-y-auto custom-scrollbar">
        <div className="mx-auto w-full max-w-md my-auto">
          
          {/* Mobile Logo (only shows on mobile) */}
          <div className="lg:hidden text-center mb-6">
            <img src={logo} alt="AgriSaarthi" className="mx-auto h-20 w-auto drop-shadow-sm mb-4 rounded-full border border-emerald-100 p-1 bg-white" />
          </div>
          
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#145a32] tracking-tight">Register as a Farmer</h2>
            <p className="mt-3 text-base text-slate-600">
              Already have an account? <Link to="/login" className="font-semibold text-[#27ae60] hover:text-[#1e8449] transition-colors">Sign in here</Link>
            </p>
          </div>

          <div className="bg-white">
            {error && (
              <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200 flex items-start">
                <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="mt-1 block w-full px-4 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#27ae60] focus:border-[#27ae60] sm:text-sm transition-shadow" placeholder="Gurpreet Singh" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-4 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#27ae60] focus:border-[#27ae60] sm:text-sm transition-shadow" placeholder="farmer@example.com" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-4 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#27ae60] focus:border-[#27ae60] sm:text-sm transition-shadow" placeholder="9876543210" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                  <input required type="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full px-4 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#27ae60] focus:border-[#27ae60] sm:text-sm transition-shadow" placeholder="••••••••" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                  <input required type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="mt-1 block w-full px-4 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#27ae60] focus:border-[#27ae60] sm:text-sm transition-shadow" placeholder="••••••••" />
                </div>
              </div>

              <div className="pt-4">
                <button disabled={loading} type="submit" className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-[#27ae60] hover:bg-[#1e8449] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#27ae60] disabled:opacity-70 transition-all active:scale-[0.98]">
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
