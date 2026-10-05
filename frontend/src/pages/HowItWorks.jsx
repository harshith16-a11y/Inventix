import React from 'react';
import {
  Layers,
  Cpu,
  Boxes,
  Truck,
  Flame,
  AlertTriangle,
  ArrowDown,
  Database,
  Search,
  CheckCircle2
} from 'lucide-react';

export default function HowItWorks() {
  const dsaComponents = [
    {
      name: 'HASHMAP',
      icon: Search,
      role: 'Product ID Lookup & Stock Access',
      complexity: 'Average O(1) Time | O(n) Space',
      color: 'sky',
      explanation:
        'Used to instantly locate, update, and validate products using unique Product IDs (e.g., P101, P214). Avoids slow sequential list scanning by hashing the Product ID directly to internal buckets.',
      backendClass: 'com.smartwarehouse.dsa.WarehouseHashMap.java',
    },
    {
      name: 'MERGE SORT',
      icon: Cpu,
      role: 'Multi-Field Inventory Ordering',
      complexity: 'Guaranteed O(n log n) Time | O(n) Space',
      color: 'indigo',
      explanation:
        'A divide-and-conquer sorting algorithm implemented manually without built-in Java sorting utilities. It recursively halves the catalog and merges sorted sub-lists by Product ID, Name, Price, or Quantity.',
      backendClass: 'com.smartwarehouse.dsa.MergeSort.java',
    },
    {
      name: 'NORMAL QUEUE (FIFO)',
      icon: Truck,
      role: 'Standard Shipment Processing',
      complexity: 'O(1) Enqueue & Dequeue | O(k) Space',
      color: 'blue',
      explanation:
        'Maintains First-In, First-Out order for standard warehouse packages. The earliest submitted order is placed at the REAR and is guaranteed to be processed first at the FRONT of the queue.',
      backendClass: 'com.smartwarehouse.dsa.NormalShipmentQueue.java (ArrayDeque)',
    },
    {
      name: 'PRIORITY QUEUE (HEAP)',
      icon: Flame,
      role: 'Urgent Dispatch Order Optimization',
      complexity: 'O(log n) Enqueue & Dequeue | O(1) Peek',
      color: 'rose',
      explanation:
        'Binary min/max heap structure that arranges shipments by urgency level: HIGH (1), MEDIUM (2), LOW (3). Orders with identical priority use creation timestamps as a tie-breaker.',
      backendClass: 'com.smartwarehouse.dsa.PriorityShipmentQueue.java (PriorityQueue)',
    },
    {
      name: 'LOW-STOCK MONITORING',
      icon: AlertTriangle,
      role: 'Real-Time Inventory Safety Decisions',
      complexity: 'O(1) Evaluation Rule',
      color: 'amber',
      explanation:
        'Evaluates "IF quantity < threshold THEN trigger low stock alert" immediately after every shipment processing, stock edit, or replenishment action, preventing unexpected inventory depletion.',
      backendClass: 'com.smartwarehouse.service.ProductService.java & InventoryService.java',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
          Faculty Presentation Review 3
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          How DSA Powers the Smart Warehouse
        </h1>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Detailed academic mapping explaining the exact role of core Data Structures & Algorithms
          operating in the Java backend.
        </p>
      </div>

      {/* Visual System Architecture Diagram */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          Layered System Architecture Pipeline
        </h2>

        <div className="flex flex-col items-center space-y-3 font-mono text-xs">
          {/* Level 1 */}
          <div className="w-full max-w-xl p-3.5 bg-slate-900 text-white rounded-2xl text-center shadow-md">
            <p className="font-bold">USER & ADMIN INTERACTION LAYER</p>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              React + Vite + Tailwind UI (Catalog, Multi-Step Cart, Queues, Live Dashboard)
            </p>
          </div>

          <ArrowDown className="w-4 h-4 text-slate-400" />

          {/* Level 2 */}
          <div className="w-full max-w-xl p-3.5 bg-sky-50 border-2 border-sky-300 text-sky-950 rounded-2xl text-center shadow-xs">
            <p className="font-bold">APPLICATION / REST API LAYER</p>
            <p className="text-[11px] text-sky-700 font-sans mt-0.5">
              Spring Boot 3 Web, Spring Security (JWT + BCrypt), Controllers & Transaction Boundaries
            </p>
          </div>

          <ArrowDown className="w-4 h-4 text-slate-400" />

          {/* Level 3: DSA Core */}
          <div className="w-full max-w-xl p-4 bg-gradient-to-r from-indigo-50 via-sky-50 to-purple-50 border-2 border-indigo-400 text-indigo-950 rounded-2xl text-center shadow-sm">
            <p className="font-extrabold text-indigo-700">CORE DSA PROCESSING LAYER (IN-MEMORY)</p>
            <div className="grid grid-cols-2 gap-2 mt-2 font-sans text-xs">
              <div className="p-2 bg-white rounded-xl border border-indigo-100 text-left">
                <strong>WarehouseHashMap</strong>: O(1) Search & Stock
              </div>
              <div className="p-2 bg-white rounded-xl border border-indigo-100 text-left">
                <strong>MergeSort</strong>: O(n log n) Recursive Sort
              </div>
              <div className="p-2 bg-white rounded-xl border border-indigo-100 text-left">
                <strong>ArrayDeque FIFO</strong>: Normal Queue
              </div>
              <div className="p-2 bg-white rounded-xl border border-indigo-100 text-left">
                <strong>PriorityQueue (Heap)</strong>: Urgent Queue
              </div>
            </div>
          </div>

          <ArrowDown className="w-4 h-4 text-slate-400" />

          {/* Level 4 */}
          <div className="w-full max-w-xl p-3.5 bg-slate-100 border border-slate-300 text-slate-800 rounded-2xl text-center shadow-xs">
            <p className="font-bold">PERSISTENCE & STORAGE LAYER</p>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              Spring Data JPA / Hibernate on H2 Database (Compatible with MySQL)
            </p>
          </div>
        </div>
      </div>

      {/* DSA Component Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dsaComponents.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-700">
                      <Icon className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">{item.name}</h3>
                      <p className="text-xs text-slate-400 font-medium">{item.role}</p>
                    </div>
                  </div>
                </div>

                <div className="font-mono text-[11px] font-bold px-3 py-1 rounded-lg bg-slate-100 text-slate-700 inline-block">
                  {item.complexity}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                  {item.explanation}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 font-mono text-[10px] text-slate-400 flex items-center justify-between">
                <span>Class:</span>
                <span className="font-semibold text-slate-700">{item.backendClass}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
