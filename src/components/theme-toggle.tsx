'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  variant?: 'compact' | 'full';
}

export function ThemeToggle({ variant = 'compact' }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    if (variant === 'compact') {
      return <div className="w-10 h-10 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse border border-slate-300/20" />;
    }
    return (
      <div className="w-full max-w-[220px] p-2.5">
        <div className="h-4 w-12 bg-slate-200/40 dark:bg-slate-800/40 rounded animate-pulse mb-3" />
        <div className="h-10 w-full bg-slate-200/40 dark:bg-slate-800/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  // 1. Compact Variant (Floating Icon Button)
  if (variant === 'compact') {
    return (
      <button
        onClick={toggleTheme}
        className="p-2.5 rounded-xl bg-white/30 dark:bg-black/20 hover:bg-white/50 dark:hover:bg-black/40 border border-white/40 dark:border-white/10 text-brand-purple hover:scale-105 active:scale-95 transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
        ) : (
          <Moon className="h-5 w-5 text-indigo-600 drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
        )}
      </button>
    );
  }

  // 2. Full Variant (Matches User Screenshot)
  return (
    <div className="w-full max-w-[220px] p-2 select-none">
      <span className="text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest block mb-2.5 font-sans">
        THEMING
      </span>
      <div 
        onClick={toggleTheme}
        className="flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-2.5">
          <Moon className={`h-5 w-5 shrink-0 transition-all duration-200 ${
            isDark 
              ? 'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]' 
              : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
          }`} />
          <span className="text-sm font-bold text-slate-700 dark:text-white transition-colors duration-200">
            Dark Mode
          </span>
        </div>

        {/* Custom Switch Capsule */}
        <div className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 flex items-center ${
          isDark ? 'bg-white' : 'bg-slate-700 dark:bg-slate-800'
        } ${isDark ? 'justify-end' : 'justify-start'}`}>
          <motion.div 
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`w-5 h-5 rounded-full shadow-md ${
              isDark ? 'bg-black' : 'bg-white'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
