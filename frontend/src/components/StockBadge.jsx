import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export default function StockBadge({ status, quantity, threshold }) {
  if (status === 'OUT_OF_STOCK' || quantity === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle className="w-3.5 h-3.5" />
        Out of Stock (0)
      </span>
    );
  }

  if (status === 'LOW_STOCK' || (threshold != null && quantity < threshold)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5" />
        Low Stock ({quantity} left)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle2 className="w-3.5 h-3.5" />
      In Stock ({quantity})
    </span>
  );
}
