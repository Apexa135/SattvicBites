import React, { useState, useEffect } from 'react';
// FIXED: Added useLocation to the react-router-dom imports below
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import OrderCustomizer from './pages/OrderCustomizer';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminConfig from './pages/AdminConfig';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminDispatch from './pages/AdminDispatch';
import AdminPayments from './pages/AdminPayments';
import AdminHelpline from './pages/AdminHelpline';
import MyOrders from './pages/MyOrders';
import ReviewsPage from './pages/ReviewsPage';
import PollPage from './pages/PollPage';
import NotificationsPage from './pages/NotificationsPage';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('sattvicbites_user_data');
      return (storedUser && storedUser !== 'undefined' && storedUser !== 'null') ? JSON.parse(storedUser) : null;
    } catch (err) {
      console.error('Error parsing stored user session:', err);
      localStorage.removeItem('sattvicbites_user_data');
      localStorage.removeItem('sattvicbites_user_token');
      return null;
    }
  });

  const [adminToken, setAdminToken] = useState(() => {
    try {
      const storedAdminToken = localStorage.getItem('sattvicbites_admin_token');
      return (storedAdminToken && storedAdminToken !== 'undefined' && storedAdminToken !== 'null') ? storedAdminToken : null;
    } catch (err) {
      console.error('Error parsing admin token:', err);
      localStorage.removeItem('sattvicbites_admin_token');
      return null;
    }
  });

  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('sattvicbites_read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState(null);

  // Fetch settings for helpline and links
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/settings');
        setSettings(res.data);
      } catch (err) {
        console.error('Error fetching settings in root App:', err);
      }
    };
    fetchSettings();
    const interval = setInterval(fetchSettings, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // Fetch active notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/notifications');
        setNotifications(res.data || []);
      } catch (err) {
        console.error('Error fetching global notifications:', err);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sattvicbites_user_token');
    localStorage.removeItem('sattvicbites_user_data');
    setUser(null);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('sattvicbites_admin_token');
    setAdminToken(null);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleAdminLogin = (token) => {
    setAdminToken(token);
  };

  return (
    <BrowserRouter>
      <AppContent 
        user={user} 
        setUser={setUser} 
        adminToken={adminToken} 
        setAdminToken={setAdminToken}
        notifications={notifications}
        setNotifications={setNotifications}
        readNotifications={readNotifications}
        setReadNotifications={setReadNotifications}
        settings={settings}
        handleLogout={handleLogout}
        handleAdminLogout={handleAdminLogout}
        handleAuthSuccess={handleAuthSuccess}
        handleAdminLogin={handleAdminLogin}
      />
    </BrowserRouter>
  );
}

