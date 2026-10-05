import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Package,
  Layers,
  Info,
  Clock
} from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'LOW_STOCK':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'SHIPMENT_COMPLETED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'SHIPMENT_QUEUED':
        return <Layers className="w-5 h-5 text-sky-500" />;
      case 'SHIPMENT_PROCESSING':
        return <Package className="w-5 h-5 text-indigo-500" />;
      default:
        return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time automated alerts for shipment lifecycle states and inventory thresholds.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="self-start sm:self-auto px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You are completely caught up! New alerts will appear here automatically."
          icon={Bell}
        />
      ) : (
        <div className="divide-y divide-slate-100 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex items-start gap-4 transition-colors ${
                !n.read ? 'bg-sky-50/40' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 shrink-0">
                {getNotificationIcon(n.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {n.type.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className={`text-xs leading-relaxed ${!n.read ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                  {n.message}
                </p>
              </div>

              {!n.read && (
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 shrink-0 self-center"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
