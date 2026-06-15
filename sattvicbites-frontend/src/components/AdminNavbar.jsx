import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, Clipboard, Compass, CreditCard, Phone } from 'lucide-react';

export default function AdminNavbar() {
  const location = useLocation();
  const path = location.pathname;

  const links = [
    { to: '/admin/config', label: '1. Configurations', icon: <Settings size={14} /> },
    { to: '/admin/analytics', label: '2. Analytics & Feedback', icon: <Clipboard size={14} /> },
    { to: '/admin/dispatch', label: '3. Dispatch Control', icon: <Compass size={14} /> },
    { to: '/admin/payments', label: '4. Payments & QR', icon: <CreditCard size={14} /> },
    { to: '/admin/helpline', label: '5. Helpline & Links', icon: <Phone size={14} /> }
  ];

  return (
    <div className="bg-transparent text-brandNavy p-4 flex flex-col md:flex-row justify-between items-center gap-4 mb-6 relative z-10">
      <div className="flex items-center gap-2.5">
        <span className="text-xl">⚙️</span>
        <div>
          {/* FIXED: Changed to text-[#112316] and increased font size to text-lg */}
          <span className="font-outfit font-black text-lg text-[#112316] tracking-wider block leading-tight">
            SattvicBites Admin Operations
          </span>
          {/* FIXED: Changed text color to a deep organic forest green tint for high-contrast tracking */}
          <span className="text-[9px] font-bold text-[#1a3822] opacity-90 uppercase tracking-widest block font-inter">
            Kitchen Administration Center
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {links.map((link) => {
          const isActive = path === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                isActive 
                  ? 'bg-[#F6E05E] text-[#112316] shadow-md border-[#E9C46A]/40' // High-contrast Saffron active button state
                  : 'bg-[#112316]/10 text-[#112316] hover:bg-[#F6E05E]/80 hover:text-[#112316] border-transparent' // Organic green tint inactive buttons
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}