import React from 'react';
import UserNavbar from '../components/user/UserNavbar';
import UserInteractive3DBackdrop from '../components/user/UserInteractive3DBackdrop';

export default function UserLayout({ children }) {
  return (
    <div className="min-h-screen relative bg-transparent text-slate-800 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Interactive Full 3D Background Picture with Cursor Tracking & Parallax */}
      <UserInteractive3DBackdrop />

      <div>
        <UserNavbar />
        <main className="pb-16 animate-fade-in relative z-10">
          {children}
        </main>
      </div>

      {/* User Portal Footer */}
      <footer className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm tracking-tight inventix-shimmer-text">INVENTIX</span>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <span>Intelligent Personal Scheduling & Operations Portal</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Real-Time Tracking · Instant Reminders · Indian Rupee (₹) Pricing
          </p>
        </div>
      </footer>
    </div>
  );
}
