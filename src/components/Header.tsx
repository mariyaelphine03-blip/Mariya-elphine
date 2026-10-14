import React, { useState, useRef, useEffect } from 'react';
import { Download, RefreshCw, UploadCloud, Palette, Check, Database, Sparkles, ChevronDown, Play, CheckCircle2 } from 'lucide-react';
import { useAppTheme, AppTheme } from '../context/ThemeContext';
import { INBUILT_DATASETS } from '../data/inbuiltDatasets';

interface HeaderProps {
  campaignCount: number;
  totalSpend: number;
  totalRevenue: number;
  overallRoas: number;
  currentDatasetId: string;
  hasRunAnalysis?: boolean;
  isAnalyzing?: boolean;
  onRunAnalysis?: () => void;
  onSelectDatasetPreset: (presetId: string) => void;
  onResetBenchmark: () => void;
  onExportCsv: () => void;
  onOpenUploadModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  campaignCount,
  totalSpend,
  totalRevenue,
  overallRoas,
  currentDatasetId,
  hasRunAnalysis = false,
  isAnalyzing = false,
  onRunAnalysis,
  onSelectDatasetPreset,
  onResetBenchmark,
  onExportCsv,
  onOpenUploadModal,
}) => {
  const { theme, setTheme, styles, isDark } = useAppTheme();
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [datasetMenuOpen, setDatasetMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const datasetMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
      if (datasetMenuRef.current && !datasetMenuRef.current.contains(e.target as Node)) {
        setDatasetMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeOptions: { id: AppTheme; name: string; color: string; desc: string }[] = [
    { id: 'dark', name: 'Midnight Cyan', color: '#06b6d4', desc: 'Cyberpunk deep dark' },
    { id: 'emerald', name: 'Emerald Profit', color: '#10b981', desc: 'High-growth fintech green' },
    { id: 'ocean', name: 'Royal Ocean', color: '#3b82f6', desc: 'Sapphire blue executive' },
    { id: 'sunset', name: 'Sunset Amber & Coral', color: '#f97316', desc: 'Warm radiant energy' },
    { id: 'violet', name: 'Electric Violet', color: '#a855f7', desc: 'Neon purple futuristic' },
    { id: 'light', name: 'Executive Slate', color: '#4f46e5', desc: 'Clean bright daylight' },
  ];

  const currentDataset = INBUILT_DATASETS.find(d => d.id === currentDatasetId);
  const isCustomUploaded = currentDatasetId === 'custom';

  return (
    <header className={`border-b ${styles.headerBorder} ${styles.headerBg} px-5 py-3.5 transition-colors sticky top-0 z-40 backdrop-blur-md`}>
      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
        {/* Brand & Multi-line Title as requested:
            Digital Marketing
            Campaign Performance
            Prediction
        */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-700/80 shadow-md">
            <span className="text-xl">📊</span>
          </div>

          <div className="flex flex-col select-none">
            {/* Line 1 */}
            <span className="text-[12px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
              Digital Marketing
            </span>
            {/* Line 2 */}
            <span className={`text-base font-extrabold tracking-tight leading-none my-0.5 ${styles.textMain}`}>
              Campaign Performance
            </span>
            {/* Line 3 */}
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black tracking-wide ${styles.accentText} uppercase`}>
                Prediction
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full border border-slate-700/60 bg-slate-800/80 text-slate-300 font-mono">
                ML • AI Platform
              </span>
            </div>
          </div>
        </div>

        {/* Global Controls: Dataset Switcher (4 Inbuilt + Manual), Color/Theme Picker, Universal Upload, and Telemetry */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Inbuilt Dataset Switcher Dropdown (4 Inbuilt Datasets + Manual CSV Upload) */}
          <div className="relative" ref={datasetMenuRef}>
            <button
              onClick={() => setDatasetMenuOpen(!datasetMenuOpen)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                isDark
                  ? 'border-slate-700 bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
                  : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
              }`}
              title="Switch between 4 Inbuilt Datasets or Manual Upload"
            >
              <Database className="h-3.5 w-3.5 text-cyan-400" />
              <div className="flex items-center gap-1.5 text-left">
                <span className="text-[11px] text-slate-400 hidden sm:inline">Dataset:</span>
                <span className="font-bold text-xs truncate max-w-[130px] sm:max-w-[160px]">
                  {isCustomUploaded ? 'Custom Uploaded CSV' : currentDataset?.name || 'Inbuilt Dataset'}
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                    hasRunAnalysis
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                      : 'bg-amber-950/80 text-amber-300 border-amber-800'
                  }`}
                >
                  {hasRunAnalysis ? '✓ Analyzed' : 'Unanalyzed'}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
            </button>

            {datasetMenuOpen && (
              <div
                className={`absolute right-0 mt-2 w-80 rounded-xl border p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700/80 text-slate-100 shadow-cyan-950/20'
                    : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/40'
                }`}
              >
                <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800 dark:border-slate-800 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Database className="h-3 w-3 text-cyan-400" />
                    Inbuilt Datasets (4 Ready)
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    4 Inbuilt
                  </span>
                </div>

                <div className="space-y-1.5">
                  {INBUILT_DATASETS.map((preset, idx) => {
                    const isSelected = currentDatasetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => {
                          onSelectDatasetPreset(preset.id);
                          setDatasetMenuOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg transition-all border ${
                          isSelected
                            ? isDark
                              ? 'bg-slate-800/90 border-cyan-500/60 text-white'
                              : 'bg-indigo-50/80 border-indigo-400 text-slate-900'
                            : isDark
                            ? 'border-transparent hover:bg-slate-800/50 hover:border-slate-700/60 text-slate-300'
                            : 'border-transparent hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-cyan-400">#{idx + 1}</span>
                            <span className="text-xs font-semibold truncate">{preset.name}</span>
                          </div>
                          {isSelected && <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 leading-snug">
                          {preset.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-slate-400">
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700">
                            {preset.badge}
                          </span>
                          <span>ROAS: {preset.averageRoas}</span>
                          <span className="truncate">Top: {preset.topChannel}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Option to upload manual CSV right inside dataset picker */}
                <div className="mt-2.5 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setDatasetMenuOpen(false);
                      onOpenUploadModal();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all shadow-sm cursor-pointer"
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>Upload Manual CSV Dataset</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dedicated RUN ANALYSIS BUTTON (Crucial for "Ennaku dataset kuduthu rin button click panna tha analysis aaganum anda inbuilt dataset ...") */}
          {onRunAnalysis && (
            <div>
              {!hasRunAnalysis ? (
                <button
                  onClick={onRunAnalysis}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-black text-white bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-md shadow-cyan-500/30 ring-2 ring-cyan-400/50 cursor-pointer animate-pulse transition-all active:scale-95"
                  title="Click to run ML analysis & prediction on selected dataset"
                >
                  <Play className="h-3.5 w-3.5 fill-white text-white" />
                  <span>▶ Run Analysis</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-200 border border-cyan-700 font-bold">
                    Ready
                  </span>
                </button>
              ) : isAnalyzing ? (
                <button
                  disabled
                  className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold text-white bg-slate-800 border border-cyan-500/60 shadow-md cursor-wait"
                >
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                  <span>Analyzing...</span>
                </button>
              ) : (
                <button
                  onClick={onRunAnalysis}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
                  title="Analysis complete for this dataset. Click to re-run models."
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Analyzed</span>
                  <span className="text-[9px] text-emerald-400/80 font-mono font-normal">(Re-run)</span>
                </button>
              )}
            </div>
          )}

          {/* Color / Theme Selector Dropdown (Prominent for "Colour change panni kudu") */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                isDark
                  ? 'border-slate-700 bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
                  : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
              }`}
              title="Change Color Theme (6 Vibrant Colors)"
            >
              <Palette className="h-3.5 w-3.5" style={{ color: styles.dotColor }} />
              <span className="hidden sm:inline text-slate-400">Theme:</span>
              <span className="inline-block w-2.5 h-2.5 rounded-full ring-2 ring-white/20" style={{ backgroundColor: styles.dotColor }} />
              <span className="font-bold text-xs">{styles.name.split(' ')[0]}</span>
              <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
            </button>

            {themeMenuOpen && (
              <div
                className={`absolute right-0 mt-2 w-56 rounded-xl border p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700/80 text-slate-100'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Palette className="h-3 w-3 text-cyan-400" />
                  Select Color Theme (6 Options)
                </div>
                <div className="space-y-1 mt-1">
                  {themeOptions.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setTheme(opt.id);
                        setThemeMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        theme === opt.id
                          ? isDark
                            ? 'bg-slate-800 text-white font-bold ring-1 ring-slate-600'
                            : 'bg-slate-100 text-slate-900 font-bold ring-1 ring-slate-300'
                          : 'hover:bg-slate-800/60 dark:hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 ring-1 ring-black/40 shadow-xs"
                          style={{ backgroundColor: opt.color }}
                        />
                        <div className="text-left">
                          <div className="leading-tight">{opt.name}</div>
                          <div className="text-[10px] text-slate-400">{opt.desc}</div>
                        </div>
                      </div>
                      {theme === opt.id && <Check className="h-3.5 w-3.5 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Universal CSV Upload Button (Available on EVERY screen as requested: "CSV file upload pandra option Venum ellam filelum") */}
          <button
            onClick={onOpenUploadModal}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all shadow-md cursor-pointer ${styles.accentBtn}`}
            title="Upload CSV / Excel data directly from computer"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Upload CSV</span>
          </button>

          {/* Reset Benchmark Button */}
          <button
            onClick={onResetBenchmark}
            className={`hidden md:inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-800 bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            title="Reset dataset back to defaults"
          >
            <RefreshCw className="h-3.5 w-3.5 opacity-60" />
            <span>Reset</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={onExportCsv}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-800 bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            title="Export current active dataset to CSV"
          >
            <Download className="h-3.5 w-3.5 opacity-60" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
};
