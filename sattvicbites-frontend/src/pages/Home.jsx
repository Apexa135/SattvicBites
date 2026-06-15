import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Info, ShieldAlert, CheckCircle, Smartphone, AlertTriangle, Vote, Star, Utensils, Heart } from 'lucide-react';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Home({ user, setActiveTab }) {
  // State variables for Tiffin Form
  const [mealType, setMealType] = useState('Lunch');
  const [tiffinCount, setTiffinCount] = useState(1);
  const [accompaniment, setAccompaniment] = useState('Dal-Rice');
  const [gujaratiCustomVariant, setGujaratiCustomVariant] = useState('None');
  const [spiceLevel, setSpiceLevel] = useState('Mid');
  const [hasFreeChaas, setHasFreeChaas] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [deliveryAddress, setDeliveryAddress] = useState(user ? `${user.city}, Pin: ${user.pincode}` : '');
  
  // State variables for Special Dishes Form
  const [activeOrderMode, setActiveOrderMode] = useState('Tiffin'); // 'Tiffin' or 'SpecialDish'
  const [specialDishItem, setSpecialDishItem] = useState('Handvo');
  const [specialDishQty, setSpecialDishQty] = useState(1);
  const [specialDeliveryDate, setSpecialDeliveryDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default tomorrow's date
  );

  // QR Modal and Reference state
  const [showQRModal, setShowQRModal] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  
  // Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Customer Reviews & Feedback states
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  // Automatic dependency hook: Selecting Gujarati customizer variations triggers buttermilk inclusion
  useEffect(() => {
    if (mealType === 'Lunch') {
      // Revert if lunch is active (locks Gujarati options)
      setGujaratiCustomVariant('None');
    }
  }, [mealType]);

  useEffect(() => {
    if (gujaratiCustomVariant !== 'None') {
      setHasFreeChaas(true);
    } else {
      setHasFreeChaas(false);
    }
  }, [gujaratiCustomVariant]);

  // Fetch reviews list
  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${apiBase}/api/feedback`);
      setReviews(res.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Local storage state for Community Polling
  const [hasVoted, setHasVoted] = useState(false);
  const [pollVotes, setPollVotes] = useState({
    Shrikhand: 45,
    Basundi: 30,
    Sukhadi: 18
  });
  const [votedOption, setVotedOption] = useState('');

  useEffect(() => {
    const voted = localStorage.getItem('sattvicbites_voted');
    if (voted) {
      setHasVoted(true);
      setVotedOption(voted);
    }
  }, []);

  const handleVote = (option) => {
    const newVotes = { ...pollVotes, [option]: pollVotes[option] + 1 };
    setPollVotes(newVotes);
    setHasVoted(true);
    setVotedOption(option);
    localStorage.setItem('sattvicbites_voted', option);
  };

  const calculateTotalVotes = () => {
    return Object.values(pollVotes).reduce((a, b) => a + b, 0);
  };

  const getPercent = (val) => {
    const total = calculateTotalVotes();
    return Math.round((val / total) * 100);
  };

  // Pricing math: Pairs (2 tiffins) charge ₹120, singles charge ₹70
  const getTiffinPrice = () => {
    const pairs = Math.floor(tiffinCount / 2);
    const singles = tiffinCount % 2;
    return (pairs * 120) + (singles * 70);
  };

  const getSpecialDishPrice = () => {
    const prices = {
      'Handvo': 60,
      'Thepla': 40,
      'Tikhi Puri': 40,
      'Aloo Paratha': 50
    };
    return (prices[specialDishItem] || 0) * specialDishQty;
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
        transactionRef: paymentMethod === 'Online' ? transactionRef : '',
        deliveryAddress,
        city: user.city,
        pincode: user.pincode,
        specialRequests,
        spiceLevel,
        // Tiffin items
        mealType: activeOrderMode === 'Tiffin' ? mealType : undefined,
        tiffinCount: activeOrderMode === 'Tiffin' ? tiffinCount : undefined,
        accompaniment: activeOrderMode === 'Tiffin' ? (gujaratiCustomVariant === 'None' ? accompaniment : 'Gujarati Variant') : undefined,
        gujaratiCustomVariant: activeOrderMode === 'Tiffin' ? gujaratiCustomVariant : 'None',
        // Special dish items
        specialDishItem: activeOrderMode === 'SpecialDish' ? specialDishItem : 'None',
        specialDishQty: activeOrderMode === 'SpecialDish' ? specialDishQty : 0,
        deliveryDate: activeOrderMode === 'SpecialDish' ? specialDeliveryDate : new Date()
      };

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.post(`${apiBase}/api/orders`, payload, config);
      
      setSuccessMsg(`Order successfully placed! Status: ${response.data.orderType === 'SpecialDish' ? 'Awaiting Kitchen Approval' : response.data.paymentStatus}`);
      setShowQRModal(false);
      setTransactionRef('');
      setSpecialRequests('');
      setTiffinCount(1);
      setGujaratiCustomVariant('None');
      setAccompaniment('Dal-Rice');
      
      setTimeout(() => {
        setActiveTab('my-orders');
      }, 2500);

    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error occurred while saving your order.');
      setShowQRModal(false);
    } finally {
      setLoading(false);
    }
  };

  // Submit Feedback Review
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackSuccess('');
    setErrorMsg('');

    if (!user) {
      setErrorMsg('Please log in to submit a review.');
      return;
    }

    try {
      const token = localStorage.getItem('sattvicbites_user_token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.post(`${apiBase}/api/feedback`, {
        rating: userRating,
        comment: userComment
      }, config);

      setFeedbackSuccess('Thank you for your valuable feedback!');
      setUserComment('');
      setUserRating(5);
      fetchReviews(); // Reload testimonials list
      setTimeout(() => setFeedbackSuccess(''), 4000);

    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit reviews.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Appetite Inviting Welcome Banner */}
      <div className="bg-brandNavy text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none translate-x-8 translate-y-8">
          <span className="text-9xl">🥣</span>
        </div>
        <div className="max-w-3xl">
          <span className="bg-brandSaffron text-white text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider mb-3 inline-block">
            Traditional Ayurvedic Kitchen
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-outfit mb-3">
            Pure Sattvic Nourishment for Body & Soul
          </h1>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            Freshly prepared, balanced, home-style meals delivered warm. We prepare all dishes with zero onions, zero garlic, organic grain selections, and light healthy fats, following strict Ayurvedic wellness principles.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Menu Options details, Homemade Food narrative, reviews */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* MENU OPTIONS CARD */}
          <div className="bg-brandCard rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
              <h2 className="font-outfit font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <Utensils className="text-brandSaffron" size={20} /> Sattvic Daily Menu Schedule
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Morning (Lunch) Plan */}
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-2">
                  ☀️ Morning Tiffin (Lunch Menu)
                </h3>
                <p className="text-xs text-slate-500 mb-2">
                  Served warm between 11:30 AM – 1:30 PM.
                </p>
                <ul className="text-xs text-slate-700 space-y-1 pl-4 list-disc">
                  <li>6 Hot wheat Rotis (smeared with organic cow ghee)</li>
                  <li>1 Seasonal Fresh Sabji (low-sodium, fresh herbs)</li>
                  <li>Accompaniment choice: Standard Dal-Rice</li>
                </ul>
              </div>

              {/* Night (Dinner) Plan */}
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-2">
                  🌙 Night Tiffin (Dinner Menu)
                </h3>
                <p className="text-xs text-slate-500 mb-2">
                  Served warm between 7:00 PM – 8:30 PM.
                </p>
                <div className="text-xs text-slate-700 space-y-2">
                  <p>Basic: 6 Rotis, 1 Fresh Sabji, and choice of standard Dal-Rice.</p>
                  
                  {/* Dinner-only Gujarati variations */}
                  <div className="bg-amber-50 bg-opacity-50 p-3 rounded-lg border border-amber-200 border-opacity-60 space-y-2">
                    <span className="text-[10px] font-bold text-brandSaffron uppercase block">Dinner Swaps (With Pictures)</span>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white p-1 rounded border border-slate-200">
                        <img 
                          src="/vaghreli_khichdi.png" 
                          alt="Vaghareli Khichdi" 
                          className="w-full h-12 object-cover rounded mb-1"
                          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=100&auto=format&fit=crop&q=60" }}
                        />
                        <span className="text-[9px] font-bold text-slate-700 block truncate text-center">Vaghareli Khichdi</span>
                      </div>

                      <div className="bg-white p-1 rounded border border-slate-200">
                        <img 
                          src="/kadhi_khichdi.png" 
                          alt="Saadi Kadhi Khichdi" 
                          className="w-full h-12 object-cover rounded mb-1"
                          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=100&auto=format&fit=crop&q=60" }}
                        />
                        <span className="text-[9px] font-bold text-slate-700 block truncate text-center">Kadhi Khichdi</span>
                      </div>

                      <div className="bg-white p-1 rounded border border-slate-200">
                        <img 
                          src="/vagharela_bhaat.png" 
                          alt="Vagharela Bhaat" 
                          className="w-full h-12 object-cover rounded mb-1"
                          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=100&auto=format&fit=crop&q=60" }}
                        />
                        <span className="text-[9px] font-bold text-slate-700 block truncate text-center">Vagharela Bhaat</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* HOMEMADE FOOD SUMMARY SECTION */}
          <div className="bg-brandCard rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="font-outfit font-extrabold text-slate-800 text-lg flex items-center gap-2">
              <Heart className="text-brandOchre fill-brandOchre" size={20} /> Wholesome Home-Cooked Promise
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every single meal is prepared in my mother's kitchen under active hygiene standard audits. We buy whole grains, grind our flour, and use filtered water and raw ghee. No preservatives, artificial coloring, chemical thickeners, onion, or garlic are ever allowed in the kitchen workspace. Pure, clean, Sattvic prasad prepared fresh daily.
            </p>
          </div>

          {/* COMMUNITY CHOICE POLL */}
          <div className="bg-brandCard rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-outfit font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <Vote className="text-brandSaffron" size={20} /> Sunday Sweet Selection
              </h2>
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-bold uppercase">Poll</span>
            </div>
            
            <p className="text-slate-600 text-xs mb-4">
              Vote for the traditional dessert to be served with the Sunday Special Tiffin box:
            </p>

            {hasVoted ? (
              <div className="space-y-3">
                {Object.entries(pollVotes).map(([key, val]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{key} {votedOption === key && <span className="text-brandSaffron font-bold">(Your Vote)</span>}</span>
                      <span>{getPercent(val)}% ({val} votes)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${votedOption === key ? 'bg-brandSaffron' : 'bg-slate-400'}`}
                        style={{ width: `${getPercent(val)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {Object.keys(pollVotes).map((option) => (
                  <button
                    key={option}
                    onClick={() => handleVote(option)}
                    className="w-full text-left px-4 py-2.5 rounded-lg border border-slate-200 hover:border-brandSaffron text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-between group"
                  >
                    <span>{option}</span>
                    <span className="text-slate-400 group-hover:text-brandSaffron transition-colors">&rarr;</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CUSTOMER FEEDBACK LIST */}
          <div className="bg-brandCard rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="font-outfit font-extrabold text-slate-800 text-lg flex items-center gap-1.5">
              <span>⭐️</span> Customer Testimonials
            </h2>
            
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No feedback entries submitted yet.</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800">{rev.user?.name || 'Anonymous'}</span>
                      <div className="flex text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={10} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 italic">"{rev.comment}"</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Ordering Configurator Form & Feedback Submission */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* ORDER CONFIGURATOR CARD */}
          <div className="bg-brandCard rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            
            {/* Form Mode Toggle tabs */}
            <div className="flex border-b border-slate-200 mb-6">
              <button
                type="button"
                onClick={() => { setActiveOrderMode('Tiffin'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`pb-3 text-sm font-bold tracking-wide mr-6 border-b-2 transition-colors ${
                  activeOrderMode === 'Tiffin' 
                    ? 'border-brandSaffron text-brandSaffron' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
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
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                🍛 Special Gujarati Dishes
              </button>
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
                <AlertTriangle className="text-brandOchre shrink-0 mt-0.5" size={18} />
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
                      <div className="p-3 text-center border-2 rounded-xl text-slate-700 font-bold hover:bg-slate-50 peer-checked:border-brandSaffron peer-checked:bg-amber-50 peer-checked:text-brandSaffron-dark transition-all">
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
                      <div className="p-3 text-center border-2 rounded-xl text-slate-700 font-bold hover:bg-slate-50 peer-checked:border-brandSaffron peer-checked:bg-amber-50 peer-checked:text-brandSaffron-dark transition-all">
                        🌙 Dinner Tiffin (₹70)
                      </div>
                    </label>
                  </div>

                  {/* Quantity & Plan Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tiffin Box Count</label>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setTiffinCount(c => Math.max(1, c - 1))}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-lg text-lg transition-colors"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={tiffinCount}
                          onChange={(e) => setTiffinCount(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 text-center border border-slate-300 rounded-lg py-2 font-bold focus:ring-2 focus:ring-brandSaffron focus:border-brandSaffron outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setTiffinCount(c => c + 1)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-lg text-lg transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
                      <span className="text-brandSaffron font-bold block mb-1">🎁 Tiffin Pricing Plans:</span>
                      1 Person: ₹70 (6 Roti, Sabji, Dal-Rice)<br/>
                      2 People: ₹120 (12 Roti, 2 servings Sabji, Dal-Rice)
                    </div>
                  </div>

                  {/* Spice Level Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Spice Level Customizer</label>
                    <div className="flex space-x-3">
                      {['Less', 'Mid', 'More'].map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setSpiceLevel(level)}
                          className={`flex-1 p-2 text-center text-xs font-bold border-2 rounded-xl transition-all ${
                            spiceLevel === level
                              ? 'border-brandSaffron bg-amber-50 text-brandSaffron-dark'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {level} Spice
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Standard Accompaniment Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Standard Accompaniment</label>
                    <select
                      disabled={gujaratiCustomVariant !== 'None'}
                      value={accompaniment}
                      onChange={(e) => setAccompaniment(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-brandSaffron focus:border-brandSaffron outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="Dal-Rice">Dal-Rice (Standard Default)</option>
                      <option value="Only Roti Add-on">No Rice (Extra Salad payload)</option>
                    </select>
                  </div>

                  {/* Gujarati Customizer (Swaps) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gujarati Customizer (Dinner Only)</label>
                      <span className="text-[10px] text-brandSage font-bold bg-emerald-50 px-2 py-0.5 rounded">Free Swap + Free Chaas</span>
                    </div>
                    
                    <select
                      disabled={mealType === 'Lunch'}
                      value={gujaratiCustomVariant}
                      onChange={(e) => setGujaratiCustomVariant(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-brandSaffron focus:border-brandSaffron outline-none font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="None">None (Standard Default Accompaniment)</option>
                      <option value="Vaghareli Khichdi & Chaas">Vaghareli Khichdi & Chaas</option>
                      <option value="Saadi Kadhi-Khichdi & Chaas">Saadi Kadhi-Khichdi & Chaas</option>
                      <option value="Vagharela Bhaat & Chaas">Vagharela Bhaat & Chaas</option>
                    </select>

                    {mealType === 'Lunch' && (
                      <span className="text-[10px] text-brandOchre font-bold block mt-1">
                        ⚠️ Traditional Khichdi / Bhaat is restricted to Night (Dinner) menu options.
                      </span>
                    )}

                    {/* Automatic Dependency Hook UI display */}
                    {hasFreeChaas && (
                      <div className="mt-2 flex items-center space-x-2 text-xs font-bold text-brandSage-dark bg-emerald-50 p-2.5 rounded-lg border border-brandSage border-opacity-20 animate-pulse">
                        <span>🥛</span>
                        <span>Dependency Hook: Free fresh cup of Buttermilk (Chaas) appended to shipping parameters!</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // ================= SPECIAL DISHES MODULE =================
                <>
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-1">
                    <h3 className="text-xs font-bold text-brandOchre flex items-center gap-1.5">
                      <Clock size={16} /> Booking Rules Constraints
                    </h3>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Special dishes require <strong>One Day Prior</strong> booking OR same-day orders must be submitted <strong>before 10:00 AM IST</strong>. All orders save as <strong>"Pending approval"</strong> until kitchen staff evaluates material availability.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Special Dish Item selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Special Dish</label>
                      <select
                        value={specialDishItem}
                        onChange={(e) => setSpecialDishItem(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-brandSaffron focus:border-brandSaffron outline-none font-semibold"
                      >
                        <option value="Handvo">Handvo (₹60 / plate)</option>
                        <option value="Thepla">Thepla (₹40 / 5 pcs)</option>
                        <option value="Tikhi Puri">Tikhi Puri (₹40 / plate)</option>
                        <option value="Aloo Paratha">Aloo Paratha (₹50 / 2 pcs)</option>
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Serving Portions</label>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setSpecialDishQty(c => Math.max(1, c - 1))}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-lg text-lg transition-colors"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={specialDishQty}
                          onChange={(e) => setSpecialDishQty(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 text-center border border-slate-300 rounded-lg py-2 font-bold focus:ring-2 focus:ring-brandSaffron focus:border-brandSaffron outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setSpecialDishQty(c => c + 1)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-lg text-lg transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delivery date specification */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Delivery Date</label>
                    <input
                      type="date"
                      required
                      value={specialDeliveryDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSpecialDeliveryDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-brandSaffron focus:border-brandSaffron outline-none font-semibold"
                    />
                  </div>
                </>
              )}

              {/* Freeform Special Requests */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Special Requests Statement</label>
                <textarea
                  rows="2"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Less oil, no green chillies, sugar-free sweets..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-brandSaffron focus:border-brandSaffron outline-none placeholder-slate-400 resize-none"
                ></textarea>
                
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                  <Info size={16} className="text-brandOchre mt-0.5 shrink-0" />
                  <p className="text-[11px] text-brandOchre-dark leading-relaxed font-bold">
                    Warning: Premium adjustments are subject to post-delivery manual billing increments on the dispatcher logs.
                  </p>
                </div>
              </div>

              {/* Delivery boundary geofencing */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Geofenced Address Details</h3>
                {user ? (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600">
                      <strong>Delivery Region:</strong> {user.city} (Locked Pincode: {user.pincode})
                    </p>
                    <textarea
                      required
                      rows="2"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Street name, landmark details, room/house numbers..."
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-750 focus:ring-1 focus:ring-brandSaffron outline-none"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-brandOchre font-bold">
                    Please log in to auto-load geofenced addresses.
                  </p>
                )}
              </div>

              {/* Payment selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billing Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3 text-center border-2 rounded-xl text-xs font-bold transition-all ${
                      paymentMethod === 'COD' 
                        ? 'border-brandSaffron bg-amber-50 text-brandSaffron-dark' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    💵 Cash on Delivery
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Online')}
                    className={`p-3 text-center border-2 rounded-xl text-xs font-bold transition-all ${
                      paymentMethod === 'Online' 
                        ? 'border-brandSaffron bg-amber-50 text-brandSaffron-dark' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    📱 UPI QR Code
                  </button>
                </div>
              </div>

              {/* Pricing & Checkout Submit */}
              <div className="border-t border-slate-200 pt-6 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold block">Total price</span>
                  <span className="text-2xl font-extrabold text-slate-800 font-outfit">
                    ₹{totalPrice}
                  </span>
                  <span className="text-[10px] text-slate-400 block -mt-1">
                    {activeOrderMode === 'Tiffin' ? 'Scale Pricing Applied' : `(${specialDishQty}x serves)`}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-brandSaffron hover:bg-brandSaffron-dark text-white px-8 py-3 rounded-xl font-bold font-outfit shadow-md transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed btn-glow text-sm"
                >
                  {loading ? 'Processing...' : paymentMethod === 'Online' ? 'Scan & Pay &rarr;' : 'Place Order'}
                </button>
              </div>

            </form>
          </div>

          {/* CUSTOMER FEEDBACK SUBMISSION */}
          {user && (
            <div className="bg-brandCard rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <h2 className="font-outfit font-extrabold text-slate-800 text-lg mb-4 flex items-center gap-1">
                <span>💬</span> Submit Cooking Feedback
              </h2>

              {feedbackSuccess && (
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg border border-emerald-200 text-xs font-semibold mb-4">
                  {feedbackSuccess}
                </div>
              )}

              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                {/* Rating selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Your Rating</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setUserRating(stars)}
                        className="text-amber-400 focus:outline-none"
                      >
                        <Star 
                          size={24} 
                          fill={userRating >= stars ? 'currentColor' : 'none'} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Feedback Statement</label>
                  <textarea
                    required
                    rows="3"
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="Tell us about food quality, taste, rotis softness..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:ring-1 focus:ring-brandSaffron outline-none resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="bg-brandNavy hover:bg-brandNavy-dark text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-colors"
                >
                  Post Review
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* UPI QR Code Payment Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brandNavy bg-opacity-70 backdrop-blur-sm p-4">
          <div className="bg-brandCard rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg font-bold"
            >
              ✕
            </button>

            <h3 className="font-outfit font-extrabold text-slate-800 text-lg mb-2 text-center flex items-center justify-center gap-1">
              <Smartphone className="text-brandSaffron" /> UPI Instant Transfer
            </h3>
            
            <p className="text-xs text-slate-500 text-center mb-6">
              Scan QR code below with any UPI App (GPay, PhonePe, Paytm, BHIM)
            </p>

            {/* Dynamic UPI QR Code Placeholder Asset */}
            <div className="flex flex-col items-center justify-center bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-inner border border-slate-200 flex flex-col items-center">
                <svg className="w-48 h-48 text-slate-800" viewBox="0 0 100 100">
                  {/* Outer border blocks */}
                  <rect x="5" y="5" width="25" height="25" fill="#16251b" />
                  <rect x="9" y="9" width="17" height="17" fill="white" />
                  <rect x="13" y="13" width="9" height="9" fill="#16251b" />
                  
                  <rect x="70" y="5" width="25" height="25" fill="#16251b" />
                  <rect x="74" y="9" width="17" height="17" fill="white" />
                  <rect x="78" y="13" width="9" height="9" fill="#16251b" />
                  
                  <rect x="5" y="70" width="25" height="25" fill="#16251b" />
                  <rect x="9" y="74" width="17" height="17" fill="white" />
                  <rect x="13" y="78" width="9" height="9" fill="#16251b" />
                  
                  {/* Random mock QR pixels */}
                  <rect x="40" y="15" width="8" height="8" fill="#c2410c" />
                  <rect x="55" y="5" width="8" height="12" fill="#16a34a" />
                  <rect x="45" y="35" width="15" height="5" fill="#16251b" />
                  <rect x="5" y="45" width="12" height="12" fill="#16251b" />
                  
                  <rect x="35" y="50" width="8" height="8" fill="#16a34a" />
                  <rect x="50" y="65" width="15" height="15" fill="#16251b" />
                  <rect x="75" y="45" width="12" height="8" fill="#c2410c" />
                  
                  <rect x="40" y="80" width="12" height="15" fill="#16251b" />
                  <rect x="80" y="80" width="10" height="10" fill="#16a34a" />
                  
                  {/* Brand Center Mark */}
                  <rect x="42" y="42" width="16" height="16" fill="#16251b" rx="2" />
                  <text x="50" y="53" fill="#d97706" fontSize="10" fontWeight="bold" textAnchor="middle">S.B.</text>
                </svg>
                <span className="text-[10px] text-slate-400 mt-2 tracking-wider">Dynamic Amount UPI Code</span>
              </div>

              <div className="text-center mt-3">
                <span className="text-xs text-slate-400 font-semibold uppercase block">Amount Payable</span>
                <span className="text-lg font-bold text-slate-800 font-outfit">₹{totalPrice}</span>
                <span className="text-[10px] text-brandSaffron font-bold block">UPI ID: gohil.sattvic@okaxis</span>
              </div>
            </div>

            {/* Verification reference ID submission */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Submit Transaction Reference ID (Required)
                </label>
                <input
                  required
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="UTR 12-digit Code or UPI Ref"
                  className="w-full text-center border-2 border-slate-300 rounded-xl py-3 text-sm font-semibold tracking-widest focus:border-brandSaffron focus:ring-1 focus:ring-brandSaffron outline-none"
                />
              </div>

              <div className="bg-amber-50 text-amber-900 border border-amber-200 p-3 rounded-lg text-[10px]">
                ⚠️ Order transitions to <strong>"Pending Verification"</strong> status immediately. Tiffin boxes will not load for kitchen dispatch logs until Admin registers reference validity.
              </div>

              <button
                type="button"
                disabled={!transactionRef.trim() || loading}
                onClick={submitOrderToDatabase}
                className="w-full bg-brandSaffron hover:bg-brandSaffron-dark text-white py-3 rounded-xl font-bold font-outfit text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting Reference...' : 'Validate & Save Order'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
