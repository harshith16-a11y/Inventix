import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import StockBadge from '../components/StockBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ArrowLeft,
  Boxes,
  ShoppingCart,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Clock,
  Layers
} from 'lucide-react';

export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError('');
      // Performs O(1) HashMap lookup in Spring Boot backend
      const data = await productService.searchByProductId(productId);
      setProduct(data);
      setQuantity(1);
    } catch (err) {
      setError(`Product with ID "${productId}" not found in Warehouse HashMap.`);
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = () => {
    if (product && quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (quantity > product.quantity) {
      setError(`Insufficient stock available. Available stock: ${product.quantity}, Requested quantity: ${quantity}`);
      return;
    }

    const res = addToCart(product, quantity);
    if (res.success) {
      setToastMessage(`Successfully added ${quantity} unit(s) of ${product.name} to shipment!`);
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Looking up product via Warehouse HashMap..." />;
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'Requested item does not exist.'}</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Product Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.quantity <= 0;
  const isInsufficientStock = quantity > product.quantity;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-slate-400 hover:text-white text-xs ml-2">✕</button>
        </div>
      )}

      {/* Back Button */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </Link>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-8 space-y-8">
        
        {/* Header details */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
                {product.productId}
              </span>
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {product.category}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.name}
            </h1>
          </div>

          <div className="flex flex-col sm:items-end">
            <StockBadge
              status={product.status}
              quantity={product.quantity}
              threshold={product.lowStockThreshold}
            />
            <span className="text-2xl font-extrabold text-slate-900 mt-2">
              ₹{Number(product.price).toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-400">Standard per-unit price</span>
          </div>
        </div>

        {/* Description & Technical DSA Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Description</h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              {product.description || 'Standard warehouse commercial stock item, verified and packaged for rapid distribution.'}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-[11px] font-semibold text-slate-400">Current Stock</p>
                <p className="text-lg font-bold text-slate-800 mt-0.5">{product.quantity} units</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-[11px] font-semibold text-slate-400">Low Stock Alert Threshold</p>
                <p className="text-lg font-bold text-amber-700 mt-0.5">{product.lowStockThreshold} units</p>
              </div>
            </div>
          </div>

          {/* Academic DSA Highlight Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-100/80 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                <Layers className="w-4 h-4 text-indigo-600" />
                Backend DSA Mapping
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Retrieved using <strong>WarehouseHashMap.java</strong> with key{' '}
                <code className="text-indigo-700 font-bold bg-white px-1.5 py-0.5 rounded border border-indigo-200">
                  {product.productId}
                </code>.
              </p>
              <div className="pt-2 text-[11px] font-mono text-indigo-800 space-y-1">
                <p>Lookup: O(1) Time</p>
                <p>Hash Function: hashCode()</p>
                <p>Status: {product.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quantity Selector & Add to Shipment */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Counter */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                <button
                  onClick={handleDecrement}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-extrabold text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={quantity >= product.quantity || isOutOfStock}
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-slate-400">
                (Available: {product.quantity})
              </span>
            </div>

            {/* Total calculation & Action */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[11px] text-slate-400 font-medium">Subtotal</span>
                <p className="text-xl font-extrabold text-slate-900">
                  ₹{(quantity * product.price).toFixed(2)}
                </p>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isInsufficientStock}
                className={`py-3 px-6 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                  isOutOfStock || isInsufficientStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20 active:scale-95'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Shipment
              </button>
            </div>
          </div>

          {/* Validation Alert for Insufficient Stock */}
          {isInsufficientStock && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>
                <strong>Insufficient stock available.</strong> Available stock: {product.quantity}, Requested quantity: {quantity}.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
