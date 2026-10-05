import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shipmentService } from '../services/shipmentService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Calendar,
  Truck,
  Flame,
  Clock,
  ArrowRight,
  Package,
  CalendarCheck,
  Search,
  Filter,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Plus
} from 'lucide-react';

export default function MyShipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const data = await shipmentService.getShipments();
      setShipments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSchedule = async (e, id, shipmentId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(`Are you sure you want to cancel schedule ${shipmentId}?`)) {
      return;
    }

    try {
      setCancellingId(id);
      // In local state / api, filter out or cancel
      setShipments(prev => prev.filter(s => s.id !== id));
      setFeedbackMessage({
        type: 'success',
        text: `Schedule ${shipmentId} was cancelled successfully.`
      });
      setTimeout(() => setFeedbackMessage({ type: '', text: '' }), 3500);
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: 'Failed to cancel schedule. Please try again.'
      });
    } finally {
      setCancellingId(null);
    }
  };

  const tabs = ['ALL', 'PENDING', 'DISPATCHED', 'COMPLETED', 'PRIORITY', 'NORMAL'];

  const filteredShipments = shipments.filter((s) => {
    // Search query filter
    const matchesSearch = !searchQuery.trim() ||
      s.shipmentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.items?.some(i => i.productName?.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Tab filter
    if (selectedTab === 'ALL') return true;
    if (selectedTab === 'NORMAL') return s.type === 'NORMAL';
    if (selectedTab === 'PRIORITY') return s.type === 'PRIORITY';
    return s.status === selectedTab;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>;
      case 'PROCESSING':
      case 'DISPATCHED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200 animate-pulse">In Transit</span>;
      case 'WAITING':
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Scheduled (Queued)</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Toast Feedback */}
      {feedbackMessage.text && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold animate-fade-in ${
          feedbackMessage.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage({ type: '', text: '' })} className="opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                My Schedules & Dispatches
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Manage your scheduled deliveries, check dispatch queue progression, and track orders.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/calendar"
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-rose-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <CalendarCheck className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span>Calendar View</span>
          </Link>

          <Link
            to="/shipments/create"
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-violet-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Schedule</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                selectedTab === tab
                  ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white shadow-sm shadow-violet-500/25'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab === 'ALL' ? 'All Schedules' : tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by ID or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <LoadingSpinner message="Fetching your schedules..." />
      ) : filteredShipments.length === 0 ? (
        <EmptyState
          title="No schedules found"
          description="You do not have any schedules matching the selected filter."
          action={
            <Link
              to="/shipments/create"
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-rose-600 text-white rounded-xl text-xs font-bold"
            >
              Create a Schedule
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredShipments.map((s) => {
            const isPriority = s.type === 'PRIORITY';
            const itemCount = s.items ? s.items.length : 0;
            const totalQuantity = s.items ? s.items.reduce((acc, i) => acc + i.quantity, 0) : 0;
            const isPending = s.status === 'WAITING' || s.status === 'PENDING';

            return (
              <div
                key={s.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-800/60 p-5 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      {s.shipmentId}
                    </span>

                    {/* Type badge */}
                    {isPriority ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                        <Flame className="w-3 h-3 text-rose-500" />
                        Priority Queue ({s.priority})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-900/60">
                        <Truck className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                        Standard FIFO
                      </span>
                    )}

                    {getStatusBadge(s.status)}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Scheduled on <strong className="text-slate-800 dark:text-slate-200">{new Date(s.createdAt).toLocaleDateString()}</strong> at {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {itemCount} product type(s) · {totalQuantity} units
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Value</span>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white font-mono">₹{Number(s.totalValue).toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* If schedule is pending, allow cancellation */}
                    {isPending && (
                      <button
                        type="button"
                        onClick={(e) => handleCancelSchedule(e, s.id, s.shipmentId)}
                        disabled={cancellingId === s.id}
                        className="p-2 text-slate-400 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                        title="Cancel this schedule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <Link
                      to={`/my-shipments/${s.id}`}
                      className="px-3.5 py-2 bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>Track</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
