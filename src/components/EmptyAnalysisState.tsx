import React from 'react';
import {
  Play,
  Database,
  Cpu,
  Sparkles,
  BarChart3,
  Layers,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  Lock,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { INBUILT_DATASETS } from '../data/inbuiltDatasets';
import { useAppTheme } from '../context/ThemeContext';

interface EmptyAnalysisStateProps {
  moduleTitle: string;
  moduleSubtitle?: string;
  moduleIcon?: 'chart' | 'cpu' | 'predict' | 'target' | 'bulb' | 'table';
  datasetDisplayName: string;
  currentDatasetId?: string;
  campaignCount: number;
  onRunAnalysis: () => void;
  isAnalyzing?: boolean;
  onOpenUploadModal?: () => void;
  onSelectDatasetPreset?: (presetId: string) => void;
}

export const EmptyAnalysisState: React.FC<EmptyAnalysisStateProps> = ({
  moduleTitle,
  moduleSubtitle,
  moduleIcon = 'chart',
  datasetDisplayName,
  currentDatasetId,
  campaignCount,
  onRunAnalysis,
  isAnalyzing = false,
  onOpenUploadModal,
  onSelectDatasetPreset,
}) => {
  const { styles } = useAppTheme();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner indicating output is locked until analysis is executed */}
      <div className={`relative overflow-hidden rounded-2xl border ${styles.cardBorder} ${styles.cardBg} p-8 lg:p-10 shadow-xl text-center flex flex-col items-center justify-center min-h-[440px]`}>
        {/* Ambient background glows */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-semibold mb-6 shadow-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <Lock className="h-3 w-3" />
            <span>Output Empty • Analysis Pending</span>
          </div>

          {/* Central Visual Icon */}
          <div className="relative mb-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              {moduleIcon === 'predict' && <Cpu className="h-10 w-10 text-cyan-400" />}
              {moduleIcon === 'chart' && <BarChart3 className="h-10 w-10 text-cyan-400" />}
              {moduleIcon === 'target' && <Layers className="h-10 w-10 text-indigo-400" />}
              {moduleIcon === 'bulb' && <Sparkles className="h-10 w-10 text-amber-400" />}
              {moduleIcon === 'table' && <FileSpreadsheet className="h-10 w-10 text-emerald-400" />}
              {moduleIcon === 'cpu' && <Cpu className="h-10 w-10 text-cyan-400" />}
            </div>
            <div className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-md">
              !
            </div>
          </div>

          {/* Title and Descriptions */}
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
            {moduleTitle}
          </h2>
          <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-3">
            Output will be generated after dataset analysis
          </p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 max-w-md">
            {moduleSubtitle ||
              'This output page is currently empty. Run the machine learning analysis and training pipeline on your dataset to display full results, charts, and forecasts.'}
          </p>

          {/* Active Dataset Status Box */}
          <div className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/70 p-4 mb-6 text-left">
            <div className="flex items-center justify-between text-xs mb-2 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
              <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-cyan-500" />
                Active Dataset Loaded:
              </span>
              <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                {campaignCount} campaigns
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {datasetDisplayName}
              </span>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Analysis Not Run Yet
              </span>
            </div>
          </div>

          {/* Primary Action Button: RUN ANALYSIS */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onRunAnalysis}
              disabled={isAnalyzing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-black text-white bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400/40 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Processing & Training Models...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white text-white" />
                  <span>▶ Run Analysis on Dataset ({campaignCount} Rows)</span>
                </>
              )}
            </button>

            {onOpenUploadModal && (
              <button
                onClick={onOpenUploadModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <UploadCloud className="h-4 w-4 text-cyan-500" />
                <span>Upload New CSV</span>
              </button>
            )}
          </div>

          {/* Quick Dataset Switcher */}
          {onSelectDatasetPreset && (
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 w-full flex flex-col items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Or choose an inbuilt dataset before running:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {INBUILT_DATASETS.map((ds) => {
                  const isSelected = currentDatasetId === ds.id;
                  return (
                    <button
                      key={ds.id}
                      onClick={() => onSelectDatasetPreset(ds.id)}
                      className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400 font-bold'
                          : 'border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {ds.name} ({ds.campaigns.length})
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
