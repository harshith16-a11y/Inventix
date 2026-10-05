import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { notificationService } from '../services/notificationService';
import {
  Boxes,
  Search,
  Bell,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  Layers,
  Activity,
  Gauge,
  SlidersHorizontal,
  ChevronDown,
  ShieldCheck,
  Cpu,
  BookOpen
} from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  useEffect(() => {
    if (user) {
      notificationService.getUnreadCount()
        .then((count) => setUnreadCount(count || 0))
        .catch(() => {});

      const interval = setInterval(() => {
        notificationService.getUnreadCount()
          .then((count) => setUnreadCount(count || 0))
          .catch(() => {});
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [user, location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20 group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors">
                SmartWarehouse
              </span>
            </div>
          </Link>

          {/* Quick Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs relative items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Quick search (e.g. P101, P214)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/90 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
          </form>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive('/') ? 'text-sky-600 bg-sky-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive('/products') ? 'text-sky-600 bg-sky-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Products
            </Link>
            <Link
              to="/shipments/create"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive('/shipments/create') ? 'text-sky-600 bg-sky-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Create Shipment
            </Link>
            <Link
              to="/my-shipments"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive('/my-shipments') ? 'text-sky-600 bg-sky-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              My Shipments
            </Link>
            <Link
              to="/low-stock"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive('/low-stock') ? 'text-amber-700 bg-amber-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Low Stock
            </Link>

            {/* Admin Menu Dropdown */}
            {isAdmin && (
              <div className="relative ml-2">
                <button
                  onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  Admin Console
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {adminDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50"
                    onClick={() => setAdminDropdownOpen(false)}
                  >
                    <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Warehouse Control</p>
                    </div>
                    <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-sky-600">
                      <Gauge className="w-4 h-4 text-sky-500" />
                      Executive Dashboard
                    </Link>
                    <Link to="/admin/inventory" className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-sky-600">
                      <Boxes className="w-4 h-4 text-indigo-500" />
                      Manage Inventory
                    </Link>
                    <Link to="/admin/shipments" className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-sky-600">
                      <Layers className="w-4 h-4 text-purple-500" />
                      All Shipments
                    </Link>
                    <Link to="/admin/queue/normal" className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-sky-600">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Normal FIFO Queue
                    </Link>
                    <Link to="/admin/queue/priority" className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-sky-600">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      Priority Binary Heap Queue
                    </Link>
                    <div className="px-3 py-1.5 border-t border-b border-slate-100 my-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">DSA & Performance</p>
                    </div>
                    <Link to="/admin/performance" className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-sky-600">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      Runtime Benchmarks
                    </Link>
                    <Link to="/admin/dsa-visualizer" className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-sky-600">
                      <Cpu className="w-4 h-4 text-amber-500" />
                      DSA Visualizers
                    </Link>
                    <Link to="/admin/activity" className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-sky-600">
                      <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                      System Activity Log
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Right Action Icons: Cart, Notification, User Dropdown */}
          <div className="flex items-center gap-2">
            {/* Shipment Cart */}
            <Link
              to="/shipments/create"
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Shipment Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-sky-600 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center animate-bounce">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'
                      }`}>
                        {user.role}
                      </span>
                    </div>

                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50">
                      <User className="w-4 h-4 text-slate-400" />
                      My Profile
                    </Link>
                    <Link to="/my-shipments" className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50">
                      <Boxes className="w-4 h-4 text-slate-400" />
                      My Shipments
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold"
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
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-bold bg-sky-600 text-white rounded-xl hover:bg-sky-700 shadow-2xs"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <form onSubmit={handleSearch} className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search product ID or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 rounded-xl"
            />
          </form>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Home
          </Link>
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Products Catalog
          </Link>
          <Link
            to="/shipments/create"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Create Shipment ({totalItems})
          </Link>
          <Link
            to="/my-shipments"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            My Shipments
          </Link>
          <Link
            to="/low-stock"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-amber-700 hover:bg-amber-50"
          >
            Low Stock Alerts
          </Link>

          {isAdmin && (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <p className="px-3 text-xs font-bold text-slate-400 uppercase">Admin Management</p>
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-xs font-semibold text-sky-600">Executive Dashboard</Link>
              <Link to="/admin/inventory" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-xs font-semibold text-slate-700">Manage Inventory</Link>
              <Link to="/admin/queue/normal" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-xs font-semibold text-slate-700">Normal FIFO Queue</Link>
              <Link to="/admin/queue/priority" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-xs font-semibold text-slate-700">Priority Heap Queue</Link>
              <Link to="/admin/performance" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-xs font-semibold text-slate-700">Runtime Benchmarks</Link>
              <Link to="/admin/dsa-visualizer" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-xs font-semibold text-slate-700">DSA Visualizer</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
