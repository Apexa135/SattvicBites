import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import { Shield, AlertCircle, CheckCircle, RefreshCw, Settings, Layers, Plus, Trash2, Clock, Volume2 } from 'lucide-react';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdminConfig({ adminToken }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Save buttons feedback states
  const [lunchMenuSaved, setLunchMenuSaved] = useState(false);
  const [dinnerMenuSaved, setDinnerMenuSaved] = useState(false);
  const [lunchOptionsSaved, setLunchOptionsSaved] = useState(false);
  const [dinnerOptionsSaved, setDinnerOptionsSaved] = useState(false);
  const [cutoffsSaved, setCutoffsSaved] = useState(false);
  const [specialOptionsSaved, setSpecialOptionsSaved] = useState(false);

  // 1. Settings state (Menu, cutoffs, options)
  const [lunchOrderTime, setLunchOrderTime] = useState('08:00');
  const [lunchCutoff, setLunchCutoff] = useState('10:00');
  const [dinnerOrderTime, setDinnerOrderTime] = useState('15:00');
  const [dinnerCutoff, setDinnerCutoff] = useState('17:00');
  const [lunchDailyLimit, setLunchDailyLimit] = useState(20);
  const [dinnerDailyLimit, setDinnerDailyLimit] = useState(20);
  const [maxExtraRotis, setMaxExtraRotis] = useState(5);
  
  const [dayRotis, setDayRotis] = useState('6 Hot Ghee Rotis');
  const [daySabji, setDaySabji] = useState('Seasonal Sabji (Alu Palak)');
  const [dayAccompaniment, setDayAccompaniment] = useState('Dal-Rice');
  const [dayImage, setDayImage] = useState('');

  const [nightRotis, setNightRotis] = useState('6 Hot Ghee Rotis');
  const [nightSabji, setNightSabji] = useState('Seasonal Sabji (Alu Palak)');
  const [nightAccompaniment, setNightAccompaniment] = useState('Dal-Rice');
  const [nightImage, setNightImage] = useState('');

  const [lunchRotisOptions, setLunchRotisOptions] = useState([]);
  const [lunchSabjisOptions, setLunchSabjisOptions] = useState([]);
  const [lunchCustomOptions, setLunchCustomOptions] = useState([]);

  const [dinnerRotisOptions, setDinnerRotisOptions] = useState([]);
  const [dinnerSabjisOptions, setDinnerSabjisOptions] = useState([]);
  const [dinnerCustomOptions, setDinnerCustomOptions] = useState([]);

  // Special Gujarati Dishes State
  const [specialDishesOptions, setSpecialDishesOptions] = useState([]);
  const [specialDishCutoff, setSpecialDishCutoff] = useState('10:00');
  const [specialDishDailyLimit, setSpecialDishDailyLimit] = useState(20);
  
  // Helpers for adding special dishes options
  const [newSpecialName, setNewSpecialName] = useState('');
  const [newSpecialPrice, setNewSpecialPrice] = useState('');
  const [newSpecialUnit, setNewSpecialUnit] = useState('');

  // Helpers for adding options
  const [newLunchRoti, setNewLunchRoti] = useState('');
  const [newLunchSabji, setNewLunchSabji] = useState('');
  const [newLunchCustom, setNewLunchCustom] = useState('');
  
  const [newDinnerRoti, setNewDinnerRoti] = useState('');
  const [newDinnerSabji, setNewDinnerSabji] = useState('');
  const [newDinnerCustom, setNewDinnerCustom] = useState('');

  // 2. Polls state
  const [polls, setPolls] = useState([]);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [pollOptionsList, setPollOptionsList] = useState(['', '']);

  // 3. Notifications state
  const [notifications, setNotifications] = useState([]);
  const [newNotificationMessage, setNewNotificationMessage] = useState('');
  const [newNotificationType, setNewNotificationType] = useState('Announcement');

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
    } else {
      fetchData();
    }
  }, [adminToken]);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      
      // Fetch Settings
      const settingsRes = await axios.get(`${apiBase}/api/settings`);
      if (settingsRes.data) {
        setLunchOrderTime(settingsRes.data.lunchOrderTime || '08:00');
        setLunchCutoff(settingsRes.data.lunchCutoffTime || '10:00');
        setDinnerOrderTime(settingsRes.data.dinnerOrderTime || '15:00');
        setDinnerCutoff(settingsRes.data.dinnerCutoffTime || '17:00');
        setLunchDailyLimit(settingsRes.data.lunchDailyLimit || 20);
        setDinnerDailyLimit(settingsRes.data.dinnerDailyLimit || 20);
        setMaxExtraRotis(settingsRes.data.maxExtraRotis || 5);
        
        setDayRotis(settingsRes.data.dayRotis || '');
        setDaySabji(settingsRes.data.daySabji || '');
        setDayAccompaniment(settingsRes.data.dayAccompaniment || '');
        setDayImage(settingsRes.data.dayImage || '');

        setNightRotis(settingsRes.data.nightRotis || '');
        setNightSabji(settingsRes.data.nightSabji || '');
        setNightAccompaniment(settingsRes.data.nightAccompaniment || '');
        setNightImage(settingsRes.data.nightImage || '');

        setLunchRotisOptions(settingsRes.data.lunchRotisOptions || []);
        setLunchSabjisOptions(settingsRes.data.lunchSabjisOptions || []);
        setLunchCustomOptions(settingsRes.data.lunchCustomOptions || []);

        setDinnerRotisOptions(settingsRes.data.dinnerRotisOptions || []);
        setDinnerSabjisOptions(settingsRes.data.dinnerSabjisOptions || []);
        setDinnerCustomOptions(settingsRes.data.dinnerCustomOptions || []);
        setSpecialDishesOptions(settingsRes.data.specialDishesOptions || []);
        setSpecialDishCutoff(settingsRes.data.specialDishCutoffTime || '10:00');
        setSpecialDishDailyLimit(settingsRes.data.specialDishDailyLimit || 20);
      }

      // Fetch Polls
      const pollRes = await axios.get(`${apiBase}/api/polls/admin`, config);
      setPolls(pollRes.data);

      // Fetch Notifications
      const notificationRes = await axios.get(`${apiBase}/api/notifications/admin`, config);
      setNotifications(notificationRes.data);

    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to sync database logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLunchMenu = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      const payload = { dayRotis, daySabji, dayAccompaniment, dayImage };
      await axios.put(`${apiBase}/api/settings`, payload, config);
      setSuccessMsg('Daytime Lunch Menu configuration updated successfully.');
      setLunchMenuSaved(true);
      setTimeout(() => {
        setSuccessMsg('');
        setLunchMenuSaved(false);
      }, 1000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save Daytime Lunch Menu.');
    }
  };

  const handleSaveDinnerMenu = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      const payload = { nightRotis, nightSabji, nightAccompaniment, nightImage };
      await axios.put(`${apiBase}/api/settings`, payload, config);
      setSuccessMsg('Nighttime Dinner Menu configuration updated successfully.');
      setDinnerMenuSaved(true);
      setTimeout(() => {
        setSuccessMsg('');
        setDinnerMenuSaved(false);
      }, 1000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save Nighttime Dinner Menu.');
    }
  };

  const handleSaveLunchOptions = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      const payload = { lunchRotisOptions, lunchSabjisOptions, lunchCustomOptions };
      await axios.put(`${apiBase}/api/settings`, payload, config);
      setSuccessMsg('Lunch Dropdown Options updated successfully.');
      setLunchOptionsSaved(true);
      setTimeout(() => {
        setSuccessMsg('');
        setLunchOptionsSaved(false);
      }, 1000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save Lunch Dropdown Options.');
    }
  };

  const handleSaveDinnerOptions = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      const payload = { dinnerRotisOptions, dinnerSabjisOptions, dinnerCustomOptions };
      await axios.put(`${apiBase}/api/settings`, payload, config);
      setSuccessMsg('Dinner Dropdown Options updated successfully.');
      setDinnerOptionsSaved(true);
      setTimeout(() => {
        setSuccessMsg('');
        setDinnerOptionsSaved(false);
      }, 1000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save Dinner Dropdown Options.');
    }
  };

  const handleSaveSpecialOptions = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      const payload = { specialDishesOptions };
      await axios.put(`${apiBase}/api/settings`, payload, config);
      setSuccessMsg('Special Dishes Options updated successfully.');
      setSpecialOptionsSaved(true);
      setTimeout(() => {
        setSuccessMsg('');
        setSpecialOptionsSaved(false);
      }, 1000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save Special Dishes Options.');
    }
  };

  const handleSaveCutoffs = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      const payload = { 
        lunchOrderTime,
        lunchCutoffTime: lunchCutoff, 
        dinnerOrderTime,
        dinnerCutoffTime: dinnerCutoff,
        lunchDailyLimit,
        dinnerDailyLimit,
        maxExtraRotis,
        specialDishCutoffTime: specialDishCutoff,
        specialDishDailyLimit
      };
      await axios.put(`${apiBase}/api/settings`, payload, config);
      setSuccessMsg('Time Cutoffs updated successfully.');
      setCutoffsSaved(true);
      setTimeout(() => {
        setSuccessMsg('');
        setCutoffsSaved(false);
      }, 1000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save Time Cutoffs.');
    }
  };

  const handleImageChange = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Poll actions
  const handleCreatePoll = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const filteredOptions = pollOptionsList.map(opt => opt.trim()).filter(Boolean);
    if (!newPollQuestion.trim() || filteredOptions.length < 2) {
      setErrorMsg('WhatsApp Poll must have a question and at least 2 non-empty options.');
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      const res = await axios.post(`${apiBase}/api/polls/admin`, {
        question: newPollQuestion,
        options: filteredOptions
      }, config);
      
      setPolls(prev => [res.data, ...prev.map(p => ({ ...p, isActive: false }))]);
      setNewPollQuestion('');
      setPollOptionsList(['', '']);
      setSuccessMsg('WhatsApp-style Poll activated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to publish poll.');
    }
  };

  const handleTogglePoll = async (pollId) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      await axios.put(`${apiBase}/api/polls/admin/${pollId}/toggle`, {}, config);
      
      const pollRes = await axios.get(`${apiBase}/api/polls/admin`, config);
      setPolls(pollRes.data);
      setSuccessMsg('Poll activation status updated.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to toggle poll status.');
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (!window.confirm('Delete this poll?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      await axios.delete(`${apiBase}/api/polls/admin/${pollId}`, config);
      setPolls(prev => prev.filter(p => p._id !== pollId));
      setSuccessMsg('Poll deleted.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete poll.');
    }
  };

  // Notification actions
  const handleCreateNotification = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newNotificationMessage.trim()) {
      setErrorMsg('Notification message cannot be empty.');
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      const res = await axios.post(`${apiBase}/api/notifications/admin`, {
        message: newNotificationMessage,
        type: newNotificationType
      }, config);

      setNotifications(prev => [res.data, ...prev]);
      setNewNotificationMessage('');
      setSuccessMsg('Announcement successfully broadcasted.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to post notification.');
    }
  };

  const handleToggleNotification = async (id) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      const res = await axios.put(`${apiBase}/api/notifications/admin/${id}/toggle`, {}, config);
      setNotifications(prev => prev.map(n => n._id === id ? res.data : n));
      setSuccessMsg('Notification state updated.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Delete this broadcast?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      await axios.delete(`${apiBase}/api/notifications/admin/${id}`, config);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setSuccessMsg('Notification removed.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete notification.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 font-outfit">
      <AdminNavbar />

      {successMsg && (
        <div className="bg-brandSaffron/30 bg-opacity-20 text-brandNavy p-4 rounded-xl border border-brandSaffron/30 text-xs font-bold flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-brandOchre bg-opacity-10 text-brandNavy p-4 rounded-xl border border-brandOchre/35 text-xs font-bold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-8 animate-in fade-in duration-300">
        
        {/* 1. DAILY MENU EDIT SECTION */}
        <div className="glass-card rounded-2xl p-6 space-y-6 relative z-10">
          <h2 className="font-extrabold text-brandNavy text-base flex items-center gap-2 border-b border-[#e6d480]/20 pb-3">
            <Settings className="text-[#d97706]" size={20} /> 1. Daily Menu Edit Section
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Day/Lunch Edit */}
            <div className="space-y-4 bg-[#fdfbf4]/40 p-4 rounded-xl border border-[#e6d480]/30">
              <span className="bg-brandSaffron text-white text-[9px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider block w-max">
                ☀️ Daytime (Lunch)
              </span>
              <div>
                <label className="block text-[10px] font-bold text-brandNavy/80 uppercase mb-1 font-inter">Rotis Section</label>
                <input
                  type="text"
                  value={dayRotis}
                  onChange={(e) => setDayRotis(e.target.value)}
                  className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-450 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-brandNavy/80 uppercase mb-1 font-inter">Sabjis Section</label>
                <input
                  type="text"
                  value={daySabji}
                  onChange={(e) => setDaySabji(e.target.value)}
                  className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-450 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-brandNavy/80 uppercase mb-1 font-inter">Dal-Rice Section</label>
                <input
                  type="text"
                  value={dayAccompaniment}
                  onChange={(e) => setDayAccompaniment(e.target.value)}
                  className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-450 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-brandNavy/80 uppercase mb-1 font-inter">Upload Daytime Dish Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, setDayImage)}
                  className="w-full text-xs text-brandNavy/70 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-[#d97706] file:text-white hover:file:bg-[#b45309]"
                />
                {dayImage && (
                  <img src={dayImage} alt="Lunch Preview" className="w-16 h-16 object-contain rounded mt-2 border border-[#e6d480]/30 p-0.5 bg-[#fdfbf4]/80" />
                )}
              </div>
              <button
                type="button"
                onClick={handleSaveLunchMenu}
                className={`w-full mt-2 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm ${
                  lunchMenuSaved ? 'bg-emerald-600 text-white' : 'bg-brandGreen hover:bg-emerald-600 text-white'
                }`}
              >
                {lunchMenuSaved ? 'Saved! ✓' : 'Save Daytime (Lunch)'}
              </button>
            </div>

            {/* Night/Dinner Edit */}
            <div className="space-y-4 bg-[#fdfbf4]/40 p-4 rounded-xl border border-[#e6d480]/30">
              <span className="bg-brandSaffron text-white text-[9px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider block w-max">
                🌙 Nighttime (Dinner) 
              </span>
              <div>
                <label className="block text-[10px] font-bold text-brandNavy/80 uppercase mb-1 font-inter">Rotis Section</label>
                <input
                  type="text"
                  value={nightRotis}
                  onChange={(e) => setNightRotis(e.target.value)}
                  className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-450 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-brandNavy/80 uppercase mb-1 font-inter">Sabjis Section</label>
                <input
                  type="text"
                  value={nightSabji}
                  onChange={(e) => setNightSabji(e.target.value)}
                  className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-450 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-brandNavy/80 uppercase mb-1 font-inter">Dal-Rice Section</label>
                <input
                  type="text"
                  value={nightAccompaniment}
                  onChange={(e) => setNightAccompaniment(e.target.value)}
                  className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-450 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-brandNavy/80 uppercase mb-1 font-inter">Upload Nighttime Dish Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, setNightImage)}
                  className="w-full text-xs text-brandNavy/70 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-[#d97706] file:text-white hover:file:bg-[#b45309]"
                />
                {nightImage && (
                  <img src={nightImage} alt="Dinner Preview" className="w-16 h-16 object-contain rounded mt-2 border border-[#e6d480]/30 p-0.5 bg-[#fdfbf4]/80" />
                )}
              </div>
              <button
                type="button"
                onClick={handleSaveDinnerMenu}
                className={`w-full mt-2 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm ${
                  dinnerMenuSaved ? 'bg-brandSage text-white' : 'bg-brandGreen hover:bg-brandSage text-white'
                }`}
              >
                {dinnerMenuSaved ? 'Saved! ✓' : 'Save Nighttime (Dinner)'}
              </button>
            </div>

          </div>
        </div>
             {/* 2. DROPDOWN OPTIONS SECTION */}
        <div className="glass-card rounded-2xl p-6 space-y-6 relative z-10">
          <h2 className="font-extrabold text-brandNavy text-base flex items-center gap-2 border-b border-[#e6d480]/20 pb-3">
            <span>📋</span> 2. Dropdown Options Management
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Lunch Options Config */}
            <div className="space-y-6 bg-[#fdfbf4]/40 p-4 rounded-xl border border-[#e6d480]/30">
              <span className="bg-brandSaffron text-white text-[9px] px-2 py-0.5 rounded font-extrabold uppercase w-max block">
                ☀️ Lunch Dropdown Options
              </span>

              {/* Roti Options */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-brandNavy/80 uppercase font-inter">Rotis count Selection Options</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add Roti (e.g. 6 Rotis)"
                    value={newLunchRoti}
                    onChange={(e) => setNewLunchRoti(e.target.value)}
                    className="flex-grow bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-455 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newLunchRoti.trim() && !lunchRotisOptions.includes(newLunchRoti.trim())) {
                        setLunchRotisOptions([...lunchRotisOptions, newLunchRoti.trim()]);
                        setNewLunchRoti('');
                      }
                    }}
                    className="bg-brandGreen hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {lunchRotisOptions.map((opt, i) => (
                    <span key={i} className="bg-[#feecaf]/30 text-[#d97706] border border-[#e6d480]/30 text-[10px] font-extrabold py-0.5 px-2 rounded-full inline-flex items-center gap-1 font-inter">
                      {opt}
                      <Trash2 size={10} className="cursor-pointer text-red-700 hover:text-red-900" onClick={() => setLunchRotisOptions(lunchRotisOptions.filter(o => o !== opt))} />
                    </span>
                  ))}
                </div>
              </div>

              {/* Sabji Options */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-brandNavy/80 uppercase font-inter">Sabjis Selection Options</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add Sabji Option"
                    value={newLunchSabji}
                    onChange={(e) => setNewLunchSabji(e.target.value)}
                    className="flex-grow bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-455 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newLunchSabji.trim() && !lunchSabjisOptions.includes(newLunchSabji.trim())) {
                        setLunchSabjisOptions([...lunchSabjisOptions, newLunchSabji.trim()]);
                        setNewLunchSabji('');
                      }
                    }}
                    className="bg-brandGreen hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {lunchSabjisOptions.map((opt, i) => (
                    <span key={i} className="bg-[#feecaf]/30 text-[#d97706] border border-[#e6d480]/30 text-[10px] font-extrabold py-0.5 px-2 rounded-full inline-flex items-center gap-1 font-inter">
                      {opt}
                      <Trash2 size={10} className="cursor-pointer text-red-700 hover:text-red-900" onClick={() => setLunchSabjisOptions(lunchSabjisOptions.filter(o => o !== opt))} />
                    </span>
                  ))}
                </div>
              </div>

              {/* Custom Options */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-brandNavy/80 uppercase font-inter">Customizer swap options</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add Swap option (e.g. Khichdi)"
                    value={newLunchCustom}
                    onChange={(e) => setNewLunchCustom(e.target.value)}
                    className="flex-grow bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-455 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newLunchCustom.trim() && !lunchCustomOptions.includes(newLunchCustom.trim())) {
                        setLunchCustomOptions([...lunchCustomOptions, newLunchCustom.trim()]);
                        setNewLunchCustom('');
                      }
                    }}
                    className="bg-brandGreen hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {lunchCustomOptions.map((opt, i) => (
                    <span key={i} className="bg-[#feecaf]/30 text-[#d97706] border border-[#e6d480]/30 text-[10px] font-extrabold py-0.5 px-2 rounded-full inline-flex items-center gap-1 font-inter">
                      {opt}
                      {opt !== 'None' && (
                        <Trash2 size={10} className="cursor-pointer text-red-700 hover:text-red-900" onClick={() => setLunchCustomOptions(lunchCustomOptions.filter(o => o !== opt))} />
                      )}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveLunchOptions}
                className={`w-full mt-4 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm ${
                  lunchOptionsSaved ? 'bg-emerald-600 text-white' : 'bg-brandGreen hover:bg-emerald-600 text-white'
                }`}
              >
                {lunchOptionsSaved ? 'Saved! ✓' : 'Save Lunch Dropdown Options'}
              </button>

            </div>

            {/* Dinner Options Config */}
            <div className="space-y-6 bg-[#fdfbf4]/40 p-4 rounded-xl border border-[#e6d480]/30">
              <span className="bg-brandSaffron text-white text-[9px] px-2 py-0.5 rounded font-extrabold uppercase w-max block">
                🌙 Dinner Dropdown Options
              </span>

              {/* Roti Options */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-brandNavy/80 uppercase font-inter">Rotis count Selection Options</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add Roti (e.g. 6 Rotis)"
                    value={newDinnerRoti}
                    onChange={(e) => setNewDinnerRoti(e.target.value)}
                    className="flex-grow bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-455 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newDinnerRoti.trim() && !dinnerRotisOptions.includes(newDinnerRoti.trim())) {
                        setDinnerRotisOptions([...dinnerRotisOptions, newDinnerRoti.trim()]);
                        setNewDinnerRoti('');
                      }
                    }}
                    className="bg-brandGreen hover:bg-brandSage text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {dinnerRotisOptions.map((opt, i) => (
                    <span key={i} className="bg-[#feecaf]/30 text-[#d97706] border border-[#e6d480]/30 text-[10px] font-extrabold py-0.5 px-2 rounded-full inline-flex items-center gap-1 font-inter">
                      {opt}
                      <Trash2 size={10} className="cursor-pointer text-red-700 hover:text-red-900" onClick={() => setDinnerRotisOptions(dinnerRotisOptions.filter(o => o !== opt))} />
                    </span>
                  ))}
                </div>
              </div>

              {/* Sabji Options */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-brandNavy/80 uppercase font-inter">Sabjis Selection Options</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add Sabji Option"
                    value={newDinnerSabji}
                    onChange={(e) => setNewDinnerSabji(e.target.value)}
                    className="flex-grow bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-455 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newDinnerSabji.trim() && !dinnerSabjisOptions.includes(newDinnerSabji.trim())) {
                        setDinnerSabjisOptions([...dinnerSabjisOptions, newDinnerSabji.trim()]);
                        setNewDinnerSabji('');
                      }
                    }}
                    className="bg-brandGreen hover:bg-brandSage text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {dinnerSabjisOptions.map((opt, i) => (
                    <span key={i} className="bg-[#feecaf]/30 text-[#d97706] border border-[#e6d480]/30 text-[10px] font-extrabold py-0.5 px-2 rounded-full inline-flex items-center gap-1 font-inter">
                      {opt}
                      <Trash2 size={10} className="cursor-pointer text-red-700 hover:text-red-900" onClick={() => setDinnerSabjisOptions(dinnerSabjisOptions.filter(o => o !== opt))} />
                    </span>
                  ))}
                </div>
              </div>

              {/* Custom Options */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-brandNavy/80 uppercase font-inter">Customizer swap options</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add Swap option (e.g. Khichdi)"
                    value={newDinnerCustom}
                    onChange={(e) => setNewDinnerCustom(e.target.value)}
                    className="flex-grow bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-455 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newDinnerCustom.trim() && !dinnerCustomOptions.includes(newDinnerCustom.trim())) {
                        setDinnerCustomOptions([...dinnerCustomOptions, newDinnerCustom.trim()]);
                        setNewDinnerCustom('');
                      }
                    }}
                    className="bg-brandGreen hover:bg-brandSage text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {dinnerCustomOptions.map((opt, i) => (
                    <span key={i} className="bg-[#feecaf]/30 text-[#d97706] border border-[#e6d480]/30 text-[10px] font-extrabold py-0.5 px-2 rounded-full inline-flex items-center gap-1 font-inter">
                      {opt}
                      {opt !== 'None' && (
                        <Trash2 size={10} className="cursor-pointer text-red-700 hover:text-red-900" onClick={() => setDinnerCustomOptions(dinnerCustomOptions.filter(o => o !== opt))} />
                      )}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveDinnerOptions}
                className={`w-full mt-4 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm ${
                  dinnerOptionsSaved ? 'bg-brandSage text-white' : 'bg-brandGreen hover:bg-brandSage text-white'
                }`}
              >
                {dinnerOptionsSaved ? 'Saved! ✓' : 'Save Dinner Dropdown Options'}
              </button>

            </div>

            {/* Special Dishes Options Config */}
            <div className="space-y-6 bg-[#fdfbf4]/40 p-4 rounded-xl border border-[#e6d480]/30">
              <span className="bg-brandSaffron text-white text-[9px] px-2 py-0.5 rounded font-extrabold uppercase w-max block">
                🍛 Special Dishes Options
              </span>

              {/* Add Special Dish */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-brandNavy/80 uppercase font-inter">Add Special Dish Option</span>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Dish Name (e.g. Handvo)"
                    value={newSpecialName}
                    onChange={(e) => setNewSpecialName(e.target.value)}
                    className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-455 transition-all"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Price (₹)"
                      value={newSpecialPrice}
                      onChange={(e) => setNewSpecialPrice(e.target.value)}
                      className="w-1/2 bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-455 transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Unit (e.g. plate)"
                      value={newSpecialUnit}
                      onChange={(e) => setNewSpecialUnit(e.target.value)}
                      className="w-1/2 bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-455 transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (newSpecialName.trim() && newSpecialPrice.trim()) {
                        const priceNum = Number(newSpecialPrice);
                        if (!isNaN(priceNum)) {
                          const exists = specialDishesOptions.some(
                            o => o.name.toLowerCase() === newSpecialName.trim().toLowerCase()
                          );
                          if (!exists) {
                            setSpecialDishesOptions([...specialDishesOptions, {
                              name: newSpecialName.trim(),
                              price: priceNum,
                              unit: newSpecialUnit.trim() || 'plate'
                            }]);
                            setNewSpecialName('');
                            setNewSpecialPrice('');
                            setNewSpecialUnit('');
                          }
                        }
                      }
                    }}
                    className="w-full bg-brandGreen hover:bg-emerald-600 text-white py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    Add Dish
                  </button>
                </div>
                
                {/* List current Special Dishes */}
                <div className="space-y-1.5 pt-2">
                  <span className="block text-[9px] font-bold text-brandNavy/60 uppercase">Current Dishes</span>
                  <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {specialDishesOptions.length === 0 ? (
                      <span className="text-[10px] text-brandNavy/50 italic font-semibold animate-pulse">No special dishes added yet.</span>
                    ) : (
                      specialDishesOptions.map((opt, i) => (
                        <div key={i} className="flex justify-between items-center bg-[#feecaf]/20 border border-[#e6d480]/30 rounded-lg p-2 text-xs font-semibold text-brandNavy">
                          <div className="flex flex-col">
                            <span className="font-bold">{opt.name}</span>
                            <span className="text-[10px] text-brandNavy/70">₹{opt.price} / {opt.unit || 'plate'}</span>
                          </div>
                          <Trash2
                            size={12}
                            className="cursor-pointer text-red-700 hover:text-red-900 transition-colors"
                            onClick={() => setSpecialDishesOptions(specialDishesOptions.filter(o => o.name !== opt.name))}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveSpecialOptions}
                className={`w-full mt-4 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm ${
                  specialOptionsSaved ? 'bg-emerald-600 text-white' : 'bg-brandGreen hover:bg-emerald-600 text-white'
                }`}
              >
                {specialOptionsSaved ? 'Saved! ✓' : 'Save Special Dishes Options'}
              </button>
            </div>

            {/* Preview Dropdowns */}
            <div className="mt-6 border-t border-[#e6d480]/20 pt-4 space-y-4 col-span-1 lg:col-span-3 animate-in fade-in">
              <span className="block text-[10px] font-bold text-brandNavy/80 uppercase tracking-wider font-inter">
                👀 Client Customizer Dropdown Preview (If we have 2 subjis on any specific day)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-brandNavy/60 uppercase mb-1 font-inter">Rotis Count Choices Preview</label>
                  <select className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy transition-all">
                    {lunchRotisOptions.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-brandNavy/60 uppercase mb-1 font-inter">Sabjis Choices Preview (For double sabji selection)</label>
                  <select className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy transition-all">
                    {lunchSabjisOptions.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-brandNavy/60 uppercase mb-1 font-inter">Special Dishes Preview</label>
                  <select className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy transition-all">
                    {specialDishesOptions.map((opt, i) => (
                      <option key={i} value={opt.name}>{opt.name} (₹{opt.price} / {opt.unit})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3. DYNAMIC TIME CUTOFFS */}
        <div className="glass-card rounded-2xl p-6 space-y-6 relative z-10">
          <h2 className="font-outfit font-extrabold text-brandNavy text-base flex items-center gap-2 border-b border-[#e6d480]/20 pb-3">
            <Clock className="text-[#d97706]" size={20} /> 3. Dynamic Time & Capacity Config
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-inter text-left">
            <div>
              <label className="block text-[10px] font-bold text-brandNavy/80 uppercase mb-1">Lunch Order Start Time (HH:MM)</label>
              <input
                type="text"
                value={lunchOrderTime}
                onChange={(e) => setLunchOrderTime(e.target.value)}
                className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-mono font-bold tracking-wider outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-455 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-brandNavy/80 uppercase mb-1">Lunch Order Cutoff (HH:MM)</label>
              <input
                type="text"
                value={lunchCutoff}
                onChange={(e) => setLunchCutoff(e.target.value)}
                className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-mono font-bold tracking-wider outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-455 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-brandNavy/80 uppercase mb-1">Dinner Order Start Time (HH:MM)</label>
              <input
                type="text"
                value={dinnerOrderTime}
                onChange={(e) => setDinnerOrderTime(e.target.value)}
                className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-mono font-bold tracking-wider outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-455 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-brandNavy/80 uppercase mb-1">Dinner Order Cutoff (HH:MM)</label>
              <input
                type="text"
                value={dinnerCutoff}
                onChange={(e) => setDinnerCutoff(e.target.value)}
                className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-mono font-bold tracking-wider outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-455 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-brandNavy/80 uppercase mb-1">Lunch Daily Capacity Limit</label>
              <input
                type="number"
                value={lunchDailyLimit}
                onChange={(e) => setLunchDailyLimit(Number(e.target.value))}
                className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-bold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-brandNavy/80 uppercase mb-1">Dinner Daily Capacity Limit</label>
              <input
                type="number"
                value={dinnerDailyLimit}
                onChange={(e) => setDinnerDailyLimit(Number(e.target.value))}
                className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-bold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-brandNavy/80 uppercase mb-1">Maximum Extra Rotis Allowed per Customer</label>
              <input
                type="number"
                value={maxExtraRotis}
                onChange={(e) => setMaxExtraRotis(Number(e.target.value))}
                className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-bold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-brandNavy/80 uppercase mb-1">Special Dish Order Cutoff (HH:MM)</label>
              <input
                type="text"
                value={specialDishCutoff}
                onChange={(e) => setSpecialDishCutoff(e.target.value)}
                className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-mono font-bold tracking-wider outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-455 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-brandNavy/80 uppercase mb-1">Special Dish Daily Capacity Limit</label>
              <input
                type="number"
                value={specialDishDailyLimit}
                onChange={(e) => setSpecialDishDailyLimit(Number(e.target.value))}
                className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-bold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy transition-all"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveCutoffs}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all font-outfit shadow-sm ${
              cutoffsSaved ? 'bg-brandSage text-white' : 'bg-brandGreen hover:bg-brandSage text-white'
            }`}
          >
            {cutoffsSaved ? 'Saved! ✓' : 'Save Time & Capacity Config'}
          </button>
        </div>

        {/* 4. MANAGE COMMUNITY POLLS */}
        <div className="glass-card rounded-2xl p-6 space-y-6 relative z-10">
          <h2 className="font-extrabold text-brandNavy text-base flex items-center gap-2 border-b border-[#e6d480]/20 pb-3">
            <Layers className="text-[#d97706]" size={20} /> 4. Manage Community Polls
          </h2>

          <form onSubmit={handleCreatePoll} className="space-y-4 bg-[#fdfbf4]/40 p-4 rounded-xl border border-[#e6d480]/30 font-inter">
            <span className="block text-[10px] font-bold text-brandNavy/80 uppercase tracking-wider">
              Create New WhatsApp-style Poll
            </span>
            <div>
              <label className="block text-[9px] font-bold text-brandNavy/70 uppercase mb-1">Question</label>
              <input
                type="text"
                required
                placeholder="Ask something... (e.g. Which sweet do you prefer?)"
                value={newPollQuestion}
                onChange={(e) => setNewPollQuestion(e.target.value)}
                className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-450 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-[9px] font-bold text-brandNavy/70 uppercase">Poll Option Choices</label>
              {pollOptionsList.map((opt, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    placeholder={`Option ${index + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const updated = [...pollOptionsList];
                      updated[index] = e.target.value;
                      setPollOptionsList(updated);
                    }}
                    className="flex-grow bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-455 transition-all"
                  />
                  {pollOptionsList.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setPollOptionsList(pollOptionsList.filter((_, i) => i !== index))}
                      className="text-red-650 hover:text-red-850 font-bold px-1 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setPollOptionsList([...pollOptionsList, ''])}
                className="text-[11px] font-bold text-[#d97706] hover:text-[#b45309] hover:underline block pt-1"
              >
                + Add Another Option
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-[#d97706] hover:bg-[#b45309] text-white py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              Publish New Active Poll
            </button>
          </form>

          {/* List existing polls */}
          <div className="space-y-3">
            <span className="block text-[10px] font-bold text-brandNavy/80 uppercase tracking-wider font-inter">
              Polls Archive logs
            </span>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {polls.length === 0 ? (
                <p className="text-xs text-brandNavy/60 italic font-semibold font-inter">No community polls in database logs.</p>
              ) : (
                polls.map((p) => {
                  const totalVotes = p.options.reduce((sum, o) => sum + o.votes, 0);
                  return (
                    <div key={p._id} className="p-3 bg-[#fdfbf4]/40 rounded-xl border border-[#e6d480]/30 space-y-2 text-xs font-inter">
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="font-bold text-brandNavy block font-outfit">{p.question}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                          p.isActive 
                            ? 'bg-[#feecaf]/40 text-[#d97706] border border-[#e6d480]/30' 
                            : 'bg-[#fdfbf4]/80 text-brandNavy/70 border border-[#e6d480]/40'
                        }`}>
                          {p.isActive ? 'Active' : 'Muted'}
                        </span>
                      </div>
                      <div className="space-y-1 pl-2 border-l border-[#e6d480]/40">
                        {p.options.map((o) => (
                          <div key={o._id} className="flex justify-between text-[10px] text-brandNavy/80 font-semibold">
                            <span>{o.optionText}</span>
                            <span className="text-brandNavy">{o.votes} votes ({totalVotes > 0 ? Math.round((o.votes / totalVotes) * 100) : 0}%)</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-[#e6d480]/20">
                        <span className="text-brandNavy/60 font-bold">Total Votes: {totalVotes}</span>
                        <div className="flex gap-3 font-outfit">
                          <button
                            type="button"
                            onClick={() => handleTogglePoll(p._id)}
                            className="text-[#d97706] hover:text-[#b45309] font-bold hover:underline"
                          >
                            {p.isActive ? 'Mute' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePoll(p._id)}
                            className="text-red-700 hover:text-red-900 font-bold hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 5. MANAGE SERVICE NOTIFICATIONS */}
        <div className="glass-card rounded-2xl p-6 space-y-6 relative z-10">
          <h2 className="font-extrabold text-brandNavy text-base flex items-center gap-2 border-b border-[#e6d480]/20 pb-3">
            <Volume2 className="text-[#d97706]" size={20} /> 5. Manage Service Notifications
          </h2>

          <form onSubmit={handleCreateNotification} className="space-y-3 bg-[#fdfbf4]/40 p-3 rounded-xl border border-[#e6d480]/30 font-inter">
            <span className="block text-[10px] font-bold text-brandNavy/80 uppercase mb-1">
              Compose Announcement Bulletin
            </span>
            <textarea
              required
              rows="2"
              placeholder="e.g. Tiffin service closed tomorrow for Holi festival celebration..."
              value={newNotificationMessage}
              onChange={(e) => setNewNotificationMessage(e.target.value)}
              className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-450 resize-none transition-all"
            />
            <select
              value={newNotificationType}
              onChange={(e) => setNewNotificationType(e.target.value)}
              className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-bold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy transition-all"
            >
              <option value="Announcement">📢 Announcement (Info)</option>
              <option value="Alert">⚠️ Alert (Warning)</option>
              <option value="Closure">🚫 Operational Service Closure</option>
            </select>
            <button
              type="submit"
              className="w-full bg-[#d97706] hover:bg-[#b45309] text-white py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              Broadcast Notification
            </button>
          </form>

          <div className="space-y-3">
            <span className="block text-[10px] font-bold text-brandNavy/80 uppercase tracking-wider font-inter">
              Broadcasted History Archive
            </span>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <p className="text-xs text-brandNavy/60 italic font-semibold font-inter">No broadcast logs found.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className="p-3 bg-[#fdfbf4]/40 rounded-xl border border-[#e6d480]/30 space-y-2 text-xs font-inter">
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="font-semibold text-brandNavy leading-tight block">{n.message}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                        n.isActive 
                          ? 'bg-[#feecaf]/40 text-[#d97706] border border-[#e6d480]/30' 
                          : 'bg-[#fdfbf4]/80 text-brandNavy/70 border border-[#e6d480]/40'
                      }`}>
                        {n.isActive ? 'Active' : 'Muted'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-[#e6d480]/20">
                      <span className="text-brandNavy/60 font-bold">Type: {n.type}</span>
                      <div className="flex gap-3 font-outfit">
                        <button
                          type="button"
                          onClick={() => handleToggleNotification(n._id)}
                          className="text-[#d97706] hover:text-[#b45309] font-bold hover:underline"
                        >
                          {n.isActive ? 'Mute' : 'Broadcast'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNotification(n._id)}
                          className="text-red-700 hover:text-red-900 font-bold hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
