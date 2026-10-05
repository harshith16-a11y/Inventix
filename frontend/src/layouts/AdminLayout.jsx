import React, { useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import AdminInteractive3DBackdrop from '../components/admin/AdminInteractive3DBackdrop';

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen relative bg-transparent text-slate-100 flex overflow-x-hidden font-sans">
      {/* Interactive Unblurred Full 3D Warehouse Background */}
      <AdminInteractive3DBackdrop />

      {/* Enterprise Dark Collapsible Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main Content Area with Enterprise Header */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950/50 overflow-hidden relative z-10">
        <AdminHeader />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-[1600px] w-full mx-auto animate-fade-in">
          {children}
        </main>

        {/* Enterprise System Footer */}
        <footer className="bg-slate-950 border-t border-slate-800/80 px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-black tracking-tight text-amber-400 inventix-shimmer-admin">INVENTIX OS</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">Enterprise Admin Console</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Auth: ROLE_ADMIN</span>
            <span>Cluster: Node-01 (Local)</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              All Engines Nominal
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
