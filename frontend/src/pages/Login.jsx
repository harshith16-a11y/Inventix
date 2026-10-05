import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import {
  Calendar,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  KeyRound,
  Mail,
  ArrowRight,
  Lock,
  Sparkles,
  Shield
} from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode: 'user' or 'admin'
  const initialMode = searchParams.get('mode') === 'admin' ? 'admin' : 'user';
  const [portalMode, setPortalMode] = useState(initialMode);

  const [email, setEmail] = useState(initialMode === 'admin' ? 'admin@example.com' : 'user@example.com');
  const [password, setPassword] = useState(initialMode === 'admin' ? 'admin123' : 'user123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleModeSwitch = (mode) => {
    setPortalMode(mode);
    setError('');
    if (mode === 'admin') {
      setEmail('admin@example.com');
      setPassword('admin123');
    } else {
      setEmail('user@example.com');
      setPassword('user123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      // Strict role redirection as requested
      if (res.role === 'ROLE_ADMIN') {
        if (portalMode === 'user') {
          // Admin can access user dashboard too if logged in via user tab
          navigate('/');
        } else {
          navigate('/admin');
        }
      } else {
        if (portalMode === 'admin') {
          setError('Unauthorized: Normal user accounts cannot access the Administrator Console.');
          return;
        }
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-[85vh] flex items-center justify-center px-4 py-12 transition-colors duration-300 ${
      portalMode === 'admin' ? 'bg-slate-950/95 py-16' : 'bg-slate-50 dark:bg-slate-950'
    }`}>
      <div className={`max-w-md w-full transition-all duration-300 relative ${
        portalMode === 'admin'
          ? 'bg-slate-900 border border-slate-800 shadow-2xl shadow-amber-500/5 text-slate-100 p-8 rounded-3xl'
          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-8 rounded-3xl text-slate-900 dark:text-slate-100'
      }`}>
        
        {/* Top Floating Utility Bar with Theme Switcher */}
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/"
            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            ← Back to Store
          </Link>
          <ThemeToggle />
        </div>

        {/* Dual Portal Switcher Tabs */}
        <div className="flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => handleModeSwitch('user')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              portalMode === 'user'
                ? 'bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 shadow-sm border border-violet-100 dark:border-violet-900/40 font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span>User Portal</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleModeSwitch('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              portalMode === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Console</span>
          </button>
        </div>

        {/* Header Branding */}
        <div className="text-center mb-6">
          {portalMode === 'user' ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-rose-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-violet-500/30 mb-3 inventix-glow inventix-float">
                <Calendar className="w-7 h-7 stroke-[2.2]" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Welcome to <span className="inventix-shimmer-text">INVENTIX</span>
              </h2>
              <p className="mt-1 text-xs text-slate-500 font-medium">
                Intelligent Scheduling & Logistics Portal
              </p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30 mb-3 inventix-admin-glow">
                <ShieldCheck className="w-7 h-7 stroke-[2.4]" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest mb-1">
                Restricted Access
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                <span className="inventix-shimmer-admin">INVENTIX</span> Console
              </h2>
              <p className="mt-1 text-xs text-slate-400 font-medium">
                Master Operations & Queue Engine Control
              </p>
            </>
          )}
        </div>

        {/* Demo Preset Chip */}
        <div className={`p-3 rounded-2xl border text-xs mb-5 flex items-center justify-between ${
          portalMode === 'admin'
            ? 'bg-slate-950 border-slate-800 text-slate-300'
            : 'bg-rose-50/70 border-rose-200/80 text-rose-950'
        }`}>
          <div>
            <span className="font-bold block text-[11px] uppercase tracking-wider">
              {portalMode === 'admin' ? 'Admin Credential Loaded' : 'Standard User Credential Loaded'}
            </span>
            <span className="text-[10px] font-mono opacity-80">
              {email} · pass: {password}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleModeSwitch(portalMode)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              portalMode === 'admin'
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                : 'bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 text-white shadow-2xs'
            }`}
          >
            Reset
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-bold mb-1 ${portalMode === 'admin' ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl focus:outline-none transition-all ${
                  portalMode === 'admin'
                    ? 'bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 font-mono'
                    : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1 ${portalMode === 'admin' ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`}>
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl focus:outline-none transition-all ${
                  portalMode === 'admin'
                    ? 'bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 font-mono'
                    : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-2.5 px-4 rounded-xl text-sm font-bold active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 ${
              portalMode === 'admin'
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 font-black'
                : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 hover:from-violet-700 hover:via-fuchsia-700 hover:to-rose-600 text-white shadow-violet-500/25'
            }`}
          >
            {loading ? 'Authenticating...' : portalMode === 'admin' ? 'Enter INVENTIX Console' : 'Sign In to INVENTIX'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          {portalMode === 'user' ? (
            <>
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-violet-600 hover:text-rose-600 underline transition-colors">
                Create User Account
              </Link>
            </>
          ) : (
            <p className="text-[11px] text-slate-400 font-mono">
              Authorized personnel only. Audit logs are continuously recorded.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
