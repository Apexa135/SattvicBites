import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Clock, Info, CheckCircle, Smartphone, AlertTriangle, Utensils } from 'lucide-react';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function OrderCustomizer({ user }) {
  const navigate = useNavigate();

  // State variables for Tiffin Form
  const [mealType, setMealType] = useState(() => new Date().getHours() < 15 ? 'Lunch' : 'Dinner');
  const [tiffinCount, setTiffinCount] = useState(1);
  const [tiffinPlan, setTiffinPlan] = useState('Single'); // 'Single' or 'Couple'
  const [accompaniment, setAccompaniment] = useState('Dal-Rice');
  const [gujaratiCustomVariant, setGujaratiCustomVariant] = useState('None');
  const [spiceLevel, setSpiceLevel] = useState('Mid');
  const [maxExtraRotis, setMaxExtraRotis] = useState(5);
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [streetAddress, setStreetAddress] = useState('');
  const [specialMealType, setSpecialMealType] = useState('Lunch');
  const [extraRotisCount, setExtraRotisCount] = useState(0);
  const [pastRequests, setPastRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('sattvicbites_past_requests');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const onlySubjiRoti = tiffinPlan.includes('_SubjiRoti');

  // Dropdown list states loaded from settings
  const [rotisCountSelection, setRotisCountSelection] = useState('');
  const [sabjiSelection, setSabjiSelection] = useState('');

  const [lunchRotisOptions, setLunchRotisOptions] = useState([]);
  const [lunchSabjisOptions, setLunchSabjisOptions] = useState([]);
  const [dinnerRotisOptions, setDinnerRotisOptions] = useState([]);
  const [dinnerSabjisOptions, setDinnerSabjisOptions] = useState([]);
  const [paymentQRCode, setPaymentQRCode] = useState('');
  
  // Geolocation states
  const [locationCoordinates, setLocationCoordinates] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError('');
    setGpsSuccess(false);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setGpsLoading(false);
        setGpsSuccess(true);
      },
      (error) => {
        console.error('Error fetching GPS coordinates:', error);
        setGpsError(error.message || 'Unable to retrieve location coordinates.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // State variables for Special Dishes Form
  const [activeOrderMode, setActiveOrderMode] = useState('Tiffin'); // 'Tiffin' or 'SpecialDish'
  const [specialDishItem, setSpecialDishItem] = useState('Handvo');
  const [specialDishQty, setSpecialDishQty] = useState(1);
  const [specialDeliveryDate, setSpecialDeliveryDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default tomorrow
  );

  // QR Modal and Reference state
  const [showQRModal, setShowQRModal] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  
  // Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dynamic custom options fetched from settings
  const [lunchCustomOptions, setLunchCustomOptions] = useState(['None']);
  const [dinnerCustomOptions, setDinnerCustomOptions] = useState(['None']);
  const [specialDishesOptions, setSpecialDishesOptions] = useState([]);
  const [specialDishCutoffTime, setSpecialDishCutoffTime] = useState('10:00');
  const [specialDishDailyLimit, setSpecialDishDailyLimit] = useState(20);
  const [lunchOrderTime, setLunchOrderTime] = useState('08:00');
  const [lunchCutoffTime, setLunchCutoffTime] = useState('10:00');
  const [dinnerOrderTime, setDinnerOrderTime] = useState('15:00');
  const [dinnerCutoffTime, setDinnerCutoffTime] = useState('17:00');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${apiBase}/api/settings`);
        if (res.data) {
          setLunchCustomOptions(res.data.lunchCustomOptions || ['None']);
          setDinnerCustomOptions(res.data.dinnerCustomOptions || ['None']);
          setLunchRotisOptions(res.data.lunchRotisOptions || []);
          setLunchSabjisOptions(res.data.lunchSabjisOptions || []);
          setDinnerRotisOptions(res.data.dinnerRotisOptions || []);
          setDinnerSabjisOptions(res.data.dinnerSabjisOptions || []);
          setPaymentQRCode(res.data.paymentQRCode || '');
          if (res.data.maxExtraRotis !== undefined) {
            setMaxExtraRotis(res.data.maxExtraRotis);
          }
          if (res.data.specialDishesOptions) {
            setSpecialDishesOptions(res.data.specialDishesOptions);
            if (res.data.specialDishesOptions.length > 0) {
              setSpecialDishItem(res.data.specialDishesOptions[0].name);
            }
          }
          if (res.data.specialDishCutoffTime) {
            setSpecialDishCutoffTime(res.data.specialDishCutoffTime);
          }
          if (res.data.specialDishDailyLimit !== undefined) {
            setSpecialDishDailyLimit(res.data.specialDishDailyLimit);
          }
          if (res.data.lunchOrderTime) setLunchOrderTime(res.data.lunchOrderTime);
          if (res.data.lunchCutoffTime) setLunchCutoffTime(res.data.lunchCutoffTime);
          if (res.data.dinnerOrderTime) setDinnerOrderTime(res.data.dinnerOrderTime);
          if (res.data.dinnerCutoffTime) setDinnerCutoffTime(res.data.dinnerCutoffTime);
        }
      } catch (err) {
        console.error('Error fetching settings in customizer:', err);
      }
    };
    fetchSettings();
  }, []);

  // Autofill user's saved streetAddress on load/update
  useEffect(() => {
    if (user && user.streetAddress) {
      setStreetAddress(user.streetAddress);
    }
  }, [user]);

  // Sync selection defaults when options or mealType changes
  useEffect(() => {
    if (onlySubjiRoti) {
      setAccompaniment('None (Subji Roti Only)');
      setGujaratiCustomVariant('None');
      setRotisCountSelection(tiffinPlan === 'Couple_SubjiRoti' ? '20 Rotis (Subji Roti Only)' : '10 Rotis (Subji Roti Only)');
    } else {
      const rotis = mealType === 'Lunch' ? lunchRotisOptions : dinnerRotisOptions;
      setRotisCountSelection(rotis[0] || '');
      setAccompaniment('Dal-Rice');
      setGujaratiCustomVariant('None');
    }
    const sabjis = mealType === 'Lunch' ? lunchSabjisOptions : dinnerSabjisOptions;
    setSabjiSelection(sabjis[0] || '');
  }, [onlySubjiRoti, tiffinPlan, mealType, lunchRotisOptions, dinnerRotisOptions, lunchSabjisOptions, dinnerSabjisOptions]);

  // Reset/validate selection when mealType changes
  useEffect(() => {
    if (onlySubjiRoti) return;
    const currentList = mealType === 'Lunch' ? lunchCustomOptions : dinnerCustomOptions;
    if (!currentList.includes(gujaratiCustomVariant)) {
      setGujaratiCustomVariant('None');
    }
  }, [onlySubjiRoti, mealType, lunchCustomOptions, dinnerCustomOptions, gujaratiCustomVariant]);

  // Buttermilk determination removed

  // Pricing math: Single tiffin ₹70, Couple plan ₹120
  const getTiffinPrice = () => {
    const rate = (tiffinPlan === 'Couple' || tiffinPlan === 'Couple_SubjiRoti') ? 120 : 70;
    return (rate + 5 * extraRotisCount) * tiffinCount;
  };

  const getSpecialDishPrice = () => {
    const match = specialDishesOptions.find(o => o.name === specialDishItem);
    const rate = match ? match.price : 0;
    return rate * specialDishQty;
  };

  const totalPrice = activeOrderMode === 'Tiffin' ? getTiffinPrice() : getSpecialDishPrice();

  // Process order placement
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!user) {
      setErrorMsg('Please Register or Log In to place an order.');
      return;
    }

    if (activeOrderMode === 'SpecialDish') {
      const todayStr = new Date().toISOString().split('T')[0];
      if (specialDeliveryDate === todayStr) {
        const now = new Date();
        const [cutoffHour, cutoffMin] = specialDishCutoffTime.split(':').map(Number);
        
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: 'numeric',
          minute: 'numeric',
          hour12: false
        });
        const parts = formatter.formatToParts(now);
        const hourVal = parts.find(p => p.type === 'hour')?.value;
        const minVal = parts.find(p => p.type === 'minute')?.value;
        const currentISTHour = parseInt(hourVal || '0', 10);
        const currentISTMin = parseInt(minVal || '0', 10);

        if (currentISTHour > cutoffHour || (currentISTHour === cutoffHour && currentISTMin >= cutoffMin)) {
          setErrorMsg(`Same-day orders for Special Gujarati Dishes must be placed before ${specialDishCutoffTime} IST. Please select tomorrow or a later date.`);
          return;
        }
      }
    }

    if (paymentMethod === 'Online') {
      setShowQRModal(true);
    } else {
      submitOrderToDatabase();
    }
  };

  const submitOrderToDatabase = async () => {
    setLoading(true);
    setErrorMsg('');
    
    try {
      const token = localStorage.getItem('sattvicbites_user_token');
      
      const payload = {
        orderType: activeOrderMode,
        paymentMethod,
        transactionRef: paymentMethod === 'Online' ? 'Paid via UPI QR Scan' : '',
        deliveryAddress: `${streetAddress.trim()}, ${user.city} - ${user.pincode}`,
        city: user.city,
        pincode: user.pincode,
        specialRequests,
        spiceLevel,
        // Tiffin items
        mealType: activeOrderMode === 'Tiffin' ? mealType : specialMealType,
        tiffinCount: activeOrderMode === 'Tiffin' ? tiffinCount : undefined,
        tiffinPlan: activeOrderMode === 'Tiffin' ? tiffinPlan : 'None',
        extraRotisCount: activeOrderMode === 'Tiffin' ? extraRotisCount : 0,
        accompaniment: activeOrderMode === 'Tiffin' ? (gujaratiCustomVariant === 'None' ? accompaniment : 'Gujarati Variant') : undefined,
        gujaratiCustomVariant: activeOrderMode === 'Tiffin' ? gujaratiCustomVariant : 'None',
        rotisCountSelection: activeOrderMode === 'Tiffin' ? rotisCountSelection : '',
        sabjiSelection: activeOrderMode === 'Tiffin' ? sabjiSelection : '',
        // Special dish items
        specialDishItem: activeOrderMode === 'SpecialDish' ? specialDishItem : 'None',
        specialDishQty: activeOrderMode === 'SpecialDish' ? specialDishQty : 0,
        deliveryDate: activeOrderMode === 'SpecialDish' ? specialDeliveryDate : new Date(),
        locationCoordinates,
        streetAddress: streetAddress.trim()
      };

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.post(`${apiBase}/api/orders`, payload, config);
      
      // Update localStorage cached user object to include the new street address
      if (streetAddress && user) {
        const updatedUser = { ...user, streetAddress: streetAddress.trim() };
        localStorage.setItem('sattvicbites_user_data', JSON.stringify(updatedUser));
      }

      // Persist the request to past requests
      if (specialRequests.trim()) {
        const updated = [specialRequests.trim(), ...pastRequests.filter(r => r !== specialRequests.trim())].slice(0, 5);
        setPastRequests(updated);
        localStorage.setItem('sattvicbites_past_requests', JSON.stringify(updated));
      }

      setSuccessMsg(`Order successfully placed! Status: ${response.data.orderType === 'SpecialDish' ? 'Awaiting Kitchen Approval' : response.data.paymentStatus}`);
      setShowQRModal(false);
      setTiffinCount(1);
      setTiffinPlan('Single');
      setExtraRotisCount(0);
      setGujaratiCustomVariant('None');
      setAccompaniment('Dal-Rice');
      
      setTimeout(() => {
        navigate('/my-orders');
      }, 2000);

    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error occurred while saving your order.');
      setShowQRModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        
        {/* Title */}
        <div className="flex border-b border-[#e6d480]/40 mb-6">
          <button
            type="button"
            onClick={() => { setActiveOrderMode('Tiffin'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`pb-3 text-sm font-bold tracking-wide mr-6 border-b-2 transition-colors ${
              activeOrderMode === 'Tiffin' 
                ? 'border-brandSaffron text-brandSaffron' 
                : 'border-transparent text-brandNavy/60 hover:text-brandNavy/80'
            }`}
          >
            🍱 Daily Tiffin Plans
          </button>
          <button
            type="button"
            onClick={() => { setActiveOrderMode('SpecialDish'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`pb-3 text-sm font-bold tracking-wide border-b-2 transition-colors ${
              activeOrderMode === 'SpecialDish' 
                ? 'border-brandSaffron text-brandSaffron' 
                : 'border-transparent text-brandNavy/60 hover:text-brandNavy/80'
            }`}
          >
            🍛 Special Gujarati Dishes
          </button>
        </div>

        {/* Dynamic Timing Banner */}
        <div className="bg-[#fdfbf4]/80 border border-[#e6d480]/30 rounded-xl p-3.5 mb-6 text-xs text-[#1a2d3c] flex flex-col sm:flex-row justify-between gap-4 font-inter leading-relaxed animate-in fade-in">
          {activeOrderMode === 'Tiffin' ? (
            <>
              <div className="flex-1">
                <span className="font-black text-[#d97706] block uppercase text-[10px] tracking-wider mb-0.5 font-outfit">☀️ Daytime (Lunch) timings</span>
                <span>Order window opens: <strong>{lunchOrderTime}</strong> | Cutoff: <strong>{lunchCutoffTime} IST</strong></span>
              </div>
              <div className="flex-1 sm:border-l sm:border-[#e6d480]/20 sm:pl-4">
                <span className="font-black text-[#4b7a5a] block uppercase text-[10px] tracking-wider mb-0.5 font-outfit">🌙 Nighttime (Dinner) timings</span>
                <span>Order window opens: <strong>{dinnerOrderTime}</strong> | Cutoff: <strong>{dinnerCutoffTime} IST</strong></span>
              </div>
            </>
          ) : (
            <div className="flex-1">
              <span className="font-black text-[#d97706] block uppercase text-[10px] tracking-wider mb-0.5 font-outfit">🍛 Special Dishes timings</span>
              <span>Daily kitchen capacity: <strong>{specialDishDailyLimit} portions</strong> | Same-day cutoff: <strong>{specialDishCutoffTime} IST</strong></span>
            </div>
          )}
        </div>

        {/* Success and Error Alerts */}
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 mb-6 flex gap-2">
            <CheckCircle className="text-brandSage shrink-0 mt-0.5" size={18} />
            <span className="text-sm font-semibold">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-brandOchre bg-opacity-10 text-brandOchre-dark p-4 rounded-xl border border-brandOchre border-opacity-20 mb-6 flex gap-2">
            <AlertTriangle className="text-brandOchre shrink-0" size={18} />
            <span className="text-sm font-semibold">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-6">
          
          {/* ================= TIFFIN PLAN FORM FIELDS ================= */}
          {activeOrderMode === 'Tiffin' ? (
            <>
              {/* Meal Type Selection */}
              <div className="grid grid-cols-2 gap-4">
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="mealType"
                    value="Lunch"
                    checked={mealType === 'Lunch'}
                    onChange={() => setMealType('Lunch')}
                    className="sr-only peer"
                  />
                  <div className="p-3 text-center border-2 rounded-xl text-brandNavy/95 font-bold hover:bg-[#fdfbf4]/40 peer-checked:border-brandSaffron peer-checked:bg-brandSaffron/30 peer-checked:text-brandNavy transition-all">
                    ☀️ Lunch Tiffin (₹70)
                  </div>
                </label>

                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="mealType"
                    value="Dinner"
                    checked={mealType === 'Dinner'}
                    onChange={() => setMealType('Dinner')}
                    className="sr-only peer"
                  />
                  <div className="p-3 text-center border-2 rounded-xl text-brandNavy/95 font-bold hover:bg-[#fdfbf4]/40 peer-checked:border-brandSaffron peer-checked:bg-brandSaffron/30 peer-checked:text-brandNavy transition-all">
                    🌙 Dinner Tiffin (₹70)
                  </div>
                </label>
              </div>

              {/* Plan Choice Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-brandNavy/70 uppercase tracking-wider">Select Tiffin Plan</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-inter">
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="tiffinPlan"
                      value="Single"
                      checked={tiffinPlan === 'Single'}
                      onChange={() => setTiffinPlan('Single')}
                      className="sr-only peer"
                    />
                    <div className="p-3 text-center border-2 rounded-xl text-xs font-bold hover:bg-[#fdfbf4]/40 peer-checked:border-brandSaffron peer-checked:bg-brandSaffron/30 peer-checked:text-brandNavy transition-all h-full flex flex-col justify-center">
                      <span>Single Tiffin (₹70)</span>
                      <span className="block text-[10px] text-brandNavy/60 font-semibold mt-0.5 font-normal">6 Roti + Sabji + Dal-Rice</span>
                    </div>
                  </label>

                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="tiffinPlan"
                      value="Couple"
                      checked={tiffinPlan === 'Couple'}
                      onChange={() => setTiffinPlan('Couple')}
                      className="sr-only peer"
                    />
                    <div className="p-3 text-center border-2 rounded-xl text-xs font-bold hover:bg-[#fdfbf4]/40 peer-checked:border-brandSaffron peer-checked:bg-brandSaffron/30 peer-checked:text-brandNavy transition-all h-full flex flex-col justify-center">
                      <span>Couple Tiffin (₹120)</span>
                      <span className="block text-[10px] text-brandNavy/60 font-semibold mt-0.5 font-normal">12 Roti + Double Sabji + Dal-Rice</span>
                    </div>
                  </label>

                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="tiffinPlan"
                      value="Single_SubjiRoti"
                      checked={tiffinPlan === 'Single_SubjiRoti'}
                      onChange={() => setTiffinPlan('Single_SubjiRoti')}
                      className="sr-only peer"
                    />
                    <div className="p-3 text-center border-2 rounded-xl text-xs font-bold hover:bg-[#fdfbf4]/40 peer-checked:border-brandSaffron peer-checked:bg-brandSaffron/30 peer-checked:text-brandNavy transition-all h-full flex flex-col justify-center">
                      <span>Single Only Subji Roti (₹70)</span>
                      <span className="block text-[10px] text-brandNavy/60 font-semibold mt-0.5 font-normal">10 Roti + Sabji (No Dal-Rice)</span>
                    </div>
                  </label>

                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="tiffinPlan"
                      value="Couple_SubjiRoti"
                      checked={tiffinPlan === 'Couple_SubjiRoti'}
                      onChange={() => setTiffinPlan('Couple_SubjiRoti')}
                      className="sr-only peer"
                    />
                    <div className="p-3 text-center border-2 rounded-xl text-xs font-bold hover:bg-[#fdfbf4]/40 peer-checked:border-brandSaffron peer-checked:bg-brandSaffron/30 peer-checked:text-brandNavy transition-all h-full flex flex-col justify-center">
                      <span>Couple Only Subji Roti (₹120)</span>
                      <span className="block text-[10px] text-brandNavy/60 font-semibold mt-0.5 font-normal">20 Roti + Double Sabji (No Dal-Rice)</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brandNavy/70 uppercase tracking-wider mb-2">Quantity (Number of Plans)</label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setTiffinCount(c => Math.max(1, c - 1))}
                      className="bg-[#fdfbf4]/80 hover:bg-[#ecdba2] text-brandNavy/95 font-bold px-3 py-2 rounded-lg text-lg transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={tiffinCount}
                      onChange={(e) => setTiffinCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center border border-[#e6d480]/50 rounded-lg py-2 font-bold focus:ring-2 focus:ring-brandGreen focus:border-brandGreen outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setTiffinCount(c => c + 1)}
                      className="bg-[#fdfbf4]/80 hover:bg-[#ecdba2] text-brandNavy/95 font-bold px-3 py-2 rounded-lg text-lg transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-[#fdfbf4]/40 p-3 rounded-xl border border-[#e6d480]/30 text-xs font-semibold text-brandNavy">
                  <span className="text-brandGreen font-bold block mb-1">🎁 Selected Plan Details:</span>
                  {tiffinPlan === 'Single' ? (
                    <span>Single pack: Ideal for one person. Comes with 6 Rotis, 1 Sabji, Dal, and Rice. Cost: ₹70.</span>
                  ) : (
                    <span>Couple pack: Ideal for two people. Comes with 12 Rotis, 2 servings Sabji, Dal, and Rice. Cost: ₹120.</span>
                  )}
                </div>
              </div>

              {/* Spice Level Selector */}
              <div>
                <label className="block text-xs font-bold text-brandNavy/70 uppercase tracking-wider mb-2">Spice Level Customizer</label>
                <div className="flex space-x-3">
                  {['Less', 'Mid', 'More'].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSpiceLevel(level)}
                      className={`flex-1 p-2 text-center text-xs font-bold border-2 rounded-xl transition-all ${
                        spiceLevel === level
                          ? 'border-brandSaffron bg-brandSaffron/30 text-brandNavy'
                          : 'border-[#e6d480]/40 text-brandNavy/80 hover:bg-[#fdfbf4]/40'
                      }`}
                    >
                      {level} Spice
                    </button>
                  ))}
                </div>
              </div>

              {/* Extra Rotis Option Section */}
              <div className="p-4 bg-[#fdfbf4]/40 border border-[#e6d480]/30 rounded-xl flex items-center justify-between font-inter">
                <div>
                  <span className="text-xs font-bold text-brandNavy/95 block">Add Extra Rotis (₹5 per Roti)</span>
                  <span className="text-[10px] text-brandNavy/70 font-medium block">Customize your meal plan with additional wheat rotis.</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setExtraRotisCount(c => Math.max(0, c - 1))}
                    className="bg-[#fdfbf4]/40 hover:bg-brandSaffron/30 text-brandNavy font-bold px-3 py-1 rounded-lg border border-[#e6d480]/40 transition-colors text-sm"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-xs text-brandNavy">
                    {extraRotisCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExtraRotisCount(c => Math.min(maxExtraRotis, c + 1))}
                    className="bg-[#fdfbf4]/40 hover:bg-brandSaffron/30 text-brandNavy font-bold px-3 py-1 rounded-lg border border-[#e6d480]/40 transition-colors text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Standard Accompaniment Selection */}
              <div>
                <label className="block text-xs font-bold text-brandNavy/70 uppercase tracking-wider mb-2">Standard Accompaniment</label>
                <select
                  disabled={onlySubjiRoti || gujaratiCustomVariant !== 'None'}
                  value={accompaniment}
                  onChange={(e) => setAccompaniment(e.target.value)}
                  className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 text-brandNavy font-bold rounded-xl p-3 text-sm focus:ring-2 focus:ring-brandSaffron focus:border-brandSaffron outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {onlySubjiRoti ? (
                    <option value="None (Subji Roti Only)">None (Subji Roti Only)</option>
                  ) : (
                    <>
                      <option value="Dal-Rice">Dal-Rice (Standard Default)</option>
                      <option value="Only Roti Add-on">No Rice (Extra Salad payload)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Gujarati Customizer Swaps */}
              {/* Roti & Sabji Choices Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brandNavy/70 uppercase tracking-wider mb-2">Select Rotis Count</label>
                  <select
                    disabled={onlySubjiRoti}
                    value={rotisCountSelection}
                    onChange={(e) => setRotisCountSelection(e.target.value)}
                    className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 text-brandNavy font-bold rounded-xl p-3 text-sm focus:ring-2 focus:ring-brandSaffron focus:border-brandSaffron outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {onlySubjiRoti ? (
                      <option value={rotisCountSelection}>{rotisCountSelection}</option>
                    ) : (
                      (mealType === 'Lunch' ? lunchRotisOptions : dinnerRotisOptions).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-brandNavy/70 uppercase tracking-wider mb-2">Select Sabji Choice</label>
                  <select
                    value={sabjiSelection}
                    onChange={(e) => setSabjiSelection(e.target.value)}
                    className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 text-brandNavy font-bold rounded-xl p-3 text-sm focus:ring-2 focus:ring-brandSaffron focus:border-brandSaffron outline-none"
                  >
                    {(mealType === 'Lunch' ? lunchSabjisOptions : dinnerSabjisOptions).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-brandNavy/70 uppercase tracking-wider">Gujarati Customizer</label>
                </div>
                
                <select
                  disabled={onlySubjiRoti}
                  value={gujaratiCustomVariant}
                  onChange={(e) => setGujaratiCustomVariant(e.target.value)}
                  className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 text-brandNavy font-bold rounded-xl p-3 text-sm focus:ring-2 focus:ring-brandSaffron focus:border-brandSaffron outline-none font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {onlySubjiRoti ? (
                    <option value="None">None</option>
                  ) : (
                    <>
                      <option value="None">None (Standard Default Accompaniment)</option>
                      {(mealType === 'Lunch' ? lunchCustomOptions : dinnerCustomOptions)
                        .filter(opt => opt !== 'None')
                        .map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))
                      }
                    </>
                  )}
                </select>                            
              </div>
            </>
          ) : (
            // ================= SPECIAL DISHES MODULE =================
            <>
              <div className="bg-[#faf8e7] border border-[#e6d480] border-opacity-35 p-4 rounded-xl space-y-1">
                <h3 className="text-xs font-bold text-brandOchre flex items-center gap-1.5">
                  <Clock size={16} /> Booking Rules Constraints
                </h3>
                <p className="text-[11px] text-brandNavy/80 leading-normal font-semibold">
                  Special dishes require <strong>One Day Prior</strong> booking OR same-day orders must be submitted <strong>before {specialDishCutoffTime} IST</strong>. All orders save as <strong>"Pending approval"</strong> until kitchen staff evaluates material availability.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Special Dish Item selection */}
                <div>
                  <label className="block text-xs font-bold text-brandNavy/70 uppercase tracking-wider mb-2">Select Special Dish</label>
                  <select
                    value={specialDishItem}
                    onChange={(e) => setSpecialDishItem(e.target.value)}
                    className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 text-brandNavy font-bold rounded-xl p-3 text-sm focus:ring-2 focus:ring-brandSaffron focus:border-brandSaffron outline-none font-semibold"
                  >
                    {specialDishesOptions.length === 0 ? (
                      <option value="None">Loading special dishes...</option>
                    ) : (
                      specialDishesOptions.map((opt) => (
                        <option key={opt.name} value={opt.name}>
                          {opt.name} (₹{opt.price} / {opt.unit})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-bold text-brandNavy/70 uppercase tracking-wider mb-2">Serving Portions</label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setSpecialDishQty(c => Math.max(1, c - 1))}
                      className="bg-[#fdfbf4]/40 hover:bg-brandSaffron/30 text-brandNavy border border-[#e6d480]/30 font-bold px-3 py-2 rounded-lg text-lg transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={specialDishQty}
                      onChange={(e) => setSpecialDishQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-lg py-2 font-bold text-brandNavy focus:ring-2 focus:ring-brandSaffron focus:border-brandSaffron outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setSpecialDishQty(c => c + 1)}
                      className="bg-[#fdfbf4]/40 hover:bg-brandSaffron/30 text-brandNavy border border-[#e6d480]/30 font-bold px-3 py-2 rounded-lg text-lg transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery time preference radio for special dishes */}
              <div>
                <label className="block text-xs font-bold text-brandNavy/70 uppercase tracking-wider mb-2">Preferred Delivery Period</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="specialMealType"
                      value="Lunch"
                      checked={specialMealType === 'Lunch'}
                      onChange={() => setSpecialMealType('Lunch')}
                      className="sr-only peer"
                    />
                    <div className="p-3 text-center border-2 rounded-xl text-brandNavy/95 font-bold hover:bg-[#fdfbf4]/40 peer-checked:border-brandSaffron peer-checked:bg-brandSaffron/30 peer-checked:text-brandNavy transition-all text-xs">
                      ☀️ Lunch Time Delivery
                    </div>
                  </label>

                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="specialMealType"
                      value="Dinner"
                      checked={specialMealType === 'Dinner'}
                      onChange={() => setSpecialMealType('Dinner')}
                      className="sr-only peer"
                    />
                    <div className="p-3 text-center border-2 rounded-xl text-brandNavy/95 font-bold hover:bg-[#fdfbf4]/40 peer-checked:border-brandSaffron peer-checked:bg-brandSaffron/30 peer-checked:text-brandNavy transition-all text-xs">
                      🌙 Dinner Time Delivery
                    </div>
                  </label>
                </div>
              </div>

              {/* Delivery date specification */}
              <div>
                <label className="block text-xs font-bold text-brandNavy/70 uppercase tracking-wider mb-2">Delivery Date</label>
                <input
                  type="date"
                  required
                  value={specialDeliveryDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSpecialDeliveryDate(e.target.value)}
                  className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 text-brandNavy font-bold rounded-xl p-3 text-sm focus:ring-2 focus:ring-brandSaffron focus:border-brandSaffron outline-none"
                />
              </div>
            </>
          )}

          {/* Freeform Special Requests */}
          <div>
            <label className="block text-xs font-bold text-brandNavy/70 uppercase tracking-wider mb-2">Special Requests Statement</label>
            <textarea
              rows="2"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Write any special instructions here..."
              className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 rounded-xl p-3 text-sm text-brandNavy focus:ring-2 focus:ring-brandSaffron focus:border-brandSaffron outline-none placeholder-slate-400 resize-none font-bold"
            ></textarea>
            {pastRequests.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5 items-center font-inter">
                <span className="text-[9px] text-brandNavy/60 font-bold uppercase mr-1">Suggestions from past orders:</span>
                {pastRequests.map((reqText, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSpecialRequests(reqText)}
                    className="bg-[#fdfbf4]/40 hover:bg-brandSaffron/30 text-brandNavy text-[10px] py-0.5 px-2 rounded-full font-bold border border-[#e6d480]/30 transition-all active:scale-95"
                  >
                    {reqText}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Delivery boundary geofencing */}
          <div className="p-4 bg-[#fdfbf4]/40 rounded-xl border border-[#e6d480]/30">
            <h3 className="text-xs font-bold text-brandNavy/70 uppercase tracking-wider mb-2">Geofenced Address Details</h3>
            {user ? (
              <div className="space-y-2">
                <p className="text-xs text-brandNavy/80">
                  <strong>Delivery Region:</strong> {user.city} (Locked Pincode: {user.pincode})
                </p>
                <textarea
                  required
                  rows="2"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Street name, landmark details, room/house numbers..."
                  className="w-full bg-[#fdfbf4]/40 border border-[#e6d480]/40 text-brandNavy focus:bg-white focus:ring-1 focus:ring-brandSaffron outline-none font-bold p-2 text-xs rounded-lg"
                />
                <div className="mt-3 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleShareLocation}
                    disabled={gpsLoading}
                    className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold transition-all border ${
                      gpsSuccess 
                        ? 'bg-brandSage/15 text-brandSage border-brandSage' 
                        : 'bg-[#fdfbf4]/40 text-brandNavy border-[#e6d480]/40 hover:bg-brandSaffron/30'
                    }`}
                  >
                    {gpsLoading ? '📡 Requesting GPS Coordinates...' : gpsSuccess ? '✅ Live Coordinates Shared Successfully' : '📍 Share Live GPS Location'}
                  </button>
                  {gpsSuccess && locationCoordinates && (
                    <span className="text-[10px] text-brandNavy/70 font-semibold block text-center">
                      Latitude: {locationCoordinates.latitude.toFixed(6)}, Longitude: {locationCoordinates.longitude.toFixed(6)}
                    </span>
                  )}
                  {gpsError && (
                    <span className="text-[10px] text-brandOchre font-bold block text-center">
                      Error: {gpsError}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-brandOchre font-bold">
                Please log in to auto-load geofenced addresses.
              </p>
            )}
          </div>

          {/* Payment selection */}
          <div>
            <label className="block text-xs font-bold text-brandNavy/70 uppercase tracking-wider mb-2">Billing Method</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-3 text-center border-2 rounded-xl text-xs font-bold transition-all ${
                  paymentMethod === 'COD' 
                    ? 'border-brandSaffron bg-brandSaffron/30 text-brandNavy' 
                    : 'border-[#e6d480]/40 text-brandNavy/80 hover:bg-[#fdfbf4]/40'
                }`}
              >
                💵 Cash on Delivery
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Online')}
                className={`p-3 text-center border-2 rounded-xl text-xs font-bold transition-all ${
                  paymentMethod === 'Online' 
                    ? 'border-brandSaffron bg-brandSaffron/30 text-brandNavy' 
                    : 'border-[#e6d480]/40 text-brandNavy/80 hover:bg-[#fdfbf4]/40'
                }`}
              >
                📱 UPI QR Code
              </button>
            </div>
          </div>

          {/* Pricing & Checkout Submit */}
          <div className="border-t border-[#e6d480]/40 pt-6 flex items-center justify-between">
            <div>
              <span className="text-xs text-brandNavy/60 font-bold block">Total price</span>
              <span className="text-2xl font-extrabold text-brandNavy font-outfit">
                ₹{totalPrice}
              </span>
              <span className="text-[10px] text-brandNavy/60 block -mt-1">
                {activeOrderMode === 'Tiffin' ? 'Scale Pricing Applied' : `(${specialDishQty}x serves)`}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-brandSaffron hover:bg-brandSaffron-dark text-brandNavy px-8 py-3 rounded-xl font-bold font-outfit shadow-md transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed btn-glow text-sm"
            >
              {loading ? 'Processing...' : paymentMethod === 'Online' ? 'Scan & Pay &rarr;' : 'Place Order'}
            </button>
          </div>

        </form>

      </div>

      {/* UPI QR Code Payment Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brandNavy/60 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 sm:p-8 relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-brandNavy/60 hover:text-brandNavy/80 text-lg font-bold"
            >
              ✕
            </button>

            <h3 className="font-outfit font-extrabold text-brandNavy text-lg mb-2 text-center flex items-center justify-center gap-1">
              <Smartphone className="text-brandSaffron" /> UPI Instant Transfer
            </h3>
            
            <p className="text-xs text-brandNavy/75 text-center mb-6">
              Scan QR code below with any UPI App (GPay, PhonePe, Paytm, BHIM)
            </p>

            {/* Dynamic UPI QR Code Scanner Image */}
            <div className="flex flex-col items-center justify-center bg-[#fdfbf4]/50 p-6 rounded-xl border border-[#e6d480]/30 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-inner border border-[#e6d480]/40 flex flex-col items-center">
                {paymentQRCode ? (
                  <img 
                    src={paymentQRCode} 
                    alt="Payments QR Code" 
                    className="w-48 h-48 object-contain rounded-lg border border-[#e6d480]/40"
                  />
                ) : (
                  <div className="w-48 h-48 bg-[#fdfbf4]/80 flex flex-col items-center justify-center rounded-lg border text-center p-3 text-brandNavy/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-brandOchre">No Scanner Configured</span>
                    <span className="text-[9px] mt-1 font-semibold leading-tight text-brandNavy/70">
                      QR Code is not uploaded by Admin. Please pay via COD or contact support.
                    </span>
                  </div>
                )}
                <span className="text-[10px] text-brandNavy/60 mt-2 font-bold uppercase tracking-wider">UPI SCANNER DISPLAY</span>
              </div>

              <div className="text-center mt-3">
                <span className="text-xs text-brandNavy/60 font-semibold uppercase block">Amount Payable</span>
                <span className="text-lg font-bold text-brandNavy font-outfit">₹{totalPrice}</span>
              </div>
            </div>

            {/* Verification message & place order button */}
            <div className="space-y-4">
              <div className="bg-[#faf8e7] text-brandNavy border border-[#e6d480] border-opacity-35 p-3 rounded-lg text-[10px] font-semibold leading-normal">
                ⚠️ Scanning and transferring the amount transitions the order status to <strong>"Pending Verification"</strong> immediately. Tiffin boxes will dispatch once Admin reviews and matches the transaction.
              </div>

              <button
                type="button"
                disabled={loading || !paymentQRCode}
                onClick={submitOrderToDatabase}
                className="w-full bg-brandSaffron hover:bg-brandSaffron-dark text-brandNavy py-3 rounded-xl font-bold font-outfit text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting Order...' : 'I Have Paid - Place Order'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
