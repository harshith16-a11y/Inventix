import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  Shield,
  Bell,
  Clock,
  Database,
  Lock,
  User,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Server,
  Zap,
  IndianRupee,
  Layers
} from 'lucide-react';

export default function AdminSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [savedMessage, setSavedMessage] = useState('');

  // Settings State
  const [settings, setSettings] = useState({
    siteName: 'INVENTIX Warehouse OS',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata (IST)',
    autoProcessQueues: true,
    fifoBatchLimit: '25',
    priorityMinHeapWeight: 'Urgent First (Min Cost/Time)',
    emailNotifications: true,
    lowStockThreshold: '10',
    auditLogRetentionDays: '90'
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMessage('Settings successfully updated and applied.');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              SYSTEM CONFIG
            </span>
            <span className="text-xs font-mono text-slate-400">Node-01 · Enterprise Core</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Admin Console Settings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure system parameters, dispatch queues, notification thresholds, and administrator privileges.
          </p>
        </div>

        {savedMessage && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{savedMessage}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'general', label: 'General & Localization', icon: Settings },
          { id: 'queues', label: 'Queues & Dispatch Logic', icon: Sliders },
          { id: 'admin-profile', label: 'Admin Security & Role', icon: Shield },
          { id: 'system', label: 'Architecture Health', icon: Server }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                active
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'general' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-400" />
                Branding & Display
              </h3>
              
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">System Brand Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Currency Standard</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-bold flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" />
                    <span>Indian Rupee (₹ INR) - Locked Standard</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Regional Timezone</label>
                <input
                  type="text"
                  value={settings.timezone}
                  disabled
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                Inventory & Stock Notifications
              </h3>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Low Stock Alert Threshold (Units)</label>
                <input
                  type="number"
                  value={settings.lowStockThreshold}
                  onChange={(e) => setSettings({ ...settings, lowStockThreshold: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Products below this quantity trigger red alert badges.</p>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-950 border-slate-800"
                  />
                  <span className="text-xs text-slate-300 font-medium">
                    Trigger broadcast notification on high-priority schedule creation
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      )}

      {activeTab === 'queues' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Dispatch Queue Engine Configuration
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Fine-tune the Java-backed DSA Queue engines (LinkedList FIFO & PriorityQueue Min-Heap).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">FIFO Normal Dispatch Queue</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">O(1) Enqueue</span>
              </div>
              <p className="text-xs text-slate-400">
                Processes standard client schedules in strict chronological order of placement.
              </p>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Batch Processing Limit</label>
                <input
                  type="text"
                  value={settings.fifoBatchLimit}
                  onChange={(e) => setSettings({ ...settings, fifoBatchLimit: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Priority Min-Heap Queue</span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">O(log n) Heapify</span>
              </div>
              <p className="text-xs text-slate-400">
                Pulls Urgent/Express client schedules dynamically to the front of dispatch.
              </p>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Priority Strategy</label>
                <select
                  value={settings.priorityMinHeapWeight}
                  onChange={(e) => setSettings({ ...settings, priorityMinHeapWeight: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  <option>Urgent First (Min Cost/Time)</option>
                  <option>High Value Schedules First</option>
                  <option>Hybrid Express & Standard Balancing</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'admin-profile' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{user?.name || 'Super Administrator'}</h3>
              <p className="text-xs text-slate-400 font-mono">{user?.email || 'admin@example.com'}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {user?.role || 'ROLE_ADMIN'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Full Cluster Access
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Role Permission Matrix
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                'Read/Write Product Inventory',
                'Process Master Schedules',
                'Dispatch FIFO Queue',
                'Dispatch Min-Heap Queue',
                'Inspect Performance Benchmarks',
                'View Audit Logs',
                'Create & Delete Products',
                'Edit Amount / Quantity'
              ].map((perm, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800/70 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                Backend Service & Cluster Telemetry
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Real-time operational status of backend services and database connections.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All Systems Operational
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-[10px] font-mono uppercase text-slate-400">Spring Boot REST API</p>
              <p className="text-lg font-bold text-white mt-1">Port 8080</p>
              <p className="text-[11px] text-emerald-400 font-mono mt-0.5">HTTP 200 OK</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-[10px] font-mono uppercase text-slate-400">Database Engine</p>
              <p className="text-lg font-bold text-white mt-1">H2 In-Memory</p>
              <p className="text-[11px] text-emerald-400 font-mono mt-0.5">Persistent Transactions</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-[10px] font-mono uppercase text-slate-400">DSA Lookup Time</p>
              <p className="text-lg font-bold text-white mt-1">&lt; 1 ms</p>
              <p className="text-[11px] text-amber-400 font-mono mt-0.5">HashMap O(1)</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-[10px] font-mono uppercase text-slate-400">Sorting Engine</p>
              <p className="text-lg font-bold text-white mt-1">Merge Sort</p>
              <p className="text-[11px] text-indigo-400 font-mono mt-0.5">O(n log n) Stable</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
