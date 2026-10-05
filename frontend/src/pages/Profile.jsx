import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import {
  User,
  Mail,
  Building,
  Warehouse,
  Phone,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogOut
} from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword(currentPassword, newPassword);
      setMessage('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Operator Profile</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Manage warehouse credentials, assigned hub facilities, and access roles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-lg shadow-sky-600/20">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
              user.role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'
            }`}>
              {user.role}
            </span>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{user.phone || '+1 555-0199'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Building className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{user.department || 'Warehouse Operations'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Warehouse className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{user.warehouse || 'Central Distribution Hub Alpha'}</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full mt-4 py-2 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Change Password Form */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-800">Security & Password</h3>
            <p className="text-xs text-slate-500">Update your account authentication password.</p>
          </div>

          {message && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
