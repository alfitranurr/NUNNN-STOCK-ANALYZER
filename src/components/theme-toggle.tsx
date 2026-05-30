'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse border border-slate-300/20" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2.5 rounded-xl bg-white/30 dark:bg-black/20 hover:bg-white/50 dark:hover:bg-black/40 border border-white/40 dark:border-white/10 text-brand-purple dark:text-brand-purple hover:scale-105 active:scale-95 transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all duration-300" />
      ) : (
        <Moon className="h-5 w-5 text-indigo-600 drop-shadow-[0_0_8px_rgba(99,102,241,0.3)] transition-all duration-300" />
      )}
    </button>
  );
}
