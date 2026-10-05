import React from 'react';
import { Check, Clock, Truck, PackageCheck, AlertCircle } from 'lucide-react';

export default function ShipmentTimeline({ status }) {
  const steps = [
    { key: 'CREATED', label: 'Created', icon: Clock },
    { key: 'WAITING', label: 'Queued', icon: Clock },
    { key: 'PROCESSING', label: 'Processing', icon: PackageCheck },
    { key: 'SHIPPED', label: 'Shipped', icon: Truck },
    { key: 'COMPLETED', label: 'Completed', icon: Check },
  ];

  const getStatusIndex = (currentStatus) => {
    switch (currentStatus) {
      case 'CREATED': return 0;
      case 'WAITING': return 1;
      case 'PROCESSING': return 2;
      case 'SHIPPED': return 3;
      case 'COMPLETED': return 4;
      default: return 1;
    }
  };

  const currentIndex = getStatusIndex(status);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Progress connecting line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-sky-600 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isDone
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : isCurrent
                    ? 'bg-white border-2 border-sky-600 text-sky-600 ring-4 ring-sky-100 shadow-md scale-110'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={`mt-2 text-xs font-semibold whitespace-nowrap ${
                  isCurrent ? 'text-sky-700 font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
