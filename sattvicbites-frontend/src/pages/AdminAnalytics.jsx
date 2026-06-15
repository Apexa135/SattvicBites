import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import { Clipboard, Star, MessageSquare, AlertCircle, Trash2 } from 'lucide-react';

export default function AdminAnalytics({ adminToken }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
    } else {
      fetchAnalyticsData(false);
      // Dynamic background polling every 5 seconds
      const interval = setInterval(() => fetchAnalyticsData(true), 5000);
      return () => clearInterval(interval);
    }
  }, [adminToken]);

  const fetchAnalyticsData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setErrorMsg('');
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      
      // Fetch Orders to compute tallies
      const ordersRes = await axios.get('http://localhost:5000/api/orders/admin/all', config);
      setOrders(ordersRes.data || []);

      // Fetch Reviews
      const feedbackRes = await axios.get('http://localhost:5000/api/feedback');
      setReviews(feedbackRes.data || []);

    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to sync operations analytics database.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this customer review?")) return;
    setErrorMsg('');
    try {
      const token = localStorage.getItem('sattvicbites_user_token') || adminToken;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      await axios.delete(`http://localhost:5000/api/feedback/${reviewId}`, config);
      setReviews(prev => prev.filter(r => r._id !== reviewId));
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to remove review.');
    }
  };

  const getProductionAggregates = () => {
    let tiffinsVVDay = 0;
    let tiffinsKDay = 0;
    let rotisVVDay = 0;
    let rotisKDay = 0;
    let buttermilkVVDay = 0;
    let buttermilkKDay = 0;

    let tiffinsVVNight = 0;
    let tiffinsKNight = 0;
    let rotisVVNight = 0;
    let rotisKNight = 0;
    let buttermilkVVNight = 0;
    let buttermilkKNight = 0;

    orders.forEach(o => {
      // Exclude delivered/archived orders from the active tally
      if (o.orderType === 'Tiffin' && !o.isDelivered && o.adminApproval === 'Approved') {
        const factor = (o.tiffinPlan === 'Couple' || o.tiffinPlan === 'Couple_SubjiRoti') ? 2 : 1;
        const actualTiffins = o.tiffinCount * factor;
        
        let rotisPerTiffin = 6;
        if (o.tiffinPlan === 'Single_SubjiRoti') {
          rotisPerTiffin = 10;
        } else if (o.tiffinPlan === 'Couple_SubjiRoti') {
          rotisPerTiffin = 20;
        } else if (o.tiffinPlan === 'Couple') {
          rotisPerTiffin = 12;
        } else {
          rotisPerTiffin = 6;
        }
        const rotis = (rotisPerTiffin + (o.extraRotisCount || 0)) * o.tiffinCount;
        const chaasCount = o.hasFreeChaas ? (o.tiffinCount * (o.tiffinPlan.startsWith('Couple') ? 2 : 1)) : 0;

        if (o.mealType === 'Lunch') {
          if (o.pincode === '388120') {
            tiffinsVVDay += actualTiffins;
            rotisVVDay += rotis;
            buttermilkVVDay += chaasCount;
          } else if (o.pincode === '388325') {
            tiffinsKDay += actualTiffins;
            rotisKDay += rotis;
            buttermilkKDay += chaasCount;
          }
        } else if (o.mealType === 'Dinner') {
          if (o.pincode === '388120') {
            tiffinsVVNight += actualTiffins;
            rotisVVNight += rotis;
            buttermilkVVNight += chaasCount;
          } else if (o.pincode === '388325') {
            tiffinsKNight += actualTiffins;
            rotisKNight += rotis;
            buttermilkKNight += chaasCount;
          }
        }
      }
    });

    return {
      tiffinsVVDay, tiffinsKDay,
      rotisVVDay, rotisKDay,
      buttermilkVVDay, buttermilkKDay,
      tiffinsVVNight, tiffinsKNight,
      rotisVVNight, rotisKNight,
      buttermilkVVNight, buttermilkKNight
    };
  };

  const tally = getProductionAggregates();
  
  // Sort reviews descending: highest rating (positive reviews) on Top
  const sortedReviews = [...reviews].sort((a, b) => b.rating - a.rating);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 font-outfit">
      <AdminNavbar />

      {errorMsg && (
        <div className="bg-brandOchre bg-opacity-10 text-brandNavy p-4 rounded-xl border border-brandOchre/35 text-xs font-bold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading && (
        <div className="text-center text-xs text-brandNavy font-extrabold animate-pulse">
          Loading operations performance data...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
        
        {/* Card 1: Mom's Target Production Tally */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-6 space-y-6 relative z-10">
          <h2 className="font-outfit font-extrabold text-brandNavy text-base flex items-center gap-2 border-b border-[#e6d480]/20 pb-3">
            <Clipboard className="text-[#d97706]" size={20} /> Mom's Target Production Tally
          </h2>
          <p className="text-[11px] text-brandNavy/70 font-semibold -mt-2">
            Displays active (approved and undelivered) tiffin components grouped by Lunch (Daytime) and Dinner (Nighttime).
          </p>

          <div className="space-y-4">
            {/* Daytime (Lunch) Tallies */}
            <div className="bg-[#fdfbf4]/40 p-4 rounded-xl border border-[#e6d480]/30">
              <span className="text-xs font-black text-brandNavy block mb-3 uppercase tracking-wider">☀️ Lunch Time (Day Tally)</span>
              <div className="grid grid-cols-2 gap-2 text-center font-inter">
                <div className="bg-[#fdfbf4]/80 p-2.5 rounded-lg border border-[#e6d480]/20">
                  <span className="text-[9px] text-brandNavy/70 font-bold block uppercase">Active Tiffins</span>
                  <span className="text-xl font-black text-brandNavy block mt-0.5">{tally.tiffinsVVDay + tally.tiffinsKDay}</span>
                  <span className="text-[8px] text-brandNavy/60 block font-bold">(VV: {tally.tiffinsVVDay} / K: {tally.tiffinsKDay})</span>
                </div>
                <div className="bg-[#fdfbf4]/80 p-2.5 rounded-lg border border-[#e6d480]/20">
                  <span className="text-[9px] text-brandNavy/70 font-bold block uppercase">Rotis to Bake</span>
                  <span className="text-xl font-black text-[#d97706] block mt-0.5">{tally.rotisVVDay + tally.rotisKDay}</span>
                  <span className="text-[8px] text-brandNavy/60 block font-bold">(VV: {tally.rotisVVDay} / K: {tally.rotisKDay})</span>
                </div>
              </div>
            </div>

            {/* Nighttime (Dinner) Tallies */}
            <div className="bg-[#fdfbf4]/40 p-4 rounded-xl border border-[#e6d480]/30">
              <span className="text-xs font-black text-brandNavy block mb-3 uppercase tracking-wider">🌙 Dinner Time (Night Tally)</span>
              <div className="grid grid-cols-2 gap-2 text-center font-inter">
                <div className="bg-[#fdfbf4]/80 p-2.5 rounded-lg border border-[#e6d480]/20">
                  <span className="text-[9px] text-brandNavy/70 font-bold block uppercase">Active Tiffins</span>
                  <span className="text-xl font-black text-brandNavy block mt-0.5">{tally.tiffinsVVNight + tally.tiffinsKNight}</span>
                  <span className="text-[8px] text-brandNavy/60 block font-bold">(VV: {tally.tiffinsVVNight} / K: {tally.tiffinsKNight})</span>
                </div>
                <div className="bg-[#fdfbf4]/80 p-2.5 rounded-lg border border-[#e6d480]/20">
                  <span className="text-[9px] text-brandNavy/70 font-bold block uppercase">Rotis to Bake</span>
                  <span className="text-xl font-black text-[#d97706] block mt-0.5">{tally.rotisVVNight + tally.rotisKNight}</span>
                  <span className="text-[8px] text-brandNavy/60 block font-bold">(VV: {tally.rotisVVNight} / K: {tally.rotisKNight})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Client Ratings Log */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-6 space-y-6 relative z-10">
          <div className="flex justify-between items-center border-b border-[#e6d480]/20 pb-3">
            <h2 className="font-outfit font-extrabold text-brandNavy text-base flex items-center gap-2">
              <MessageSquare className="text-[#d97706]" size={20} /> Client Ratings Log
            </h2>
            <div className="flex items-center gap-1 bg-[#feecaf]/40 px-2.5 py-1 rounded-lg border border-[#e6d480]/30 text-[#d97706] text-xs font-black">
              <span>★</span>
              <span>{averageRating} Avg</span>
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {sortedReviews.length === 0 ? (
              <p className="text-xs text-brandNavy/60 italic text-center py-8">No testimonials submitted yet.</p>
            ) : (
              sortedReviews.map((r) => (
                <div key={r._id} className="bg-[#fdfbf4]/60 p-3 rounded-xl border border-[#e6d480]/30 text-xs transition-all hover:border-[#d97706]/60 flex justify-between items-start gap-4">
                  <div className="space-y-1 flex-1 font-inter">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="font-extrabold text-brandNavy block text-xs font-outfit">{r.user?.name || 'Anonymous Client'}</span>
                        <span className="text-[9px] text-brandNavy/60 block font-semibold">{r.user?.city || 'Verified User'}</span>
                      </div>
                      <div className="flex text-[#d97706]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} fill={i < r.rating ? 'currentColor' : 'none'} className="text-[#d97706]" />
                        ))}
                      </div>
                    </div>
                    <p className="text-brandNavy/80 italic">"{r.comment}"</p>
                    <span className="text-[8px] text-brandNavy/60 block text-right font-bold">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Delete Review Button for Admin */}
                  <button
                    onClick={() => handleDeleteReview(r._id)}
                    className="text-brandOchre hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50/50 transition-colors self-center"
                    title="Delete customer review"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
