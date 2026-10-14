import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'dark' | 'emerald' | 'ocean' | 'sunset' | 'violet' | 'light';

export interface ThemeStyles {
  id: AppTheme;
  name: string;
  dotColor: string;
  appBg: string;
  cardBg: string;
  cardBorder: string;
  headerBg: string;
  headerBorder: string;
  sidebarBg: string;
  sidebarBorder: string;
  textMain: string;
  textMuted: string;
  accentBtn: string;
  accentText: string;
  highlightCard: string;
  badgeBg: string;
  gradientBadge: string;
  accentBorder: string;
}

export const THEME_CONFIGS: Record<AppTheme, ThemeStyles> = {
  dark: {
    id: 'dark',
    name: 'Midnight Cyan',
    dotColor: '#06b6d4',
    appBg: 'bg-slate-950',
    cardBg: 'bg-slate-900',
    cardBorder: 'border-slate-800',
    headerBg: 'bg-slate-900',
    headerBorder: 'border-slate-800',
    sidebarBg: 'bg-slate-900',
    sidebarBorder: 'border-slate-800',
    textMain: 'text-slate-100',
    textMuted: 'text-slate-400',
    accentBtn: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/30',
    accentText: 'text-cyan-400',
    highlightCard: 'bg-slate-950 border-cyan-800/50',
    badgeBg: 'bg-cyan-950/70 border border-cyan-800/60 text-cyan-300',
    gradientBadge: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30',
    accentBorder: 'border-cyan-500',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Profit',
    dotColor: '#10b981',
    appBg: 'bg-stone-950',
    cardBg: 'bg-stone-900',
    cardBorder: 'border-stone-800',
    headerBg: 'bg-stone-900',
    headerBorder: 'border-stone-800',
    sidebarBg: 'bg-stone-900',
    sidebarBorder: 'border-stone-800',
    textMain: 'text-stone-100',
    textMuted: 'text-stone-400',
    accentBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30',
    accentText: 'text-emerald-400',
    highlightCard: 'bg-stone-950 border-emerald-800/50',
    badgeBg: 'bg-emerald-950/70 border border-emerald-800/60 text-emerald-300',
    gradientBadge: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
    accentBorder: 'border-emerald-500',
  },
  ocean: {
    id: 'ocean',
    name: 'Royal Ocean',
    dotColor: '#3b82f6',
    appBg: 'bg-slate-950',
    cardBg: 'bg-slate-900',
    cardBorder: 'border-blue-900/40',
    headerBg: 'bg-slate-900',
    headerBorder: 'border-blue-900/40',
    sidebarBg: 'bg-slate-900',
    sidebarBorder: 'border-blue-900/40',
    textMain: 'text-slate-100',
    textMuted: 'text-slate-400',
    accentBtn: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30',
    accentText: 'text-blue-400',
    highlightCard: 'bg-slate-950 border-blue-700/50',
    badgeBg: 'bg-blue-950/70 border border-blue-800/60 text-blue-300',
    gradientBadge: 'from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30',
    accentBorder: 'border-blue-500',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Amber & Coral',
    dotColor: '#f97316',
    appBg: 'bg-zinc-950',
    cardBg: 'bg-zinc-900',
    cardBorder: 'border-zinc-800',
    headerBg: 'bg-zinc-900',
    headerBorder: 'border-zinc-800',
    sidebarBg: 'bg-zinc-900',
    sidebarBorder: 'border-zinc-800',
    textMain: 'text-zinc-100',
    textMuted: 'text-zinc-400',
    accentBtn: 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/30',
    accentText: 'text-orange-400',
    highlightCard: 'bg-zinc-950 border-orange-800/50',
    badgeBg: 'bg-orange-950/70 border border-orange-800/60 text-orange-300',
    gradientBadge: 'from-orange-500/20 to-rose-500/20 text-orange-300 border-orange-500/30',
    accentBorder: 'border-orange-500',
  },
  violet: {
    id: 'violet',
    name: 'Electric Violet',
    dotColor: '#a855f7',
    appBg: 'bg-neutral-950',
    cardBg: 'bg-neutral-900',
    cardBorder: 'border-neutral-800',
    headerBg: 'bg-neutral-900',
    headerBorder: 'border-neutral-800',
    sidebarBg: 'bg-neutral-900',
    sidebarBorder: 'border-neutral-800',
    textMain: 'text-neutral-100',
    textMuted: 'text-neutral-400',
    accentBtn: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/30',
    accentText: 'text-purple-400',
    highlightCard: 'bg-neutral-950 border-purple-800/50',
    badgeBg: 'bg-purple-950/70 border border-purple-800/60 text-purple-300',
    gradientBadge: 'from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30',
    accentBorder: 'border-purple-500',
  },
  light: {
    id: 'light',
    name: 'Executive Slate (Light)',
    dotColor: '#4f46e5',
    appBg: 'bg-slate-100',
    cardBg: 'bg-white',
    cardBorder: 'border-slate-200',
    headerBg: 'bg-white',
    headerBorder: 'border-slate-200',
    sidebarBg: 'bg-white',
    sidebarBorder: 'border-slate-200',
    textMain: 'text-slate-900',
    textMuted: 'text-slate-500',
    accentBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200',
    accentText: 'text-indigo-600',
    highlightCard: 'bg-slate-50 border-indigo-200',
    badgeBg: 'bg-indigo-50 border border-indigo-200 text-indigo-700',
    gradientBadge: 'from-indigo-100 to-blue-100 text-indigo-800 border-indigo-200',
    accentBorder: 'border-indigo-600',
  }
};

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  styles: ThemeStyles;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  styles: THEME_CONFIGS.dark,
  isDark: true,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('app_marketing_theme');
    return (saved as AppTheme) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('app_marketing_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  const styles = THEME_CONFIGS[theme] || THEME_CONFIGS.dark;
  const isDark = theme !== 'light';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, styles, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
