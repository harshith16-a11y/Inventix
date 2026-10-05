import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import { shipmentService } from '../services/shipmentService';
import { inventoryService } from '../services/inventoryService';
import ProductCard from '../components/ProductCard';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Search,
  Boxes,
  Truck,
  Flame,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  PackagePlus,
  ListOrdered
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const [stats, setStats] = useState({
    availableProducts: 0,
    myPendingNormal: 0,
    myPriorityPending: 0,
    lowStockCount: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allProducts, myShipments, lowStockList] = await Promise.all([
        productService.getAll(),
        shipmentService.getShipments().catch(() => []),
        inventoryService.getLowStock().catch(() => []),
      ]);

      setProducts(allProducts);

      const pendingNormal = myShipments.filter(
        (s) => s.type === 'NORMAL' && (s.status === 'WAITING' || s.status === 'PROCESSING')
      ).length;

      const pendingPriority = myShipments.filter(
        (s) => s.type === 'PRIORITY' && (s.status === 'WAITING' || s.status === 'PROCESSING')
      ).length;

      setStats({
        availableProducts: allProducts.length,
        myPendingNormal: pendingNormal,
        myPriorityPending: pendingPriority,
        lowStockCount: lowStockList.length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleAddToCart = (product) => {
    const res = addToCart(product, 1);
    if (res.success) {
      setToastMessage(`Added 1 unit of ${product.name} (${product.productId}) to shipment cart!`);
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage('')}
            className="text-slate-400 hover:text-white text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white p-8 sm:p-10 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            DSA-Powered Warehouse Optimization
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome, {user ? user.name : 'Warehouse Operator'}
          </h1>
          
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            Streamlined logistics featuring real O(1) HashMap product lookup, O(n log n) recursive Merge Sort,
            FIFO normal shipment queues, and urgency-based binary heap priority queues.
          </p>

          {/* Large Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2 relative max-w-xl">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products, product IDs (e.g. P101, P214) or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-28 py-3.5 bg-white/10 hover:bg-white/15 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-sm border border-white/20 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/20 backdrop-blur-md transition-all placeholder:text-slate-300 focus:placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors shadow-sm"
            >
              <Boxes className="w-4 h-4 text-sky-600" />
              Browse Products
            </Link>
            <Link
              to="/shipments/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-500 transition-colors shadow-sm shadow-sky-600/30"
            >
              <PackagePlus className="w-4 h-4" />
              Create Shipment
            </Link>
            <Link
              to="/my-shipments"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/15 font-bold text-xs transition-colors"
            >
              <ListOrdered className="w-4 h-4 text-slate-300" />
              My Shipments
            </Link>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Available Products"
          value={stats.availableProducts}
          subtext="Active catalog items"
          icon={Boxes}
          color="sky"
        />
        <StatCard
          title="My Normal Queue"
          value={stats.myPendingNormal}
          subtext="FIFO queue waiting"
          icon={Truck}
          color="indigo"
        />
        <StatCard
          title="My Priority Queue"
          value={stats.myPriorityPending}
          subtext="Urgent dispatch orders"
          icon={Flame}
          color="rose"
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.lowStockCount}
          subtext="Threshold alerts active"
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      {/* Available Products Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Available Products</h2>
            <p className="text-xs text-slate-500 font-medium">Real-time inventory linked directly to backend HashMap</p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors group"
          >
            View Full Catalog
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading live inventory..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.slice(0, 8).map((product) => (
              <ProductCard
                key={product.productId}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
