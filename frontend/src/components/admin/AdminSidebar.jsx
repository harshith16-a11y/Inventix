import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Truck,
  Flame,
  Boxes,
  Users,
  BarChart3,
  Cpu,
  History,
  Settings,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export default function AdminSidebar({ collapsed, onToggleCollapse }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const navGroups = [
    {
      group: 'CORE OVERVIEW',
      items: [
        { label: 'Executive Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Master Schedules', path: '/admin/shipments', icon: Calendar },
      ]
    },
    {
      group: 'DISPATCH QUEUES',
      items: [
        { label: 'FIFO Normal Queue', path: '/admin/queue/normal', icon: Truck },
        { label: 'Priority Min-Heap', path: '/admin/queue/priority', icon: Flame },
      ]
    },
    {
      group: 'INVENTORY & ASSETS',
      items: [
        { label: 'Warehouse Master', path: '/admin/inventory', icon: Boxes },
        { label: '3D/2D Digital Twin', path: '/admin/warehouse-twin', icon: Sparkles },
        { label: 'Low Stock Alerts', path: '/admin/low-stock', icon: AlertTriangle },
      ]
    },
    {
      group: 'USER DIRECTORY',
      items: [
        { label: 'Users & Permissions', path: '/admin/users', icon: Users },
      ]
    },
    {
      group: 'INTEL & ARCHITECTURE',
      items: [
        { label: 'Runtime Benchmarks', path: '/admin/performance', icon: BarChart3 },
        { label: 'Architecture Visualizer', path: '/admin/dsa-visualizer', icon: Cpu },
        { label: 'Audit Activity Logs', path: '/admin/activity', icon: History },
        { label: 'System Settings', path: '/admin/settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside
      className={`bg-slate-950 text-slate-300 border-r border-slate-800/90 flex flex-col justify-between transition-all duration-300 z-50 shrink-0 sticky top-0 h-screen select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header & Branding */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <Link to="/admin" className="flex items-center gap-3 overflow-hidden group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-slate-950 shrink-0 shadow-md shadow-amber-500/20 group-hover:scale-105 group-hover:rotate-6 transition-all inventix-admin-glow">
              <ShieldCheck className="w-5 h-5 stroke-[2.4]" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base tracking-tight inventix-shimmer-admin">
                    INVENTIX
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    PRO
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                    ENTERPRISE
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Console</span>
                </div>
              </div>
            )}
          </Link>

          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Live System Heartbeat Pill */}
        {!collapsed && (
          <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800/60 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-mono font-medium">System Online</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Port 8080 · H2</span>
          </div>
        )}

        {/* Navigation Groups */}
        <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)]">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">
                  {group.group}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item, iIdx) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={iIdx}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        active
                          ? 'bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-300 border border-amber-500/30 shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-amber-400' : 'text-slate-400'}`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Profile & Portal Link */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950 space-y-2">
        {/* Switch to User Portal */}
        <Link
          to="/"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-800 ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Open User Portal View"
        >
          <ExternalLink className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          {!collapsed && <span>View User Portal</span>}
        </Link>

        {/* Admin Info Pill */}
        <div className={`flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
              A
            </div>
            {!collapsed && (
              <div className="truncate">
                <p className="text-xs font-extrabold text-white truncate">{user ? user.name : 'Administrator'}</p>
                <p className="text-[10px] text-amber-400 font-mono truncate">ROLE_ADMIN</p>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={logout}
              className="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Sign Out of Admin Console"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
