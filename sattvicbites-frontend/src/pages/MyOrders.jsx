import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ClipboardList, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function MyOrders({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchMyOrders = async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('sattvicbites_user_token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.get('http://localhost:5000/api/orders/my-orders', config);
      setOrders(response.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error fetching order history.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
    const interval = setInterval(() => {
      fetchMyOrders(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Title Header */}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brandNavy font-outfit flex items-center gap-2">
            <ClipboardList className="text-brandSaffron" /> Your Order History
          </h1>
          <p className="text-xs text-brandNavy/70 mt-1 font-semibold">
            Tracking Geofenced address deliveries for {user?.name}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-brandOchre bg-opacity-10 text-brandOchre-dark p-4 rounded-xl border border-brandOchre border-opacity-20 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="text-center py-12 text-brandNavy/70">
          Loading order parameters...
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-brandNavy/60 font-semibold text-sm">
          🍱 You have not placed any orders yet.{' '}
          <Link to="/order" className="text-brandSaffron hover:underline">
            Head to Order Customizer to begin!
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div 
              key={order._id}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#e6d480]/20 pb-4 mb-4 gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    order.orderType === 'SpecialDish'
                      ? 'bg-amber-100 text-brandOchre-dark'
                      : order.mealType === 'Lunch' 
                      ? 'bg-amber-100 text-brandSaffron-dark' 
                      : 'bg-brandSaffron/40 text-brandNavy font-semibold'
                  }`}>
                    {order.orderType === 'SpecialDish' ? 'Special Dish' : `${order.mealType} Tiffin`}
                  </span>
                  <span className="text-xs text-brandNavy/60">
                    Ordered on: {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    order.isDelivered
                      ? 'bg-brandSaffron/30 text-brandNavy font-semibold'
                      : order.adminApproval === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.adminApproval === 'Rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    Status: {
                      order.isDelivered
                        ? 'Delivered'
                        : order.adminApproval === 'Approved'
                        ? 'Accepted'
                        : order.adminApproval === 'Rejected'
                        ? 'Declined'
                        : 'Pending'
                    }
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    order.paymentStatus === 'Paid' 
                      ? 'bg-emerald-50 text-brandSage-dark border border-brandSage border-opacity-10' 
                      : order.paymentStatus === 'Pending Verification'
                      ? 'bg-amber-100 text-brandOchre'
                      : 'bg-[#ecdba2] text-brandNavy/80'
                  }`}>
                    Payment: {order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-brandNavy/95 text-sm">
                <div>
                  <span className="text-[10px] text-brandNavy/60 uppercase tracking-wider block font-bold">Items Ordered</span>
                  {order.orderType === 'Tiffin' ? (
                    <>
                      <span className="font-extrabold text-brandNavy">{order.tiffinCount}x Tiffin Box</span>
                      <span className="text-xs text-brandNavy/60 block -mt-1">🍱 (6 Rotis + 1 Sabji per box)</span>
                      {order.extraRotisCount > 0 && (
                        <span className="text-xs text-[#d97706] font-extrabold block mt-1">
                          + {order.extraRotisCount} Extra Rotis
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="font-extrabold text-brandNavy">{order.specialDishQty}x Servings</span>
                      <span className="text-xs text-brandNavy/60 block -mt-1">🍛 {order.specialDishItem}</span>
                    </>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-brandNavy/60 uppercase tracking-wider block font-bold font-outfit">Accompaniment / Choices</span>
                  {order.orderType === 'Tiffin' ? (
                    <>
                      <span className="font-extrabold text-[#1a2d3c] block leading-snug">
                        {order.gujaratiCustomVariant !== 'None' ? order.gujaratiCustomVariant : order.accompaniment}
                      </span>
                      <span className="text-xs text-brandNavy/80 block mt-0.5 font-semibold">
                        Rotis: {order.rotisCountSelection || '6 Rotis (Standard)'}
                      </span>
                      <span className="text-xs text-brandNavy/80 block font-semibold">
                        Sabji: {order.sabjiSelection || 'Seasonal (Standard)'}
                      </span>
                      <span className="text-xs text-brandNavy/70 block mt-0.5 font-bold">Spice: {order.spiceLevel}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-extrabold text-[#1a2d3c] block leading-snug">{order.specialDishItem}</span>
                      <span className="text-xs text-brandNavy/75 block mt-0.5 font-semibold">Scheduled for: {new Date(order.deliveryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-brandNavy/60 uppercase tracking-wider block font-bold">Total Bill</span>
                  <span className="font-extrabold text-brandSaffron text-lg">₹{order.totalPrice}</span>
                  <span className="text-[10px] text-brandNavy/60 block -mt-1">({order.paymentMethod} Payment)</span>
                </div>
              </div>

              {order.specialRequests && (
                <div className="mt-3 p-2 bg-[#fdfbf4]/40 border border-[#e6d480]/30 rounded-lg text-xs italic text-brandNavy/80">
                  <strong>Special request:</strong> "{order.specialRequests}"
                </div>
              )}

              {order.transactionRef && (
                <div className="mt-2 text-[10px] text-brandNavy/60 font-mono flex items-center gap-1">
                  <ShieldCheck size={12} className="text-brandSage" /> 
                  <span>UPI Ref ID: {order.transactionRef} (Admin verifying transfer)</span>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-[#e6d480]/20 flex items-center justify-between text-xs text-brandNavy/60">
                <span>Deliver to: {order.deliveryAddress}</span>
                <span className="font-bold">{order.city} ({order.pincode})</span>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
