import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Info, AlertTriangle, ShieldAlert } from 'lucide-react';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBase}/api/notifications`);
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10 animate-in fade-in duration-300">
      
      {/* Title Banner */}
      <div className="bg-transparent text-brandNavy p-4 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-4 translate-y-4">
          <span className="text-[120px]">📢</span>
        </div>
        <div className="max-w-2xl space-y-3">
          <span className="bg-brandSaffron/20 border border-brandSaffron/35 text-brandNavy text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-block shadow-sm">
            Announcements & Alerts
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-outfit text-brandNavy">
            SattvicBites Notice Board
          </h1>
          <p className="text-brandNavy/70 text-xs sm:text-sm">
            Stay up to date with kitchen operations announcements, scheduling updates, and service closure alerts for Vallabh Vidyanagar and Karamsad.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="font-outfit font-extrabold text-brandNavy text-lg flex items-center gap-2 border-b border-[#e6d480]/20 pb-3">
          <Bell className="text-emerald-700" size={20} /> Latest Broadcasts
        </h2>

        <div className="space-y-4">
          {loading && notifications.length === 0 ? (
            <p className="text-xs text-brandNavy/60 italic">Syncing notices from the kitchen board...</p>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 bg-[#fdfbf4]/40 border border-dashed border-[#e6d480]/40 rounded-xl">
              <span className="text-3xl block mb-2">🍃</span>
              <p className="text-xs text-brandNavy/60 font-semibold">Everything is running smoothly! No active announcements.</p>
            </div>
          ) : (
            notifications.map((n) => {
              // Custom icon & color based on alert type
              let colorClass = 'bg-[#fdfbf4]/40 border-[#e6d480]/30 text-brandNavy';
              let icon = <Info size={16} className="text-emerald-700 shrink-0 mt-0.5" />;
              
              if (n.type === 'Closure') {
                colorClass = 'bg-red-50/50 border-red-200/40 text-red-950';
                icon = <ShieldAlert size={16} className="text-red-700 shrink-0 mt-0.5" />;
              } else if (n.type === 'Alert') {
                colorClass = 'bg-[#faf8e7]/60 border-[#e6d480]/45 text-brandNavy';
                icon = <AlertTriangle size={16} className="text-[#d1be5b] shrink-0 mt-0.5" />;
              }

              return (
                <div key={n._id} className={`p-4 rounded-xl border ${colorClass} text-xs sm:text-sm flex gap-3 shadow-sm`}>
                  {icon}
                  <div className="space-y-1.5 flex-grow">
                    <p className="font-semibold leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-brandNavy/60 block font-bold">
                      Posted: {new Date(n.createdAt).toLocaleDateString(undefined, { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
