import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading warehouse data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-sky-100 border-t-sky-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-sky-600 rounded-full"></div>
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">{message}</p>
    </div>
  );
}
