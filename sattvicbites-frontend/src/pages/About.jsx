import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, ArrowRight } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-300">
      {/* Title */}
      <div className="text-center mb-12 relative z-10">
        <span className="text-brandSaffron font-bold uppercase tracking-wider text-xs bg-brandSaffron/10 px-3 py-1 rounded-full border border-brandSaffron/30 shadow-sm">
          The Story of SattvicBites
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brandNavy font-outfit mt-3 mb-4">
          From Fragmented WhatsApp Loops to a Centralized Database
        </h1>
        <p className="text-brandNavy/70 text-sm sm:text-base max-w-2xl mx-auto font-medium">
          Our transition from an unorganized home kitchen business to a modern, geofenced Web platform.
        </p>
      </div>

      {/* Main Narrative Card */}
      <div className="glass-card rounded-2xl p-8 space-y-6 text-brandNavy/95 leading-relaxed text-sm sm:text-base">
        <div>
          <h2 className="text-xl font-bold font-outfit text-brandNavy mb-2 flex items-center gap-2">
            <Heart className="text-brandOchre fill-brandOchre" size={20} /> My Mother's Kitchen Legacy
          </h2>
          <p>
            SattvicBites was born in our family kitchen in Vallabh Vidyanagar. My mother has always been passionate about preparing authentic, wholesome, purely Sattvic food—cooked fresh daily according to traditional dietary principles with Customized Tiffin Options Like no onions, no garlic, low oil, and natural spices.
          </p>
        </div>

        <div className="border-l-4 border-amber-500 pl-4 bg-amber-50/50 border border-amber-200/40 p-4 rounded-r-xl">
          <h3 className="font-bold text-brandOchre-dark text-xs sm:text-sm uppercase tracking-wider mb-2 flex items-center gap-1">
            ⚠️ The WhatsApp Chaos Era
          </h3>
          <p className="text-xs sm:text-sm text-brandNavy/80 leading-relaxed">
            For years, her business was managed entirely through informal WhatsApp group loops. Customers would send custom requests ("no oil", "substitute Kadhi-Khichdi", "extra rotis") in continuous chat threads. This created massive operational overhead: orders were frequently missed, delivery addresses had to be repeatedly verified, and billing adjustments for special dietary modifications were tracked on paper logs that were prone to damage or loss.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold font-outfit text-brandNavy mb-2 flex items-center gap-2">
            <ShieldCheck className="text-brandSage" size={20} /> Transition to a Structured Web Platform
          </h2>
          <p>
            To protect our operational logistics and help her business grow, we built **SattvicBites**. By digitizing the workflow, we replaced the chaos of WhatsApp with a robust, decoupled MERN architecture:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <li className="flex items-start gap-2 bg-[#fdfbf4]/40 p-3 rounded-lg border border-[#e6d480]/30 text-xs">
              <span className="text-brandSage font-bold mt-0.5">✔</span>
              <span><strong>Regional Geofencing:</strong> Dropdown registration locks customer orders strictly to Vallabh Vidyanagar and Karamsad to protect delivery runners.</span>
            </li>
            <li className="flex items-start gap-2 bg-[#fdfbf4]/40 p-3 rounded-lg border border-[#e6d480]/30 text-xs">
              <span className="text-brandSage font-bold mt-0.5">✔</span>
              <span><strong>Cutoff Enforcements:</strong> Server-side chronometers auto-reject late orders based on dynamic admin cutoffs to ensure kitchen workflow predictability.</span>
            </li>
            <li className="flex items-start gap-2 bg-[#fdfbf4]/40 p-3 rounded-lg border border-[#e6d480]/30 text-xs">
              <span className="text-brandSage font-bold mt-0.5">✔</span>
              <span><strong>Customizer Hooks:</strong> Swapping default accompaniments for traditional Gujarati variations automatically triggers free buttermilk and modifies packing lists.</span>
            </li>
            <li className="flex items-start gap-2 bg-[#fdfbf4]/40 p-3 rounded-lg border border-[#e6d480]/30 text-xs">
              <span className="text-brandSage font-bold mt-0.5">✔</span>
              <span><strong>Admin Dispatch Log:</strong> Eliminates manual paper records, organizing deliveries by city-pincode boundaries and enabling payment validation.</span>
            </li>
          </ul>
        </div>

        <div className="border-t border-[#e6d480]/40 pt-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-brandNavy/70">Ready to taste purity?</span>
          </div>
          <Link
            to="/order"
            className="bg-brandSaffron hover:bg-brandSaffron-dark text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-outfit shadow-sm flex items-center gap-1 transition-all"
          >
            Order a Tiffin Box <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
