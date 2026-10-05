import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import StatCard from '../../components/StatCard';
import StockBadge from '../../components/StockBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Boxes,
  Truck,
  Flame,
  AlertTriangle,
  XCircle,
  PackageCheck,
  DollarSign,
  PlayCircle,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoResult, setDemoResult] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunDemo = async () => {
    try {
      setDemoRunning(true);
      setDemoResult(null);
      const res = await adminService.runDemo();
      setDemoResult(res);
      loadDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Demo execution failed.');
    } finally {
      setDemoRunning(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Calculating warehouse inventory statistics..." />;
  }

  if (!data) return null;

  // Chart data formatting
  const categoryData = Object.entries(data.categoryUnits || {}).map(([category, units]) => ({
    name: category,
    units,
  }));

  const queueDistributionData = [
    { name: 'Normal (FIFO)', value: data.pendingNormalShipments || 0, color: '#0284c7' },
    { name: 'Priority (Urgent)', value: data.pendingPriorityShipments || 0, color: '#f43f5e' },
    { name: 'Completed', value: data.completedShipments || 0, color: '#10b981' },
  ];

  const COLORS = ['#0284c7', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header with 1-Click Demo Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">Executive Dashboard</h1>
          <p className="text-xs text-slate-300 font-medium mt-0.5 drop-shadow">
            Real-time warehouse metrics calculated directly from database records and in-memory DSA queues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboard}
            className="p-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all shadow-2xs"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleRunDemo}
            disabled={demoRunning}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {demoRunning ? 'Executing Demo...' : 'Run Live Demo Sequence'}
          </button>
        </div>
      </div>

      {/* Demo Results Modal/Banner if triggered */}
      {demoResult && (
        <div className="p-6 bg-gradient-to-r from-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-800 shadow-xl space-y-4 animate-scale-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold tracking-tight">Live Demo Sequence Executed!</h3>
            </div>
            <button
              onClick={() => setDemoResult(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕ Dismiss
            </button>
          </div>
          <div className="bg-slate-900/80 rounded-2xl p-4 font-mono text-xs text-slate-300 space-y-1.5 border border-slate-800 max-h-48 overflow-y-auto">
            {demoResult.executionLog && demoResult.executionLog.map((line, idx) => (
              <p key={idx} className="leading-relaxed text-emerald-400">{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={data.totalProducts}
          subtext="Catalog items"
          icon={Boxes}
          color="sky"
        />
        <StatCard
          title="Total Inventory Units"
          value={data.totalInventoryUnits}
          subtext="Available stock in hub"
          icon={Boxes}
          color="indigo"
        />
        <StatCard
          title="Total Stock Value"
          value={`₹${data.totalInventoryValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtext="Gross warehouse inventory"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Completed Shipments"
          value={data.completedShipments}
          subtext="Orders dispatched"
          icon={PackageCheck}
          color="purple"
        />
      </div>

      {/* Secondary Queue & Threshold Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Normal Queue (FIFO)"
          value={data.pendingNormalShipments}
          subtext="ArrayDeque FIFO queue"
          icon={Truck}
          color="sky"
        />
        <StatCard
          title="Priority Queue (Urgent)"
          value={data.pendingPriorityShipments}
          subtext="Binary min-heap priority"
          icon={Flame}
          color="rose"
        />
        <StatCard
          title="Low Stock Products"
          value={data.lowStockCount}
          subtext="Threshold alerts triggered"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Out of Stock"
          value={data.outOfStockCount}
          subtext="Fulfillment depleted"
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* Visual Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown Bar Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Inventory Units by Category</h3>
            <span className="text-[11px] font-mono text-slate-400">Total units</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="units" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shipment Status Distribution Pie Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Shipment Queue & Status Distribution</h3>
            <span className="text-[11px] font-mono text-slate-400">Order count</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={queueDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {queueDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Stock Alert Items */}
      {data.criticalAlertProducts && data.criticalAlertProducts.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Critical Stock Attention Required</h3>
            </div>
            <Link to="/low-stock" className="text-xs font-bold text-sky-600 hover:text-sky-700">
              Manage in Low Stock →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {data.criticalAlertProducts.map((p) => (
              <div key={p.productId} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200">
                    {p.productId}
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-1">{p.name}</p>
                  <p className="text-[11px] text-slate-400">Available: {p.quantity} (Threshold: {p.lowStockThreshold})</p>
                </div>
                <StockBadge status={p.status} quantity={p.quantity} threshold={p.lowStockThreshold} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
