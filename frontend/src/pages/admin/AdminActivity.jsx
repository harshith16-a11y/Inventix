import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Activity, Clock, User, RefreshCw, FileText } from 'lucide-react';

export default function AdminActivity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getActivity();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    if (action.includes('RESTOCK') || action.includes('ADDED')) {
      return <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">{action}</span>;
    }
    if (action.includes('LOW_STOCK') || action.includes('DELETED')) {
      return <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-100 text-rose-800">{action}</span>;
    }
    if (action.includes('PRIORITY')) {
      return <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-800">{action}</span>;
    }
    return <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-sky-100 text-sky-800">{action}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Audit Activity Log</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Immutable chronicle of all warehouse events, inventory alterations, shipments, and algorithm tests.
          </p>
        </div>
        <button
          onClick={loadLogs}
          className="p-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-2xs"
          title="Refresh Logs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving warehouse audit records..." />
      ) : logs.length === 0 ? (
        <EmptyState title="No logs recorded" description="Audit log will populate as operations occur." icon={Activity} />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono">{getActionBadge(log.action)}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{log.description}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{log.userName || 'System'}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
