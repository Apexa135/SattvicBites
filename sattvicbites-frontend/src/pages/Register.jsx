import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, MapPin, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function Register({ onAuthSuccess }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Vallabh Vidyanagar');
  const [pincode, setPincode] = useState('388120');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleCityChange = (selectedCity) => {
    setCity(selectedCity);
    if (selectedCity === 'Vallabh Vidyanagar') {
      setPincode('388120');
    } else if (selectedCity === 'Karamsad') {
      setPincode('388325');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const payload = { name, email, password, city, pincode };
      const response = await axios.post('http://localhost:5000/api/auth/register', payload);
      
      setSuccessMsg('Account registered successfully! Redirecting...');
      localStorage.setItem('sattvicbites_user_token', response.data.token);
      localStorage.setItem('sattvicbites_user_data', JSON.stringify(response.data));
      
      setTimeout(() => {
        onAuthSuccess(response.data);
        navigate('/');
      }, 1500);

    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Server error occurred during account registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 relative z-10">
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        
        <div className="text-center mb-8">
          <div className="bg-[#feecaf]/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-[#e6d480]/30">
            <UserPlus className="text-[#d97706]" size={24} />
          </div>
          <h2 className="font-outfit font-extrabold text-brandNavy text-2xl">Create Account</h2>
          <p className="text-brandNavy/80 text-xs mt-1">Join SattvicBites for fresh daily tiffin delivery</p>
        </div>

        {errorMsg && (
          <div className="bg-brandOchre bg-opacity-10 text-brandNavy p-3 rounded-lg border border-brandOchre/30 text-xs font-semibold mb-4 flex gap-1.5 items-start">
            <AlertTriangle size={14} className="shrink-0 mt-0.5 text-brandOchre" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50/20 text-emerald-900 p-3 rounded-lg border border-emerald-200/30 text-xs font-semibold mb-4">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-brandNavy/70 uppercase tracking-wider mb-1">Full Name</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jinarth Gohil"
              className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-xl px-3 py-2.5 text-sm text-brandNavy placeholder-slate-450 focus:bg-white focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] outline-none font-bold transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brandNavy/70 uppercase tracking-wider mb-1">Email Address</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. gohil.sattvic@gmail.com"
              className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-xl px-3 py-2.5 text-sm text-brandNavy placeholder-slate-450 focus:bg-white focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] outline-none font-bold transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brandNavy/70 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-xl px-3 py-2.5 text-sm text-brandNavy placeholder-slate-450 focus:bg-white focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] outline-none pr-10 font-bold transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-brandNavy/60 hover:text-brandNavy"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="p-4 bg-[#fdfbf4]/40 border border-[#e6d480]/30 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-brandNavy/80 uppercase tracking-wider flex items-center gap-1">
              <MapPin size={14} className="text-[#d97706]" /> Regional Geofencing Bounds
            </h3>
            <p className="text-[10px] text-brandNavy/60 leading-normal">
              Delivery city registration is locked. Select your area:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-brandNavy/70 uppercase tracking-wider mb-1">City Location</label>
                <select
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full bg-[#fdfbf4]/60 border border-[#e6d480]/40 rounded-lg p-2 text-xs text-brandNavy focus:bg-white focus:ring-1 focus:ring-[#d97706] outline-none font-bold transition-all"
                >
                  <option value="Vallabh Vidyanagar">Vallabh Vidyanagar</option>
                  <option value="Karamsad">Karamsad</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-brandNavy/70 uppercase tracking-wider mb-1">Pincode (Locked)</label>
                <input
                  type="text"
                  readOnly
                  value={pincode}
                  className="w-full bg-[#e6d480]/10 border border-[#e6d480]/20 rounded-lg p-2 text-xs text-brandNavy/70 font-mono font-bold outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d97706] hover:bg-[#b45309] text-white py-3 rounded-xl font-bold font-outfit shadow-sm transition-all disabled:opacity-50 text-sm transform active:scale-95 hover:scale-[1.01]"
          >
            {loading ? 'Registering Account...' : 'Create Account'}
          </button>

          <div className="text-center pt-2">
            <span className="text-xs text-brandNavy/60">Already registered? </span>
            <Link
              to="/login"
              className="text-[#d97706] hover:text-[#b45309] text-xs font-bold transition-all hover:underline"
            >
              Sign In Here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
