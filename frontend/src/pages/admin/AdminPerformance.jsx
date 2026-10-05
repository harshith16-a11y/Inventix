import React, { useState, useEffect } from 'react';
import { performanceService } from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Activity,
  Play,
  Clock,
  Zap,
  Cpu,
  Layers,
  Database,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  History
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

export default function AdminPerformance() {
  const [datasetSize, setDatasetSize] = useState(10000);
  const [runningTest, setRunningTest] = useState('');
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await performanceService.getHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const runSearchBenchmark = async () => {
    try {
      setRunningTest('SEARCH');
      const res = await performanceService.benchmarkSearch(datasetSize);
      setBenchmarkResult({ type: 'SEARCH', data: res });
      loadHistory();
    } catch (err) {
      alert(err.response?.data?.message || 'Benchmark failed.');
    } finally {
      setRunningTest('');
    }
  };

  const runSortBenchmark = async () => {
    try {
      setRunningTest('SORT');
      const res = await performanceService.benchmarkSort(datasetSize);
      setBenchmarkResult({ type: 'SORT', data: res });
      loadHistory();
    } catch (err) {
      alert(err.response?.data?.message || 'Benchmark failed.');
    } finally {
      setRunningTest('');
    }
  };

  const runQueueBenchmark = async () => {
    try {
      setRunningTest('QUEUE');
      const res = await performanceService.benchmarkQueue(datasetSize);
      setBenchmarkResult({ type: 'QUEUE', data: res });
      loadHistory();
    } catch (err) {
      alert(err.response?.data?.message || 'Benchmark failed.');
    } finally {
      setRunningTest('');
    }
  };

  const runAllBenchmarks = async () => {
    try {
      setRunningTest('ALL');
      const res = await performanceService.runAll(datasetSize);
      setBenchmarkResult({ type: 'ALL', data: res });
      loadHistory();
    } catch (err) {
      alert(err.response?.data?.message || 'Benchmarks failed.');
    } finally {
      setRunningTest('');
    }
  };

  // Prepare chart comparison data for search
  const searchChartData = benchmarkResult?.data?.linearSearch ? [
    {
      name: 'Search Runtime',
      'Linear Search O(n)': benchmarkResult.data.linearSearch.timeNanos,
      'HashMap Search O(1)': benchmarkResult.data.hashMapSearch.timeNanos,
    }
  ] : [];

  // Prepare chart comparison data for queues
  const queueChartData = benchmarkResult?.data?.fifoQueue ? [
    {
      name: 'Queue Runtime',
      'ArrayDeque FIFO O(1)': benchmarkResult.data.fifoQueue.timeNanos,
      'PriorityQueue Heap O(log n)': benchmarkResult.data.priorityQueue.timeNanos,
    }
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Runtime Performance Benchmarks
          </h1>
          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            System.nanoTime() Precision
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Empirical execution time measurements conducted directly in Java. No mocked numbers.
        </p>
      </div>

      {/* Control Panel: Dataset Selector & Triggers */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">1. Select Benchmark Dataset Size (N Elements)</h2>
            <p className="text-xs text-slate-400">Scale dataset size to observe asymptotic Big-O behavior.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {[100, 1000, 10000, 50000, 100000].map((size) => (
              <button
                key={size}
                onClick={() => setDatasetSize(size)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  datasetSize === size
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                N = {size.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={runSearchBenchmark}
            disabled={!!runningTest}
            className="p-4 rounded-2xl bg-sky-50 hover:bg-sky-100/80 border border-sky-200 text-sky-900 text-left transition-all flex flex-col justify-between disabled:opacity-50"
          >
            <div>
              <Zap className="w-5 h-5 text-sky-600 mb-1" />
              <h4 className="text-xs font-bold">1. Linear vs. HashMap</h4>
              <p className="text-[11px] text-sky-700 mt-0.5">O(n) scan vs. O(1) hash table</p>
            </div>
            <span className="text-[11px] font-bold text-sky-700 mt-3">
              {runningTest === 'SEARCH' ? 'Measuring...' : 'Run Test →'}
            </span>
          </button>

          <button
            onClick={runSortBenchmark}
            disabled={!!runningTest}
            className="p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 text-indigo-900 text-left transition-all flex flex-col justify-between disabled:opacity-50"
          >
            <div>
              <Cpu className="w-5 h-5 text-indigo-600 mb-1" />
              <h4 className="text-xs font-bold">2. Manual Merge Sort</h4>
              <p className="text-[11px] text-indigo-700 mt-0.5">O(n log n) recursive divide</p>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 mt-3">
              {runningTest === 'SORT' ? 'Sorting...' : 'Run Test →'}
            </span>
          </button>

          <button
            onClick={runQueueBenchmark}
            disabled={!!runningTest}
            className="p-4 rounded-2xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-purple-900 text-left transition-all flex flex-col justify-between disabled:opacity-50"
          >
            <div>
              <Layers className="w-5 h-5 text-purple-600 mb-1" />
              <h4 className="text-xs font-bold">3. Queue vs Priority Queue</h4>
              <p className="text-[11px] text-purple-700 mt-0.5">ArrayDeque vs Binary Heap</p>
            </div>
            <span className="text-[11px] font-bold text-purple-700 mt-3">
              {runningTest === 'QUEUE' ? 'Processing...' : 'Run Test →'}
            </span>
          </button>

          <button
            onClick={runAllBenchmarks}
            disabled={!!runningTest}
            className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-left transition-all flex flex-col justify-between shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            <div>
              <Play className="w-5 h-5 fill-current mb-1" />
              <h4 className="text-xs font-bold">Run Full Suite</h4>
              <p className="text-[11px] text-emerald-100 mt-0.5">Execute all three algorithms</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-200 mt-3">
              {runningTest === 'ALL' ? 'Running All...' : 'Execute Suite →'}
            </span>
          </button>
        </div>
      </div>

      {/* Live Benchmark Execution Results */}
      {benchmarkResult && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm animate-scale-up">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Live Measured Execution
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                Measured Runtime Results (N = {datasetSize.toLocaleString()})
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Timestamp: {new Date().toLocaleTimeString()}
            </span>
          </div>

          {/* Search Result */}
          {benchmarkResult.type === 'SEARCH' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="text-xs font-bold text-slate-700">Linear Scan O(n)</p>
                  <p className="text-2xl font-extrabold text-slate-900">
                    {benchmarkResult.data.linearSearch.timeNanos.toLocaleString()} ns
                  </p>
                  <p className="text-xs text-slate-500">
                    ({benchmarkResult.data.linearSearch.timeMs.toFixed(4)} ms)
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-2">
                  <p className="text-xs font-bold text-sky-800">HashMap Direct Lookup O(1)</p>
                  <p className="text-2xl font-extrabold text-sky-950">
                    {benchmarkResult.data.hashMapSearch.timeNanos.toLocaleString()} ns
                  </p>
                  <p className="text-xs text-sky-700">
                    ({benchmarkResult.data.hashMapSearch.timeMs.toFixed(4)} ms) · Speedup: <strong>{benchmarkResult.data.speedupFactor}</strong>
                  </p>
                </div>
              </div>

              {/* Chart */}
              <div className="h-64 pt-4 border-t border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={searchChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit=" ns" />
                    <Tooltip formatter={(value) => `${value.toLocaleString()} ns`} />
                    <Legend />
                    <Bar dataKey="Linear Search O(n)" fill="#ef4444" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="HashMap Search O(1)" fill="#0284c7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Sort Result */}
          {benchmarkResult.type === 'SORT' && (
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
              <p className="text-xs font-bold text-indigo-900">Merge Sort Execution</p>
              <p className="text-3xl font-extrabold text-indigo-950">
                {benchmarkResult.data.timeNanos.toLocaleString()} ns
              </p>
              <p className="text-xs text-indigo-700">
                ({benchmarkResult.data.timeMs.toFixed(3)} ms) across {datasetSize.toLocaleString()} randomly generated product records.
              </p>
            </div>
          )}

          {/* Queue Result */}
          {benchmarkResult.type === 'QUEUE' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-2">
                  <p className="text-xs font-bold text-sky-800">ArrayDeque FIFO Queue O(1)</p>
                  <p className="text-2xl font-extrabold text-slate-900">
                    {benchmarkResult.data.fifoQueue.timeNanos.toLocaleString()} ns
                  </p>
                  <p className="text-xs text-sky-700">({benchmarkResult.data.fifoQueue.timeMs.toFixed(4)} ms)</p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                  <p className="text-xs font-bold text-rose-800">PriorityQueue Min-Heap O(log n)</p>
                  <p className="text-2xl font-extrabold text-slate-900">
                    {benchmarkResult.data.priorityQueue.timeNanos.toLocaleString()} ns
                  </p>
                  <p className="text-xs text-rose-700">({benchmarkResult.data.priorityQueue.timeMs.toFixed(4)} ms)</p>
                </div>
              </div>

              <div className="h-64 pt-4 border-t border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={queueChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit=" ns" />
                    <Tooltip formatter={(value) => `${value.toLocaleString()} ns`} />
                    <Legend />
                    <Bar dataKey="ArrayDeque FIFO O(1)" fill="#0284c7" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="PriorityQueue Heap O(log n)" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* All Suite Result */}
          {benchmarkResult.type === 'ALL' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
                  <h4 className="text-xs font-bold text-sky-800">HashMap Search</h4>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">
                    {benchmarkResult.data.searchBenchmark.hashMapSearch.timeNanos.toLocaleString()} ns
                  </p>
                  <p className="text-[11px] text-sky-600 mt-1">
                    Linear Scan: {benchmarkResult.data.searchBenchmark.linearSearch.timeNanos.toLocaleString()} ns
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
                  <h4 className="text-xs font-bold text-indigo-800">Merge Sort</h4>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">
                    {benchmarkResult.data.sortBenchmark.timeNanos.toLocaleString()} ns
                  </p>
                  <p className="text-[11px] text-indigo-600 mt-1">
                    {benchmarkResult.data.sortBenchmark.timeMs.toFixed(2)} ms (O(n log n))
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                  <h4 className="text-xs font-bold text-purple-800">FIFO vs Priority Queue</h4>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">
                    {benchmarkResult.data.queueBenchmark.fifoQueue.timeNanos.toLocaleString()} ns
                  </p>
                  <p className="text-[11px] text-purple-600 mt-1">
                    Heap: {benchmarkResult.data.queueBenchmark.priorityQueue.timeNanos.toLocaleString()} ns
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historical Benchmark Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Historical Benchmark Results</h3>
          </div>
          <span className="text-xs text-slate-400">Stored in H2 benchmark_results</span>
        </div>

        {loadingHistory ? (
          <LoadingSpinner message="Loading historical timings..." />
        ) : history.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No benchmarks executed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Test Type</th>
                  <th className="py-2.5 px-4">Algorithm</th>
                  <th className="py-2.5 px-4 text-right">Dataset (N)</th>
                  <th className="py-2.5 px-4 text-right">Execution Time</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.slice(0, 15).map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/60 font-mono">
                    <td className="py-2 px-4 font-bold text-slate-700">{h.testType}</td>
                    <td className="py-2 px-4 text-slate-900">{h.algorithm}</td>
                    <td className="py-2 px-4 text-right font-bold text-slate-800">{h.datasetSize.toLocaleString()}</td>
                    <td className="py-2 px-4 text-right font-extrabold text-emerald-600">
                      {h.executionTimeNanos.toLocaleString()} ns ({h.executionTimeMs.toFixed(3)} ms)
                    </td>
                    <td className="py-2 px-4 text-slate-400 text-[11px] font-sans">
                      {new Date(h.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
