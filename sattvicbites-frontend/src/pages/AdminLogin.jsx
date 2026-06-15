import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, AlertCircle, CheckCircle } from 'lucide-react';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdminLogin({ adminToken, setAdminToken, onAdminLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passkey, setPasskey] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (adminToken) {
      navigate('/admin/config', { replace: true });
    }
  }, [adminToken]);

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const MASTER_PASSKEY = import.meta.env.VITE_MASTER_PASSKEY;
    if (!MASTER_PASSKEY) {
      setErrorMsg('Client configuration error: Master passkey is not configured in the environment.');
      setLoading(false);
      return;
    }
    if (passkey !== MASTER_PASSKEY) {
      setErrorMsg('Invalid Cryptographic Passkey. Isolated access blocked.');
      setLoading(false);
      return;
    }

    try {
      const payload = { email, password };
      const response = await axios.post(`${apiBase}/api/auth/login`, payload);

      if (!response.data.isAdmin) {
        setErrorMsg('Authentication succeeded, but account lacks administrative clearance.');
        setLoading(false);
        return;
      }

      setSuccessMsg('Passkey clear. Entering Kitchen Dispatch Dashboard...');
      localStorage.setItem('sattvicbites_admin_token', response.data.token);
      
      setTimeout(() => {
        setAdminToken(response.data.token);
        onAdminLogin(response.data.token);
        navigate('/admin/config', { replace: true });
      }, 1200);

    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid admin email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 relative z-10">
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        
        <div className="text-center mb-8">
          <div className="bg-[#feecaf]/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-[#e6d480]/30">
            <Shield className="text-[#d97706]" size={24} />
          </div>
          <h2 className="font-outfit font-extrabold text-brandNavy text-2xl">Isolated Admin Access</h2>
          <p className="text-brandNavy/70 text-xs mt-1">Requires cryptographic passkey verification</p>
        </div>

        {errorMsg && (
          <div className="bg-brandOchre bg-opacity-10 text-brandNavy p-3 rounded-lg border border-brandOchre/30 text-xs font-semibold mb-4 flex gap-1.5 items-start">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-brandOchre" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50/20 text-emerald-900 p-3 rounded-lg border border-emerald-200/30 text-xs font-semibold mb-4">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAdminAuth} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-brandNavy/70 uppercase tracking-wider mb-1">Admin Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sattvicbites.com"
              className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-xl px-3 py-2.5 text-sm text-brandNavy placeholder-slate-455 focus:bg-white focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] outline-none font-bold transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brandNavy/70 uppercase tracking-wider mb-1">Admin Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-xl px-3 py-2.5 text-sm text-brandNavy placeholder-slate-455 focus:bg-white focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] outline-none font-bold transition-all"
            />
          </div>

          <div className="p-4 bg-[#fdfbf4]/40 border border-[#e6d480]/30 rounded-xl">
            <label className="block text-xs font-bold text-[#d97706] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Key size={12} /> Master Cryptographic Passkey
            </label>
            <input
              required
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="Enter passkey to unlock dispatch database"
              className="w-full bg-[#fdfbf4]/70 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-mono font-bold tracking-widest text-brandNavy focus:bg-white focus:ring-1 focus:ring-[#d97706] outline-none"
            />
            <span className="text-[9px] text-brandNavy/60 mt-1.5 block">
              Development Notice: Try passkey <code>sattvic_master_passkey_2026</code>
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d97706] hover:bg-[#b45309] text-white py-3 rounded-xl font-bold font-outfit shadow-sm transition-all disabled:opacity-50 text-sm transform active:scale-95 hover:scale-[1.01]"
          >
            {loading ? 'Decrypting Access Clearances...' : 'Unlock Dispatch Dashboard'}
          </button>
          
        </form>

      </div>
    </div>
  );
}
