import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import { CreditCard, Upload, CheckCircle, AlertCircle, RefreshCw, Folder, FolderOpen, DollarSign, IndianRupeeIcon } from 'lucide-react';

export default function AdminPayments({ adminToken }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // QR state
  const [paymentQRCode, setPaymentQRCode] = useState('');
  const [qrSuccess, setQrSuccess] = useState('');

  // Accordion folder state
  const [expandedFolders, setExpandedFolders] = useState({});

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
    } else {
      fetchPaymentData();
      // Setup dynamic background polling every 5 seconds to remove need for manual refresh
      const interval = setInterval(() => {
        fetchPaymentData();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [adminToken]);

  const fetchPaymentData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      
      const res = await axios.get('http://localhost:5000/api/orders/admin/all', config);
      setOrders(res.data || []);

      const settingsRes = await axios.get('http://localhost:5000/api/settings');
      if (settingsRes.data && settingsRes.data.paymentQRCode) {
        setPaymentQRCode(settingsRes.data.paymentQRCode);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to sync payments queue databases.');
    } finally {
      setLoading(false);
    }
  };

  const handleQRUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentQRCode(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveQR = async () => {
    setQrSuccess('');
    setErrorMsg('');
    setQrLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      await axios.put('http://localhost:5000/api/settings', { paymentQRCode }, config);
      setQrSuccess('QR Code successfully uploaded and saved in settings.');
      setTimeout(() => setQrSuccess(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update payment QR code.');
    } finally {
      setQrLoading(false);
    }
  };

  const handleVerifyPayment = async (orderId) => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };
      await axios.put(`http://localhost:5000/api/orders/admin/verify/${orderId}`, { status: 'Paid' }, config);
      
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, paymentStatus: 'Paid' } : o));
      setSuccessMsg('Payment successfully verified as Paid.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating payment verification.');
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

  const todayStr = new Date().toDateString();
  const todayPayments = [];
  const pastPaymentsByDate = {};

  orders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    const dateKey = orderDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (orderDate.toDateString() === todayStr) {
      todayPayments.push(order);
    } else {
      if (!pastPaymentsByDate[dateKey]) {
        pastPaymentsByDate[dateKey] = [];
      }
      pastPaymentsByDate[dateKey].push(order);
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300 font-outfit">
      <AdminNavbar />

      {/* Control Banner */}
      <div className="bg-transparent text-brandNavy p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div>
          <span className="bg-[#d97706] text-white text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider mb-2 inline-block">
            PAGE 4: PAYMENTS HUB
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            QR Configurations & Transaction Verification
          </h1>
          <p className="text-brandNavy/60 text-xs mt-1 font-semibold font-inter">
            Upload kitchen bank QR code scanner, verify client transaction IDs, and review daily histories.
          </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Add & Update QR Code */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-6 relative z-10">
            <h2 className="font-extrabold text-brandNavy text-base flex items-center gap-2 border-b border-[#e6d480]/20 pb-3">
              <CreditCard className="text-[#d97706]" size={20} /> Add & Update QR Code
            </h2>

            {qrSuccess && (
              <div className="bg-[#feecaf]/20 text-brandNavy p-2.5 rounded-lg border border-[#e6d480]/30 text-xs font-bold">
                {qrSuccess}
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-[#fdfbf4]/40 p-4 rounded-xl border border-dashed border-[#e6d480]/50 flex flex-col items-center justify-center">
                {paymentQRCode ? (
                  <img 
                    src={paymentQRCode} 
                    alt="Active Payments QR code" 
                    className="w-48 h-48 object-contain rounded-lg border border-[#e6d480]/40 bg-white p-2"
                  />
                ) : (
                  <div className="w-48 h-48 bg-[#e6d480]/10 flex flex-col items-center justify-center rounded-lg text-center p-3 text-brandNavy/70">
                    <CreditCard size={40} className="mb-2 opacity-50 text-[#d97706]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">No active QR Code</span>
                    <span className="text-[9px] mt-1 font-semibold leading-tight font-inter">Please upload a picture of your bank QR scanner code.</span>
                  </div>
                )}
                <span className="text-[10px] text-brandNavy/60 font-bold block mt-3 uppercase tracking-wider font-inter">Payments QR Display</span>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-brandNavy/70 uppercase tracking-wider font-inter">Upload New Image Scanner</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQRUpload}
                  className="w-full text-xs text-brandNavy/70 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-[#d97706] file:text-white hover:file:bg-[#b45309] file:cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveQR}
                disabled={qrLoading}
                className="w-full bg-[#d97706] hover:bg-[#b45309] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Upload size={14} />
                <span>{qrLoading ? 'Saving...' : 'Save & Publish QR'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Transaction requests split by Today and Collapsible Date Folders */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TODAY'S PAYMENT REQUESTS */}
          <div className="glass-card rounded-2xl overflow-hidden relative z-10">
            <div className="px-6 py-4 bg-[#e6d480]/15 border-b border-[#e6d480]/25 flex justify-between items-center">
              <h2 className="font-extrabold text-brandNavy text-sm flex items-center gap-1.5">
                <IndianRupeeIcon size={18} className="text-[#d97706]" />
                <span>Today's Pending & COD Payment Requests</span>
              </h2>
              <span className="bg-[#d97706] text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                Active: {todayPayments.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              {todayPayments.length === 0 ? (
                <p className="text-center py-8 text-brandNavy/60 text-xs italic font-semibold font-inter">
                  No payment transactions logged today.
                </p>
              ) : (
                renderPaymentTable(todayPayments, '#e6d480')
              )}
            </div>
          </div>

          {/* PAST PAYMENT REQUESTS GROUPED BY DATE FOLDERS */}
          <div className="space-y-4 font-inter relative z-10">
            <span className="block text-[11px] font-bold text-brandNavy uppercase tracking-wider pl-1.5">
              📁 Past Payments Folders Archive
            </span>

            {Object.keys(pastPaymentsByDate).length === 0 ? (
              <p className="text-left py-6 text-brandNavy/60 text-xs italic font-semibold pl-1.5 font-inter">
                No past transactions recorded in databases.
              </p>
            ) : (
              Object.keys(pastPaymentsByDate).sort((a, b) => new Date(b) - new Date(a)).map((dateStr) => {
                const isExpanded = !!expandedFolders[dateStr];
                const list = pastPaymentsByDate[dateStr];

                return (
                  <div key={dateStr} className="bg-[#fdfbf4]/40 rounded-xl border border-[#e6d480]/25 overflow-hidden shadow-sm">
                    {/* Folder Header */}
                    <button
                      onClick={() => toggleFolder(dateStr)}
                      className="w-full px-5 py-3.5 bg-[#fdfbf4]/50 border-b border-[#e6d480]/20 flex justify-between items-center outline-none hover:bg-[#fdfbf4]/80 transition-colors font-outfit"
                    >
                      <div className="flex items-center gap-2.5 text-xs font-black text-brandNavy">
                        {isExpanded ? (
                          <FolderOpen className="text-[#d97706]" size={18} />
                        ) : (
                          <Folder className="text-[#d97706]" size={18} />
                        )}
                        <span>{dateStr} Payments Folder</span>
                      </div>
                      <div className="flex items-center gap-3 font-inter">
                        <span className="bg-[#feecaf]/40 text-[#d97706] text-[9px] font-black px-2 py-0.5 rounded-full border border-[#e6d480]/30">
                          {list.length} Payments
                        </span>
                        <span className="text-[10px] text-[#d97706] font-bold">{isExpanded ? 'Hide' : 'Open'}</span>
                      </div>
                    </button>

                    {/* Folder Table Contents */}
                    {isExpanded && (
                      <div className="border-t border-[#e6d480]/20 overflow-x-auto animate-in slide-in-from-top-1.5 duration-200">
                        {renderPaymentTable(list, '#e6d480')}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>
    </div>
  );

  function renderPaymentTable(paymentList, themeHex) {
    return (
      <table className="w-full text-left text-xs border-collapse font-inter">
        <thead>
          <tr className="bg-[#e6d480]/20 border-b border-[#e6d480]/30 text-brandNavy uppercase tracking-wider font-extrabold">
            <th className="px-4 py-2.5">Customer</th>
            <th className="px-4 py-2.5">Billing Mode</th>
            <th className="px-4 py-2.5">Tiffin Plan</th>
            <th className="px-4 py-2.5">Total Bill</th>
            <th className="px-4 py-2.5">Verification status</th>
            <th className="px-4 py-2.5 text-right">Payment Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e6d480]/20 text-brandNavy/95 font-semibold bg-white/30">
          {paymentList.map((order) => (
            <tr 
              key={order._id} 
              className="transition-colors hover:bg-[#e6d480]/5"
            >
              <td className="px-4 py-3">
                <div className="font-black text-brandNavy font-outfit">{order.user?.name || 'Guest'}</div>
                <div className="text-[9px] text-brandNavy/70 font-normal">{order.user?.email}</div>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-outfit ${
                  order.paymentMethod === 'Online' 
                    ? 'bg-[#feecaf]/40 text-brandNavy border border-[#e6d480]/30' 
                    : 'bg-[#d97706]/20 text-[#d97706] border border-[#d97706]/30'
                }`}>
                  {order.paymentMethod}
                </span>
              </td>
              <td className="px-4 py-3">
                {order.orderType === 'SpecialDish' ? (
                  <span className="text-[#d97706] font-bold">{order.specialDishQty}x {order.specialDishItem}</span>
                ) : (
                  <span className="text-brandNavy">{order.tiffinCount}x {order.tiffinPlan} Tiffin</span>
                )}
              </td>
              <td className="px-4 py-3 font-black text-brandNavy font-outfit">₹{order.totalPrice}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide font-outfit ${
                  order.paymentStatus === 'Paid' 
                    ? 'bg-emerald-500/20 text-emerald-800 border border-emerald-500/30' 
                    : order.paymentStatus === 'Pending Verification'
                      ? 'bg-red-700/20 text-red-700 border border-red-700/30'
                      : 'bg-[#d97706]/20 text-[#d97706] border border-[#d97706]/30'
                }`}>
                  {order.paymentStatus}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-outfit">
                {order.paymentStatus !== 'Paid' ? (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleVerifyPayment(order._id)}
                    className="bg-[#d97706] hover:bg-[#b45309] text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm"
                  >
                    Mark Paid
                  </button>
                ) : (
                  <span className="text-emerald-700 font-black text-[10px] pr-2">Paid & Verified ✓</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
