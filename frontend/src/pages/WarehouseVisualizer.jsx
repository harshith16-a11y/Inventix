import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import Warehouse3DScene from '../components/warehouse/Warehouse3DScene';
import Warehouse2DMap from '../components/warehouse/Warehouse2DMap';
import LoadingSpinner from '../components/LoadingSpinner';
import confetti from 'canvas-confetti';
import {
  Box,
  Boxes,
  Layers,
  Sparkles,
  Search,
  Eye,
  Sun,
  Moon,
  Camera,
  Maximize2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  ArrowRight,
  X,
  Compass,
  CheckCircle2,
  Activity,
  Cpu
} from 'lucide-react';

export default function WarehouseVisualizer() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('3d'); // '3d', '2d', or 'split'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNightMode, setIsNightMode] = useState(true);
  const [cameraPreset, setCameraPreset] = useState('isometric');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data || []);
      // Set default selected product to the first item for immediate inspection preview
      if (data && data.length > 0) {
        setSelectedProduct({
          ...data[0],
          aisle: 'AISLE B',
          bay: 'AISLE B-02',
          tier: 2,
          slot: 1
        });
      }
    } catch (err) {
      console.error('Failed to load products for warehouse digital twin', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleAddToCartFromTwin = (product) => {
    if (!product) return;
    const res = addToCart(product, 1);
    if (res.success) {
      // Fire celebration confetti!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
      showToast(`Added 1x ${product.name} from ${product.bay || 'Warehouse Rack'} to your schedule cart!`);
    }
  };

  // Metrics
  const totalBays = 4 * 8 * 6; // 4 aisles * 8 bays * 6 slots = 192 slots
  const totalItems = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const totalValuation = products.reduce((acc, p) => acc + ((p.price || 0) * (p.quantity || 0)), 0);
  const lowStockCount = products.filter(p => p.quantity <= (p.lowStockThreshold || 10)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-slate-400 hover:text-white text-xs ml-2">✕</button>
        </div>
      )}

      {/* Header Banner & Telemetry Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30 font-mono">
                <Box className="w-3.5 h-3.5" />
                2D & 3D Extenders Active
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Live Digital Twin Sync
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Warehouse Floor & Digital Twin (2D/3D)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time interactive 3D WebGL digital twin and 2D floor blueprint. Inspect physical rack slots, monitor stock levels, and locate inventory in Indian Rupee (₹) valuation.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Locate SKU or Product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl focus:outline-none focus:border-violet-500 text-white placeholder-slate-400 font-mono"
            />
          </div>
        </div>

        {/* Live Warehouse Telemetry */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Storage Capacity</span>
            <span className="text-lg font-black text-white">{totalBays} Bays</span>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Stock Units</span>
            <span className="text-lg font-black text-sky-400">{totalStockUnits.toLocaleString()} units</span>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Inventory Value</span>
            <span className="text-lg font-black text-emerald-400">
              ₹{totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Low Stock Alerts</span>
            <span className={`text-lg font-black ${lowStockCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
              {lowStockCount} items
            </span>
          </div>
        </div>
      </div>

      {/* Mode Switcher & Camera Preset Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Tab Switcher: 3D / 2D / Split */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('3d')}
            className={`px-3.5 py-1.5 rounded-lg font-extrabold flex items-center gap-1.5 transition-all ${
              activeTab === '3d'
                ? 'bg-gradient-to-r from-violet-600 to-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Digital Twin</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('2d')}
            className={`px-3.5 py-1.5 rounded-lg font-extrabold flex items-center gap-1.5 transition-all ${
              activeTab === '2d'
                ? 'bg-gradient-to-r from-violet-600 to-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2D Floor Blueprint</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={`px-3.5 py-1.5 rounded-lg font-extrabold flex items-center gap-1.5 transition-all ${
              activeTab === 'split'
                ? 'bg-gradient-to-r from-violet-600 to-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Dual Split View</span>
          </button>
        </div>

        {/* 3D Camera Controls & Lighting Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeTab !== '2d' && (
            <>
              {/* Camera Presets */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <Camera className="w-3.5 h-3.5 text-slate-400 ml-1" />
                <button
                  onClick={() => setCameraPreset('isometric')}
                  className={`px-2 py-1 rounded-lg ${cameraPreset === 'isometric' ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                >
                  Isometric
                </button>
                <button
                  onClick={() => setCameraPreset('topdown')}
                  className={`px-2 py-1 rounded-lg ${cameraPreset === 'topdown' ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                >
                  Top-Down
                </button>
                <button
                  onClick={() => setCameraPreset('aisle')}
                  className={`px-2 py-1 rounded-lg ${cameraPreset === 'aisle' ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                >
                  Aisle View
                </button>
                <button
                  onClick={() => setCameraPreset('dock')}
                  className={`px-2 py-1 rounded-lg ${cameraPreset === 'dock' ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                >
                  Dock Bay
                </button>
              </div>

              {/* Day / Night Lighting */}
              <button
                type="button"
                onClick={() => setIsNightMode(!isNightMode)}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
                  isNightMode
                    ? 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
                title={isNightMode ? 'Switch to Daytime High-Bay Lighting' : 'Switch to Nighttime Neon LED Glow'}
              >
                {isNightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span className="text-[11px] hidden sm:inline">{isNightMode ? 'Night Shift LED' : 'Day High-Bay'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Viewport + Side Inspection HUD Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Central Visualizer Area */}
        <div className={`${selectedProduct ? 'lg:col-span-3' : 'lg:col-span-4'} h-[560px] relative`}>
          {loading ? (
            <div className="h-full flex items-center justify-center bg-slate-900 rounded-3xl">
              <LoadingSpinner message="Initializing 3D WebGL Canvas & 2D Floor Layout..." />
            </div>
          ) : activeTab === '3d' ? (
            <Warehouse3DScene
              products={products}
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
              isNight={isNightMode}
              cameraPreset={cameraPreset}
            />
          ) : activeTab === '2d' ? (
            <Warehouse2DMap
              products={products}
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
              searchQuery={searchQuery}
            />
          ) : (
            /* Split View */
            <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-full">
                <Warehouse2DMap
                  products={products}
                  selectedProduct={selectedProduct}
                  onSelectProduct={setSelectedProduct}
                  searchQuery={searchQuery}
                />
              </div>
              <div className="h-full">
                <Warehouse3DScene
                  products={products}
                  selectedProduct={selectedProduct}
                  onSelectProduct={setSelectedProduct}
                  isNight={isNightMode}
                  cameraPreset={cameraPreset}
                />
              </div>
            </div>
          )}
        </div>

        {/* Side Inspection HUD Card */}
        {selectedProduct && (
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between space-y-4 animate-scale-in">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-violet-700 dark:text-violet-400">
                  <Compass className="w-4 h-4" />
                  <span>RACK INSPECTION HUD</span>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Location Badge */}
              <div className="p-3 rounded-2xl bg-violet-50/80 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/50 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Physical Coordinates</span>
                <p className="text-sm font-black text-violet-900 dark:text-violet-200 font-mono">
                  {selectedProduct.bay || 'AISLE B-02'} · Tier {selectedProduct.tier || 1}
                </p>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  {selectedProduct.aisle || 'AISLE B'} (Slot #{selectedProduct.slot || 1})
                </span>
              </div>

              {/* Product Info */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {selectedProduct.productId}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {selectedProduct.category}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                  {selectedProduct.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {selectedProduct.description || 'Smart warehouse inventory item tracked in 3D digital twin space.'}
                </p>
              </div>

              {/* Financial & Stock Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Unit Price</span>
                  <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                    ₹{Number(selectedProduct.price).toFixed(2)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">In Stock</span>
                  <span className={`text-base font-black font-mono ${selectedProduct.quantity <= (selectedProduct.lowStockThreshold || 10) ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                    {selectedProduct.quantity} u
                  </span>
                </div>
              </div>

              {/* Total Rack Valuation */}
              <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-xs">
                <span className="text-emerald-800 dark:text-emerald-300 font-bold">Bay Total Value:</span>
                <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  ₹{Number((selectedProduct.price || 0) * (selectedProduct.quantity || 0)).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleAddToCartFromTwin(selectedProduct)}
                disabled={selectedProduct.quantity <= 0}
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 hover:from-violet-700 hover:to-rose-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-violet-500/20 active:scale-95 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Schedule Bag</span>
              </button>

              <Link
                to={`/products/${selectedProduct.productId}`}
                className="w-full py-2 text-center text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 block transition-colors"
              >
                Open Full Specifications →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
