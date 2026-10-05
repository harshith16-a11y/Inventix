import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shipmentService } from '../../services/shipmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {
  Layers,
  Truck,
  Flame,
  Play,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  ArrowRight
} from 'lucide-react';

export default function AdminShipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [actionMessage, setActionMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      setLoading(true);
      const data = await shipmentService.getShipments();
      setShipments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessNormal = async () => {
    try {
      setActionLoading(true);
      setActionMessage('');
      const res = await shipmentService.processNormal();
      setActionMessage(res.message);
      await loadShipments();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing normal shipment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcessPriority = async () => {
    try {
      setActionLoading(true);
      setActionMessage('');
      const res = await shipmentService.processPriority();
      setActionMessage(res.message);
      await loadShipments();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing priority shipment.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredShipments = shipments.filter((s) => {
    if (filter === 'ALL') return true;
    if (filter === 'NORMAL') return s.type === 'NORMAL';
    if (filter === 'PRIORITY') return s.type === 'PRIORITY';
    return s.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header with dual action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Shipment Dispatch Master</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Direct warehouse dispatch control for FIFO normal queues and urgency heap queues.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadShipments}
            className="p-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleProcessNormal}
            disabled={actionLoading}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Truck className="w-4 h-4" />
            Process Next Normal
          </button>
          <button
            onClick={handleProcessPriority}
            disabled={actionLoading}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Flame className="w-4 h-4" />
            Process Highest Priority
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-slide-up font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2 overflow-x-auto">
        {['ALL', 'NORMAL', 'PRIORITY', 'WAITING', 'PROCESSING', 'COMPLETED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filter === tab ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Fetching master shipment registry..." />
      ) : filteredShipments.length === 0 ? (
        <EmptyState title="No Shipments" description="No orders match your filter criteria." icon={Layers} />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Shipment ID</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 text-right">Items</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredShipments.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.shipmentId}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{s.userName}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.type === 'PRIORITY' ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'
                    }`}>
                      {s.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {s.priority && s.priority !== 'NONE' ? (
                      <span className="font-bold text-rose-600">{s.priority}</span>
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-700">{s.items ? s.items.length : 0}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">₹{Number(s.totalValue).toFixed(2)}</td>
                  <td className="py-3 px-4 text-slate-400">{new Date(s.createdAt).toLocaleTimeString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : s.status === 'PROCESSING'
                        ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      to={`/my-shipments/${s.id}`}
                      className="p-1.5 text-slate-400 hover:text-sky-600 inline-block"
                      title="Inspect"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