function AppContent({
  user,
  setUser,
  adminToken,
  setAdminToken,
  notifications,
  setNotifications,
  readNotifications,
  setReadNotifications,
  settings,
  handleLogout,
  handleAdminLogout,
  handleAuthSuccess,
  handleAdminLogin
}) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  const lowerBgClass = "flex-grow w-full bg-[#FEF3C7] relative";
    
  const waveFill = "#FEF3C7";

  return (
    <div className="min-h-screen flex flex-col text-brandNavy font-inter relative bg-transparent overflow-x-hidden">
      
      {/* Global Background Gradient Layers & Curved Wave */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex flex-col">
        {/* Top Nature-Green Banner background */}
        <div className="h-[480px] bg-gradient-to-br from-[#112316] to-[#1a3822] w-full relative">
          {/* Gold glow element */}
          <div className="absolute top-1/4 right-10 w-96 h-96 bg-amber-400/10 rounded-full blur-[120px]"></div>
          {/* Soft leaf accents in top background */}
          <svg className="absolute top-12 left-10 w-24 h-24 text-emerald-800/10 fill-current rotate-45" viewBox="0 0 24 24">
            <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7,18C12,18 16.5,14 17,8M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
          </svg>
          <svg className="absolute top-32 right-12 w-32 h-32 text-emerald-800/10 fill-current -rotate-12" viewBox="0 0 24 24">
            <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7,18C12,18 16.5,14 17,8M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
          </svg>
        </div>
        
        {/* Transition wave SVG */}
        <div className="relative w-full -mt-2">
          <svg viewBox="0 0 1440 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0,96 C320,160 640,32 960,128 C1120,176 1280,144 1440,96 L1440,160 L0,160 Z" fill={waveFill} />
            <path d="M0,96 C320,160 640,32 960,128 C1120,176 1280,144 1440,96 L1440,0 L0,0 Z" fill="url(#greenGrad)" />
            <defs>
              <linearGradient id="greenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#112316" />
                <stop offset="100%" stopColor="#1a3822" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        {/* Lower Earthy-Olive & Golden-Yellow section */}
        <div className={lowerBgClass}>
          {/* Soft gold vector line art overlays of food items, cutlery, plates, grains */}
          <div className="absolute inset-0 opacity-15">
            <svg className="absolute bottom-20 right-10 w-96 h-96 text-amber-500/25 stroke-current fill-none" strokeWidth="1" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="30" />
              <circle cx="50" cy="50" r="25" />
              <path d="M12 30 L12 70 M8 30 L8 50 L12 50 M16 30 L16 50 L12 50" />
              <path d="M88 30 L88 70 M84 30 C84 45 88 50 88 50" />
            </svg>
            <svg className="absolute top-1/4 left-10 w-64 h-64 text-amber-500/20 stroke-current fill-none" strokeWidth="0.8" viewBox="0 0 100 100">
              <path d="M20,80 C30,70 40,50 35,30 M35,30 C30,35 25,45 20,80 M35,30 L38,20 M38,20 C36,25 32,32 20,80" />
              <path d="M50,90 C55,75 58,60 52,40 M52,40 C46,45 42,60 50,90" />
            </svg>
          </div>
          {/* Muted green leaf accents scattered in background */}
          <div className="absolute inset-0 opacity-10">
            <svg className="absolute top-48 right-1/4 w-16 h-16 text-emerald-800/20 fill-current" viewBox="0 0 24 24">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7,18C12,18 16.5,14 17,8M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
            </svg>
            <svg className="absolute bottom-96 left-12 w-20 h-20 text-emerald-800/25 fill-current rotate-90" viewBox="0 0 24 24">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7,18C12,18 16.5,14 17,8M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
            </svg>
            <svg className="absolute bottom-48 right-12 w-16 h-16 text-emerald-800/20 fill-current -rotate-45" viewBox="0 0 24 24">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7,18C12,18 16.5,14 17,8M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Navigation Headings */}
      <Navbar user={user} logout={handleLogout} adminToken={adminToken} adminLogout={handleAdminLogout} />

      {/* Global Alert Notification Bar */}
      {notifications.length > 0 && notifications.filter(n => !readNotifications.includes(n._id)).slice(0, 1).map((notif) => (
        <div key={notif._id} className="bg-[#F6E05E] text-[#112316] py-2.5 px-4 text-xs font-bold text-center flex items-center justify-center gap-2 border-b border-amber-400/30 transition-all shadow-sm relative z-20">
          <span>📢</span>
          <span className="font-semibold">{notif.message}</span>
          <button 
            onClick={() => {
              const updated = [...readNotifications, notif._id];
              setReadNotifications(updated);
              localStorage.setItem('sattvicbites_read_notifications', JSON.stringify(updated));
            }}
            className="ml-3 bg-[#112316] text-white hover:bg-opacity-90 px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-all"
          >
            Mark Read
          </button>
        </div>
      ))}

      {/* Main Content Areas */}
      {isHome ? (
        <main className="flex-grow relative z-10">
          <Routes>
            <Route path="/" element={<Landing user={user} />} />
            <Route path="/order" element={<OrderCustomizer user={user} />} />
            <Route path="/about" element={<About />} />
            <Route path="/feedback" element={<ReviewsPage user={user} />} />
            <Route path="/polls" element={<PollPage user={user} />} />
            <Route path="/notifications" element={<NotificationsPage user={user} />} />
            <Route path="/login" element={<Login onAuthSuccess={handleAuthSuccess} />} />
            <Route path="/register" element={<Register onAuthSuccess={handleAuthSuccess} />} />
            <Route 
              path="/admin/login" 
              element={
                <AdminLogin 
                  adminToken={adminToken} 
                  setAdminToken={setAdminToken} 
                  onAdminLogin={handleAdminLogin} 
                />
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={<AdminConfig adminToken={adminToken} />} 
            />
            <Route 
              path="/admin/config" 
              element={<AdminConfig adminToken={adminToken} />} 
            />
            <Route 
              path="/admin/analytics" 
              element={<AdminAnalytics adminToken={adminToken} />} 
            />
            <Route 
              path="/admin/dispatch" 
              element={<AdminDispatch adminToken={adminToken} />} 
            />
            <Route 
              path="/admin/payments" 
              element={<AdminPayments adminToken={adminToken} />} 
            />
            <Route 
              path="/admin/helpline" 
              element={<AdminHelpline adminToken={adminToken} />} 
            />
            <Route 
              path="/my-orders" 
              element={user ? <MyOrders user={user} /> : <Navigate to="/login" />} 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      ) : (
        <div className="flex-grow bg-gradient-to-b from-[#112316] via-[#16301e] to-[#1a3822] p-4 sm:p-6 md:p-8 relative z-10">
          <main className="bg-[#FEF3C7] rounded-3xl p-6 sm:p-8 min-h-[75vh] shadow-2xl border border-[#E9C46A]/20">
            <Routes>
              <Route path="/" element={<Landing user={user} />} />
              <Route path="/order" element={<OrderCustomizer user={user} />} />
              <Route path="/about" element={<About />} />
              <Route path="/feedback" element={<ReviewsPage user={user} />} />
              <Route path="/polls" element={<PollPage user={user} />} />
              <Route path="/notifications" element={<NotificationsPage user={user} />} />
              <Route path="/login" element={<Login onAuthSuccess={handleAuthSuccess} />} />
              <Route path="/register" element={<Register onAuthSuccess={handleAuthSuccess} />} />
              <Route 
                path="/admin/login" 
                element={
                  <AdminLogin 
                    adminToken={adminToken} 
                    setAdminToken={setAdminToken} 
                    onAdminLogin={handleAdminLogin} 
                  />
                } 
              />
              <Route 
                path="/admin/dashboard" 
                element={<AdminConfig adminToken={adminToken} />} 
              />
              <Route 
                path="/admin/config" 
                element={<AdminConfig adminToken={adminToken} />} 
              />
              <Route 
                path="/admin/analytics" 
                element={<AdminAnalytics adminToken={adminToken} />} 
              />
              <Route 
                path="/admin/dispatch" 
                element={<AdminDispatch adminToken={adminToken} />} 
              />
              <Route 
                path="/admin/payments" 
                element={<AdminPayments adminToken={adminToken} />} 
              />
              <Route 
                path="/admin/helpline" 
                element={<AdminHelpline adminToken={adminToken} />} 
              />
              <Route 
                path="/my-orders" 
                element={user ? <MyOrders user={user} /> : <Navigate to="/login" />} 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      )}

      {/* Premium Styled Footer */}
      <footer className="bg-gradient-to-br from-[#112316] to-[#1a3822] text-emerald-100/90 py-12 border-t border-[#e6d480]/20 relative z-10 font-inter shadow-inner mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-white/10">
            
            {/* Column 1: Brand Info (4 cols) */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="rounded-full shadow-md overflow-hidden w-10 h-10 shrink-0 border border-[#FEF3C7] bg-white flex items-center justify-center">
                  <img 
                    src="/logo.jpeg"
                    alt="SattvicBites Logo" 
                    className="w-full h-full object-cover rounded-full scale-[1.02]" 
                  />
                </div>
                <div>
                  <span className="font-bold text-lg text-white tracking-wide block">SattvicBites</span>
                  <span className="text-[10px] uppercase tracking-widest block text-[#FEF3C7] font-bold">Purity in Every Bite</span>
                </div>
              </div>
              <p className="text-xs text-emerald-100/70 leading-relaxed max-w-sm">
                100% Pure Sattvic Food tiffin delivery service. Prepared in our organic home kitchen with Customized Options and infinite care. Serving Vallabh Vidyanagar & Karamsad regions.
              </p>
            </div>

            {/* Column 2: Quick Navigation (2 cols) */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#FEF3C7]">Navigation</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/" className="hover:text-white text-emerald-100/80 hover:text-[#FEF3C7] transition-colors">Daily Menu</Link>
                </li>
                <li>
                  <Link to="/order" className="hover:text-white text-emerald-100/80 hover:text-[#FEF3C7] transition-colors">Place Order</Link>
                </li>
                <li>
                  <Link to="/feedback" className="hover:text-white text-emerald-100/80 hover:text-[#FEF3C7] transition-colors">Customer Reviews</Link>
                </li>
                <li>
                  <Link to="/polls" className="hover:text-white text-emerald-100/80 hover:text-[#FEF3C7] transition-colors">Community Polls</Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Company & Access (3 cols) */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#FEF3C7]">Our Kitchen</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/about" className="hover:text-white text-emerald-100/80 hover:text-[#FEF3C7] transition-colors">Our Ayurvedic Legacy</Link>
                </li>
                <li>
                  <Link to="/notifications" className="hover:text-white text-emerald-100/80 hover:text-[#FEF3C7] transition-colors">Notice Board Announcements</Link>
                </li>
                <li>
                  <Link to="/admin/login" className="text-amber-300 hover:text-amber-200 transition-colors inline-flex items-center gap-1 font-bold">
                    🔑 Kitchen Staff Access
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Support & Community (3 cols) */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#FEF3C7]">Support & Socials</h4>
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <span className="text-emerald-100/50 block uppercase tracking-wider text-[10px] font-bold">Kitchen Helpline</span>
                  <span className="text-white bg-[#0B160E] px-3 py-1.5 rounded-lg border border-[#e6d480]/20 font-mono font-bold inline-block shadow-sm">
                    {settings?.helplineNumber || '+91 98765 43210'}
                  </span>
                  {settings?.additionalNumbers && settings.additionalNumbers.map((num, i) => (
                    <span key={i} className="text-white bg-[#0B160E] px-3 py-1.5 rounded-lg border border-[#e6d480]/20 font-mono font-bold block mt-1.5 shadow-sm w-max">
                      {num}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col space-y-2 pt-1">
                  <a href={settings?.communityLink || '#'} target="_blank" rel="noopener noreferrer" className="text-[#FEF3C7] hover:text-white transition-colors hover:underline flex items-center gap-1 font-semibold">
                    🌐 WhatsApp Community
                  </a>
                  <a href={settings?.discordLink || '#'} target="_blank" rel="noopener noreferrer" className="text-[#FEF3C7] hover:text-white transition-colors hover:underline flex items-center gap-1 font-semibold">
                    💬 Discord Server
                  </a>
                  {settings?.additionalLinks && settings.additionalLinks.map((link, i) => (
                    <a key={i} href={link.url || '#'} target="_blank" rel="noopener noreferrer" className="text-[#FEF3C7] hover:text-white transition-colors hover:underline flex items-center gap-1 font-semibold">
                      🔗 {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Copyright bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-[11px] font-medium text-emerald-100/40 gap-4">
            <div>
              © {new Date().getFullYear()} SattvicBites. All rights reserved.
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#0B160E] px-2.5 py-1 rounded text-[10px] text-emerald-100/70 border border-white/10 shadow-sm">
                Karamsad & Vallabh Vidyanagar Geofenced Delivery Area
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}