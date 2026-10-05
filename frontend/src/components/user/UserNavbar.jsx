import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import ThemeToggle from '../ThemeToggle';
import {
  Calendar,
  Clock,
  Boxes,
  PlusCircle,
  Bell,
  ShoppingCart,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Search,
  Sparkles,
  ShieldCheck,
  ListOrdered,
  Package
} from 'lucide-react';

export default function UserNavbar() {
  const { user, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (path) => location.pathname === path;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo - INVENTIX User Portal */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-violet-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all inventix-float">
              <Calendar className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight inventix-shimmer-text">
                  INVENTIX
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 uppercase tracking-wider font-mono">
                  PORTAL
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block -mt-1 tracking-wider uppercase">
                Schedule & Dispatch
              </span>
            </div>
          </Link>

          {/* Quick Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs relative items-center">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search goods & schedules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </form>

          {/* User Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive('/')
                  ? 'text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 border border-violet-200/60 dark:border-violet-800/60 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              Dashboard
            </Link>

            <Link
              to="/my-shipments"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive('/my-shipments')
                  ? 'text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 border border-violet-200/60 dark:border-violet-800/60 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              My Schedules
            </Link>

            <Link
              to="/calendar"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive('/calendar')
                  ? 'text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 border border-violet-200/60 dark:border-violet-800/60 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Calendar View
            </Link>

            <Link
              to="/shipments/create"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive('/shipments/create')
                  ? 'text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 border border-violet-200/60 dark:border-violet-800/60 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              New Schedule
            </Link>

            <Link
              to="/products"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive('/products')
                  ? 'text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 border border-violet-200/60 dark:border-violet-800/60 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Goods Catalog
            </Link>

            <Link
              to="/warehouse-twin"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive('/warehouse-twin')
                  ? 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/60 border border-orange-200/60 dark:border-orange-800/60 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <Boxes className="w-3.5 h-3.5 text-orange-500" />
              <span>3D Twin</span>
            </Link>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-2">
            {/* If Admin is browsing User Portal, show clean quick switch button */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:border dark:border-amber-500/30 text-white dark:text-amber-300 text-xs font-bold shadow-sm transition-all"
                title="Switch to Admin Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Console</span>
              </Link>
            )}

            {/* Dark / Light Mode Switcher Toggle */}
            <ThemeToggle />

            {/* Schedule Cart / Bag */}
            <Link
              to="/shipments/create"
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Schedule Cart"
            >
              <ShoppingCart className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center animate-bounce shadow-xs">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </Link>

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden sm:inline">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-scale-up"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-violet-50 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-900/50">
                        {user.role === 'ROLE_ADMIN' ? 'Administrator' : 'Standard User'}
                      </span>
                    </div>

                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold">
                      <User className="w-4 h-4 text-slate-400" />
                      My Profile
                    </Link>
                    <Link to="/my-shipments" className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      My Schedules
                    </Link>
                    <Link to="/calendar" className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Schedule Calendar
                    </Link>

                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-50 dark:hover:bg-amber-950/50 font-bold border-t border-slate-100 dark:border-slate-800">
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                        Go to Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs font-bold bg-gradient-to-r from-violet-600 to-rose-600 text-white rounded-xl hover:from-violet-700 hover:to-rose-700 shadow-sm shadow-violet-500/20"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Dashboard
          </Link>
          <Link
            to="/my-shipments"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            My Schedules
          </Link>
          <Link
            to="/calendar"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Schedule Calendar
          </Link>
          <Link
            to="/shipments/create"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            New Schedule ({totalItems} items)
          </Link>
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Goods Catalog
          </Link>
          <Link
            to="/warehouse-twin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-orange-600 dark:text-orange-400 bg-orange-50/60 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-900/40"
          >
            <Boxes className="w-4 h-4 text-orange-500" />
            <span>3D Digital Twin Visualizer</span>
          </Link>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Theme</span>
            <ThemeToggle showLabel={true} />
          </div>

          {isAdmin && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
              >
                Switch to Admin Console
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
