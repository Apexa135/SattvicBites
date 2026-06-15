import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';

export default function Navbar({ user, logout, adminToken, adminLogout }) {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="bg-[#112316]/70 backdrop-blur-md text-white sticky top-0 z-50 shadow-md border-b border-[#e6d480]/15">
      {/* FIXED: Removed max-w-7xl and used w-full to stretch to the absolute edges of the monitor */}
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20"> 
          
          {/* 1. ABSOLUTE LEFT: Logo & Brand Title */}
          <Link to="/" className="flex items-center space-x-3 cursor-pointer shrink-0">
            {/* PERFECT CIRCLE LOGO WRAPPER */}
            <div className="rounded-full shadow-md overflow-hidden w-12 h-12 sm:w-14 sm:h-14 shrink-0 border-2 border-[#FEF3C7] bg-white flex items-center justify-center">
              <img 
                src="/logo.jpeg"
                alt="SattvicBites Logo" 
                className="w-full h-full object-cover rounded-full scale-[1.02]" 
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-outfit font-black text-xl sm:text-2xl tracking-wider block text-white leading-tight">
                SattvicBites
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold block uppercase tracking-widest text-[#FEF3C7] whitespace-nowrap">
                Purity in Every Bite
              </span>
            </div>
          </Link>

          {/* 2. ABSOLUTE RIGHT: Grouping Navigation Tabs & Logout/Auth Actions Together */}
          <div className="flex items-center gap-4 lg:gap-6 ml-auto">
            
            {/* Navigation Links */}
            <div className="hidden lg:flex space-x-1 items-center h-full">
              <Link
                to="/"
                className={`px-3 py-2 text-sm font-semibold transition-all border-b-2 ${
                  path === '/' 
                    ? 'text-[#feecaf] border-[#e6d480] font-bold' 
                    : 'text-[#FDFBF4]/80 border-transparent hover:text-[#feecaf] hover:border-[#e6d480]/50'
                }`}
              >
                Daily Menu
              </Link>
   
              <Link
                to="/order"
                className={`px-3 py-2 text-sm font-semibold transition-all border-b-2 ${
                  path === '/order' 
                    ? 'text-[#feecaf] border-[#e6d480] font-bold' 
                    : 'text-[#FDFBF4]/80 border-transparent hover:text-[#feecaf] hover:border-[#e6d480]/50'
                }`}
              >
                Place Order
              </Link>
   
              <Link
                to="/feedback"
                className={`px-3 py-2 text-sm font-semibold transition-all border-b-2 ${
                  path === '/feedback' 
                    ? 'text-[#feecaf] border-[#e6d480] font-bold' 
                    : 'text-[#FDFBF4]/80 border-transparent hover:text-[#feecaf] hover:border-[#e6d480]/50'
                }`}
              >
                Reviews
              </Link>
   
              <Link
                to="/polls"
                className={`px-3 py-2 text-sm font-semibold transition-all border-b-2 ${
                  path === '/polls' 
                    ? 'text-[#feecaf] border-[#e6d480] font-bold' 
                    : 'text-[#FDFBF4]/80 border-transparent hover:text-[#feecaf] hover:border-[#e6d480]/50'
                }`}
              >
                Community Poll
              </Link>
   
              <Link
                to="/notifications"
                className={`px-3 py-2 text-sm font-semibold transition-all border-b-2 ${
                  path === '/notifications' 
                    ? 'text-[#feecaf] border-[#e6d480] font-bold' 
                    : 'text-[#FDFBF4]/80 border-transparent hover:text-[#feecaf] hover:border-[#e6d480]/50'
                }`}
              >
                Notice Board
              </Link>
                
              <Link
                to="/about"
                className={`px-3 py-2 text-sm font-semibold transition-all border-b-2 ${
                  path === '/about' 
                    ? 'text-[#feecaf] border-[#e6d480] font-bold' 
                    : 'text-[#FDFBF4]/80 border-transparent hover:text-[#feecaf] hover:border-[#e6d480]/50'
                }`}
              >
                Our Story
              </Link>
   
              {user && (
                <Link
                  to="/my-orders"
                  className={`px-3 py-2 text-sm font-semibold transition-all border-b-2 ${
                    path === '/my-orders' 
                      ? 'text-[#feecaf] border-[#e6d480] font-bold' 
                      : 'text-[#FDFBF4]/80 border-transparent hover:text-[#feecaf] hover:border-[#e6d480]/50'
                  }`}
                >
                  My Orders
                </Link>
              )}
   
              {adminToken && (
                <Link
                  to="/admin/config"
                  className={`px-3 py-2 text-sm font-bold flex items-center space-x-1 transition-all border-b-2 ${
                    path.startsWith('/admin') 
                      ? 'text-[#feecaf] border-[#e6d480]' 
                      : 'text-[#FDFBF4]/80 border-transparent hover:border-[#e6d480]/50 hover:text-[#feecaf]'
                  }`}
                >
                  <ShieldAlert size={16} />
                  <span>Kitchen Dispatch</span>
                </Link>
              )}
            </div>
   
            {/* User Actions Section */}
            <div className="flex items-center">
              {adminToken ? (
                /* Admin Session */
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <ShieldAlert size={12} className="text-[#e6d480]" /> Admin Mode
                    </span>
                    <span className="text-[10px] text-[#e6d480] font-medium">Pure Kitchen Logs</span>
                  </div>
                  {/* RED/ORANGE LOGOUT BUTTON */}
                  <button
                    onClick={adminLogout}
                    className="bg-[#D34A36] hover:bg-[#b53a29] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all shadow-sm"
                  >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Exit Admin</span>
                  </button>
                </div>
              ) : user ? (
                /* Authenticated User Session */
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <UserIcon size={12} className="text-[#e6d480]" /> {user.name}
                    </span>
                    <span className="text-[10px] text-[#e6d480] font-bold">{user.city}</span>
                  </div>
                  {/* RED/ORANGE LOGOUT BUTTON MATCHING IMAGE */}
                  <button
                    onClick={logout}
                    className="bg-[#D34A36] hover:bg-[#b53a29] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all shadow-sm"
                  >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                /* Guest Session */
                <div className="flex space-x-3">
                  <Link
                    to="/login"
                    className="text-white hover:text-[#feecaf] text-sm font-bold px-3 py-2 rounded-md transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-[#e6d480] hover:bg-[#d1be5b] text-[#112316] text-sm font-bold px-5 py-2 rounded-lg shadow-sm transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
 
      {/* Mobile navigation bottom bar */}
      <div className="lg:hidden flex justify-around items-center border-t border-[#e6d480]/15 bg-[#112316]/85 backdrop-blur-md py-2 overflow-x-auto no-scrollbar">
        <Link 
          to="/"
          className={`flex flex-col items-center text-[10px] font-bold p-1.5 rounded-lg transition-all shrink-0 min-w-[60px] ${path === '/' ? 'text-[#feecaf] bg-[#e6d480]/15 border border-[#e6d480]/30 shadow-sm' : 'text-[#f0f5f8]'}`}
        >
          <span>🍱</span>
          <span>Menu</span>
        </Link>
        <Link 
          to="/order"
          className={`flex flex-col items-center text-[10px] font-bold p-1.5 rounded-lg transition-all shrink-0 min-w-[60px] ${path === '/order' ? 'text-[#feecaf] bg-[#e6d480]/15 border border-[#e6d480]/30 shadow-sm' : 'text-[#f0f5f8]'}`}
        >
          <span>🍲</span>
          <span>Order</span>
        </Link>
        <Link 
          to="/feedback"
          className={`flex flex-col items-center text-[10px] font-bold p-1.5 rounded-lg transition-all shrink-0 min-w-[60px] ${path === '/feedback' ? 'text-[#feecaf] bg-[#e6d480]/15 border border-[#e6d480]/30 shadow-sm' : 'text-[#f0f5f8]'}`}
        >
          <span>⭐</span>
          <span>Reviews</span>
        </Link>
        <Link 
          to="/polls"
          className={`flex flex-col items-center text-[10px] font-bold p-1.5 rounded-lg transition-all shrink-0 min-w-[60px] ${path === '/polls' ? 'text-[#feecaf] bg-[#e6d480]/15 border border-[#e6d480]/30 shadow-sm' : 'text-[#f0f5f8]'}`}
        >
          <span>🗳️</span>
          <span>Poll</span>
        </Link>
        <Link 
          to="/notifications"
          className={`flex flex-col items-center text-[10px] font-bold p-1.5 rounded-lg transition-all shrink-0 min-w-[60px] ${path === '/notifications' ? 'text-[#feecaf] bg-[#e6d480]/15 border border-[#e6d480]/30 shadow-sm' : 'text-[#f0f5f8]'}`}
        >
          <span>📢</span>
          <span>Notice</span>
        </Link>
        {user && (
          <Link 
            to="/my-orders"
            className={`flex flex-col items-center text-[10px] font-bold p-1.5 rounded-lg transition-all shrink-0 min-w-[60px] ${path === '/my-orders' ? 'text-[#feecaf] bg-[#e6d480]/15 border border-[#e6d480]/30 shadow-sm' : 'text-[#f0f5f8]'}`}
          >
            <span>📋</span>
            <span>Orders</span>
          </Link>
        )}
        {adminToken && (
          <Link 
            to="/admin/config"
            className={`flex flex-col items-center text-[10px] font-bold p-1.5 rounded-lg transition-all shrink-0 min-w-[60px] ${path.startsWith('/admin') ? 'text-[#feecaf] bg-[#e6d480]/15 border border-[#e6d480]/30 shadow-sm' : 'text-[#f0f5f8]'}`}
          >
            <span>⚙️</span>
            <span>Kitchen</span>
          </Link>
        )}
      </div>
    </nav>
  );
}