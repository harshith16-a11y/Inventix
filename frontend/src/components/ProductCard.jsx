import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ArrowUpRight,
  ShoppingCart,
  Plus,
  Minus,
  SlidersHorizontal,
  Trash2,
  DollarSign,
  Boxes,
  Check
} from 'lucide-react';
import StockBadge from './StockBadge';

const CATEGORY_COLORS = {
  'Cooking Essentials': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Dairy & Beverages': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Grains & Staples': 'bg-amber-50 text-amber-700 border-amber-200',
  'Health & Sweets': 'bg-purple-50 text-purple-700 border-purple-200',
  'Snacks': 'bg-rose-50 text-rose-700 border-rose-200',
  'General Goods': 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function ProductCard({
  product,
  onAddToCart,
  onQuickAdjust,
  onDeleteProduct,
  isAdmin = false
}) {
  const [orderQty, setOrderQty] = useState(1);
  const [copiedSku, setCopiedSku] = useState(false);

  const isOutOfStock = product.quantity <= 0;
  const maxAvailable = Math.max(0, product.quantity);
  const safeQty = Math.min(orderQty, Math.max(1, maxAvailable));
  const subtotalAmount = Number(product.price * (isOutOfStock ? 0 : safeQty)).toFixed(2);
  const totalStockAmount = Number(product.price * product.quantity).toFixed(2);

  const handleIncrement = () => {
    if (orderQty < maxAvailable) {
      setOrderQty(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (orderQty > 1) {
      setOrderQty(prev => prev - 1);
    }
  };

  const handleCopySku = () => {
    navigator.clipboard?.writeText(product.productId);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
  };

  const categoryBadgeClass = CATEGORY_COLORS[product.category] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-300/60 dark:hover:border-violet-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top subtle accent glow line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity" />

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Top Meta: SKU chip & Stock Badge */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <button
              onClick={handleCopySku}
              title="Click to copy Product ID"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-slate-100/90 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200/90 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <span>{product.productId}</span>
              {copiedSku ? (
                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <span className="text-[9px] text-slate-400 dark:text-slate-500">COPY</span>
              )}
            </button>

            <StockBadge
              status={product.status}
              quantity={product.quantity}
              threshold={product.lowStockThreshold}
            />
          </div>

          {/* Category Tag */}
          <div className="mb-1.5">
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryBadgeClass}`}>
              {product.category || 'General Goods'}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {product.description || 'Warehouse inventory catalog item registered in HashMap and tracked in real time.'}
          </p>
        </div>

        {/* Pricing & Stock Valuation Section */}
        <div className="pt-3 border-t border-slate-100/80 dark:border-slate-800 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Unit Price</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                ₹{Number(product.price).toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">In Stock</span>
              <p className={`text-sm font-extrabold ${isOutOfStock ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                {product.quantity} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">units</span>
              </p>
            </div>
          </div>

          {/* Total Stock Asset Amount */}
          <div className="flex items-center justify-between text-[11px] bg-slate-50/80 dark:bg-slate-950/60 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Total Stock Valuation:
            </span>
            <span className="font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
              ₹{totalStockAmount}
            </span>
          </div>
        </div>

        {/* Customer Quantity Selector & Live Subtotal */}
        {!isOutOfStock && (
          <div className="bg-rose-50/40 dark:bg-rose-950/20 p-2.5 rounded-2xl border border-rose-100/60 dark:border-rose-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-rose-950 dark:text-rose-200">Shipment Quantity:</span>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-2 py-1 rounded-xl border border-rose-200 dark:border-rose-900/50 shadow-2xs">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={orderQty <= 1}
                  className="p-0.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-extrabold text-xs font-mono text-rose-950 dark:text-rose-100 w-6 text-center">
                  {safeQty}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={orderQty >= maxAvailable}
                  className="p-0.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-rose-900/80 dark:text-rose-300 font-medium">
              <span>Order Subtotal Amount:</span>
              <span className="font-black text-violet-700 dark:text-violet-300 text-xs font-mono">₹{subtotalAmount}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-slate-50/90 dark:bg-slate-950/80 border-t border-slate-100/90 dark:border-slate-800 space-y-2">
        {/* Primary Cart & Details */}
        <div className="grid grid-cols-5 gap-2">
          <Link
            to={`/products/${product.productId}`}
            className="col-span-2 flex items-center justify-center gap-1 py-2 px-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-2xs"
            title="Inspect Product Specifications"
          >
            Details
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => onAddToCart && onAddToCart(product, safeQty)}
            disabled={isOutOfStock}
            className={`col-span-3 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl transition-all shadow-2xs active:scale-95 ${
              isOutOfStock
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 hover:from-violet-700 hover:via-fuchsia-700 hover:to-rose-600 text-white shadow-md shadow-violet-500/20'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add • ₹{subtotalAmount}</span>
          </button>
        </div>

        {/* Product Management Bar: Fix Amount & Price + Delete */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800 gap-1.5">
          <button
            type="button"
            onClick={() => onQuickAdjust && onQuickAdjust(product)}
            className="flex-1 py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/50 border border-slate-200 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800/60 rounded-xl text-[11px] font-bold text-violet-700 dark:text-violet-300 flex items-center justify-center gap-1 transition-all shadow-2xs"
            title="Fix or adjust unit price and stock amount"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Fix Amount/Price</span>
          </button>

          <button
            type="button"
            onClick={() => onDeleteProduct && onDeleteProduct(product)}
            className="py-1.5 px-2.5 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800/60 rounded-xl text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1 transition-all shadow-2xs"
            title="Delete product from catalog and HashMap"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
