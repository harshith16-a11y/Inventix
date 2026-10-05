import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '', showLabel = false }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2 rounded-xl transition-all duration-300 flex items-center gap-2 select-none group ${
        isDark
          ? 'bg-slate-800/90 text-amber-400 hover:bg-slate-800 hover:text-amber-300 border border-slate-700/80 shadow-2xs shadow-amber-400/5'
          : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80 shadow-2xs'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle dark/light theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Sun Icon */}
        <Sun
          className={`w-4 h-4 transition-all duration-500 absolute ${
            isDark
              ? 'rotate-90 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100 text-amber-500'
          }`}
        />
        {/* Moon Icon */}
        <Moon
          className={`w-4 h-4 transition-all duration-500 absolute ${
            isDark
              ? 'rotate-0 scale-100 opacity-100 text-amber-400'
              : '-rotate-90 scale-0 opacity-0'
          }`}
        />
      </div>

      {showLabel && (
        <span className="text-xs font-bold font-mono">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
}
