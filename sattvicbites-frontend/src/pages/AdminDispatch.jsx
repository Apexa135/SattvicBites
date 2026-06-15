import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import { Compass, CheckCircle, AlertCircle, Sparkles, MapPin, ClipboardList, Folder, FolderOpen } from 'lucide-react';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AdminDispatch({ adminToken }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showArchive, setShowArchive] = useState(false);

  // Dynamic capacity states from Settings
  const [lunchDailyLimit, setLunchDailyLimit] = useState(20);
  const [dinnerDailyLimit, setDinnerDailyLimit] = useState(20);

  // Folder accordion state for past deliveries
  const [expandedFolders, setExpandedFolders] = useState({});

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
    } else {
      fetchOrders(false);
      fetchCapacitySettings();
      // Dynamic polling interval (every 5 seconds)
      const interval = setInterval(() => fetchOrders(true), 5000);
      return () => clearInterval(interval);
    }
  }, [adminToken]);

  const fetchCapacitySettings = async () => {
    try {
      const res = await axios.get(`${apiBase}/api/settings`);
      if (res.data) {
        setLunchDailyLimit(res.data.lunchDailyLimit || 20);
        setDinnerDailyLimit(res.data.dinnerDailyLimit || 20);
      }
    } catch (err) {
      console.error('Error loading capacity limits:', err);
    }
  };

  const fetchOrders = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setErrorMsg('');
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      const res = await axios.get(`${apiBase}/api/orders/admin/all`, config);
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to sync orders dispatch database.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const handleApproval = async (orderId, approvalStatus) => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      await axios.put(`${apiBase}/api/orders/admin/approve/${orderId}`, { approvalStatus }, config);
      
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, adminApproval: approvalStatus } : o));
      setSuccessMsg(`Order has been successfully ${approvalStatus.toLowerCase()}.`);
      setTimeout(() => setSuccessMsg(''), 3050);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating order approval.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliver = async (orderId) => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      await axios.put(`${apiBase}/api/orders/admin/deliver/${orderId}`, {}, config);
      
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, isDelivered: true } : o));
      setSuccessMsg('Order marked as delivered and archived.');
      setTimeout(() => setSuccessMsg(''), 3050);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error marking order as delivered.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliverCategory = async (category) => {
    let confirmMsg = 'Are you sure you want to mark these orders as delivered?';
    if (category === 'SpecialDish') confirmMsg = 'Are you sure you want to deliver all active Special Dishes?';
    else if (category === 'Anand') confirmMsg = 'Are you sure you want to deliver all active Anand (Karamsad) orders?';
    else if (category === 'Vidhyanagar') confirmMsg = 'Are you sure you want to deliver all active Vidhyanagar orders?';

    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      const res = await axios.put(`${apiBase}/api/orders/admin/deliver-all`, { category }, config);
      
      setSuccessMsg(res.data.message || 'Orders successfully marked as delivered.');
      fetchOrders(true);
      setTimeout(() => setSuccessMsg(''), 3050);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error delivering orders.');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleFolder = (dateStr) => {
    setExpandedFolders(prev => ({
      ...prev,
      [dateStr]: !prev[dateStr]
    }));
  };

  // Grouping orders
  const activeOrders = orders.filter(o => !o.isDelivered && o.adminApproval !== 'Rejected');
  const pastOrders = orders.filter(o => o.isDelivered);

  const ordersVVN = activeOrders.filter(o => o.orderType === 'Tiffin' && o.pincode === '388120');
  const ordersKaramsad = activeOrders.filter(o => o.orderType === 'Tiffin' && o.pincode === '388325');
  const specialDishes = activeOrders.filter(o => o.orderType === 'SpecialDish');

  // Grouping past orders by delivered date folder
  const pastOrdersByDate = {};
  pastOrders.forEach(o => {
    const dateStr = new Date(o.deliveryDate || o.updatedAt).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    if (!pastOrdersByDate[dateStr]) {
      pastOrdersByDate[dateStr] = [];
    }
    pastOrdersByDate[dateStr].push(o);
  });

  // Calculate active tiffins for capacity bars
  const activeLunchTiffins = activeOrders.filter(o => o.orderType === 'Tiffin' && o.mealType === 'Lunch').reduce((sum, o) => sum + (o.tiffinCount || 0), 0);
  const activeDinnerTiffins = activeOrders.filter(o => o.orderType === 'Tiffin' && o.mealType === 'Dinner').reduce((sum, o) => sum + (o.tiffinCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 font-outfit">
      <AdminNavbar />

      {/* Control Banner */}
      <div className="bg-transparent text-brandNavy p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        <div className="text-left">
          <span className="bg-[#d97706] text-white text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider mb-2 inline-block">
            PAGE 3: DISPATCH HUB
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Active Deliveries & Special Approvals
          </h1>
          <p className="text-brandNavy/60 text-xs mt-1 font-semibold font-inter">
            Accept or decline bookings, mark single/bulk orders as delivered, and track geofenced addresses.
          </p>
        </div>

        {/* Categorized Bulk Delivery Buttons */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto font-inter">
          <button
            onClick={() => handleDeliverCategory('SpecialDish')}
            disabled={specialDishes.length === 0 || actionLoading}
            className="flex-grow md:flex-none bg-[#d97706] hover:bg-[#b45309] text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span>🍱</span>
            <span>Deliver Special ({specialDishes.length})</span>
          </button>
          
          <button
            onClick={() => handleDeliverCategory('Anand')}
            disabled={ordersKaramsad.length === 0 || actionLoading}
            className="flex-grow md:flex-none bg-[#4b7a5a] hover:bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span>🚚</span>
            <span>Deliver Karamsad ({ordersKaramsad.length})</span>
          </button>

          <button
            onClick={() => handleDeliverCategory('Vidhyanagar')}
            disabled={ordersVVN.length === 0 || actionLoading}
            className="flex-grow md:flex-none bg-[#4b7a5a] hover:bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span>🚚</span>
            <span>Deliver Vidhyanagar ({ordersVVN.length})</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-[#feecaf]/20 text-brandNavy p-4 rounded-xl border border-[#e6d480]/30 text-xs font-bold flex items-center gap-2 relative z-10 animate-in fade-in">
          <CheckCircle size={16} className="text-[#d97706]" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-brandOchre bg-opacity-10 text-brandNavy p-4 rounded-xl border border-brandOchre/30 text-xs font-bold flex items-center gap-2 relative z-10 animate-in fade-in">
          <AlertCircle size={16} className="text-brandOchre" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Customizable Daily capacity indicator blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {/* Lunch Limit */}
        <div className="bg-[#fdfbf4]/40 rounded-xl border border-[#e6d480]/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-xs font-bold text-[#1a2d3c] uppercase tracking-wider block">☀️ Lunch Capacity Limit</span>
            <span className="text-[10px] text-brandNavy/70 font-semibold block mt-0.5 font-inter">
              Active Lunch tiffin orders count compared to daily kitchen limit.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 bg-[#fdfbf4]/80 rounded-full h-2.5 border border-[#e6d480]/40 overflow-hidden relative">
              <div 
                className="h-full rounded-full transition-all duration-500 bg-[#d97706]"
                style={{ width: `${Math.min(100, (activeLunchTiffins / lunchDailyLimit) * 100)}%` }}
              ></div>
            </div>
            <span className="text-xs font-black text-[#1a2d3c] font-inter">
              {activeLunchTiffins} / {lunchDailyLimit}
            </span>
          </div>
        </div>

        {/* Dinner Limit */}
        <div className="bg-[#fdfbf4]/40 rounded-xl border border-[#e6d480]/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-xs font-bold text-[#1a2d3c] uppercase tracking-wider block">🌙 Dinner Capacity Limit</span>
            <span className="text-[10px] text-brandNavy/70 font-semibold block mt-0.5 font-inter">
              Active Dinner tiffin orders count compared to daily kitchen limit.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 bg-[#fdfbf4]/80 rounded-full h-2.5 border border-[#e6d480]/40 overflow-hidden relative">
              <div 
                className="h-full rounded-full transition-all duration-500 bg-[#d97706]"
                style={{ width: `${Math.min(100, (activeDinnerTiffins / dinnerDailyLimit) * 100)}%` }}
              ></div>
            </div>
            <span className="text-xs font-black text-[#1a2d3c] font-inter">
              {activeDinnerTiffins} / {dinnerDailyLimit}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* ================= SECTION 1: SPECIAL DISHES QUEUE ================= */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-[#e6d480]/25 shadow-sm overflow-hidden relative z-10">
          <div className="px-6 py-4 bg-[#e6d480]/15 border-b border-[#e6d480]/25 flex justify-between items-center">
            <h2 className="font-extrabold text-[#1a2d3c] text-base flex items-center gap-2">
              <Sparkles className="text-[#d97706]" size={18} />
              <span>1. Special Dishes Approval Queue (Awaiting Kitchen Action)</span>
            </h2>
            <span className="bg-[#d97706] text-white text-[10px] font-black px-2 py-0.5 rounded-md">
              Active: {specialDishes.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            {specialDishes.length === 0 ? (
              <p className="text-center py-8 text-brandNavy/60 text-xs italic font-semibold font-inter">
                No active special dish bookings currently in queue.
              </p>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#e6d480]/20 border-b border-[#e6d480]/30 text-[#1a2d3c] font-extrabold font-inter uppercase tracking-wider">
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Full Street Address</th>
                    <th className="px-4 py-3">Target Date & Time</th>
                    <th className="px-4 py-3">Dish Item</th>
                    <th className="px-4 py-3">Bill</th>
                    <th className="px-4 py-3">Payments</th>
                    <th className="px-4 py-3 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6d480]/20 font-semibold font-inter text-brandNavy/95">
                  {specialDishes.map((order) => (
                    <tr key={order._id} className="hover:bg-[#e6d480]/5 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-black text-[#1a2d3c] font-outfit">{order.user?.name || 'Guest'}</div>
                        <div className="text-[9px] text-brandNavy/70 font-normal">{order.user?.email}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-[#1a2d3c] block break-words whitespace-normal font-bold">
                          {order.deliveryAddress}
                        </div>
                        {order.locationCoordinates?.latitude && order.locationCoordinates?.longitude && (
                          <a
                            href={`https://www.google.com/maps?q=${order.locationCoordinates.latitude},${order.locationCoordinates.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] text-[#d97706] hover:text-[#b45309] hover:underline font-black mt-1 inline-flex items-center gap-0.5"
                          >
                            🗺️ Map Pin
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-[#1a2d3c] font-bold">
                        <div>{new Date(order.deliveryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        <div className={`text-[9px] font-black uppercase tracking-wider mt-0.5 ${
                          order.mealType === 'Lunch' ? 'text-[#d97706]' : 'text-[#4b7a5a]'
                        }`}>
                          {order.mealType || 'Lunch Time'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-[#1a2d3c]">{order.specialDishQty}x {order.specialDishItem}</div>
                        {order.specialRequests && (
                          <div className="text-[10px] text-brandNavy/70 italic mt-0.5 font-normal">
                            💬 "{order.specialRequests}"
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-[#1a2d3c]">₹{order.totalPrice}</div>
                        <span className="text-[9px] text-brandNavy/60 uppercase tracking-widest">{order.paymentMethod}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          order.paymentStatus === 'Paid' 
                            ? 'bg-emerald-500/20 text-emerald-800 border border-emerald-500/30' 
                            : 'bg-[#d97706]/20 text-[#d97706] border border-[#d97706]/30'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-black font-outfit">
                        <div className="flex justify-end gap-1.5">
                          {order.adminApproval === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleApproval(order._id, 'Approved')}
                                className="bg-[#4b7a5a] hover:bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-sm"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleApproval(order._id, 'Rejected')}
                                className="bg-red-700 hover:bg-red-950 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-sm"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {order.adminApproval === 'Approved' && (
                            <button
                              onClick={() => handleDeliver(order._id)}
                              className="bg-[#d97706] hover:bg-[#b45309] text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-sm"
                            >
                              Deliver
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ================= SECTION 2: VALLABH VIDYANAGAR TIFFINS ================= */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-[#e6d480]/25 shadow-sm overflow-hidden relative z-10">
          <div className="px-6 py-4 bg-[#e6d480]/15 border-b border-[#e6d480]/25 flex justify-between items-center">
            <h2 className="font-extrabold text-[#1a2d3c] text-sm flex items-center gap-2">
              <MapPin className="text-[#d97706]" size={18} />
              <span>2. Vallabh Vidyanagar Active Deliveries (Pin: 388120)</span>
            </h2>
            <span className="bg-[#4b7a5a] text-white text-[10px] font-black px-2 py-0.5 rounded-md">
              Orders: {ordersVVN.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            {ordersVVN.length === 0 ? (
              <p className="text-center py-8 text-brandNavy/60 text-xs italic font-semibold font-inter">
                No active Vidyanagar deliveries recorded in this dispatch cycle.
              </p>
            ) : (
              renderTiffinTable(ordersVVN, '#d97706')
            )}
          </div>
        </div>

        {/* ================= SECTION 3: KARAMSAD TIFFINS ================= */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-[#e6d480]/25 shadow-sm overflow-hidden relative z-10">
          <div className="px-6 py-4 bg-[#e6d480]/15 border-b border-[#e6d480]/25 flex justify-between items-center">
            <h2 className="font-extrabold text-[#1a2d3c] text-sm flex items-center gap-2">
              <MapPin className="text-[#d97706]" size={18} />
              <span>3. Karamsad Active Deliveries (Pin: 388325)</span>
            </h2>
            <span className="bg-[#4b7a5a] text-white text-[10px] font-black px-2 py-0.5 rounded-md">
              Orders: {ordersKaramsad.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            {ordersKaramsad.length === 0 ? (
              <p className="text-center py-8 text-brandNavy/60 text-xs italic font-semibold font-inter">
                No active Karamsad deliveries recorded in this dispatch cycle.
              </p>
            ) : (
              renderTiffinTable(ordersKaramsad, '#d97706')
            )}
          </div>
        </div>

        {/* ================= SECTION 4: ARCHIVE COLLAPSIBLE PAST DELIVERIES BY DATE ================= */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-[#e6d480]/25 shadow-sm overflow-hidden relative z-10">
          <button
            onClick={() => setShowArchive(!showArchive)}
            className="w-full px-6 py-4 bg-[#e6d480]/15 flex justify-between items-center outline-none border-b border-[#e6d480]/25 hover:bg-[#e6d480]/25 transition-colors"
          >
            <h2 className="font-extrabold text-[#1a2d3c] text-sm flex items-center gap-2">
              <ClipboardList className="text-[#d97706]" size={18} />
              <span>📜 Collapsible Past Ordered Archive</span>
            </h2>
            <div className="flex items-center gap-2 font-inter">
              <span className="text-xs text-[#1a2d3c] font-black">
                Delivered: {pastOrders.length}
              </span>
              <span className="text-[#1a2d3c] font-bold text-xs">{showArchive ? '▼ Close' : '▶ Expand'}</span>
            </div>
          </button>

          {showArchive && (
            <div className="space-y-4 font-inter p-6 bg-[#fdfbf4]/40 border-t border-[#e6d480]/20">
              <span className="block text-[10px] font-bold text-[#1a2d3c] uppercase tracking-wider pl-1.5">
                📁 Past Deliveries Folders Archive
              </span>

              {Object.keys(pastOrdersByDate).length === 0 ? (
                <p className="text-center py-8 text-brandNavy/60 text-xs italic font-semibold">
                  No orders have been marked as delivered in this logs cycle.
                </p>
              ) : (
                Object.keys(pastOrdersByDate).sort((a, b) => new Date(b) - new Date(a)).map((dateStr) => {
                  const isExpanded = !!expandedFolders[dateStr];
                  const list = pastOrdersByDate[dateStr];

                  return (
                    <div key={dateStr} className="bg-[#fdfbf4]/50 rounded-xl border border-[#e6d480]/25 overflow-hidden shadow-sm">
                      <button
                        onClick={() => toggleFolder(dateStr)}
                        className="w-full px-5 py-3.5 bg-[#fdfbf4]/50 border-b border-[#e6d480]/20 flex justify-between items-center outline-none hover:bg-[#fdfbf4]/80 transition-colors font-outfit"
                      >
                        <div className="flex items-center gap-2.5 text-xs font-black text-[#1a2d3c]">
                          {isExpanded ? (
                            <FolderOpen className="text-[#d97706]" size={18} />
                          ) : (
                            <Folder className="text-[#d97706]" size={18} />
                          )}
                          <span>{dateStr} Deliveries Folder</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="bg-[#feecaf]/40 text-[#d97706] text-[9px] font-black px-2 py-0.5 rounded-full border border-[#e6d480]/30">
                            {list.length} Orders
                          </span>
                          <span className="text-[10px] text-[#d97706] font-bold">{isExpanded ? 'Hide' : 'Open'}</span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-[#e6d480]/20 overflow-x-auto animate-in slide-in-from-top-1.5 duration-200">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-[#e6d480]/20 border-b border-[#e6d480]/30 text-[#1a2d3c] uppercase tracking-wider font-bold">
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Region</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Details</th>
                                <th className="px-4 py-3">Accompaniment (Swaps)</th>
                                <th className="px-4 py-3">Total Paid</th>
                                <th className="px-4 py-3">Delivered Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e6d480]/20 text-brandNavy/95 font-semibold bg-white/40">
                              {list.map((order) => (
                                <tr key={order._id} className="hover:bg-[#e6d480]/5 transition-colors">
                                  <td className="px-4 py-3">
                                    <div className="font-bold text-[#1a2d3c] font-outfit">{order.user?.name || 'Guest'}</div>
                                    <div className="text-[9px] text-brandNavy/70">{order.user?.email}</div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="font-bold text-[#1a2d3c]">{order.city}</div>
                                    <div className="text-[9px] text-brandNavy/70">{order.pincode}</div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-outfit ${
                                      order.orderType === 'SpecialDish' 
                                        ? 'bg-[#d97706]/20 text-[#d97706] border border-[#d97706]/30' 
                                        : 'bg-[#feecaf]/40 text-[#1a2d3c] border border-[#e6d480]/30'
                                    }`}>
                                      {order.orderType === 'SpecialDish' ? 'Special' : 'Tiffin'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    {order.orderType === 'SpecialDish' ? (
                                      <span>{order.specialDishQty}x {order.specialDishItem}</span>
                                    ) : (
                                      <div className="space-y-0.5">
                                        <div>{order.tiffinCount}x {order.tiffinPlan} ({order.mealType})</div>
                                        {order.extraRotisCount > 0 && (
                                          <div className="text-[10px] text-[#d97706] font-bold">
                                            +{order.extraRotisCount} Extra Rotis
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    {order.orderType === 'SpecialDish' ? (
                                      <span>—</span>
                                    ) : (
                                      <div className="space-y-0.5">
                                        {order.gujaratiCustomVariant !== 'None' ? (
                                          <span className="text-[#d97706] font-bold">{order.gujaratiCustomVariant}</span>
                                        ) : (
                                          <span>{order.accompaniment}</span>
                                        )}
                                        <div className="text-[9px] text-brandNavy/70 font-medium">Rotis: {order.rotisCountSelection || 'Standard'} / Sabji: {order.sabjiSelection || 'Standard'}</div>
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="font-bold text-[#1a2d3c]">₹{order.totalPrice}</div>
                                    <span className="text-[9px] text-brandNavy/60 uppercase font-black">{order.paymentMethod}</span>
                                  </td>
                                  <td className="px-4 py-3 font-semibold text-brandNavy/70">
                                    {new Date(order.updatedAt).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function renderTiffinTable(orderList, themeHex) {
    const tableHeaderClass = "border-b border-[#e6d480]/30 text-[#1a2d3c] uppercase tracking-wider font-bold font-inter";

    return (
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className={tableHeaderClass} style={{ backgroundColor: `${themeHex}18` }}>
            <th className="px-4 py-2.5">Customer</th>
            <th className="px-4 py-2.5">Full Street Address</th>
            <th className="px-4 py-2.5">Meal</th>
            <th className="px-4 py-2.5">Qty & Plan</th>
            <th className="px-4 py-2.5">Choices</th>
            <th className="px-4 py-2.5">Accompaniment (Swaps)</th>
            <th className="px-4 py-2.5">Spice</th>
            <th className="px-4 py-2.5">Special Requests</th>
            <th className="px-4 py-2.5">Bill</th>
            <th className="px-4 py-2.5">Pay Status</th>
            <th className="px-4 py-2.5 text-right">Approval Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e6d480]/20 text-brandNavy/95 font-semibold font-inter">
          {orderList.map((order) => (
            <tr 
              key={order._id} 
              className="transition-colors hover:bg-[#e6d480]/5"
            >
              <td className="px-4 py-3.5">
                <div className="font-black text-[#1a2d3c] font-outfit">{order.user?.name || 'Guest'}</div>
                <div className="text-[9px] text-brandNavy/70 font-normal">{order.user?.email}</div>
              </td>
              <td className="px-4 py-3.5">
                <div className="text-[#1a2d3c] font-bold block break-words whitespace-normal">
                  {order.deliveryAddress}
                </div>
                {order.locationCoordinates?.latitude && order.locationCoordinates?.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${order.locationCoordinates.latitude},${order.locationCoordinates.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] text-[#d97706] hover:text-[#b45309] hover:underline font-black mt-1 inline-flex items-center gap-0.5"
                  >
                    🗺️ Map Pin
                  </a>
                )}
              </td>
              <td className="px-4 py-3.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  order.mealType === 'Lunch' 
                    ? 'bg-[#feecaf]/40 text-[#d97706] border border-[#e6d480]/30' 
                    : 'bg-[#112316]/10 text-[#4b7a5a] border border-[#4b7a5a]/20'
                }`}>
                  {order.mealType}
                </span>
              </td>
              <td className="px-4 py-3.5 font-bold font-outfit text-[#1a2d3c]">
                <div>{order.tiffinCount}x</div>
                <div className="text-[9px] text-brandNavy/70 font-semibold font-inter">{order.tiffinPlan} Plan</div>
                {order.extraRotisCount > 0 && (
                  <div className="text-[9px] text-[#d97706] font-black mt-0.5 font-inter">
                    +{order.extraRotisCount} Extra Rotis
                  </div>
                )}
              </td>
              <td className="px-4 py-3.5">
                <div className="text-[10px] space-y-0.5 font-inter">
                  <div className="text-brandNavy/95">🥖 <span className="font-bold">{order.rotisCountSelection || '6 Rotis (Standard)'}</span></div>
                  <div className="text-brandNavy/95">🥦 <span className="font-bold">{order.sabjiSelection || 'Seasonal Sabji (Standard)'}</span></div>
                </div>
              </td>
              <td className="px-4 py-3.5">
                <div className="space-y-1">
                  {order.gujaratiCustomVariant !== 'None' ? (
                    <span className="text-[#d97706] font-black bg-[#feecaf]/40 px-1.5 py-0.5 rounded border border-[#e6d480]/30 text-[10px] block w-max font-outfit">
                      {order.gujaratiCustomVariant}
                    </span>
                  ) : (
                    <span className="text-[#1a2d3c]">{order.accompaniment}</span>
                  )}
                  {order.hasFreeChaas && (
                    <span className="text-[#4b7a5a] font-black bg-[#112316]/10 px-1.5 py-0.5 rounded text-[9px] block w-max uppercase tracking-wider font-outfit border border-[#4b7a5a]/20">
                      🥛 Free Buttermilk
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3.5">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                  order.spiceLevel === 'Less' 
                    ? 'bg-[#4b7a5a]/20 text-[#4b7a5a] border border-[#4b7a5a]/30' 
                    : order.spiceLevel === 'More' 
                      ? 'bg-red-700/20 text-red-700 border border-red-700/30' 
                      : 'bg-[#d97706]/20 text-[#d97706] border border-[#d97706]/30'
                }`}>
                  {order.spiceLevel} Spice
                </span>
              </td>
              <td className="px-4 py-3.5 font-medium italic text-brandNavy/80 block break-words whitespace-normal text-left">
                {order.specialRequests ? (
                  <span className="bg-[#feecaf]/20 text-[#1a2d3c] px-1.5 py-0.5 rounded block text-[10px] border border-[#e6d480]/30">
                    "{order.specialRequests}"
                  </span>
                ) : (
                  <span className="text-brandNavy/60 font-normal">—</span>
                )}
              </td>
              <td className="px-4 py-3.5">
                <div className="font-black text-[#1a2d3c]">₹{order.totalPrice}</div>
                <div className="text-[9px] text-brandNavy/70 font-bold uppercase tracking-wider">{order.paymentMethod}</div>
              </td>
              <td className="px-4 py-3.5">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                  order.paymentStatus === 'Paid' 
                    ? 'bg-emerald-500/20 text-emerald-800 border border-emerald-500/30' 
                    : 'bg-[#d97706]/20 text-[#d97706] border border-[#d97706]/30'
                }`}>
                  {order.paymentStatus}
                </span>
              </td>
              <td className="px-4 py-3.5 text-right font-black font-outfit">
                <div className="flex justify-end gap-1.5">
                  {order.adminApproval === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleApproval(order._id, 'Approved')}
                        className="bg-[#4b7a5a] hover:bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleApproval(order._id, 'Rejected')}
                        className="bg-red-700 hover:bg-red-950 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-sm"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {order.adminApproval === 'Approved' && (
                    <button
                      onClick={() => handleDeliver(order._id)}
                      className="bg-[#d97706] hover:bg-[#b45309] text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-sm"
                    >
                      Deliver
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
