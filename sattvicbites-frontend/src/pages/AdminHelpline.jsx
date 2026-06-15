import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import { Phone, Link2, AlertCircle, CheckCircle, Save } from 'lucide-react';

export default function AdminHelpline({ adminToken }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // States for helpline configuration
  const [helpline, setHelpline] = useState('');
  const [communityLink, setCommunityLink] = useState('');
  const [discordLink, setDiscordLink] = useState('');
  const [additionalNumbers, setAdditionalNumbers] = useState([]);
  const [additionalLinks, setAdditionalLinks] = useState([]);

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
    } else {
      fetchHelplines();
    }
  }, [adminToken]);

  const fetchHelplines = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.get('http://localhost:5000/api/settings');
      if (res.data) {
        setHelpline(res.data.helplineNumber || '');
        setCommunityLink(res.data.communityLink || '');
        setDiscordLink(res.data.discordLink || '');
        setAdditionalNumbers(res.data.additionalNumbers || []);
        setAdditionalLinks(res.data.additionalLinks || []);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to sync helpline settings from database.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHelpline = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSaved(false);

    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      const payload = {
        helplineNumber: helpline,
        communityLink,
        discordLink,
        additionalNumbers,
        additionalLinks
      };

      await axios.put('http://localhost:5000/api/settings', payload, config);
      setSuccessMsg('Helplines and links configuration saved.');
      setIsSaved(true);
      setTimeout(() => {
        setSuccessMsg('');
        setIsSaved(false);
      }, 1000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save configuration.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 font-outfit">
      <AdminNavbar />

      {errorMsg && (
        <div className="bg-brandOchre bg-opacity-10 text-brandNavy p-4 rounded-xl border border-brandOchre/30 text-xs font-bold flex items-center gap-2">
          <AlertCircle size={16} className="text-brandOchre" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-[#feecaf]/20 text-brandNavy p-4 rounded-xl border border-[#e6d480]/30 text-xs font-bold flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="glass-card rounded-2xl p-6 space-y-6 relative z-10">
        <div>
          <h2 className="font-extrabold text-brandNavy text-base flex items-center gap-2 border-b border-[#e6d480]/20 pb-3">
            <Phone className="text-[#d97706]" size={20} /> 5. Helpline & Community Links Config
          </h2>
          <p className="text-[11px] text-brandNavy/70 font-semibold mt-1">
            Configure contact coordinates and social community links displayed in the client website footer.
          </p>
        </div>

        <form onSubmit={handleSaveHelpline} className="space-y-5 font-inter">
          <div>
            <label className="block text-[10px] font-bold text-brandNavy/70 uppercase tracking-wider mb-1">
              Customer Helpline Number / Contact
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brandNavy/60">
                <Phone size={14} />
              </span>
              <input
                type="text"
                required
                value={helpline}
                onChange={(e) => setHelpline(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg pl-9 p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-450 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-brandNavy/70 uppercase tracking-wider mb-1">
              Community Forum Link
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brandNavy/60">
                <Link2 size={14} />
              </span>
              <input
                type="url"
                required
                value={communityLink}
                onChange={(e) => setCommunityLink(e.target.value)}
                placeholder="e.g. https://community.sattvicbites.com"
                className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg pl-9 p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-450 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-brandNavy/70 uppercase tracking-wider mb-1">
              Discord Server Invite Link
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brandNavy/60">
                <Link2 size={14} />
              </span>
              <input
                type="url"
                required
                value={discordLink}
                onChange={(e) => setDiscordLink(e.target.value)}
                placeholder="e.g. https://discord.gg/sattvicbites"
                className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg pl-9 p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-450 transition-all"
              />
            </div>
          </div>

          {/* Additional Helpline Numbers */}
          <div className="space-y-3 p-4 bg-[#fdfbf4]/40 border border-[#e6d480]/30 rounded-xl text-left">
            <span className="block text-xs font-bold text-brandNavy/80 uppercase tracking-wider mb-1 font-outfit">
              📞 Additional Helpline Numbers
            </span>
            {additionalNumbers.map((num, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={num}
                  onChange={(e) => {
                    const updated = [...additionalNumbers];
                    updated[index] = e.target.value;
                    setAdditionalNumbers(updated);
                  }}
                  placeholder="e.g. +91 99887 76655"
                  className="flex-grow bg-white/60 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy"
                />
                <button
                  type="button"
                  onClick={() => {
                    setAdditionalNumbers(additionalNumbers.filter((_, i) => i !== index));
                  }}
                  className="bg-red-700 hover:bg-red-900 text-white text-xs px-2.5 py-2 rounded-lg font-bold shrink-0"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setAdditionalNumbers([...additionalNumbers, ''])}
              className="bg-brandGreen hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold inline-block"
            >
              + Add Helpline Number
            </button>
          </div>

          {/* Additional Social Links */}
          <div className="space-y-3 p-4 bg-[#fdfbf4]/40 border border-[#e6d480]/30 rounded-xl text-left">
            <span className="block text-xs font-bold text-brandNavy/80 uppercase tracking-wider mb-1 font-outfit">
              🔗 Additional Social & Info Links
            </span>
            {additionalLinks.map((link, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-white/20 border border-[#e6d480]/20 rounded-lg relative">
                <div>
                  <label className="block text-[9px] font-bold text-brandNavy/60 uppercase tracking-wider mb-0.5">Link Label</label>
                  <input
                    type="text"
                    required
                    value={link.label}
                    onChange={(e) => {
                      const updated = [...additionalLinks];
                      updated[index] = { ...updated[index], label: e.target.value };
                      setAdditionalLinks(updated);
                    }}
                    placeholder="e.g. Instagram Page"
                    className="w-full bg-white/60 border border-[#e6d480]/40 rounded-lg p-1.5 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-brandNavy/60 uppercase tracking-wider mb-0.5">Link URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      required
                      value={link.url}
                      onChange={(e) => {
                        const updated = [...additionalLinks];
                        updated[index] = { ...updated[index], url: e.target.value };
                        setAdditionalLinks(updated);
                      }}
                      placeholder="e.g. https://instagram.com/sattvicbites"
                      className="flex-grow bg-white/60 border border-[#e6d480]/40 rounded-lg p-1.5 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setAdditionalLinks(additionalLinks.filter((_, i) => i !== index));
                      }}
                      className="bg-red-700 hover:bg-red-900 text-white text-xs px-2.5 py-1.5 rounded-lg font-bold shrink-0 self-end"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setAdditionalLinks([...additionalLinks, { label: '', url: '' }])}
              className="bg-brandGreen hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold inline-block"
            >
              + Add Social / Info Link
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all font-outfit flex items-center justify-center gap-1.5 shadow-sm ${
              isSaved ? 'bg-emerald-600 text-white' : 'bg-[#d97706] hover:bg-[#b45309] text-white'
            }`}
          >
            <Save size={14} />
            {isSaved ? 'Saved! ✓' : 'Save Footer Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
