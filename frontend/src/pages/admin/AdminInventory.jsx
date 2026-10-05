import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { inventoryService } from '../../services/inventoryService';
import StockBadge from '../../components/StockBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Boxes,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  X,
  Layers,
  DollarSign,
  TrendingUp,
  Sparkles,
  Package,
  SlidersHorizontal
} from 'lucide-react';

const PRESET_ESSENTIALS = [
  {
    name: 'Organic Almond Milk 1L',
    category: 'Dairy & Beverages',
    price: '4.50',
    quantity: '40',
    lowStockThreshold: '10',
    description: 'Fresh organic unsweetened plant-based almond milk.'
  },
  {
    name: 'Royal Basmati Rice 5kg',
    category: 'Grains & Staples',
    price: '18.99',
    quantity: '55',
    lowStockThreshold: '15',
    description: 'Premium aged aromatic long-grain basmati rice.'
  },
  {
    name: 'Cold-Pressed Olive Oil 750ml',
    category: 'Cooking Essentials',
    price: '14.25',
    quantity: '28',
    lowStockThreshold: '8',
    description: 'Extra virgin single-origin cold pressed culinary olive oil.'
  },
  {
    name: 'Organic Wild Honey 500g',
    category: 'Health & Sweets',
    price: '9.75',
    quantity: '45',
    lowStockThreshold: '12',
    description: 'Pure unfiltered organic forest wildflower honey.'
  }
];

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Single Add / Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [targetProduct, setTargetProduct] = useState(null);

  // Batch Multi-Product Add Modal
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchItems, setBatchItems] = useState([]);

  // Quick Adjust Price & Quantity Modal
  const [quickAdjustModalOpen, setQuickAdjustModalOpen] = useState(false);
  const [quickProduct, setQuickProduct] = useState(null);
  const [quickPrice, setQuickPrice] = useState('');
  const [quickQuantity, setQuickQuantity] = useState('');

  // Restock Modal
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [restockQuantity, setRestockQuantity] = useState(20);

  // Single Form states
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    category: '',
    description: '',
    price: '',
    quantity: '',
    lowStockThreshold: '',
  });

  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Open single add modal with auto-suggested next Product ID
  const handleOpenAdd = async () => {
    setIsEditingExisting(false);
    setTargetProduct(null);
    setFormData({
      productId: 'Loading...',
      name: '',
      category: 'Cooking Essentials',
      description: '',
      price: '',
      quantity: '',
      lowStockThreshold: '10',
    });
    setModalError('');
    setEditModalOpen(true);

    try {
      const res = await productService.getNextId();
      if (res && res.nextProductId) {
        setFormData(prev => ({ ...prev, productId: res.nextProductId }));
      }
    } catch (e) {
      setFormData(prev => ({ ...prev, productId: 'P' + Math.floor(100 + Math.random() * 899) }));
    }
  };

  const handleOpenEdit = (product) => {
    setIsEditingExisting(true);
    setTargetProduct(product);
    setFormData({
      productId: product.productId,
      name: product.name,
      category: product.category || '',
      description: product.description || '',
      price: product.price,
      quantity: product.quantity,
      lowStockThreshold: product.lowStockThreshold,
    });
    setModalError('');
    setEditModalOpen(true);
  };

  // Open Quick Adjust modal
  const handleOpenQuickAdjust = (product) => {
    setQuickProduct(product);
    setQuickPrice(product.price.toString());
    setQuickQuantity(product.quantity.toString());
    setModalError('');
    setQuickAdjustModalOpen(true);
  };

  // Execute Quick Adjust (price & quantity)
  const handleSaveQuickAdjust = async (e) => {
    e.preventDefault();
    if (!quickProduct) return;
    setModalError('');
    setModalLoading(true);

    try {
      const updated = await productService.quickAdjust(
        quickProduct.id,
        Number(quickPrice),
        Number(quickQuantity)
      );
      setToastMessage(`Updated ${updated.name} (${updated.productId}) - Price: ₹${Number(updated.price).toFixed(2)}, Stock: ${updated.quantity} units.`);
      setQuickAdjustModalOpen(false);
      loadProducts();
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error updating product price and quantity.');
    } finally {
      setModalLoading(false);
    }
  };

  // Open Batch Add Modal
  const handleOpenBatchAdd = async () => {
    setModalError('');
    let baseNext = 'P801';
    try {
      const res = await productService.getNextId();
      if (res?.nextProductId) baseNext = res.nextProductId;
    } catch (e) {
      // fallback
    }

    // Default with 2 blank rows
    const numPart = parseInt(baseNext.replace(/\D/g, '')) || 800;
    setBatchItems([
      {
        productId: `P${numPart}`,
        name: '',
        category: 'Cooking Essentials',
        price: '',
        quantity: '',
        lowStockThreshold: '10',
        description: ''
      },
      {
        productId: `P${numPart + 1}`,
        name: '',
        category: 'Dairy & Beverages',
        price: '',
        quantity: '',
        lowStockThreshold: '10',
        description: ''
      }
    ]);
    setBatchModalOpen(true);
  };

  // Add another row in batch
  const handleAddBatchRow = () => {
    const nextNum = 800 + batchItems.length + Math.floor(Math.random() * 50);
    setBatchItems([
      ...batchItems,
      {
        productId: `P${nextNum}`,
        name: '',
        category: 'General Goods',
        price: '',
        quantity: '',
        lowStockThreshold: '10',
        description: ''
      }
    ]);
  };

  // Remove a row from batch
  const handleRemoveBatchRow = (index) => {
    if (batchItems.length <= 1) return;
    setBatchItems(batchItems.filter((_, idx) => idx !== index));
  };

  // Update a field in batch
  const handleUpdateBatchField = (index, field, value) => {
    const updated = [...batchItems];
    updated[index][field] = value;
    setBatchItems(updated);
  };

  // Load preset essentials into batch
  const handleLoadPresetEssentials = () => {
    const baseNum = Math.floor(600 + Math.random() * 300);
    const presets = PRESET_ESSENTIALS.map((item, idx) => ({
      ...item,
      productId: `P${baseNum + idx}`
    }));
    setBatchItems(presets);
  };

  // Submit Batch Products
  const handleSaveBatch = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      // Validate all items
      for (let i = 0; i < batchItems.length; i++) {
        const item = batchItems[i];
        if (!item.productId || !item.name || !item.price || !item.quantity) {
          throw new Error(`Row #${i + 1} has missing required fields (ID, Name, Price, Quantity).`);
        }
        if (Number(item.price) <= 0 || Number(item.quantity) < 0) {
          throw new Error(`Row #${i + 1} (${item.name || 'Product'}) has invalid price or negative quantity.`);
        }
      }

      const payload = batchItems.map(item => ({
        productId: item.productId.trim().toUpperCase(),
        name: item.name.trim(),
        category: item.category.trim() || 'General Goods',
        description: item.description.trim() || `${item.name} warehouse inventory item`,
        price: Number(item.price),
        quantity: Number(item.quantity),
        lowStockThreshold: Number(item.lowStockThreshold) || 10
      }));

      const res = await productService.createBatch(payload);
      setToastMessage(res.message || `Successfully added ${payload.length} products to inventory!`);
      setBatchModalOpen(false);
      loadProducts();
      setTimeout(() => setToastMessage(''), 4500);
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to save batch products.');
    } finally {
      setModalLoading(false);
    }
  };

  // Single Product Save
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      const payload = {
        productId: formData.productId.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        lowStockThreshold: Number(formData.lowStockThreshold),
      };

      if (isEditingExisting && targetProduct) {
        await productService.update(targetProduct.id, payload);
        setToastMessage(`Product ${payload.name} (${payload.productId}) updated successfully!`);
      } else {
        await productService.create(payload);
        setToastMessage(`Product ${payload.name} (${payload.productId}) added to inventory!`);
      }

      setEditModalOpen(false);
      loadProducts();
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error saving product. Product ID must be unique.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name} (${product.productId})? This will remove it from database and HashMap.`)) {
      try {
        await productService.delete(product.id);
        setToastMessage(`Product ${product.productId} deleted.`);
        loadProducts();
        setTimeout(() => setToastMessage(''), 3500);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete product.');
      }
    }
  };

  const handleOpenRestock = (product) => {
    setTargetProduct(product);
    setRestockQuantity(20);
    setRestockModalOpen(true);
  };

  const handleExecuteRestock = async (e) => {
    e.preventDefault();
    if (!targetProduct) return;

    try {
      setModalLoading(true);
      await inventoryService.restock(targetProduct.productId, Number(restockQuantity));
      setToastMessage(`Restocked ${restockQuantity} units for ${targetProduct.name}!`);
      setRestockModalOpen(false);
      loadProducts();
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      alert(err.response?.data?.message || 'Restock failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    searchTerm.trim() === '' ||
    p.productId.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
    p.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase().trim()))
  );

  // Summary Metrics
  const totalUnits = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const totalValuation = products.reduce((acc, p) => acc + ((p.price || 0) * (p.quantity || 0)), 0);
  const lowStockCount = products.filter(p => p.quantity <= p.lowStockThreshold).length;

  // Batch calculations
  const batchTotalUnits = batchItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  const batchTotalValuation = batchItems.reduce((acc, item) => acc + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-slate-400 hover:text-white text-xs ml-2">✕</button>
        </div>
      )}

      {/* Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Boxes className="w-7 h-7 text-sky-600" />
            Warehouse Inventory Master
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Add multiple products with custom quantities & prices, adjust stock levels, and sync atomically to the HashMap.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={loadProducts}
            className="p-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all shadow-2xs"
            title="Refresh Inventory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Batch Add Button */}
          <button
            onClick={handleOpenBatchAdd}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Batch Add Products
          </button>

          {/* Add Single Product Button */}
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Single Product
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total SKUs</div>
            <div className="text-xl font-extrabold text-slate-900">{products.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Units</div>
            <div className="text-xl font-extrabold text-slate-900">{totalUnits.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Inventory Valuation</div>
            <div className="text-xl font-extrabold text-emerald-600">₹{totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${lowStockCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Low Stock Alerts</div>
            <div className={`text-xl font-extrabold ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{lowStockCount}</div>
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Product ID (e.g. P101, P214) or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">
            Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> items
          </span>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Loading inventory master records..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Product ID</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Stock</th>
                  <th className="py-3 px-4 text-right">Total Value</th>
                  <th className="py-3 px-4 text-right">Threshold</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-slate-400">
                      No products match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const rowValue = (p.price || 0) * (p.quantity || 0);
                    return (
                      <tr key={p.productId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{p.productId}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                        <td className="py-3 px-4 text-slate-500">{p.category}</td>
                        <td className="py-3 px-4 text-right font-extrabold text-slate-900">₹{Number(p.price).toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">{p.quantity}</td>
                        <td className="py-3 px-4 text-right font-semibold text-emerald-700">₹{rowValue.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-slate-400">{p.lowStockThreshold}</td>
                        <td className="py-3 px-4">
                          <StockBadge status={p.status} quantity={p.quantity} threshold={p.lowStockThreshold} />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Quick Price/Stock Adjust */}
                            <button
                              onClick={() => handleOpenQuickAdjust(p)}
                              className="px-2 py-1 rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-bold text-[11px] flex items-center gap-1 transition-colors"
                              title="Quick Adjust Price & Stock"
                            >
                              <SlidersHorizontal className="w-3 h-3" />
                              Price/Stock
                            </button>

                            {/* Restock */}
                            <button
                              onClick={() => handleOpenRestock(p)}
                              className="px-2 py-1 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 font-bold text-[11px] flex items-center gap-1 transition-colors"
                              title="Restock units"
                            >
                              <PlusCircle className="w-3 h-3" />
                              Restock
                            </button>

                            {/* Full Edit */}
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-slate-100"
                              title="Edit all product fields"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteProduct(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: BATCH / MULTI-PRODUCT CREATION */}
      {/* ============================================================== */}
      {batchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Batch Add Multiple Products with Quantity & Price
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add different products simultaneously with customized unit prices and stock levels.
                </p>
              </div>
              <button
                onClick={() => setBatchModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar inside Modal */}
            <div className="flex items-center justify-between gap-3 p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex-wrap">
              <div className="flex items-center gap-2 text-xs text-indigo-900 font-medium">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Want to quickly test with realistic grocery & staples catalog data?
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadPresetEssentials}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Load Preset Essentials (4 Items)
                </button>
                <button
                  type="button"
                  onClick={handleAddBatchRow}
                  className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Empty Row
                </button>
              </div>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Dynamic Items Table Form */}
            <form onSubmit={handleSaveBatch} className="space-y-4">
              <div className="max-h-[380px] overflow-y-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3 w-12">#</th>
                      <th className="py-2.5 px-3 w-28">Product ID *</th>
                      <th className="py-2.5 px-3">Product Name *</th>
                      <th className="py-2.5 px-3 w-36">Category</th>
                      <th className="py-2.5 px-3 w-28">Price (₹) *</th>
                      <th className="py-2.5 px-3 w-24">Quantity *</th>
                      <th className="py-2.5 px-3 w-24">Threshold</th>
                      <th className="py-2.5 px-3 w-12 text-center">Del</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batchItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            required
                            placeholder="P101"
                            value={item.productId}
                            onChange={(e) => handleUpdateBatchField(idx, 'productId', e.target.value.toUpperCase())}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            required
                            placeholder="e.g. Basmati Rice 5kg"
                            value={item.name}
                            onChange={(e) => handleUpdateBatchField(idx, 'name', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="Category"
                            value={item.category}
                            onChange={(e) => handleUpdateBatchField(idx, 'category', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <div className="relative">
                            <span className="absolute left-2 top-1.5 text-slate-400 font-bold">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              required
                              placeholder="0.00"
                              value={item.price}
                              onChange={(e) => handleUpdateBatchField(idx, 'price', e.target.value)}
                              className="w-full pl-5 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="0"
                            required
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => handleUpdateBatchField(idx, 'quantity', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="0"
                            placeholder="10"
                            value={item.lowStockThreshold}
                            onChange={(e) => handleUpdateBatchField(idx, 'lowStockThreshold', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveBatchRow(idx)}
                            disabled={batchItems.length <= 1}
                            className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:pointer-events-none rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Live Batch Summary Banner */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs flex-wrap gap-3">
                <div className="flex items-center gap-4 text-slate-700">
                  <span>Items: <strong className="text-slate-900">{batchItems.length}</strong></span>
                  <span>Total Units: <strong className="text-slate-900">{batchTotalUnits.toLocaleString()}</strong></span>
                  <span>Total Value: <strong className="text-emerald-600">₹{batchTotalValuation.toFixed(2)}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBatchModalOpen(false)}
                    className="px-4 py-2 font-bold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading || batchItems.length === 0}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                  >
                    {modalLoading ? 'Adding Products...' : `Add ${batchItems.length} Products to Inventory`}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: QUICK ADJUST PRICE & STOCK */}
      {/* ============================================================== */}
      {quickAdjustModalOpen && quickProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  Quick Price & Stock Adjust
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Fast modify unit price & stock for <span className="font-bold text-slate-800">{quickProduct.name}</span> ({quickProduct.productId})
                </p>
              </div>
              <button
                onClick={() => setQuickAdjustModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuickAdjust} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Current Unit Price:</span>
                  <span className="font-bold text-slate-800">₹{Number(quickProduct.price).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Current In-Stock Quantity:</span>
                  <span className="font-bold text-slate-800">{quickProduct.quantity} units</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200 pt-1.5">
                  <span>Current Valuation:</span>
                  <span className="font-bold text-slate-800">₹{(quickProduct.price * quickProduct.quantity).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Unit Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={quickPrice}
                      onChange={(e) => setQuickPrice(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">New In-Stock Quantity (Units)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={quickQuantity}
                    onChange={(e) => setQuickQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Dynamic Preview */}
              {quickPrice && quickQuantity && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-[11px] text-indigo-900 space-y-1">
                  <div className="flex items-center justify-between font-medium">
                    <span>New Total Product Value:</span>
                    <span className="font-extrabold text-indigo-700">₹{(Number(quickPrice) * Number(quickQuantity)).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-indigo-600">
                    <span>Low Stock Alert at:</span>
                    <span>{quickProduct.lowStockThreshold} units</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuickAdjustModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition-all"
                >
                  {modalLoading ? 'Saving...' : 'Apply Quick Adjust'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: SINGLE ADD / FULL EDIT PRODUCT MODAL */}
      {/* ============================================================== */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {isEditingExisting ? 'Edit Product Details' : 'Add New Product to Warehouse'}
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product ID (Unique Key)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. P101, P214"
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Organic Honey 500g"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cooking Essentials"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="8.50"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity in Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="15"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Low Stock Threshold</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="10"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 text-slate-900"
                  />
                </div>
              </div>

              {formData.price && formData.quantity && (
                <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-100 flex items-center justify-between text-[11px] text-sky-900 font-medium">
                  <span>Calculated Initial Valuation:</span>
                  <span className="font-extrabold text-sky-700">₹{(Number(formData.price) * Number(formData.quantity)).toFixed(2)}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Catalog description..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 text-slate-900"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-600/20 transition-all"
                >
                  {modalLoading ? 'Saving...' : isEditingExisting ? 'Update Product' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: RESTOCK MODAL */}
      {/* ============================================================== */}
      {restockModalOpen && targetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Restock Product Inventory</h3>
              <button onClick={() => setRestockModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Replenishing units for <strong className="text-slate-800">{targetProduct.name}</strong> ({targetProduct.productId}).
            </p>

            <form onSubmit={handleExecuteRestock} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Units to Add</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  required
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 text-slate-900 font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all"
                >
                  {modalLoading ? 'Restocking...' : 'Confirm Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
