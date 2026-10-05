import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Boxes,
  Truck,
  Flame,
  Layers,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';

const CATEGORY_COLORS_2D = {
  'Cooking Essentials': 'bg-emerald-500 text-white border-emerald-600',
  'Dairy & Beverages': 'bg-cyan-500 text-white border-cyan-600',
  'Grains & Staples': 'bg-amber-500 text-slate-950 border-amber-600',
  'Health & Sweets': 'bg-purple-500 text-white border-purple-600',
  'Snacks': 'bg-rose-500 text-white border-rose-600',
  'General Goods': 'bg-blue-500 text-white border-blue-600',
};

export default function Warehouse2DMap({
  products = [],
  selectedProduct,
  onSelectProduct,
  searchQuery = ''
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [displayMode, setDisplayMode] = useState('density'); // 'density' or 'category'

  const aisles = ['A', 'B', 'C', 'D'];
  const baysPerAisle = 8;

  // Map products to aisle bays deterministically
  const getProductForSlot = (aisle, bayNum) => {
    const aisleIdx = aisles.indexOf(aisle);
    const index = (aisleIdx * baysPerAisle + (bayNum - 1)) % Math.max(1, products.length);
    return products[index];
  };

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.min(1.5, Math.max(0.8, Number((prev + delta).toFixed(1)))));
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden select-none">
      {/* 2D Control Toolbar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-950/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              2D Architectural Floor Plan
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive top-down aisle corridor & bin allocation blueprint
            </p>
          </div>
        </div>

        {/* Display Mode & Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setDisplayMode('density')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                displayMode === 'density'
                  ? 'bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Stock Density
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('category')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                displayMode === 'category'
                  ? 'bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Categories
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleZoom(-0.1)}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-1 font-bold text-slate-700 dark:text-slate-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => handleZoom(0.1)}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              title="Reset Zoom"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2D Canvas / Blueprint Viewport */}
      <div className="flex-1 overflow-auto p-6 flex justify-center items-center bg-slate-100/50 dark:bg-slate-950/50 min-h-[420px]">
        <motion.div
          animate={{ scale: zoomLevel }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl max-w-4xl w-full space-y-6"
        >
          {/* Top: Loading & Dispatch Docks Header */}
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((dockNum) => (
              <div
                key={dockNum}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center"
              >
                <div className="flex items-center justify-center gap-1.5 text-xs font-black text-amber-500 font-mono">
                  <Truck className="w-4 h-4" />
                  <span>DOCK #{dockNum}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                  {dockNum % 2 === 1 ? 'Outbound Dispatch' : 'Inbound Receiving'}
                </span>
              </div>
            ))}
          </div>

          {/* Staging Buffer & Automated Conveyor Lanes */}
          <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                CONVEYOR 01 (FIFO Standard Queue)
              </span>
            </div>
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-mono font-extrabold">
              <Flame className="w-4 h-4 animate-bounce" />
              <span>EXPRESS CHUTE (Priority Min-Heap)</span>
            </div>
          </div>

          {/* Central Aisle Racks (A, B, C, D) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Bank: Aisles A & B */}
            <div className="space-y-4">
              {['A', 'B'].map((aisle) => (
                <div
                  key={aisle}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs font-mono text-violet-700 dark:text-violet-400 tracking-wider">
                      AISLE {aisle} — WEST RACK BANK
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">8 BAYS AVAILABLE</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: baysPerAisle }).map((_, idx) => {
                      const bayNum = idx + 1;
                      const product = getProductForSlot(aisle, bayNum);
                      const isSelected = selectedProduct && product && selectedProduct.productId === product.productId;
                      const isLowStock = product && product.quantity <= (product.lowStockThreshold || 10);
                      const isMatchSearch = searchQuery && product && (
                        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.productId?.toLowerCase().includes(searchQuery.toLowerCase())
                      );

                      // Density colors
                      let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
                      if (!product || product.quantity <= 0) {
                        badgeColor = 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500';
                      } else if (isLowStock) {
                        badgeColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
                      }

                      if (displayMode === 'category' && product) {
                        badgeColor = CATEGORY_COLORS_2D[product.category] || badgeColor;
                      }

                      return (
                        <motion.button
                          key={bayNum}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (product) {
                              onSelectProduct({
                                ...product,
                                aisle: `AISLE ${aisle}`,
                                bay: `AISLE ${aisle}-${String(bayNum).padStart(2, '0')}`,
                                tier: 1,
                                slot: 1
                              });
                            }
                          }}
                          className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all relative ${badgeColor} ${
                            isSelected
                              ? 'ring-2 ring-violet-500 ring-offset-2 dark:ring-offset-slate-900 shadow-md scale-105'
                              : 'shadow-2xs'
                          } ${isMatchSearch ? 'ring-2 ring-rose-500 animate-pulse' : ''}`}
                        >
                          {isMatchSearch && (
                            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
                          )}
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold opacity-80">
                            <span>{aisle}-{String(bayNum).padStart(2, '0')}</span>
                            {product && <span>{product.quantity}u</span>}
                          </div>
                          <span className="text-[11px] font-extrabold truncate block mt-1">
                            {product ? product.name : 'Empty Slot'}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Bank: Aisles C & D */}
            <div className="space-y-4">
              {['C', 'D'].map((aisle) => (
                <div
                  key={aisle}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs font-mono text-violet-700 dark:text-violet-400 tracking-wider">
                      AISLE {aisle} — EAST RACK BANK
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">8 BAYS AVAILABLE</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: baysPerAisle }).map((_, idx) => {
                      const bayNum = idx + 1;
                      const product = getProductForSlot(aisle, bayNum);
                      const isSelected = selectedProduct && product && selectedProduct.productId === product.productId;
                      const isLowStock = product && product.quantity <= (product.lowStockThreshold || 10);
                      const isMatchSearch = searchQuery && product && (
                        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.productId?.toLowerCase().includes(searchQuery.toLowerCase())
                      );

                      let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
                      if (!product || product.quantity <= 0) {
                        badgeColor = 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500';
                      } else if (isLowStock) {
                        badgeColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
                      }

                      if (displayMode === 'category' && product) {
                        badgeColor = CATEGORY_COLORS_2D[product.category] || badgeColor;
                      }

                      return (
                        <motion.button
                          key={bayNum}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (product) {
                              onSelectProduct({
                                ...product,
                                aisle: `AISLE ${aisle}`,
                                bay: `AISLE ${aisle}-${String(bayNum).padStart(2, '0')}`,
                                tier: 1,
                                slot: 1
                              });
                            }
                          }}
                          className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all relative ${badgeColor} ${
                            isSelected
                              ? 'ring-2 ring-violet-500 ring-offset-2 dark:ring-offset-slate-900 shadow-md scale-105'
                              : 'shadow-2xs'
                          } ${isMatchSearch ? 'ring-2 ring-rose-500 animate-pulse' : ''}`}
                        >
                          {isMatchSearch && (
                            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
                          )}
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold opacity-80">
                            <span>{aisle}-{String(bayNum).padStart(2, '0')}</span>
                            {product && <span>{product.quantity}u</span>}
                          </div>
                          <span className="text-[11px] font-extrabold truncate block mt-1">
                            {product ? product.name : 'Empty Slot'}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Central AGV Transit Highway & Inspection Staging */}
          <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-amber-800 dark:text-amber-300">
              CENTRAL CORRIDOR: Forklift & AGV Autonomous Transit Way
            </span>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
              Speed Limit: 5 km/h
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
