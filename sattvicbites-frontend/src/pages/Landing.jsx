import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Heart, Check } from 'lucide-react';

export default function Landing({ user }) {
  // Determine if it's currently day (Lunch: before 3 PM) or night (Dinner: after 3 PM)
  const [currentPeriod, setCurrentPeriod] = useState(() => new Date().getHours() < 15 ? 'Lunch' : 'Dinner');
  const [isManualOverride, setIsManualOverride] = useState(false);

  // Day Menu Configuration
  const [dayRotis, setDayRotis] = useState('');
  const [daySabji, setDaySabji] = useState('');
  const [dayAccompaniment, setDayAccompaniment] = useState('');
  const [dayImage, setDayImage] = useState('');

  // Night Menu Configuration
  const [nightRotis, setNightRotis] = useState('');
  const [nightSabji, setNightSabji] = useState('');
  const [nightAccompaniment, setNightAccompaniment] = useState('');
  const [nightImage, setNightImage] = useState('');
  const [dinnerCustomOptions, setDinnerCustomOptions] = useState([]);

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 15) {
      setCurrentPeriod('Dinner');
    } else {
      setCurrentPeriod('Lunch');
    }

    const fetchMenuSettings = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/settings');
        if (res.data) {
          setDayRotis(res.data.dayRotis || '');
          setDaySabji(res.data.daySabji || '');
          setDayAccompaniment(res.data.dayAccompaniment || '');
          setDayImage(res.data.dayImage || '');

          setNightRotis(res.data.nightRotis || '');
          setNightSabji(res.data.nightSabji || '');
          setNightAccompaniment(res.data.nightAccompaniment || '');
          setNightImage(res.data.nightImage || '');
          setDinnerCustomOptions(res.data.dinnerCustomOptions || []);
        }
      } catch (err) {
        console.error('Error fetching today menu settings:', err);
      }
    };
    fetchMenuSettings();
  }, []);

  const toggleMenuPeriod = () => {
    setCurrentPeriod(prev => prev === 'Lunch' ? 'Dinner' : 'Lunch');
    setIsManualOverride(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-300">
      
      {/* 1. WELCOME HERO SECTION - Nature Green Gradient with bottom left curve and gold accent glow */}
      <div className="bg-transparent text-white relative">
        {/* Subtle warm gold glow on the far right edge */}
        <div className="absolute top-0 right-0 w-[35%] h-full bg-gradient-to-l from-amber-400/15 via-amber-500/5 to-transparent blur-[80px] pointer-events-none" />
        
        {/* Layout split cleanly */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 px-6 py-10 sm:py-16 items-center relative z-10">
          
          {/* Left Aligned Content */}
          <div className="md:col-span-7 space-y-5">
            <span className="bg-amber-400/20 border border-amber-400/35 text-amber-300 text-xs px-3.5 py-1 rounded-full font-bold uppercase tracking-wider inline-block shadow-sm">
              100% Pure Sattvic Food Kitchen
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-outfit leading-tight text-white animate-fade-in">
              Fresh Home-Style Nourishment Delivered Daily
            </h1>
            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed font-medium">
              Authentic daily tiffin service catering strictly to Vallabh Vidyanagar and Karamsad with Customized Options like  Zero garlic, zero onion, low oil, and infinite care. Shifted from unorganized WhatsApp groups to real-time structured updates.
            </p>
            <div className="pt-2">
              <Link
                to="/order"
                className="bg-slate-300 hover:bg-[#d1be5b] text-[#112316] px-8 py-3.5 rounded-xl font-bold font-outfit shadow-md transition-all duration-300 transform active:scale-95 inline-flex items-center gap-2 hover:scale-[1.03] hover:shadow-lg"
              >
                Order Tiffin Now <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Right Aligned Image Container */}
          <div className="md:col-span-5 flex justify-center items-center relative">
            <img
              src="/sattvic_thali_hero.png"
              alt="Traditional Sattvic Thali"
              className="w-full max-w-[340px] aspect-square object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)] relative z-10 transition-transform duration-500 hover:rotate-3"
            />
          </div>
        </div>
      </div>

      {/* 2. STANDARD TIFFIN PLANS CONTAINER */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <span className="text-emerald-800 text-2xl">🌿</span>
          </div>
          <h2 className="font-outfit font-extrabold text-[#112316] text-2xl sm:text-3xl">Our Standard Tiffin Plans</h2>
          <p className="text-[#1a3822]/80 text-xs sm:text-sm mt-1 font-semibold">Two different tiffin sizes prepared fresh for your dietary needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Plan 1: Single Person Tiffin */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between bg-[#FEFDF6] border border-[#1a3822]/10 shadow-md hover:scale-[1.01] transition-all">
            <div className="space-y-4">
              <div className="flex justify-between items-start border-b border-emerald-900/10 pb-4">
                <div>
                  <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider block">Single Plan</span>
                  <h3 className="font-outfit font-extrabold text-[#112316] text-lg sm:text-xl">Single Person Tiffin</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-800 block font-outfit">₹70</span>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Per Meal</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#112316]/80 leading-relaxed font-semibold">
                Perfect standard meal size designed to fully nourish a single person:
              </p>

              <ul className="space-y-2 text-xs sm:text-sm text-[#112316]/90 font-medium">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-700 shrink-0" />
                  <span>6 Hot whole wheat ghee-smeared Rotis</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-700 shrink-0" />
                  <span>1 Fresh seasonal organic Sabji</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-700 shrink-0" />
                  <span>Standard Dal & Basmati Rice accompaniment</span>
                </li>
              </ul>
            </div>
            
            <div className="pt-6 mt-6 border-t border-emerald-900/10">
              <Link 
                to="/order" 
                className="w-full bg-slate-100 border border-emerald-900/20 hover:bg-[#1a3822] hover:text-white text-[#112316] text-xs sm:text-sm py-2.5 rounded-xl font-bold transition-all text-center block"
              >
                Select Single Tiffin Plan
              </Link>
            </div>
          </div>

          {/* Plan 2: Couple Tiffin */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between bg-[#FEFDF6] border border-[#1a3822]/10 shadow-md hover:scale-[1.01] transition-all">
            <div className="space-y-4">
              <div className="flex justify-between items-start border-b border-emerald-900/10 pb-4">
                <div>
                  <span className="text-xs text-amber-600 font-bold uppercase tracking-wider block">Couple Plan</span>
                  <h3 className="font-outfit font-extrabold text-[#112316] text-lg sm:text-xl">Couple/Two-Person Tiffin</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-600 block font-outfit">₹120</span>
                  <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Per Meal</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#112316]/80 leading-relaxed font-semibold">
                Coupled package providing complete double servings at discounted rates:
              </p>

              <ul className="space-y-2 text-xs sm:text-sm text-[#112316]/90 font-medium">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-amber-600 shrink-0" />
                  <span>12 Hot whole wheat ghee-smeared Rotis</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-amber-600 shrink-0" />
                  <span>2 Servings of fresh seasonal organic Sabji</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-amber-600 shrink-0" />
                  <span>Double Dal & Basmati Rice accompaniment</span>
                </li>
              </ul>
            </div>
            
            <div className="pt-6 mt-6 border-t border-emerald-900/10">
              <Link 
                to="/order" 
                className="w-full bg-blue-100 border border-amber-500/20 text-amber-900 hover:bg-[#1a3822] hover:text-white text-xs sm:text-sm py-2.5 rounded-xl font-bold transition-all text-center block shadow-sm"
              >
                Select Couple Tiffin Plan
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TODAY'S WHOLESOME MENU PANEL */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-5xl mx-auto bg-[#FEFDF6] border border-[#1a3822]/10 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-emerald-900/10 pb-4 mb-6 gap-4">
          <div>
            <h2 className="font-outfit font-extrabold text-[#112316] text-xl sm:text-2xl flex items-center gap-2">
              <Clock className="text-emerald-800" size={24} /> Today's Wholesome Menu <span className="text-emerald-800 text-sm">🌿</span>
            </h2>
            <p className="text-xs text-[#112316]/60 mt-0.5 font-semibold">
              {isManualOverride ? 'Manually peeking at options' : 'Auto-updated based on local hour'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              currentPeriod === 'Lunch' 
                ? 'bg-[#faf8e7] text-[#112316] border border-[#e6d480]' 
                : 'bg-[#f0f5f8] text-[#112316] border border-[#9cb9ce]'
            }`}>
              {currentPeriod === 'Lunch' ? '☀️ Lunch Menu (Daytime)' : '🌙 Dinner Menu (Nighttime)'}
            </span>
            <button
              onClick={toggleMenuPeriod}
              className="text-xs font-bold text-emerald-800 hover:text-white transition-all border border-emerald-800 hover:bg-emerald-800 px-3 py-1 rounded-lg"
            >
              Show {currentPeriod === 'Lunch' ? 'Dinner' : 'Lunch'} Menu
            </button>
          </div>
        </div>

        {/* Dynamic Menu Content Mapping */}
        {currentPeriod === 'Lunch' ? (
          !daySabji.trim() || !dayRotis.trim() ? (
            <div className="p-8 bg-amber-50 border border-amber-200 rounded-2xl text-center">
              <span className="text-2xl block mb-2">⏳</span>
              <p className="text-amber-900 font-black text-sm font-outfit">
                The menu for day (Lunch) is still being decided. We will let you know soon!
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-5 bg-slate-100 border border-slate-200 rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-7 space-y-4">
                    <h3 className="font-outfit font-bold text-[#112316] text-base">Afternoon Refreshing Meal (Lunch)</h3>
                    <p className="text-xs sm:text-sm text-[#112316]/70 leading-relaxed font-semibold">
                      Prepared fresh in the morning to provide nutrients and clean energy for active daytime hours:
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-[#112316]">
                      <li className="bg-[#FEFDF6] p-3.5 rounded-xl border border-emerald-900/10 flex items-center gap-2 shadow-sm">
                        <span className="text-lg">🍞</span> {dayRotis}
                      </li>
                      <li className="bg-[#FEFDF6] p-3.5 rounded-xl border border-emerald-900/10 flex items-center gap-2 shadow-sm">
                        <span className="text-lg">🥦</span> {daySabji}
                      </li>
                      <li className="bg-[#FEFDF6] p-3.5 rounded-xl border border-emerald-900/10 flex items-center gap-2 shadow-sm">
                        <span className="text-lg">🍚</span> {dayAccompaniment}
                      </li>
                    </ul>
                  </div>

                  <div className="md:col-span-5 flex flex-col items-center justify-center">
                    <img 
                      src={dayImage || "/lunch_gujarati_thali.png"} 
                      alt="Daytime Lunch Menu" 
                      className="w-full max-w-[280px] h-40 object-contain rounded-2xl border border-emerald-900/10 shadow-md bg-white p-1"
                      onError={(e) => { e.target.src = "/lunch_gujarati_thali.png"; }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          !nightSabji.trim() || !nightRotis.trim() ? (
            <div className="p-8 bg-amber-50 border border-amber-200 rounded-2xl text-center">
              <span className="text-2xl block mb-2">⏳</span>
              <p className="text-amber-900 font-black text-sm font-outfit">
                The menu for night (Dinner) is still being decided. We will let you know soon!
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-5 bg-slate-100 border border-slate-200 rounded-2xl space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-7 space-y-4">
                    <h3 className="font-outfit font-bold text-[#112316] text-base">Traditional Light Dinner (Night)</h3>
                    <p className="text-xs sm:text-sm text-[#112316]/70 leading-relaxed font-semibold">
                      Light home-cooked foods designed for easy digestion and tranquil night sleep:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-[#112316]">
                      <div className="bg-[#FEFDF6] p-3.5 rounded-xl border border-emerald-900/10 flex items-center gap-2 shadow-sm">
                        <span className="text-lg">🍞</span> {nightRotis}
                      </div>
                      <div className="bg-[#FEFDF6] p-3.5 rounded-xl border border-emerald-900/10 flex items-center gap-2 shadow-sm">
                        <span className="text-lg">🥦</span> {nightSabji}
                      </div>
                      <div className="bg-[#FEFDF6] p-3.5 rounded-xl border border-emerald-900/10 flex items-center gap-2 shadow-sm">
                        <span className="text-lg">🥣</span> {nightAccompaniment}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-5 flex flex-col items-center justify-center">
                    <img 
                      src={nightImage || "/night_gujarati_thali.png"} 
                      alt="Nighttime Dinner Menu" 
                      className="w-full max-w-[280px] h-40 object-contain rounded-2xl border border-emerald-900/10 shadow-md bg-white p-1"
                      onError={(e) => { e.target.src = "/night_gujarati_thali.png"; }}
                    />
                  </div>
                </div>

                <div className="border-t border-emerald-900/10 pt-4 space-y-3">
                  <span className="block text-xs font-bold text-[#112316]/60 uppercase tracking-wider">
                    Dinner swap choices (Selectable in order customizer):
                  </span>

                  <div className="flex flex-wrap gap-2 pt-1 font-inter">
                    {dinnerCustomOptions.filter(opt => opt !== 'None').map((opt, i) => (
                      <span key={i} className="bg-blue-100 text-amber-950 text-xs font-extrabold px-3 py-1.5 rounded-full border border-amber-400/30 shadow-sm flex items-center gap-1.5 font-outfit">
                        🍲 {opt}
                      </span>
                    ))}
                    {dinnerCustomOptions.filter(opt => opt !== 'None').length === 0 && (
                      <span className="text-xs text-[#112316]/40 italic font-semibold">No customizer swap variations configured for tonight.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* 4. SUMMARY NARRATIVE PANEL */}
      <div className="max-w-5xl mx-auto glass-card rounded-2xl p-8 space-y-4 bg-[#FEFDF6] border border-[#1a3822]/10 shadow-md">
        <h2 className="font-outfit font-extrabold text-[#112316] text-2xl flex items-center gap-2">
          <Heart className="text-amber-500 fill-amber-500" size={24} /> Wholesome Home-Cooked Quality <span className="text-emerald-800 text-sm">🌿</span>
        </h2>
        <p className="text-[#112316]/80 text-xs sm:text-sm leading-relaxed font-semibold">
          SattvicBites tiffins are prepared in my mother's home kitchen following Safe guidelines with Home like food. We use freshly ground stone-ground flour, organic cooking grains, and pure cow ghee. Our kitchen is Customized with no onion and garlic food, standard white refined sugar, and artificial coloring agents. Low in sodium and healthy fat allocations, our meals are designed to be light on the stomach and nourishing for daily consumption.
        </p>
      </div>
    </div>
  );
}