import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import { shipmentService } from '../services/shipmentService';
import LoadingSpinner from '../components/LoadingSpinner';
import StockBadge from '../components/StockBadge';
import {
  Boxes,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Truck,
  Flame,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Clock
} from 'lucide-react';

export default function CreateShipment() {
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQuantity, removeFromCart, clearCart, totalItems, totalValue } = useCart();

  const [step, setStep] = useState(cartItems.length > 0 ? 3 : 1);
  const [catalog, setCatalog] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  // Shipment Type & Priority
  const [shipmentType, setShipmentType] = useState('NORMAL'); // 'NORMAL' or 'PRIORITY'
  const [priorityLevel, setPriorityLevel] = useState('HIGH'); // 'HIGH', 'MEDIUM', 'LOW'

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdResult, setCreatedResult] = useState(null);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      setLoadingCatalog(true);
      const data = await productService.getAll();
      setCatalog(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCatalog(false);
    }
  };

  const handleConfirmShipment = async () => {
    if (cartItems.length === 0) {
      setError('Shipment must contain at least one product.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        type: shipmentType,
        priority: shipmentType === 'PRIORITY' ? priorityLevel : 'NONE',
        items: cartItems.map((item) => ({
          productId: item.product.productId,
          quantity: item.quantity,
        })),
      };

      const result = await shipmentService.createShipment(payload);
      setCreatedResult(result);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit shipment. Please verify stock.');
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (createdResult) {
    const s = createdResult.shipment;
    const isNormal = s.type === 'NORMAL';

    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-50">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {s.shipmentId}
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">Shipment Queued Successfully!</h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isNormal
              ? `Shipment ${s.shipmentId} was enqueued into the FIFO Normal Queue.`
              : `Shipment ${s.shipmentId} was enqueued into the Binary Heap Priority Queue with ${s.priority} priority.`}
          </p>
        </div>

        {/* Queue Highlight Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm max-w-md mx-auto text-left space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Processing Pipeline:</span>
            <span className="font-bold text-slate-800">
              {isNormal ? 'FIFO ArrayDeque Queue' : 'Min-Heap Priority Queue'}
            </span>
          </div>

          {isNormal ? (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800 font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                You are currently <strong>#{createdResult.queuePosition || 1}</strong> in the normal shipment queue.
              </span>
            </div>
          ) : (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Dispatched with <strong>{s.priority}</strong> Priority order (Level {s.priorityOrder}).
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Total Items: {s.items ? s.items.length : totalItems}</span>
            <span className="font-bold text-slate-900">₹{Number(s.totalValue).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            to={`/my-shipments`}
            className="px-5 py-2.5 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 shadow-md shadow-sky-600/20"
          >
            Track in My Shipments
          </Link>
          <button
            onClick={() => {
              setCreatedResult(null);
              setStep(1);
            }}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50"
          >
            Create Another Shipment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Step Wizard Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create New Shipment</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Step-by-step shipment builder with real-time stock reservation and queue dispatch.
        </p>

        {/* Step indicator bar */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { num: 1, label: '1. Select Items' },
            { num: 2, label: '2. Review Cart' },
            { num: 3, label: '3. Dispatch Type' },
            { num: 4, label: '4. Confirmation' },
          ].map((s) => {
            const isDone = (step === 3 ? 2 : step === 4 ? 3 : step === 5 ? 4 : 1) > s.num;
            const isCurrent =
              (step <= 2 && s.num === 1) ||
              (step === 3 && s.num === 2) ||
              (step === 4 && s.num === 3) ||
              (step === 5 && s.num === 4);

            return (
              <div
                key={s.num}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-sky-50 border-sky-500 text-sky-700 font-bold'
                    : isDone
                    ? 'bg-slate-100 border-slate-200 text-slate-700'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <span className="text-xs">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Select Products from Catalog */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Select Products for Shipment</h2>
            {cartItems.length > 0 && (
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 flex items-center gap-1.5"
              >
                Go to Cart ({totalItems})
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {loadingCatalog ? (
            <LoadingSpinner message="Loading catalog items..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {catalog.map((product) => {
                const isOutOfStock = product.quantity <= 0;
                const inCart = cartItems.find((item) => item.product.productId === product.productId);

                return (
                  <div
                    key={product.productId}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-sky-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {product.productId}
                        </span>
                        <StockBadge status={product.status} quantity={product.quantity} threshold={product.lowStockThreshold} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{product.name}</h4>
                      <p className="text-xs text-slate-400">{product.category}</p>
                      <p className="text-sm font-extrabold text-slate-900 mt-2">₹{Number(product.price).toFixed(2)}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Stock: {product.quantity}</span>
                      <button
                        onClick={() => addToCart(product, 1)}
                        disabled={isOutOfStock}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isOutOfStock
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : inCart
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-sky-600 text-white hover:bg-sky-700'
                        }`}
                      >
                        {inCart ? `In Cart (${inCart.quantity})` : '+ Add'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 flex items-center gap-2 shadow-md shadow-sky-600/20"
              >
                Proceed to Review ({totalItems} items)
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Review Shipment / Cart */}
      {step === 3 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Shipment Items & Quantities</h2>
            <button
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              + Add More Products
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-600">Your shipment cart is empty.</p>
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-xl"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {cartItems.map(({ product, quantity }) => (
                  <div key={product.productId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-slate-50/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                          {product.productId}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{product.name}</h4>
                      </div>
                      <p className="text-xs text-slate-400">
                        ₹{Number(product.price).toFixed(2)} each · Max Available: {product.quantity}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                        <button
                          onClick={() => updateQuantity(product.productId, quantity - 1)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-white"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center text-xs font-bold text-slate-900">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.productId, quantity + 1)}
                          disabled={quantity >= product.quantity}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-white disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <span className="text-sm font-bold text-slate-900 w-20 text-right">
                        ₹{(quantity * product.price).toFixed(2)}
                      </span>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(product.productId)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500">Total Items:</span>
                  <span className="ml-1.5 text-sm font-bold text-slate-800">{totalItems}</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500">Total Shipment Value:</span>
                  <span className="ml-2 text-xl font-extrabold text-slate-900">₹{totalValue.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  ← Back to Selection
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 flex items-center gap-2 shadow-md shadow-sky-600/20"
                >
                  Choose Dispatch Type
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: Choose Shipment Type (Normal vs Priority) */}
      {step === 4 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-slate-800">Select Shipment Processing Type</h2>
            <p className="text-xs text-slate-500">How should this shipment be processed in the warehouse?</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Option 1: NORMAL */}
            <div
              onClick={() => setShipmentType('NORMAL')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                shipmentType === 'NORMAL'
                  ? 'border-sky-500 bg-sky-50/50 shadow-md ring-4 ring-sky-500/10'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-sky-100 text-sky-700 mb-3">
                  <Truck className="w-6 h-6" />
                </div>
                {shipmentType === 'NORMAL' && (
                  <CheckCircle2 className="w-5 h-5 text-sky-600" />
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900">NORMAL SHIPMENT</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Processed in first-in-first-out order (FIFO).
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/60 font-mono text-[11px] text-sky-800">
                DSA: ArrayDeque FIFO Queue
              </div>
            </div>

            {/* Option 2: PRIORITY */}
            <div
              onClick={() => setShipmentType('PRIORITY')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                shipmentType === 'PRIORITY'
                  ? 'border-rose-500 bg-rose-50/50 shadow-md ring-4 ring-rose-500/10'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-rose-100 text-rose-700 mb-3">
                  <Flame className="w-6 h-6" />
                </div>
                {shipmentType === 'PRIORITY' && (
                  <CheckCircle2 className="w-5 h-5 text-rose-600" />
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900">PRIORITY SHIPMENT</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Processed according to urgency level.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/60 font-mono text-[11px] text-rose-800">
                DSA: Binary Min-Heap PriorityQueue
              </div>
            </div>
          </div>

          {/* Priority Level Selector when PRIORITY selected */}
          {shipmentType === 'PRIORITY' && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Select Priority Urgency Level:
              </label>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { level: 'HIGH', label: '🔴 HIGH (Level 1)', desc: 'Processed before normal & medium' },
                  { level: 'MEDIUM', label: '🟡 MEDIUM (Level 2)', desc: 'Processed before low' },
                  { level: 'LOW', label: '🟢 LOW (Level 3)', desc: 'Expedited queue entry' },
                ].map((p) => (
                  <button
                    key={p.level}
                    type="button"
                    onClick={() => setPriorityLevel(p.level)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      priorityLevel === p.level
                        ? 'bg-white border-rose-500 shadow-sm ring-2 ring-rose-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">{p.label}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              ← Back to Cart
            </button>
            <button
              onClick={() => setStep(5)}
              className="px-6 py-2.5 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 flex items-center gap-2 shadow-md shadow-sky-600/20"
            >
              Final Confirmation
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Final Review & Confirmation */}
      {step === 5 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-slate-800">Confirm Shipment Submission</h2>
            <p className="text-xs text-slate-500">Please review items and dispatch parameters before submission.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Shipment Type:</span>
              <span className="font-bold text-slate-900">
                {shipmentType === 'NORMAL' ? 'Standard FIFO Dispatch' : `Priority Dispatch (${priorityLevel})`}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Total Unique Products:</span>
              <span className="font-bold text-slate-900">{cartItems.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Total Units:</span>
              <span className="font-bold text-slate-900">{totalItems}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
              <span className="font-bold text-slate-700">Total Order Value:</span>
              <span className="text-lg font-extrabold text-slate-900">₹{totalValue.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(4)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              ← Change Dispatch Settings
            </button>
            <button
              onClick={handleConfirmShipment}
              disabled={submitting}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Submitting to Queue...' : 'Confirm Shipment'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
