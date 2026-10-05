import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { shipmentService } from '../../services/shipmentService';
import { productService } from '../../services/productService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProductCard from '../../components/ProductCard';
import { useCart } from '../../context/CartContext';
import {
  Calendar,
  Clock,
  PlusCircle,
  Package,
  Boxes,
  Truck,
  Flame,
  ArrowRight,
  CheckCircle2,
  CalendarCheck,
  AlertCircle,
  Bell,
  Search,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [shipmentsData, productsData] = await Promise.all([
        shipmentService.getMyShipments(),
        productService.getAll()
      ]);
      setSchedules(shipmentsData || []);
      setPopularProducts((productsData || []).slice(0, 4));
    } catch (err) {
      console.error('Failed to load user dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleAddToCart = (product, qty = 1) => {
    const res = addToCart(product, qty);
    if (res.success) {
      showToast(`Added ${qty}x ${product.name} to schedule bag!`);
    }
  };

  // Metrics
  const totalSchedules = schedules.length;
  const pendingSchedules = schedules.filter(s => s.status === 'PENDING').length;
  const dispatchedSchedules = schedules.filter(s => s.status === 'DISPATCHED').length;
  const completedSchedules = schedules.filter(s => s.status === 'COMPLETED').length;

  // Recent 3 schedules
  const recentSchedules = schedules.slice(0, 3);

  // Generate current week dates for mini-schedule preview
  const today = new Date();
  const weekDays = [];
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    const countForDay = schedules.filter(s => {
      const d = new Date(s.createdAt);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` === dateStr;
    }).length;

    weekDays.push({
      date: day,
      dayName: day.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: day.getDate(),
      isToday: day.toDateString() === today.toDateString(),
      count: countForDay
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-slate-400 hover:text-white text-xs ml-2">✕</button>
        </div>
      )}

      {/* Modern Friendly Hero - Vibrant Violet & Sunset Coral */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-950 via-purple-900 to-rose-950 text-white p-8 sm:p-10 shadow-xl border border-violet-800/60">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-violet-500/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-400/30 text-xs font-bold backdrop-blur-md inventix-float">
            <Sparkles className="w-3.5 h-3.5 text-rose-300 inventix-rotate-slow" />
            <span className="font-black text-white tracking-wide">INVENTIX</span>
            <span className="opacity-60">·</span>
            <span className="text-rose-200">User Portal</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Welcome back, {user ? user.name.split(' ')[0] : 'Member'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 leading-relaxed max-w-xl">
            Manage your personal schedules, plan delivery dispatches on the calendar, and track goods in real time with ease.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link
              to="/shipments/create"
              className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-extrabold rounded-xl text-xs shadow-md shadow-rose-950/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Create New Schedule</span>
            </Link>

            <Link
              to="/calendar"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5"
            >
              <CalendarCheck className="w-4 h-4 text-rose-300" />
              <span>Open Calendar View</span>
            </Link>

            <Link
              to="/products"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5"
            >
              <Package className="w-4 h-4 text-violet-300" />
              <span>Browse Goods</span>
            </Link>

            <Link
              to="/warehouse-twin"
              className="px-4 py-2.5 bg-gradient-to-r from-orange-500/25 to-amber-500/25 hover:from-orange-500/40 hover:to-amber-500/40 text-amber-200 border border-amber-400/30 font-bold rounded-xl text-xs backdrop-blur-md transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Boxes className="w-4 h-4 text-amber-300" />
              <span>3D Warehouse Twin</span>
            </Link>
          </div>
        </div>

        {/* 3D Visual Cart Showcase Pill */}
        <div className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 items-center pointer-events-none">
          <div className="relative group pointer-events-auto">
            <Link
              to="/warehouse-twin"
              className="block p-4 rounded-3xl bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md text-center transition-all duration-300 hover:scale-105 shadow-2xl"
              title="Click to launch 3D/2D Visualizer"
            >
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                <img
                  src="/images/inventix-3d-cart.png"
                  alt="INVENTIX 3D Spatial Twin"
                  className="w-full h-full object-contain drop-shadow-xl animate-float"
                />
              </div>
              <div className="mt-1">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white uppercase tracking-wider font-mono">
                  3D VISUAL ENGINE
                </span>
                <p className="text-[11px] text-purple-200 font-semibold mt-1">
                  Interactive Spatial Twin &rarr;
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* User Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/90 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-4 inventix-card-hover group">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">My Schedules</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalSchedules}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-4 inventix-card-hover group">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Pending Queue</span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{pendingSchedules}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-4 inventix-card-hover group">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Truck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">In Transit</span>
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{dispatchedSchedules}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-4 inventix-card-hover group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Completed</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{completedSchedules}</span>
          </div>
        </div>
      </div>

      {/* Week Timeline Strip Widget */}
      <div className="bg-white dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">This Week's Schedule Timeline</h2>
          </div>
          <Link
            to="/calendar"
            className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
          >
            <span>Full Month Calendar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {weekDays.map((d, idx) => (
            <div
              key={idx}
              onClick={() => navigate('/calendar')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                d.isToday
                  ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white border-transparent shadow-md shadow-violet-500/25'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-100 dark:border-slate-700/80 hover:bg-rose-50/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <span className={`text-[11px] font-bold uppercase tracking-wider block ${d.isToday ? 'text-rose-200' : 'text-slate-400 dark:text-slate-400'}`}>
                {d.dayName}
              </span>
              <span className="text-lg font-black font-mono block mt-1">
                {d.dayNumber}
              </span>
              <div className="mt-2 flex items-center justify-center">
                {d.count > 0 ? (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${d.isToday ? 'bg-white text-violet-950' : 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'}`}>
                    {d.count} plan
                  </span>
                ) : (
                  <span className={`text-[10px] opacity-40 ${d.isToday ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>-</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Recent Schedules & Quick Goods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Personal Schedules */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Recent Schedules</h2>
            <Link to="/my-shipments" className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-rose-600 flex items-center gap-1 transition-colors">
              <span>View All ({schedules.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading your schedules..." />
          ) : recentSchedules.length === 0 ? (
            <div className="bg-white dark:bg-slate-900/90 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No schedules recorded yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create your first scheduled delivery or warehouse dispatch in just a few clicks.
              </p>
              <Link
                to="/shipments/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-violet-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                Schedule Now
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSchedules.map((s) => {
                const isPriority = s.type === 'PRIORITY';
                return (
                  <div
                    key={s.id}
                    className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                          {s.shipmentId}
                        </span>
                        {isPriority ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                            <Flame className="w-3 h-3 text-rose-500" />
                            Priority Urgency
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-900/60">
                            <Truck className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                            Standard FIFO
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          s.status === 'COMPLETED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                            : s.status === 'DISPATCHED'
                            ? 'bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300'
                            : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                        }`}>
                          {s.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Scheduled for: <strong className="text-slate-800 dark:text-slate-200">{new Date(s.createdAt).toLocaleDateString()}</strong> · {s.items ? s.items.length : 0} item types
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 uppercase block">Order Total</span>
                        <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                          ₹{Number(s.totalValue).toFixed(2)}
                        </span>
                      </div>

                      <Link
                        to={`/my-shipments/${s.id}`}
                        className="px-3.5 py-2 bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Add Essential Goods */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Available Goods</h2>
            <Link to="/products" className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-rose-600 transition-colors">
              Browse All
            </Link>
          </div>

          <div className="space-y-3">
            {popularProducts.map((p) => (
              <div
                key={p.productId}
                className="bg-white dark:bg-slate-900/90 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-800/60 flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-slate-400">{p.productId}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">{p.category}</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate mt-0.5">{p.name}</h4>
                  <span className="text-xs font-black text-slate-900 dark:text-white">₹{Number(p.price).toFixed(2)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddToCart(p, 1)}
                  disabled={p.quantity <= 0}
                  className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-xl text-xs font-bold shrink-0 shadow-2xs transition-all"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
