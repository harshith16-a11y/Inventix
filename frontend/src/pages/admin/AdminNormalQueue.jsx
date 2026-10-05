import React, { useState, useEffect } from 'react';
import { shipmentService } from '../../services/shipmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {
  Truck,
  ArrowRight,
  Play,
  CheckCircle2,
  Clock,
  Layers,
  User,
  Package,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function AdminNormalQueue() {
  const [queue, setQueue] = useState([]);
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
      const data = await shipmentService.getNormalQueue();
      setQueue(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessNext = async () => {
    if (queue.length === 0) return;

    try {
      setProcessing(true);
      setActionMessage('');
      setErrorMessage('');

      const res = await shipmentService.processNormal();
      setActionMessage(res.message || `Processed ${res.shipment?.shipmentId} from FIFO Queue.`);
      await loadQueue();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to process next shipment.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Normal Shipment Queue</h1>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
              FIFO ArrayDeque
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Strict First-In, First-Out sequence. Earliest orders wait at FRONT and are dispatched first.
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
            onClick={handleProcessNext}
            disabled={processing || queue.length === 0}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-sky-600/20 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {processing ? 'Processing FIFO Head...' : 'Process Next Shipment'}
          </button>
        </div>
      </div>

      {/* Action and Error Feedback */}
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

      {/* Visual Queue Pipeline Diagram */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            Visual FIFO Queue Line ({queue.length} shipments queued)
          </span>
          <span className="font-mono text-[11px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
            Front: index 0 | Rear: index {Math.max(0, queue.length - 1)}
          </span>
        </div>

        {queue.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Queue is currently empty. Create a normal shipment to observe the FIFO pipeline.
          </div>
        ) : (
          <div className="flex items-center gap-3 overflow-x-auto py-4 px-2">
            
            {/* FRONT Indicator */}
            <div className="flex flex-col items-center shrink-0">
              <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[10px] font-extrabold uppercase tracking-widest shadow-2xs">
                FRONT
              </span>
              <span className="text-[10px] text-slate-400 mt-1 font-semibold">Next Out</span>
            </div>

            {queue.map((s, idx) => (
              <React.Fragment key={s.id}>
                <div
                  className={`p-4 rounded-2xl border shrink-0 w-48 shadow-2xs transition-all ${
                    idx === 0
                      ? 'bg-sky-50 border-sky-400 ring-4 ring-sky-500/10'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-slate-900">{s.shipmentId}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      #{idx + 1}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold mt-1 truncate">{s.userName}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {s.items ? s.items.length : 0} items · ₹{Number(s.totalValue).toFixed(2)}
                  </p>
                </div>

                {idx < queue.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                )}
              </React.Fragment>
            ))}

            {/* REAR Indicator */}
            <div className="flex flex-col items-center shrink-0 ml-2">
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-white font-mono text-[10px] font-extrabold uppercase tracking-widest">
                REAR
              </span>
              <span className="text-[10px] text-slate-400 mt-1 font-semibold">Newest In</span>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Queue Table */}
      {loading ? (
        <LoadingSpinner message="Fetching FIFO queue state..." />
      ) : queue.length === 0 ? (
        <EmptyState
          title="Normal Queue is Clear"
          description="There are no standard shipments waiting for processing."
          icon={Truck}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Position</th>
                <th className="py-3 px-4">Shipment ID</th>
                <th className="py-3 px-4">Operator / User</th>
                <th className="py-3 px-4 text-right">Items</th>
                <th className="py-3 px-4 text-right">Total Value</th>
                <th className="py-3 px-4">Submission Time</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queue.map((s, idx) => (
                <tr
                  key={s.id}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    idx === 0 ? 'bg-sky-50/30' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-600">
                    {idx === 0 ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold">
                        #1 Head
                      </span>
                    ) : (
                      `#${idx + 1}`
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.shipmentId}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{s.userName}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-700">{s.items ? s.items.length : 0}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">₹{Number(s.totalValue).toFixed(2)}</td>
                  <td className="py-3 px-4 text-slate-400">{new Date(s.createdAt).toLocaleTimeString()}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                      {s.status}
                    </span>
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
