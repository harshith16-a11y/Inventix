import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Search,
  Truck,
  Flame,
  Play,
  RotateCcw,
  StepForward,
  Plus,
  Minus,
  CheckCircle2,
  ArrowRight,
  Boxes
} from 'lucide-react';

export default function AdminDSAVisualizer() {
  const [activeTab, setActiveTab] = useState('MERGE_SORT'); // 'MERGE_SORT', 'HASHMAP', 'QUEUE', 'PRIORITY_QUEUE'

  // MERGE SORT STATE
  const initialArray = [42, 17, 31, 8, 56, 24];
  const [sortStep, setSortStep] = useState(0);
  const sortSteps = [
    {
      title: 'Original Input Array',
      description: 'Initial unsorted inventory keys.',
      elements: [[42, 17, 31, 8, 56, 24]],
    },
    {
      title: 'Step 1: Divide into Halves',
      description: 'Recursively split array into Left and Right sub-arrays.',
      elements: [[42, 17, 31], [8, 56, 24]],
    },
    {
      title: 'Step 2: Sub-Divide Further',
      description: 'Divide down until individual base elements of size 1 are reached.',
      elements: [[42], [17, 31], [8], [56, 24]],
    },
    {
      title: 'Step 3: Base Unit Division Complete',
      description: 'Every element is a single sorted sub-array.',
      elements: [[42], [17], [31], [8], [56], [24]],
    },
    {
      title: 'Step 4: Merge Sorted Pairs',
      description: 'Merge pairs comparing adjacent elements.',
      elements: [[17, 42], [8, 31], [24, 56]],
    },
    {
      title: 'Step 5: Merge Intermediate Sub-Arrays',
      description: 'Combine into larger sorted partitions.',
      elements: [[8, 17, 31, 42], [24, 56]],
    },
    {
      title: 'Step 6: Final Conquer & Merge Complete!',
      description: 'Fully sorted array in O(n log n) time.',
      elements: [[8, 17, 24, 31, 42, 56]],
    },
  ];

  // HASHMAP STATE
  const [hashInput, setHashInput] = useState('P214');
  const demoHashMap = {
    'P101': { name: 'Rice 5kg', price: '₹14.99', bucket: 1 },
    'P214': { name: 'Oil 1L', price: '₹8.50', bucket: 6 },
    'P309': { name: 'Soap Pack', price: '₹6.25', bucket: 3 },
    'P417': { name: 'Tea 500g', price: '₹11.00', bucket: 7 },
    'P522': { name: 'Sugar 2kg', price: '₹5.75', bucket: 2 },
  };

  const getHashDetails = (key) => {
    const k = key.trim().toUpperCase();
    let hash = 0;
    for (let i = 0; i < k.length; i++) {
      hash = (hash * 31 + k.charCodeAt(i)) & 0xffffffff;
    }
    const bucket = Math.abs(hash) % 8;
    const match = demoHashMap[k] || { name: 'Custom Product', price: '₹10.00', bucket };
    return { key: k, hash, bucket, match };
  };

  const hashDetails = getHashDetails(hashInput);

  // QUEUE (FIFO) STATE
  const [fifoQueue, setFifoQueue] = useState(['SH101', 'SH102', 'SH103', 'SH104']);
  const [queueCounter, setQueueCounter] = useState(105);

  const handleEnqueue = () => {
    setFifoQueue((prev) => [...prev, `SH${queueCounter}`]);
    setQueueCounter((c) => c + 1);
  };

  const handleDequeue = () => {
    if (fifoQueue.length > 0) {
      setFifoQueue((prev) => prev.slice(1));
    }
  };

  // PRIORITY QUEUE STATE
  const [pqItems, setPqItems] = useState([
    { id: 'SH104', priority: 'HIGH', label: 'Urgent Medical/Perishable' },
    { id: 'SH108', priority: 'HIGH', label: 'Express Critical Food' },
    { id: 'SH105', priority: 'MEDIUM', label: 'Standard Wholesale Order' },
    { id: 'SH106', priority: 'LOW', label: 'Restock Transfer Order' },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          DSA Academic Visualizers
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Interactive simulation tool for faculty presentation demonstrations of warehouse core algorithms.
        </p>
      </div>

      {/* Algorithm Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { key: 'MERGE_SORT', label: '1. Merge Sort (Divide & Conquer)', icon: Cpu },
          { key: 'HASHMAP', label: '2. HashMap (O(1) Hashing)', icon: Search },
          { key: 'QUEUE', label: '3. Normal FIFO Queue', icon: Truck },
          { key: 'PRIORITY_QUEUE', label: '4. Priority Binary Heap', icon: Flame },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. MERGE SORT VISUALIZER */}
      {activeTab === 'MERGE_SORT' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                Time Complexity: O(n log n) | Space: O(n)
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 mt-2">
                {sortSteps[sortStep].title}
              </h2>
              <p className="text-xs text-slate-500">{sortSteps[sortStep].description}</p>
            </div>

            {/* Stepper controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortStep((s) => Math.max(0, s - 1))}
                disabled={sortStep === 0}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-30"
              >
                Previous Step
              </button>
              <button
                onClick={() => setSortStep((s) => Math.min(sortSteps.length - 1, s + 1))}
                disabled={sortStep === sortSteps.length - 1}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold disabled:opacity-30 flex items-center gap-1"
              >
                Next Step
                <StepForward className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSortStep(0)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Visual Elements Partition Box */}
          <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 min-h-[200px] flex flex-col items-center justify-center space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {sortSteps[sortStep].elements.map((subArray, sIdx) => (
                <div
                  key={sIdx}
                  className="p-3 bg-white rounded-xl border border-slate-300 shadow-sm flex items-center gap-2 animate-scale-up"
                >
                  {subArray.map((val, vIdx) => (
                    <div
                      key={vIdx}
                      className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 font-extrabold font-mono text-sm flex items-center justify-center"
                    >
                      {val}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <span className="text-[11px] font-mono text-slate-400 mt-2">
              Progress: Step {sortStep + 1} of {sortSteps.length}
            </span>
          </div>
        </div>
      )}

      {/* 2. HASHMAP VISUALIZER */}
      {activeTab === 'HASHMAP' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-sky-50 text-sky-700">
              Average Lookup: O(1) Time | Direct Hash Indexing
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 mt-2">
              HashMap Key Hashing & Bucket Resolution
            </h2>
            <p className="text-xs text-slate-500">
              Product ID transforms into hash code and directly resolves target bucket index without scanning.
            </p>
          </div>

          {/* Key Input */}
          <div className="flex items-center gap-3 max-w-md">
            <input
              type="text"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Enter Product ID (e.g. P101, P214, P309)..."
              className="flex-1 px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-sky-500/20"
            />
            <button
              onClick={() => setHashInput('P214')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              Preset: P214
            </button>
          </div>

          {/* Transformation Pipeline */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="p-4 bg-white rounded-xl border border-slate-200 text-center w-40 shadow-xs">
              <span className="text-[10px] text-slate-400 font-sans uppercase">Product ID Key</span>
              <p className="text-base font-extrabold text-slate-900 mt-1">{hashDetails.key}</p>
            </div>

            <ArrowRight className="w-5 h-5 text-slate-400 shrink-0 rotate-90 md:rotate-0" />

            <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 text-center w-44 shadow-xs">
              <span className="text-[10px] text-sky-600 font-sans uppercase">Calculated Hash</span>
              <p className="text-xs font-bold text-sky-950 mt-1 truncate">{hashDetails.hash}</p>
            </div>

            <ArrowRight className="w-5 h-5 text-slate-400 shrink-0 rotate-90 md:rotate-0" />

            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 text-center w-40 shadow-xs">
              <span className="text-[10px] text-indigo-600 font-sans uppercase">Bucket Index</span>
              <p className="text-base font-extrabold text-indigo-950 mt-1">Bucket #{hashDetails.bucket}</p>
            </div>

            <ArrowRight className="w-5 h-5 text-slate-400 shrink-0 rotate-90 md:rotate-0" />

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center w-48 shadow-xs">
              <span className="text-[10px] text-emerald-600 font-sans uppercase">Target Product</span>
              <p className="text-xs font-bold text-emerald-950 mt-1">{hashDetails.match.name}</p>
              <p className="text-[11px] text-emerald-700">{hashDetails.match.price}</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. QUEUE (FIFO) VISUALIZER */}
      {activeTab === 'QUEUE' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700">
                Enqueue: O(1) | Dequeue: O(1) | ArrayDeque
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 mt-2">
                First-In, First-Out (FIFO) Shipment Pipeline
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleEnqueue}
                className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Enqueue Demo Item
              </button>
              <button
                onClick={handleDequeue}
                disabled={fifoQueue.length === 0}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 disabled:opacity-30"
              >
                Dequeue (Poll Front)
              </button>
            </div>
          </div>

          <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 overflow-x-auto">
            <span className="font-mono text-[10px] font-extrabold px-2 py-1 rounded bg-emerald-600 text-white">
              FRONT
            </span>

            {fifoQueue.map((id, idx) => (
              <React.Fragment key={id}>
                <div
                  className={`p-4 rounded-xl border shrink-0 font-mono text-center font-bold text-xs ${
                    idx === 0
                      ? 'bg-sky-50 border-sky-400 text-sky-900 ring-4 ring-sky-500/10'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <p>{id}</p>
                  <span className="text-[10px] text-slate-400 font-sans font-normal">#{idx + 1}</span>
                </div>
                {idx < fifoQueue.length - 1 && <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />}
              </React.Fragment>
            ))}

            <span className="font-mono text-[10px] font-extrabold px-2 py-1 rounded bg-slate-800 text-white">
              REAR
            </span>
          </div>
        </div>
      )}

      {/* 4. PRIORITY QUEUE VISUALIZER */}
      {activeTab === 'PRIORITY_QUEUE' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-rose-50 text-rose-700">
              Binary Heap | Priority Comparator Ordering
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 mt-2">
              Urgency Heap Ordering (HIGH &gt; MEDIUM &gt; LOW)
            </h2>
            <p className="text-xs text-slate-500">
              High priority shipments bubble to the root of the heap regardless of when lower priority shipments were added.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
              <span className="text-xs font-bold text-rose-800">Priority Level 1 (HIGH)</span>
              <p className="text-xs text-rose-700">SH104, SH108 (Dispatched first)</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <span className="text-xs font-bold text-amber-800">Priority Level 2 (MEDIUM)</span>
              <p className="text-xs text-amber-700">SH105</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <span className="text-xs font-bold text-emerald-800">Priority Level 3 (LOW)</span>
              <p className="text-xs text-emerald-700">SH106</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
