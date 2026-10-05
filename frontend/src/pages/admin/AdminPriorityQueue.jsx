import React, { useState, useEffect } from 'react';
import { shipmentService } from '../../services/shipmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {
  Flame,
  Play,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export default function AdminPriorityQueue() {
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data = await shipmentService.getPriorityQueue();
      setPriorityQueue(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessHighestPriority = async () => {
    if (priorityQueue.length === 0) return;

    try {
      setProcessing(true);
      setActionMessage('');
      setErrorMessage('');

      const res = await shipmentService.processPriority();
      setActionMessage(res.message || `Dispatched highest priority shipment ${res.shipment?.shipmentId}!`);
      await loadQueue();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to process priority shipment.');
    } finally {
      setProcessing(false);
    }
  };

  const highPriority = priorityQueue.filter((s) => s.priority === 'HIGH');
  const mediumPriority = priorityQueue.filter((s) => s.priority === 'MEDIUM');
  const lowPriority = priorityQueue.filter((s) => s.priority === 'LOW');

  const nextShipment = priorityQueue[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Priority Shipment Queue</h1>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
              Binary Min-Heap
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Comparator: Order by Urgency Level (HIGH=1, MEDIUM=2, LOW=3), then by creation timestamp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadQueue}
            className="p-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-2xs"
            title="Refresh Queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleProcessHighestPriority}
            disabled={processing || priorityQueue.length === 0}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-rose-600/20 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {processing ? 'Processing Heap Root...' : 'Process Highest Priority Shipment'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-slide-up font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-slide-up font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Next Up Spotlight */}
      {nextShipment && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 text-white shadow-lg border border-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-rose-600 text-white font-extrabold">
                Heap Root (Next To Dispatch)
              </span>
              <span className="font-mono text-xs font-bold text-slate-300">
                {nextShipment.shipmentId}
              </span>
            </div>
            <h3 className="text-base font-bold text-white">
              {nextShipment.userName} · Priority {nextShipment.priority}
            </h3>
            <p className="text-xs text-slate-400">
              {nextShipment.items ? nextShipment.items.length : 0} item types · Total Value: ₹{Number(nextShipment.totalValue).toFixed(2)}
            </p>
          </div>

          <button
            onClick={handleProcessHighestPriority}
            disabled={processing}
            className="self-start sm:self-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-1.5"
          >
            Dispatch Root Now
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3 Urgency Priority Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* HIGH PRIORITY */}
        <div className="bg-white rounded-3xl border-2 border-rose-200 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-rose-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <h3 className="text-sm font-extrabold text-slate-900">HIGH PRIORITY</h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
              {highPriority.length} queued
            </span>
          </div>

          {highPriority.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center italic">No HIGH priority shipments</p>
          ) : (
            <div className="space-y-3">
              {highPriority.map((s) => (
                <div key={s.id} className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-slate-900">{s.shipmentId}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-800">
                      LEVEL 1
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">{s.userName}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-rose-100">
                    <span>{new Date(s.createdAt).toLocaleTimeString()}</span>
                    <span className="font-bold text-slate-800">₹{Number(s.totalValue).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MEDIUM PRIORITY */}
        <div className="bg-white rounded-3xl border-2 border-amber-200 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <h3 className="text-sm font-extrabold text-slate-900">MEDIUM PRIORITY</h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
              {mediumPriority.length} queued
            </span>
          </div>

          {mediumPriority.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center italic">No MEDIUM priority shipments</p>
          ) : (
            <div className="space-y-3">
              {mediumPriority.map((s) => (
                <div key={s.id} className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-slate-900">{s.shipmentId}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-800">
                      LEVEL 2
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">{s.userName}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-amber-100">
                    <span>{new Date(s.createdAt).toLocaleTimeString()}</span>
                    <span className="font-bold text-slate-800">₹{Number(s.totalValue).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LOW PRIORITY */}
        <div className="bg-white rounded-3xl border-2 border-emerald-200 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-extrabold text-slate-900">LOW PRIORITY</h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              {lowPriority.length} queued
            </span>
          </div>

          {lowPriority.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center italic">No LOW priority shipments</p>
          ) : (
            <div className="space-y-3">
              {lowPriority.map((s) => (
                <div key={s.id} className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-slate-900">{s.shipmentId}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800">
                      LEVEL 3
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">{s.userName}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-emerald-100">
                    <span>{new Date(s.createdAt).toLocaleTimeString()}</span>
                    <span className="font-bold text-slate-800">₹{Number(s.totalValue).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
