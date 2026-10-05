import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ThemeToggle';
import {
  Search,
  Bell,
  Sparkles,
  ExternalLink,
  Shield,
  Layers,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  LogOut,
  UserCheck
} from 'lucide-react';

export default function AdminHeader({ onRefresh }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate breadcrumbs based on pathname
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/admin') return [{ label: 'Admin', to: '/admin' }, { label: 'Executive Dashboard' }];
    if (path.startsWith('/admin/shipments')) return [{ label: 'Admin', to: '/admin' }, { label: 'Master Schedules' }];
    if (path.startsWith('/admin/queue/normal')) return [{ label: 'Admin', to: '/admin' }, { label: 'Queues' }, { label: 'FIFO Normal' }];
    if (path.startsWith('/admin/queue/priority')) return [{ label: 'Admin', to: '/admin' }, { label: 'Queues' }, { label: 'Priority Min-Heap' }];
    if (path.startsWith('/admin/inventory')) return [{ label: 'Admin', to: '/admin' }, { label: 'Warehouse Master' }];
    if (path.startsWith('/admin/low-stock')) return [{ label: 'Admin', to: '/admin' }, { label: 'Low Stock Alerts' }];
    if (path.startsWith('/admin/users')) return [{ label: 'Admin', to: '/admin' }, { label: 'Users & Permissions' }];
    if (path.startsWith('/admin/performance')) return [{ label: 'Admin', to: '/admin' }, { label: 'Runtime Benchmarks' }];
    if (path.startsWith('/admin/dsa-visualizer')) return [{ label: 'Admin', to: '/admin' }, { label: 'Architecture Visualizer' }];
    if (path.startsWith('/admin/activity')) return [{ label: 'Admin', to: '/admin' }, { label: 'Audit Activity Logs' }];
    if (path.startsWith('/admin/settings')) return [{ label: 'Admin', to: '/admin' }, { label: 'System Settings' }];
    return [{ label: 'Admin', to: '/admin' }, { label: 'Overview' }];
  };

  const breadcrumbs = getBreadcrumbs();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Route to appropriate search view
    navigate(`/admin/inventory?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-slate-200 px-6 py-3 shadow-md flex items-center justify-between gap-4">
      {/* Left: Breadcrumbs & Current Page */}
      <div className="flex items-center gap-2 text-xs">
        <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/80 animate-pulse"></div>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
            {crumb.to ? (
              <Link to={crumb.to} className="text-slate-400 hover:text-amber-400 font-medium transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-white font-bold">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Middle: Admin Quick Omnisearch */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-72">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Admin search (SKU, ID, User)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 font-mono transition-all"
        />
      </form>

      {/* Right: Quick actions, Status, User Portal switch & Admin Profile */}
      <div className="flex items-center gap-3">
        {/* Refresh button */}
        <button
          onClick={handleManualRefresh}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Refresh Operational State"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
        </button>

        {/* Theme Mode Switcher */}
        <ThemeToggle />

        {/* System Engine indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>DSA Engine: Active</span>
        </div>

        {/* View Normal User Portal link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-bold transition-all"
          title="Switch to User Interface"
        >
          <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">User Portal</span>
        </Link>

        {/* Admin User Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 text-slate-950 font-extrabold text-xs flex items-center justify-center shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-white leading-tight">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-amber-400 font-mono leading-tight">Admin Console</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors ml-1"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
