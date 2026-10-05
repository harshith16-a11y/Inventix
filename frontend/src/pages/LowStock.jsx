import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inventoryService } from '../services/inventoryService';
import { useAuth } from '../context/AuthContext';
import StockBadge from '../components/StockBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import {
  AlertTriangle,
  XCircle,
  PackagePlus,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  Boxes,
  CheckCircle2
} from 'lucide-react';

export default function LowStock() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'LOW_STOCK', 'OUT_OF_STOCK'
  
  // Restock modal
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [targetProduct, setTargetProduct] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState(25);
  const [restockLoading, setRestockLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadLowStockItems();
  }, []);

  const loadLowStockItems = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getLowStock();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRestock = (product) => {
    setTargetProduct(product);
    setRestockQuantity(25);
    setRestockModalOpen(true);
  };

  const handleExecuteRestock = async (e) => {
    e.preventDefault();
    if (!targetProduct) return;

    try {
      setRestockLoading(true);
      await inventoryService.restock(targetProduct.productId, Number(restockQuantity));
      setToastMessage(`Replenished ${restockQuantity} units for ${targetProduct.name} (${targetProduct.productId})!`);
      setRestockModalOpen(false);
      loadLowStockItems();
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to restock.');
    } finally {
      setRestockLoading(false);
    }
  };

  const lowStockCount = items.filter((i) => i.status === 'LOW_STOCK').length;
  const outOfStockCount = items.filter((i) => i.status === 'OUT_OF_STOCK' || i.quantity === 0).length;

  const filteredItems = items.filter((item) => {
    if (filter === 'LOW_STOCK') return item.status === 'LOW_STOCK';
    if (filter === 'OUT_OF_STOCK') return item.status === 'OUT_OF_STOCK' || item.quantity === 0;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-slate-400 hover:text-white text-xs ml-2">✕</button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Low Stock & Inventory Monitoring</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Automatic decision threshold engine: Evaluates <code className="text-amber-700 bg-amber-50 px-1 py-0.5 rounded font-mono">IF quantity &lt; threshold</code> across all warehouse operations.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Products Needing Restock"
          value={items.length}
          subtext="Total items below critical threshold"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Low Stock (Critical)"
          value={lowStockCount}
          subtext="Units low but available"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Out of Stock (Zero Units)"
          value={outOfStockCount}
          subtext="Fulfillment completely blocked"
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { key: 'ALL', label: `All Alerts (${items.length})` },
          { key: 'LOW_STOCK', label: `Low Stock (${lowStockCount})` },
          { key: 'OUT_OF_STOCK', label: `Out of Stock (${outOfStockCount})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === tab.key
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table of Alert Items */}
      {loading ? (
        <LoadingSpinner message="Scanning warehouse inventory thresholds..." />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="All Inventory Healthy!"
          description="There are currently no items below their defined low stock safety thresholds."
          icon={Boxes}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Product ID</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Current Quantity</th>
                <th className="py-3 px-4 text-right">Threshold</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.productId} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{item.productId}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                  <td className="py-3 px-4 text-slate-500">{item.category}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-rose-600">{item.quantity}</td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-400">{item.lowStockThreshold}</td>
                  <td className="py-3 px-4">
                    <StockBadge status={item.status} quantity={item.quantity} threshold={item.lowStockThreshold} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/products/${item.productId}`}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-sky-600 hover:bg-slate-100 rounded-lg"
                      >
                        View
                      </Link>

                      {isAdmin && (
                        <button
                          onClick={() => handleOpenRestock(item)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Restock
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Restock Modal for Admin */}
      {restockModalOpen && targetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-up">
            <div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                {targetProduct.productId}
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-2">Restock Product Inventory</h3>
              <p className="text-xs text-slate-500">
                Replenish units for <strong>{targetProduct.name}</strong>.
              </p>
            </div>

            <form onSubmit={handleExecuteRestock} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Stock:</span>
                  <span className="font-bold text-slate-800">{targetProduct.quantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Threshold:</span>
                  <span className="font-bold text-slate-800">{targetProduct.lowStockThreshold} units</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-600 font-medium">New Projected Stock:</span>
                  <span className="font-extrabold text-emerald-600">
                    {targetProduct.quantity + Number(restockQuantity)} units
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantity to Add</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  required
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-900 font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={restockLoading}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm"
                >
                  {restockLoading ? 'Restocking...' : 'Confirm Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
