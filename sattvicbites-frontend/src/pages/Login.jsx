import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Login({ onAuthSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const payload = { email, password };
      const response = await axios.post(`${apiBase}/api/auth/login`, payload);

      setSuccessMsg('Logged in successfully! Redirecting...');
      localStorage.setItem('sattvicbites_user_token', response.data.token);
      localStorage.setItem('sattvicbites_user_data', JSON.stringify(response.data));

      setTimeout(() => {
        onAuthSuccess(response.data);
        navigate('/');
      }, 1500);

    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password combination.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 relative z-10">
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        
        <div className="text-center mb-8">
          <div className="bg-[#feecaf]/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-[#e6d480]/30">
            <LogIn className="text-[#d97706]" size={24} />
          </div>
          <h2 className="font-outfit font-extrabold text-brandNavy text-2xl">Welcome Back</h2>
          <p className="text-brandNavy/70 text-xs mt-1 font-semibold">Access your SattvicBites tiffin dashboard</p>
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

        <form onSubmit={handleLogin} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-brandNavy/70 uppercase tracking-wider mb-1">Email Address</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d97706] hover:bg-[#b45309] text-white py-3 rounded-xl font-bold font-outfit shadow-sm transition-all disabled:opacity-50 text-sm transform active:scale-95 hover:scale-[1.01]"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>

          <div className="text-center pt-2 flex flex-col space-y-3">
            <div>
              <span className="text-xs text-brandNavy/60">New to SattvicBites? </span>
              <Link
                to="/register"
                className="text-[#d97706] hover:text-[#b45309] text-xs font-bold transition-all hover:underline"
              >
                Create Account
              </Link>
            </div>

            <div className="border-t border-[#e6d480]/20 pt-3">
              <Link
                to="/admin/login"
                className="text-xs font-bold text-[#d97706] hover:text-[#b45309] flex items-center justify-center gap-1 mx-auto hover:underline"
              >
                <ShieldCheck size={14} /> Enter Isolated Admin Dispatch Logs
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
