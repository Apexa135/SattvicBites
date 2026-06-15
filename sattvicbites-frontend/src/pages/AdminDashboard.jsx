import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, AlertCircle, CheckCircle, RefreshCw, Smartphone, Clipboard, Settings, Star, MessageSquare, Layers } from 'lucide-react';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdminDashboard({ adminToken }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Settings states
  const [lunchCutoff, setLunchCutoff] = useState('10:00');
  const [dinnerCutoff, setDinnerCutoff] = useState('17:00');
  const [todaySabji, setTodaySabji] = useState('');
  const [todayAccompaniment, setTodayAccompaniment] = useState('Dal-Rice');
  const [lunchCustomOptions, setLunchCustomOptions] = useState([]);
  const [dinnerCustomOptions, setDinnerCustomOptions] = useState([]);
  const [newLunchOption, setNewLunchOption] = useState('');
  const [newDinnerOption, setNewDinnerOption] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Polls management states
  const [polls, setPolls] = useState([]);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState('');
  const [pollSuccess, setPollSuccess] = useState('');

  // Notifications states
  const [notifications, setNotifications] = useState([]);
  const [newNotificationMessage, setNewNotificationMessage] = useState('');
  const [newNotificationType, setNewNotificationType] = useState('Announcement');
  const [notificationSuccess, setNotificationSuccess] = useState('');

  // Redirect to login if token is missing
  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
    } else {
      fetchDashboardData();
    }
  }, [adminToken]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      };

      // 1. Fetch Orders
      const orderRes = await axios.get(`${apiBase}/api/orders/admin/all`, config);
      setOrders(orderRes.data);

      // 2. Fetch Settings
      const settingsRes = await axios.get(`${apiBase}/api/settings`);
      setLunchCutoff(settingsRes.data.lunchCutoffTime);
      setDinnerCutoff(settingsRes.data.dinnerCutoffTime);
      setTodaySabji(settingsRes.data.todaySabji || '');
      setTodayAccompaniment(settingsRes.data.todayAccompaniment || 'Dal-Rice');
      setLunchCustomOptions(settingsRes.data.lunchCustomOptions || []);
      setDinnerCustomOptions(settingsRes.data.dinnerCustomOptions || []);

      // 3. Fetch Feedback Reviews
      const feedbackRes = await axios.get(`${apiBase}/api/feedback`);
      setReviews(feedbackRes.data);

      // 4. Fetch All Polls (Admin only)
      const pollRes = await axios.get(`${apiBase}/api/polls/admin`, config);
      setPolls(pollRes.data);

      // 5. Fetch All Notifications (Admin only)
      const notificationRes = await axios.get(`${apiBase}/api/notifications/admin`, config);
      setNotifications(notificationRes.data);

    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to sync dispatch dashboard databases.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSettingsSuccess('');
    setErrorMsg('');

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      };

      const payload = {
        lunchCutoffTime: lunchCutoff,
        dinnerCutoffTime: dinnerCutoff,
        todaySabji,
        todayAccompaniment,
        lunchCustomOptions,
        dinnerCustomOptions
      };

      await axios.put(`${apiBase}/api/settings`, payload, config);
      setSettingsSuccess('Dynamic time cutoffs updated successfully.');
      setTimeout(() => setSettingsSuccess(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update dynamic settings.');
    }
  };

  const handleVerifyPayment = async (orderId) => {
    setErrorMsg('');
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      };
      await axios.put(`${apiBase}/api/orders/admin/verify/${orderId}`, { status: 'Paid' }, config);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, paymentStatus: 'Paid' } : o));
      setSuccessMsg('Payment successfully verified.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating payment status.');
    }
  };

  const handleSpecialApproval = async (orderId, approvalStatus) => {
    setErrorMsg('');
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      };
      await axios.put(`${apiBase}/api/orders/admin/approve-special/${orderId}`, { approvalStatus }, config);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, adminApproval: approvalStatus } : o));
      setSuccessMsg(`Special dish order successfully ${approvalStatus.toLowerCase()}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error modifying special dish status.');
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    setPollSuccess('');
    setErrorMsg('');

    if (!newPollQuestion.trim() || !newPollOptions.trim()) {
      setErrorMsg('Poll question and options are required.');
      return;
    }

    const optionsArray = newPollOptions.split(',').map(o => o.trim()).filter(Boolean);
    if (optionsArray.length < 2) {
      setErrorMsg('Please specify at least 2 comma-separated options.');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      };

      const payload = {
        question: newPollQuestion,
        options: optionsArray
      };

      const res = await axios.post(`${apiBase}/api/polls/admin`, payload, config);
      setPolls(prev => [res.data, ...prev.map(p => ({ ...p, isActive: false }))]);
      setPollSuccess('New community poll published and activated.');
      setNewPollQuestion('');
      setNewPollOptions('');
      setTimeout(() => setPollSuccess(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create new poll.');
    }
  };

  const handleTogglePoll = async (pollId) => {
    setErrorMsg('');
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      };
      const res = await axios.put(`${apiBase}/api/polls/admin/${pollId}/toggle`, {}, config);
      
      setPolls(prev => prev.map(p => {
        if (p._id === pollId) {
          return res.data;
        } else if (res.data.isActive) {
          return { ...p, isActive: false };
        }
        return p;
      }));
      setSuccessMsg('Poll status successfully toggled.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to toggle poll status.');
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this poll?')) return;
    setErrorMsg('');
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      };
      await axios.delete(`${apiBase}/api/polls/admin/${pollId}`, config);
      setPolls(prev => prev.filter(p => p._id !== pollId));
      setSuccessMsg('Poll successfully deleted.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete poll.');
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    setNotificationSuccess('');
    setErrorMsg('');

    if (!newNotificationMessage.trim()) {
      setErrorMsg('Notification message cannot be empty.');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      };

      const payload = {
        message: newNotificationMessage,
        type: newNotificationType
      };

      const res = await axios.post(`${apiBase}/api/notifications/admin`, payload, config);
      setNotifications(prev => [res.data, ...prev]);
      setNotificationSuccess('New notification broadcasted successfully.');
      setNewNotificationMessage('');
      setTimeout(() => setNotificationSuccess(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to publish notification.');
    }
  };

  const handleToggleNotification = async (id) => {
    setErrorMsg('');
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      };
      const res = await axios.put(`${apiBase}/api/notifications/admin/${id}/toggle`, {}, config);
      setNotifications(prev => prev.map(n => n._id === id ? res.data : n));
      setSuccessMsg('Notification status toggled.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to toggle notification.');
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    setErrorMsg('');
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      };
      await axios.delete(`${apiBase}/api/notifications/admin/${id}`, config);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setSuccessMsg('Notification deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete notification.');
    }
  };

  const getKitchenAggregates = () => {
    let tiffinsVV = 0;
    let tiffinsK = 0;
    let rotisVV = 0;
    let rotisK = 0;
    let buttermilkVV = 0;
    let buttermilkK = 0;

    orders.forEach(o => {
      if (o.orderType === 'Tiffin') {
        const factor = o.tiffinPlan === 'Couple' ? 2 : 1;
        const actualTiffins = o.tiffinCount * factor;
        const rotis = actualTiffins * 6;
        const chaasCount = o.hasFreeChaas ? actualTiffins : 0;
        
        if (o.pincode === '388120') {
          tiffinsVV += actualTiffins;
          rotisVV += rotis;
          buttermilkVV += chaasCount;
        } else if (o.pincode === '388325') {
          tiffinsK += actualTiffins;
          rotisK += rotis;
          buttermilkK += chaasCount;
        }
      }
    });

    return {
      tiffinsVV, tiffinsK,
      rotisVV, rotisK,
      buttermilkVV, buttermilkK
    };
  };

  const aggregates = getKitchenAggregates();

  const ordersVV = orders.filter(o => o.orderType === 'Tiffin' && o.pincode === '388120');
  const ordersKaramsad = orders.filter(o => o.orderType === 'Tiffin' && o.pincode === '388325');
  const specialDishes = orders.filter(o => o.orderType === 'SpecialDish');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-[#fdfbf4]/90 backdrop-blur-md text-[#112316] rounded-2xl p-6 shadow-md border border-[#e6d480]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div>
          <span className="bg-[#d97706] text-white text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider mb-1.5 inline-block">
            Kitchen Operations Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-outfit text-[#112316]">
            Tiffin Production & Dispatch Logs
          </h1>
          <p className="text-[#112316]/70 text-xs sm:text-sm mt-1 font-semibold">
            Separated regional delivery logs mapping geofenced delivery drop bounds
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="bg-[#d97706] hover:bg-[#b45309] text-white border border-[#e6d480]/30 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all self-stretch sm:self-auto justify-center shadow-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Database</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50/20 text-emerald-900 p-4 rounded-xl border border-emerald-200/30 text-sm font-semibold flex items-center gap-2 relative z-10">
          <CheckCircle className="text-brandSage shrink-0" size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-brandOchre bg-opacity-10 text-brandNavy p-4 rounded-xl border border-brandOchre/35 text-sm font-semibold flex items-center gap-2 relative z-10">
          <AlertCircle className="text-brandOchre shrink-0" size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT COLUMN: Dynamic Time configurations & feedback reviews */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* CUTOFF CONFIGURATOR CARD */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <h2 className="font-outfit font-extrabold text-brandNavy text-md flex items-center gap-2 border-b border-[#e6d480]/20 pb-3">
              <Settings className="text-[#d97706]" size={18} /> Dynamic Time Cutoffs
            </h2>

            {settingsSuccess && (
              <div className="bg-emerald-50/20 text-emerald-900 p-2.5 rounded-lg border border-emerald-200/30 text-xs font-semibold">
                {settingsSuccess}
              </div>
            )}

            <form onSubmit={handleUpdateSettings} className="space-y-4 font-inter">
              <div>
                <label className="block text-[10px] font-bold text-brandNavy/80 uppercase tracking-wider mb-1">
                  Lunch Order Cutoff (24h)
                </label>
                <input
                  type="text"
                  required
                  value={lunchCutoff}
                  onChange={(e) => setLunchCutoff(e.target.value)}
                  placeholder="e.g. 10:00"
                  className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-mono font-bold tracking-wider outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-450 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-brandNavy/80 uppercase tracking-wider mb-1">
                  Dinner Order Cutoff (24h)
                </label>
                <input
                  type="text"
                  required
                  value={dinnerCutoff}
                  onChange={(e) => setDinnerCutoff(e.target.value)}
                  placeholder="e.g. 17:00"
                  className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-mono font-bold tracking-wider outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-450 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-brandNavy/80 uppercase tracking-wider mb-1">
                  Today's Sabji
                </label>
                <input
                  type="text"
                  required
                  value={todaySabji}
                  onChange={(e) => setTodaySabji(e.target.value)}
                  placeholder="e.g. Alu Palak"
                  className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-450 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-brandNavy/80 uppercase tracking-wider mb-1">
                  Today's Accompaniment
                </label>
                <select
                  value={todayAccompaniment}
                  onChange={(e) => setTodayAccompaniment(e.target.value)}
                  className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy transition-all"
                >
                  <option value="Dal-Rice">Dal-Rice</option>
                  <option value="Kadhi-Rice">Kadhi-Rice</option>
                  <option value="Kadhi & Plain Khichdi">Kadhi & Plain Khichdi</option>
                  <option value="Vaghareli Khichdi & Kadhi">Vaghareli Khichdi & Kadhi</option>
                  <option value="Vaghareli Khichdi & Chaas">Vaghareli Khichdi & Chaas</option>
                  <option value="Vagharela Bhaat & Chaas">Vagharela Bhaat & Chaas</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#d97706] hover:bg-[#b45309] text-white py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                Update Settings & Daily Menu
              </button>
            </form>
          </div>

          {/* CUSTOM DROPDOWN OPTIONS MANAGEMENT CARD */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <h2 className="font-outfit font-extrabold text-brandNavy text-md flex items-center gap-2 border-b border-[#e6d480]/20 pb-3">
              <span>📋</span> Custom Dropdown Options
            </h2>

            {/* Lunch/Day Dropdown Options */}
            <div className="space-y-3 font-inter">
              <span className="block text-[10px] font-bold text-brandNavy/80 uppercase tracking-wider">
                ☀️ Lunch (Day) Custom Options
              </span>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New Lunch Option (e.g. Kadhi Khichdi)"
                  value={newLunchOption}
                  onChange={(e) => setNewLunchOption(e.target.value)}
                  className="flex-grow bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-450 transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newLunchOption.trim() && !lunchCustomOptions.includes(newLunchOption.trim())) {
                      const updated = [...lunchCustomOptions, newLunchOption.trim()];
                      setLunchCustomOptions(updated);
                      setNewLunchOption('');
                    }
                  }}
                  className="bg-brandGreen hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  Add
                </button>
              </div>

              <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                {lunchCustomOptions.length === 0 ? (
                  <p className="text-xs text-brandNavy/60 italic">No custom lunch options defined.</p>
                ) : (
                  lunchCustomOptions.map((opt) => (
                    <div key={opt} className="flex justify-between items-center bg-[#fdfbf4]/40 p-2 rounded border border-[#e6d480]/20 text-xs">
                      <span className="font-semibold text-brandNavy">{opt}</span>
                      {opt !== 'None' && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = lunchCustomOptions.filter(o => o !== opt);
                            setLunchCustomOptions(updated);
                          }}
                          className="text-brandOchre hover:text-red-700 font-bold hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Dinner/Night Dropdown Options */}
            <div className="space-y-3 border-t border-[#e6d480]/20 pt-4 font-inter">
              <span className="block text-[10px] font-bold text-brandNavy/80 uppercase tracking-wider">
                🌙 Dinner (Night) Custom Options
              </span>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New Dinner Option (e.g. Vaghareli Khichdi)"
                  value={newDinnerOption}
                  onChange={(e) => setNewDinnerOption(e.target.value)}
                  className="flex-grow bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-450 transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newDinnerOption.trim() && !dinnerCustomOptions.includes(newDinnerOption.trim())) {
                      const updated = [...dinnerCustomOptions, newDinnerOption.trim()];
                      setDinnerCustomOptions(updated);
                      setNewDinnerOption('');
                    }
                  }}
                  className="bg-brandGreen hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  Add
                </button>
              </div>

              <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                {dinnerCustomOptions.length === 0 ? (
                  <p className="text-xs text-brandNavy/60 italic">No custom dinner options defined.</p>
                ) : (
                  dinnerCustomOptions.map((opt) => (
                    <div key={opt} className="flex justify-between items-center bg-[#fdfbf4]/40 p-2 rounded border border-[#e6d480]/20 text-xs">
                      <span className="font-semibold text-brandNavy">{opt}</span>
                      {opt !== 'None' && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = dinnerCustomOptions.filter(o => o !== opt);
                            setDinnerCustomOptions(updated);
                          }}
                          className="text-brandOchre hover:text-red-700 font-bold hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Update Master Settings Button */}
            <button
              type="button"
              onClick={() => handleUpdateSettings()}
              className="w-full bg-[#d97706] hover:bg-[#b45309] text-white py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              Save Custom Dropdown Options
            </button>
          </div>

          {/* MANAGE NOTIFICATIONS CARD */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <h2 className="font-outfit font-extrabold text-brandNavy text-md flex items-center gap-2 border-b border-[#e6d480]/20 pb-3">
              <span>📢</span> Manage Service Notifications
            </h2>

            {notificationSuccess && (
              <div className="bg-emerald-50/20 text-emerald-900 p-2.5 rounded-lg border border-emerald-200/30 text-xs font-semibold animate-pulse">
                {notificationSuccess}
              </div>
            )}

            {/* Create notification form */}
            <form onSubmit={handleCreateNotification} className="space-y-3 bg-[#fdfbf4]/40 p-3 rounded-xl border border-[#e6d480]/30 font-inter">
              <span className="block text-[10px] font-bold text-brandNavy/80 uppercase tracking-wider mb-1">
                Broadcast New Notification
              </span>
              <div>
                <textarea
                  required
                  rows="2"
                  placeholder="Notification Message (e.g. Tiffin service closed today...)"
                  value={newNotificationMessage}
                  onChange={(e) => setNewNotificationMessage(e.target.value)}
                  className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy placeholder-slate-450 font-semibold resize-none transition-all"
                />
              </div>
              <div>
                <select
                  value={newNotificationType}
                  onChange={(e) => setNewNotificationType(e.target.value)}
                  className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy font-bold transition-all"
                >
                  <option value="Announcement">📢 Announcement (Info)</option>
                  <option value="Alert">⚠️ Alert (Warning)</option>
                  <option value="Closure">🚫 Service Closure Alert</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-brandGreen hover:bg-emerald-600 text-white py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                Send Notification
              </button>
            </form>

            {/* List active notifications */}
            <div className="space-y-3 border-t border-[#e6d480]/20 pt-4 font-inter">
              <span className="block text-[10px] font-bold text-brandNavy/80 uppercase tracking-wider mb-2">
                Active & Past Broadcasts
              </span>

              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-brandNavy/60 italic">No broadcasted notifications.</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n._id} className="p-3 bg-[#fdfbf4]/40 rounded-lg border border-[#e6d480]/20 space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="font-semibold text-brandNavy leading-tight block">{n.message}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase shrink-0 ${
                          n.isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-250/25' : 'bg-[#ecdba2] text-brandNavy/70'
                        }`}>
                          {n.isActive ? 'Active' : 'Muted'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-[#e6d480]/25 border-opacity-60">
                        <span className="text-brandNavy/60 font-bold">Type: {n.type}</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleNotification(n._id)}
                            className="text-brandGreen hover:underline font-bold"
                          >
                            {n.isActive ? 'Mute' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNotification(n._id)}
                            className="text-brandOchre hover:underline font-bold"
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

          {/* TOTAL KITCHEN TARGET AGGREGATES */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <h2 className="font-outfit font-extrabold text-brandNavy text-md flex items-center gap-2 border-b border-[#e6d480]/20 pb-3">
              <Clipboard className="text-[#d97706]" size={18} /> Mom's Target Production Tally
            </h2>

            <div className="grid grid-cols-2 gap-4 text-center font-inter">
              <div className="bg-[#fdfbf4]/40 p-3 rounded-lg border border-[#e6d480]/25">
                <span className="text-[9px] text-brandNavy/70 font-bold uppercase block tracking-wider">Total Tiffins</span>
                <span className="text-2xl font-black text-brandNavy block">
                  {aggregates.tiffinsVV + aggregates.tiffinsK}
                </span>
                <span className="text-[9px] text-brandNavy/60 block mt-1 font-semibold">
                  (VV: {aggregates.tiffinsVV} / K: {aggregates.tiffinsK})
                </span>
              </div>

              <div className="bg-[#fdfbf4]/40 p-3 rounded-lg border border-[#e6d480]/25">
                <span className="text-[9px] text-brandNavy/70 font-bold uppercase block tracking-wider">Rotis to Bake (x6)</span>
                <span className="text-2xl font-black text-brandGreen block">
                  {aggregates.rotisVV + aggregates.rotisK}
                </span>
                <span className="text-[9px] text-brandNavy/60 block mt-1 font-semibold">
                  (VV: {aggregates.rotisVV} / K: {aggregates.rotisK})
                </span>
              </div>
            </div>

            <div className="bg-[#fdfbf4]/40 p-3 rounded-lg border border-[#e6d480]/25 text-center font-inter">
              <span className="text-[9px] text-brandNavy/80 font-bold uppercase block tracking-wider">Free Buttermilk (Chaas)</span>
              <span className="text-xl font-black text-teal-700 block">
                {aggregates.buttermilkVV + aggregates.buttermilkK} Cups
              </span>
              <span className="text-[9px] text-brandNavy/60 block font-semibold">
                (VV: {aggregates.buttermilkVV} / K: {aggregates.buttermilkK})
              </span>
            </div>
          </div>

          {/* CUSTOMER FEEDBACK REVIEW LOG */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="font-outfit font-extrabold text-brandNavy text-md flex items-center gap-2 border-b border-[#e6d480]/20 pb-3">
              <MessageSquare className="text-[#d97706]" size={18} /> Client Ratings Log
            </h2>

            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 font-inter">
              {reviews.length === 0 ? (
                <p className="text-xs text-brandNavy/60 italic">No feedback entries submitted yet.</p>
              ) : (
                reviews.map(r => (
                  <div key={r._id} className="bg-[#fdfbf4]/40 p-3 rounded-lg border border-[#e6d480]/20 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-brandNavy">{r.user?.name || 'Anonymous'}</span>
                      <div className="flex text-amber-500">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} size={10} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    <p className="text-brandNavy/80 italic">"{r.comment}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* COMMUNITY POLLS MANAGEMENT CARD */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <h2 className="font-outfit font-extrabold text-brandNavy text-md flex items-center gap-2 border-b border-[#e6d480]/20 pb-3">
              <Layers className="text-brandGreen" size={18} /> Manage Community Polls
            </h2>

            {pollSuccess && (
              <div className="bg-emerald-50/20 text-emerald-900 p-2.5 rounded-lg border border-emerald-200/30 text-xs font-semibold animate-pulse">
                {pollSuccess}
              </div>
            )}

            {/* Create poll form */}
            <form onSubmit={handleCreatePoll} className="space-y-3 bg-[#fdfbf4]/40 p-3 rounded-xl border border-[#e6d480]/30 font-inter">
              <span className="block text-[10px] font-bold text-brandNavy/80 uppercase tracking-wider mb-1">
                Create New Active Poll
              </span>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Poll Question (e.g. Which sabji next week?)"
                  value={newPollQuestion}
                  onChange={(e) => setNewPollQuestion(e.target.value)}
                  className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy font-semibold transition-all"
                />
              </div>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Options (comma-separated, e.g. Paneer, Aloo Gobi)"
                  value={newPollOptions}
                  onChange={(e) => setNewPollOptions(e.target.value)}
                  className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg p-2 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-[#d97706] text-brandNavy font-semibold transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brandGreen hover:bg-emerald-600 text-white py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                Publish New Poll
              </button>
            </form>

            {/* List existing polls */}
            <div className="space-y-3 border-t border-[#e6d480]/20 pt-4 font-inter">
              <span className="block text-[10px] font-bold text-brandNavy/80 uppercase tracking-wider mb-2">
                Existing Polls & Results
              </span>

              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {polls.length === 0 ? (
                  <p className="text-xs text-brandNavy/60 italic">No community polls in database.</p>
                ) : (
                  polls.map((p) => {
                    const totalVotes = p.options.reduce((sum, o) => sum + o.votes, 0);

                    return (
                      <div key={p._id} className="p-3 bg-[#fdfbf4]/40 rounded-lg border border-[#e6d480]/20 space-y-2 text-xs">
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="font-bold text-brandNavy leading-tight block">{p.question}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase shrink-0 ${
                            p.isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-250/25' : 'bg-[#ecdba2] text-brandNavy/70'
                          }`}>
                            {p.isActive ? 'Active' : 'Archived'}
                          </span>
                        </div>

                        <div className="space-y-1 pl-1 border-l-2 border-[#e6d480]/30">
                          {p.options.map((o) => (
                            <div key={o._id} className="flex justify-between text-[10px] text-brandNavy/70 font-semibold">
                              <span>{o.optionText}</span>
                              <span className="font-bold text-brandNavy">{o.votes} votes</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-[#e6d480]/20 border-opacity-60">
                          <span className="text-brandNavy/60 font-bold">Total Votes: {totalVotes}</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleTogglePoll(p._id)}
                              className="text-brandGreen hover:underline font-bold"
                            >
                              {p.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePoll(p._id)}
                              className="text-brandOchre hover:underline font-bold"
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
        </div>

        {/* RIGHT COLUMN: Split Drop Tables & Special Dishes approvals */}
        <div className="lg:col-span-8 space-y-8 relative z-10">
          
          {/* SPECIAL DISHES APPROVAL QUEUE PANEL */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#e6d480]/15 border-b border-[#e6d480]/25 flex items-center justify-between">
              <h2 className="font-outfit font-extrabold text-brandNavy text-md flex items-center gap-2">
                <span>🍛</span> Special Dishes Approval Queue
              </h2>
              <span className="text-xs text-brandNavy font-black">
                Pending: {specialDishes.filter(o => o.adminApproval === 'Pending').length}
              </span>
            </div>

            <div className="overflow-x-auto">
              {specialDishes.length === 0 ? (
                <p className="text-center py-6 text-brandNavy/60 text-xs italic font-semibold">
                  No special dish bookings registered.
                </p>
              ) : (
                <table className="w-full text-left text-xs font-inter">
                  <thead>
                    <tr className="bg-[#e6d480]/20 border-b border-[#e6d480]/30 text-brandNavy uppercase tracking-wider font-extrabold font-outfit">
                      <th className="px-4 py-2.5">Customer</th>
                      <th className="px-4 py-2.5">Street Address</th>
                      <th className="px-4 py-2.5">Dish Item</th>
                      <th className="px-4 py-2.5">Servings</th>
                      <th className="px-4 py-2.5">Target Date</th>
                      <th className="px-4 py-2.5">Bill</th>
                      <th className="px-4 py-2.5">Payment</th>
                      <th className="px-4 py-2.5 text-right">Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6d480]/20 text-brandNavy/95 font-semibold">
                    {specialDishes.map((order) => (
                      <tr key={order._id} className="odd:bg-transparent even:bg-[#fdfbf4]/30 hover:bg-[#e6d480]/10 transition-colors">
                        <td className="px-4 py-3 font-bold">
                          <div className="text-brandNavy font-outfit">{order.user?.name || 'N/A'}</div>
                          <div className="text-[9px] text-brandNavy/70 font-normal">{order.user?.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-brandNavy">{order.deliveryAddress}</div>
                          <div className="text-[9px] text-brandNavy/70 font-black uppercase">{order.city} ({order.pincode})</div>
                          {order.locationCoordinates?.latitude && order.locationCoordinates?.longitude && (
                            <div className="mt-1">
                              <a
                                href={`https://www.google.com/maps?q=${order.locationCoordinates.latitude},${order.locationCoordinates.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-brandGreen hover:underline font-black inline-flex items-center gap-0.5"
                              >
                                🗺️ View GPS Location
                              </a>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-[#feecaf]/30 text-[#d97706] font-extrabold px-1.5 py-0.5 rounded text-[10px] border border-[#e6d480]/30">
                            {order.specialDishItem}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-black">{order.specialDishQty}x</td>
                        <td className="px-4 py-3 font-bold text-[#d97706]">
                          {new Date(order.deliveryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-brandNavy">₹{order.totalPrice}</div>
                          <div className="text-[9px] text-brandNavy/60 font-black uppercase">{order.paymentMethod}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-[#ecdba2] text-brandNavy/80'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {order.adminApproval === 'Pending' ? (
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleSpecialApproval(order._id, 'Approved')}
                                className="bg-brandGreen hover:bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleSpecialApproval(order._id, 'Rejected')}
                                className="bg-brandOchre hover:bg-brandOchre-dark text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className={`font-bold text-[10px] uppercase ${order.adminApproval === 'Approved' ? 'text-brandGreen' : 'text-brandOchre'}`}>
                              {order.adminApproval}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* TABLE 1: VALLABH VIDYANAGAR DISPATCH LOG */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#e6d480]/15 border-b border-[#e6d480]/25 flex items-center justify-between">
              <h2 className="font-outfit font-extrabold text-brandNavy text-md flex items-center gap-2">
                <span>📍</span> Vallabh Vidyanagar Dispatch Logs (Pin: 388120)
              </h2>
              <span className="bg-[#d97706]/10 text-[#d97706] font-black px-2 py-0.5 rounded text-xs border border-[#e6d480]/20">
                Tiffins: {aggregates.tiffinsVV}
              </span>
            </div>

            <div className="overflow-x-auto">
              {ordersVV.length === 0 ? (
                <p className="text-center py-6 text-brandNavy/60 text-xs italic font-semibold">
                  No standard tiffin orders registered for Vallabh Vidyanagar boundary.
                </p>
              ) : (
                renderDispatchTable(ordersVV)
              )}
            </div>
          </div>

          {/* TABLE 2: KARAMSAD DISPATCH LOG */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#e6d480]/15 border-b border-[#e6d480]/25 flex items-center justify-between">
              <h2 className="font-outfit font-extrabold text-brandNavy text-md flex items-center gap-2">
                <span>📍</span> Karamsad Dispatch Logs (Pin: 388325)
              </h2>
              <span className="bg-[#d97706]/10 text-[#d97706] font-black px-2 py-0.5 rounded text-xs border border-[#e6d480]/20">
                Tiffins: {aggregates.tiffinsK}
              </span>
            </div>

            <div className="overflow-x-auto">
              {ordersKaramsad.length === 0 ? (
                <p className="text-center py-6 text-brandNavy/60 text-xs italic font-semibold">
                  No standard tiffin orders registered for Karamsad boundary.
                </p>
              ) : (
                renderDispatchTable(ordersKaramsad)
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  function renderDispatchTable(orderList) {
    return (
      <table className="w-full text-left text-xs border-collapse font-inter">
        <thead>
          <tr className="bg-[#e6d480]/20 border-b border-[#e6d480]/30 text-brandNavy uppercase tracking-wider font-extrabold font-outfit">
            <th className="px-4 py-2.5">Customer</th>
            <th className="px-4 py-2.5">Street Address</th>
            <th className="px-4 py-2.5">Meal</th>
            <th className="px-4 py-2.5">Qty</th>
            <th className="px-4 py-2.5">Spiciness</th>
            <th className="px-4 py-2.5">Accompaniment (Swaps)</th>
            <th className="px-4 py-2.5">Add-ons</th>
            <th className="px-4 py-2.5">Requests</th>
            <th className="px-4 py-2.5">Pay Mode</th>
            <th className="px-4 py-2.5">Status Check</th>
            <th className="px-4 py-2.5 text-right">Payment Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e6d480]/20 text-brandNavy/95 font-semibold">
          {orderList.map((order) => (
            <tr 
              key={order._id} 
              className="transition-colors"
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(230, 212, 128, 0.12)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <td className="px-4 py-3">
                <div className="font-bold text-brandNavy font-outfit">{order.user?.name || 'N/A'}</div>
                <div className="text-[9px] text-brandNavy/70 font-normal">{order.user?.email}</div>
              </td>
              <td className="px-4 py-3 max-w-[150px]">
                <div className="truncate" title={order.deliveryAddress}>{order.deliveryAddress}</div>
                {order.locationCoordinates?.latitude && order.locationCoordinates?.longitude && (
                  <div className="mt-1">
                    <a
                      href={`https://www.google.com/maps?q=${order.locationCoordinates.latitude},${order.locationCoordinates.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-brandGreen hover:underline font-black inline-flex items-center gap-0.5"
                    >
                      🗺️ View GPS
                    </a>
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  order.mealType === 'Lunch' ? 'bg-[#e6d480]/30 text-[#d97706]' : 'bg-[#feecaf]/20 text-brandNavy'
                }`}>
                  {order.mealType}
                </span>
              </td>
              <td className="px-4 py-3 font-bold font-outfit">
                <div>{order.tiffinCount}x</div>
                <div className="text-[9px] text-brandNavy/70 font-semibold font-inter">{order.tiffinPlan} Plan</div>
              </td>
              <td className="px-4 py-3">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                  order.spiceLevel === 'Less' 
                    ? 'bg-[#feecaf]/20 text-brandNavy/80' 
                    : order.spiceLevel === 'More' 
                    ? 'bg-brandOchre bg-opacity-10 text-brandOchre' 
                    : 'bg-[#e6d480]/20 text-brandNavy/95'
                }`}>
                  {order.spiceLevel}
                </span>
              </td>
              <td className="px-4 py-3 font-semibold">
                {order.gujaratiCustomVariant !== 'None' ? (
                  <span className="text-[#d97706] font-black bg-[#feecaf]/30 px-1.5 py-0.5 rounded text-[10px] block w-max border border-[#e6d480]/20 font-outfit">
                    {order.gujaratiCustomVariant}
                  </span>
                ) : (
                  <span>{order.accompaniment}</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="space-y-0.5 text-[10px] text-brandNavy/70 font-semibold">
                  <div>🥖 {order.tiffinCount * (order.tiffinPlan.startsWith('Couple') ? 12 : 6)} Rotis</div>
                  {order.hasFreeChaas && (
                    <span className="text-teal-800 font-bold bg-[#feecaf]/20 px-1.5 py-0.5 rounded text-[9px] block w-max uppercase tracking-wider font-outfit">
                      🥛 Chaas Cup
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 italic max-w-[100px] truncate">
                {order.specialRequests ? (
                  <span className="text-brandNavy/95 font-semibold bg-brandSaffron/30 px-1.5 py-0.5 rounded text-[10px] border border-brandSaffron/30">
                    "{order.specialRequests}"
                  </span>
                ) : (
                  '—'
                )}
              </td>
              <td className="px-4 py-3">
                <div className="font-bold text-brandNavy font-outfit">₹{order.totalPrice}</div>
                <div className="text-[9px] text-brandNavy/70 font-black uppercase tracking-widest">{order.paymentMethod}</div>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  order.paymentStatus === 'Paid' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : order.paymentStatus === 'Pending Verification'
                    ? 'bg-[#feecaf]/30 text-[#d97706] border border-[#e6d480]/40'
                    : 'bg-[#ecdba2] text-brandNavy/80'
                }`}>
                  {order.paymentStatus}
                </span>
                {order.transactionRef && (
                  <div className="text-[9px] text-brandNavy/70 font-mono mt-0.5">Ref: {order.transactionRef}</div>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {order.paymentStatus === 'Pending Verification' && (
                  <button
                    onClick={() => handleVerifyPayment(order._id)}
                    className="bg-[#d97706] hover:bg-[#b45309] text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-sm inline-flex items-center gap-1 transition-all"
                  >
                    <Smartphone size={10} /> Verify UPI
                  </button>
                )}
                
                {order.paymentStatus === 'Pending' && order.paymentMethod === 'COD' && (
                  <button
                    onClick={() => handleVerifyPayment(order._id)}
                    className="text-[#d97706] hover:text-[#b45309] hover:bg-[#feecaf]/20 px-2 py-1 rounded text-[10px] font-bold transition-all"
                  >
                    Mark Paid
                  </button>
                )}

                {order.paymentStatus === 'Paid' && (
                  <span className="text-brandGreen font-black text-[10px] pr-2">Verified ✓</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
