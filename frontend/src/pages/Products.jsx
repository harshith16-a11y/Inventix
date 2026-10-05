import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { inventoryService } from '../services/inventoryService';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import StockBadge from '../components/StockBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  Plus,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Boxes,
  Package,
  DollarSign,
  AlertCircle,
  Sparkles,
  Trash2,
  X,
  ShieldCheck,
  Lock,
  Minus,
  ShoppingCart,
  Check
} from 'lucide-react';

const PRESET_PRODUCTS = [
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

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const { addToCart } = useCart();
  const { user, isAdmin, login } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('productId');
  const [sortDirection, setSortDirection] = useState('asc');
  const [toastMessage, setToastMessage] = useState('');
  const [isMergeSortActive, setIsMergeSortActive] = useState(true);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [quickAdjustModalOpen, setQuickAdjustModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [adminPromptOpen, setAdminPromptOpen] = useState(false);
  const [targetProduct, setTargetProduct] = useState(null);

  // Single Add Form state
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    category: 'Cooking Essentials',
    description: '',
    price: '',
    quantity: '',
    lowStockThreshold: '10',
  });

  // Quick Adjust Price & Stock Form state
  const [quickPrice, setQuickPrice] = useState('');
  const [quickQuantity, setQuickQuantity] = useState('');

  // Table view order quantities map { [productId]: qty }
  const [tableOrderQty, setTableOrderQty] = useState({});

  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [sortBy, sortDirection]);

  useEffect(() => {
    if (initialSearch) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetch sorted inventory from backend manual MergeSort implementation
      const data = await inventoryService.getSorted(sortBy, sortDirection);
      setProducts(data);
      setIsMergeSortActive(true);
    } catch (err) {
      console.error(err);
      // Fallback to general list
      try {
        const fallback = await productService.getAll();
        setProducts(fallback);
      } catch (e) {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  // Extract unique categories
  const categories = ['ALL', ...new Set(products.map((p) => p.category).filter(Boolean))];

  // Filtering on client for instant responsiveness
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      p.productId.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase().trim()));

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'IN_STOCK' && p.status === 'IN_STOCK') ||
      (selectedStatus === 'LOW_STOCK' && p.status === 'LOW_STOCK') ||
      (selectedStatus === 'OUT_OF_STOCK' && p.status === 'OUT_OF_STOCK');

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Metrics
  const totalUnits = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const totalValuation = products.reduce((acc, p) => acc + ((p.price || 0) * (p.quantity || 0)), 0);
  const lowStockCount = products.filter(p => p.quantity <= p.lowStockThreshold).length;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleAddToCart = (product, quantity = 1) => {
    const res = addToCart(product, quantity);
    if (res.success) {
      showToast(`Added ${quantity}x ${product.name} to shipment cart!`);
    }
  };

  // Open Single Add Modal
  const handleOpenAdd = async () => {
    if (!isAdmin) {
      setAdminPromptOpen(true);
      return;
    }

    setModalError('');
    setFormData({
      productId: 'Loading...',
      name: '',
      category: 'Cooking Essentials',
      description: '',
      price: '',
      quantity: '',
      lowStockThreshold: '10',
    });
    setAddModalOpen(true);

    try {
      const res = await productService.getNextId();
      if (res && res.nextProductId) {
        setFormData(prev => ({ ...prev, productId: res.nextProductId }));
      }
    } catch (e) {
      setFormData(prev => ({ ...prev, productId: 'P' + Math.floor(100 + Math.random() * 899) }));
    }
  };

  // 1-Click Preset Selection in Add Modal
  const handleSelectPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      name: preset.name,
      category: preset.category,
      price: preset.price,
      quantity: preset.quantity,
      lowStockThreshold: preset.lowStockThreshold,
      description: preset.description
    }));
  };

  // Save new product
  const handleSaveAddProduct = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      const payload = {
        productId: formData.productId.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category.trim() || 'General Goods',
        description: formData.description.trim() || `${formData.name} warehouse inventory item`,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        lowStockThreshold: Number(formData.lowStockThreshold) || 10,
      };

      await productService.create(payload);
      showToast(`Product ${payload.name} (${payload.productId}) added to inventory!`);
      setAddModalOpen(false);
      fetchProducts();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error saving product. Product ID must be unique.');
    } finally {
      setModalLoading(false);
    }
  };

  // Batch Add Preset Essentials in 1 Click
  const handleBatchPresetAdd = async () => {
    if (!isAdmin) {
      setAdminPromptOpen(true);
      return;
    }

    try {
      setLoading(true);
      const baseNum = Math.floor(700 + Math.random() * 200);
      const presets = PRESET_PRODUCTS.map((item, idx) => ({
        ...item,
        productId: `P${baseNum + idx}`,
        price: Number(item.price),
        quantity: Number(item.quantity),
        lowStockThreshold: Number(item.lowStockThreshold)
      }));

      const res = await productService.createBatch(presets);
      showToast(res.message || `Added ${presets.length} preset products to inventory!`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add batch preset products.');
    } finally {
      setLoading(false);
    }
  };

  // Open Quick Adjust Price & Amount Modal
  const handleOpenQuickAdjust = (product) => {
    if (!isAdmin) {
      setTargetProduct(product);
      setAdminPromptOpen(true);
      return;
    }
    setTargetProduct(product);
    setQuickPrice(product.price.toString());
    setQuickQuantity(product.quantity.toString());
    setModalError('');
    setQuickAdjustModalOpen(true);
  };

  // Save Quick Price & Stock Adjust
  const handleSaveQuickAdjust = async (e) => {
    e.preventDefault();
    if (!targetProduct) return;
    setModalError('');
    setModalLoading(true);

    try {
      const updated = await productService.quickAdjust(
        targetProduct.id,
        Number(quickPrice),
        Number(quickQuantity)
      );

      showToast(`Updated ${updated.name} (${updated.productId}) - Price: ₹${Number(updated.price).toFixed(2)}, Stock: ${updated.quantity} units.`);
      setQuickAdjustModalOpen(false);
      fetchProducts();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error updating product price and quantity.');
    } finally {
      setModalLoading(false);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (product) => {
    if (!isAdmin) {
      setTargetProduct(product);
      setAdminPromptOpen(true);
      return;
    }
    setTargetProduct(product);
    setDeleteConfirmOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!targetProduct) return;
    try {
      setModalLoading(true);
      await productService.delete(targetProduct.id);
      showToast(`Product ${targetProduct.productId} (${targetProduct.name}) removed from inventory.`);
      setDeleteConfirmOpen(false);
      setProducts(prev => prev.filter(p => p.id !== targetProduct.id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setModalLoading(false);
    }
  };

  // 1-Click Authenticate as Admin
  const handle1ClickAdminLogin = async () => {
    try {
      setModalLoading(true);
      await login('admin@example.com', 'admin123');
      showToast('Switched to Administrator mode!');
      setAdminPromptOpen(false);
    } catch (err) {
      alert('Failed to log in as admin.');
    } finally {
      setModalLoading(false);
    }
  };

  // Table view quantity stepper helper
  const getTableQty = (productId) => tableOrderQty[productId] || 1;
  const setTableQty = (productId, delta, max) => {
    const curr = getTableQty(productId);
    const next = Math.max(1, Math.min(curr + delta, max));
    setTableOrderQty(prev => ({ ...prev, [productId]: next }));
  };

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

      {/* ============================================================== */}
      {/* HERO / CATALOG CONTROL BANNER */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        {/* Glow ambient circle */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                MergeSort.java: O(n log n)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 backdrop-blur-md">
                <Boxes className="w-3.5 h-3.5 text-sky-400" />
                WarehouseHashMap: O(1) Search
              </span>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Admin Controls Enabled
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Smart Warehouse Inventory Catalog
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Explore available warehouse goods, inspect real-time valuations, add or adjust products with instant quantity and price sync to the backend HashMap.
            </p>
          </div>

          {/* Action Buttons in Hero */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Add Product Button */}
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>

            {/* Quick Batch Preset Button */}
            <button
              onClick={handleBatchPresetAdd}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white border border-white/10 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all active:scale-95"
              title="Add 4 diverse grocery essentials in one click"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>1-Click Preset (4 Items)</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewMode === 'table' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Inventory Valuation Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total SKUs</span>
            <span className="text-lg font-black text-white font-mono">{products.length} Items</span>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Stock Units</span>
            <span className="text-lg font-black text-sky-400 font-mono">{totalUnits.toLocaleString()} units</span>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Inventory Valuation</span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              ₹{totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Low Stock Alerts</span>
            <span className={`text-lg font-black font-mono ${lowStockCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
              {lowStockCount} alerts
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SEARCH AND FILTERS TOOLBAR */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by ID (e.g. P101), Name, Category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-slate-100 font-medium"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="IN_STOCK">In Stock (Healthy)</option>
              <option value="LOW_STOCK">Low Stock (Alert)</option>
              <option value="OUT_OF_STOCK">Out of Stock (Depleted)</option>
            </select>
          </div>

          {/* Merge Sort Controller */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-indigo-900 dark:text-indigo-300 font-bold"
              title="Backend MergeSort Field"
            >
              <option value="productId">Sort: Product ID</option>
              <option value="name">Sort: Product Name</option>
              <option value="price">Sort: Price</option>
              <option value="quantity">Sort: Available Stock</option>
            </select>

            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl text-xs font-bold transition-colors shadow-2xs"
              title="Toggle Sort Direction"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Categories:</span>
          {categories.map((cat) => {
            const count = cat === 'ALL'
              ? products.length
              : products.filter(p => p.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{cat === 'ALL' ? 'All Items' : cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filteredProducts.length}</strong> of{' '}
            <strong className="text-slate-900 dark:text-white">{products.length}</strong> products
          </span>
          <span className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/60">
            MergeSort.java: O(n log n) | {sortBy} ({sortDirection.toUpperCase()})
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CONTENT RENDERING: GRID OR TABLE */}
      {/* ============================================================== */}
      {loading ? (
        <LoadingSpinner message="Executing backend Merge Sort..." />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="No products matched your filters"
          description="Try clearing your search query or adjusting your category/stock filter criteria."
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('ALL');
                  setSelectedStatus('ALL');
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-xs"
              >
                Reset Filters
              </button>
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-2xs"
              >
                + Add New Product
              </button>
            </div>
          }
        />
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.productId}
              product={product}
              onAddToCart={handleAddToCart}
              onQuickAdjust={handleOpenQuickAdjust}
              onDeleteProduct={handleOpenDelete}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Product ID</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Stock</th>
                  <th className="py-3 px-4 text-right">Stock Valuation</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Order Qty</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map((p) => {
                  const isOut = p.quantity <= 0;
                  const rowValuation = (p.price || 0) * (p.quantity || 0);
                  const currQty = getTableQty(p.productId);
                  const orderSubtotal = (p.price * currQty).toFixed(2);

                  return (
                    <tr key={p.productId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">{p.productId}</td>
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 dark:text-white">{p.name}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{p.description}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{p.category}</td>
                      <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white">₹{Number(p.price).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-200">{p.quantity}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-700 dark:text-emerald-400">₹{rowValuation.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <StockBadge status={p.status} quantity={p.quantity} threshold={p.lowStockThreshold} />
                      </td>
                      
                      {/* Inline Stepper for Table */}
                      <td className="py-3 px-4 text-center">
                        {!isOut ? (
                          <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                            <button
                              type="button"
                              onClick={() => setTableQty(p.productId, -1, p.quantity)}
                              className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 disabled:opacity-30"
                              disabled={currQty <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono font-bold text-xs w-5 text-center text-slate-900 dark:text-slate-100">
                              {currQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setTableQty(p.productId, 1, p.quantity)}
                              className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 disabled:opacity-30"
                              disabled={currQty >= p.quantity}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">N/A</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Add to Shipment Button */}
                          <button
                            onClick={() => handleAddToCart(p, currQty)}
                            disabled={isOut}
                            className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-all ${
                              isOut
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                            title={`Add ${currQty}x to Cart for ₹${orderSubtotal}`}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>₹{orderSubtotal}</span>
                          </button>

                          {/* Fix Amount / Price */}
                          <button
                            onClick={() => handleOpenQuickAdjust(p)}
                            className="p-1.5 text-indigo-700 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg shadow-2xs transition-colors"
                            title="Fix Amount / Price & Stock"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>

                          {/* Details */}
                          <Link
                            to={`/products/${p.productId}`}
                            className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors"
                            title="View Details"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete */}
                          <button
                            onClick={() => handleOpenDelete(p)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg shadow-2xs transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: ADD PRODUCT TO CATALOG */}
      {/* ============================================================== */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-sky-600" />
                  Add Product to Warehouse Catalog
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronizes directly into MySQL/H2 and in-memory HashMap.
                </p>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick 1-Click Preset Selector */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Fill with Preset Essentials:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_PRODUCTS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-800 rounded-xl text-[11px] font-semibold border border-indigo-200 transition-colors shadow-2xs"
                  >
                    {preset.name} (₹{preset.price})
                  </button>
                ))}
              </div>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddProduct} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product ID (Unique Key)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. P101, P214"
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Basmati Rice 5kg"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-sky-500/20"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="8.50"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-6 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity in Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="25"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="10"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              {formData.price && formData.quantity && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs text-emerald-900 font-medium">
                  <span>Initial Stock Asset Value:</span>
                  <span className="font-black text-emerald-700 text-sm font-mono">
                    ₹{(Number(formData.price) * Number(formData.quantity)).toFixed(2)}
                  </span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catalog Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Catalog specs..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-sky-500/20"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-600/20 transition-all"
                >
                  {modalLoading ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: FIX AMOUNT / PRICE & STOCK */}
      {/* ============================================================== */}
      {quickAdjustModalOpen && targetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  Fix Amount & Stock Level
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Adjust unit price and quantity for <strong className="text-slate-800">{targetProduct.name}</strong> ({targetProduct.productId})
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
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Current Price:</span>
                  <span className="font-bold text-slate-800">₹{Number(targetProduct.price).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Current In-Stock:</span>
                  <span className="font-bold text-slate-800">{targetProduct.quantity} units</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200 pt-1.5">
                  <span>Current Stock Value:</span>
                  <span className="font-black text-slate-800 font-mono">
                    ₹{(targetProduct.price * targetProduct.quantity).toFixed(2)}
                  </span>
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
                      className="w-full pl-6 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Dynamic Preview */}
              {quickPrice && quickQuantity && (
                <div className="p-3 bg-indigo-50/80 border border-indigo-100 rounded-2xl text-[11px] text-indigo-900 space-y-1">
                  <div className="flex items-center justify-between font-medium">
                    <span>New Total Stock Valuation:</span>
                    <span className="font-black text-indigo-700 text-xs font-mono">
                      ₹{(Number(quickPrice) * Number(quickQuantity)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-indigo-600">
                    <span>Threshold status:</span>
                    <span>{Number(quickQuantity) <= targetProduct.lowStockThreshold ? '⚠️ Low Stock' : '✅ Healthy Stock'}</span>
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
                  {modalLoading ? 'Saving...' : 'Apply Fixed Amount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: DELETE PRODUCT CONFIRMATION */}
      {/* ============================================================== */}
      {deleteConfirmOpen && targetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Product from Inventory</h3>
                <p className="text-xs text-slate-500">This action will remove it from both H2 and the HashMap.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="font-extrabold text-slate-900">{targetProduct.name}</div>
              <div className="text-slate-500 font-mono">Product ID: {targetProduct.productId}</div>
              <div className="text-slate-500">Unit Price: ₹{Number(targetProduct.price).toFixed(2)} | Stock: {targetProduct.quantity} units</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={modalLoading}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all"
              >
                {modalLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: ADMIN PRIVILEGES REQUIRED PROMPT */}
      {/* ============================================================== */}
      {adminPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Admin Authorization Required</h3>
                <p className="text-xs text-slate-500">Adding, editing amounts, and deleting require Administrator role.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Would you like to instantly authenticate as the Demo Warehouse Administrator (<code>admin@example.com</code>) to perform this operation?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAdminPromptOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handle1ClickAdminLogin}
                disabled={modalLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                {modalLoading ? 'Authenticating...' : '⚡ Authenticate as Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
