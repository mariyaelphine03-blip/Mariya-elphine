import React, { useState } from 'react';
import {
  Play,
  Database,
  Cpu,
  Sparkles,
  Layers,
  UploadCloud,
  CheckCircle2,
  Sliders,
  TrendingUp,
  Table,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Campaign } from '../types/campaign';
import { INBUILT_DATASETS } from '../data/inbuiltDatasets';
import { useAppTheme } from '../context/ThemeContext';

interface DatasetPreAnalysisCardProps {
  campaigns: Campaign[];
  currentDatasetId: string;
  onSelectDatasetPreset?: (presetId: string) => void;
  onOpenUploadModal?: () => void;
  onRunAnalysis: (testRatio?: number, seed?: number) => void;
  isAnalyzing?: boolean;
}

export const DatasetPreAnalysisCard: React.FC<DatasetPreAnalysisCardProps> = ({
  campaigns,
  currentDatasetId,
  onSelectDatasetPreset,
  onOpenUploadModal,
  onRunAnalysis,
  isAnalyzing = false
}) => {
  const { styles, isDark } = useAppTheme();
  const [testSplit, setTestSplit] = useState<number>(20);
  const [randomSeed, setRandomSeed] = useState<number>(42);
  const [showDataPreview, setShowDataPreview] = useState<boolean>(true);

  const activeDatasetObj = INBUILT_DATASETS.find(d => d.id === currentDatasetId);
  const isCustom = currentDatasetId === 'custom';

  const datasetName = isCustom
    ? 'Custom Uploaded CSV Dataset'
    : activeDatasetObj?.name || 'Inbuilt Marketing Benchmark';

  const datasetDesc = isCustom
    ? `User-supplied marketing dataset containing ${campaigns.length} rows ready for ingestion, statistical aggregation, and regression modeling.`
    : activeDatasetObj?.description || 'Curated cross-channel marketing benchmark dataset.';

  // Quick stats
  const totalSpend = campaigns.reduce((acc, c) => acc + c.ad_spend, 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0);
  const channels = Array.from(new Set(campaigns.map(c => c.channel)));
  const audiences = Array.from(new Set(campaigns.map(c => c.audience_type)));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Action Banner */}
      <div className={`relative overflow-hidden rounded-2xl border ${styles.cardBorder} ${styles.cardBg} p-6 lg:p-8 shadow-xl`}>
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Top Status & Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                Dataset Ingested • Analysis Pending (Click Run)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded-full border border-slate-700 bg-slate-800/80 text-slate-300">
                {campaigns.length} Campaigns Loaded
              </span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full border border-cyan-800 bg-cyan-950/80 text-cyan-400">
                15 Dimensions Ready
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="max-w-3xl">
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
                {datasetName}
              </span>
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              {datasetDesc} To generate exploratory visualizations, compute Pearson correlation matrices, train Random Forest & Linear Regression models, and predict ROAS/Revenue, click the <strong className="text-cyan-400">Run Analysis</strong> button below.
            </p>
          </div>

          {/* Key Ingested Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className={`p-3.5 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-850/60' : 'border-slate-200 bg-slate-50'}`}>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Total Campaigns</div>
              <div className="text-xl font-extrabold mt-1 text-slate-200">{campaigns.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Rows in dataset</div>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-850/60' : 'border-slate-200 bg-slate-50'}`}>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Total Ad Spend</div>
              <div className="text-xl font-extrabold mt-1 text-cyan-400">
                ${totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Across all campaigns</div>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-850/60' : 'border-slate-200 bg-slate-50'}`}>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Channels Detected</div>
              <div className="text-xl font-extrabold mt-1 text-indigo-400">{channels.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate">{channels.join(', ')}</div>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-850/60' : 'border-slate-200 bg-slate-50'}`}>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Target Objective</div>
              <div className="text-xl font-extrabold mt-1 text-emerald-400">Revenue & ROAS</div>
              <div className="text-[10px] text-slate-500 mt-0.5">ML Target Variables</div>
            </div>
          </div>

          {/* Parameters & Run Action Bar */}
          <div className={`p-4 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-100/90'} flex flex-col md:flex-row items-center justify-between gap-4`}>
            {/* Split & Seed Controls */}
            <div className="flex flex-wrap items-center gap-4 text-xs w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-cyan-400" />
                <span className="font-semibold text-slate-300">Train/Test Split:</span>
                <select
                  value={testSplit}
                  onChange={(e) => setTestSplit(Number(e.target.value))}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value={20}>80% Train / 20% Test (Standard)</option>
                  <option value={25}>75% Train / 25% Test</option>
                  <option value={30}>70% Train / 30% Test</option>
                  <option value={15}>85% Train / 15% Test</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300">Seed:</span>
                <input
                  type="number"
                  value={randomSeed}
                  onChange={(e) => setRandomSeed(Number(e.target.value))}
                  className="w-16 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-mono text-slate-200 text-center focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* THE BIG RUN BUTTONS (ஓவர் ஆல் ப்ராஜெக்ட் ரன் பட்டன்) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto justify-end">
              {onSelectDatasetPreset && currentDatasetId !== 'all_projects' && (
                <button
                  onClick={() => {
                    onSelectDatasetPreset('all_projects');
                    setTimeout(() => {
                      onRunAnalysis(testSplit / 100, randomSeed);
                    }, 100);
                  }}
                  disabled={isAnalyzing}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 transition-all cursor-pointer disabled:opacity-50"
                  title="Combine all 4 industry projects (180 campaigns) and execute overall multi-project ML analysis"
                >
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Run ALL 4 Projects Combined (180 Camps)</span>
                </button>
              )}

              <button
                onClick={() => onRunAnalysis(testSplit / 100, randomSeed)}
                disabled={isAnalyzing}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-sm font-black text-white bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-500 active:scale-95 transition-all shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-400/50 cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-white" />
                    <span>Executing Overall ML Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-white text-white" />
                    <span>▶ Run Overall Project Analysis & Predictions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inbuilt Dataset Picker Cards (Quick-select all 4 inbuilt datasets or upload CSV) */}
      <div className={`p-5 rounded-2xl border ${styles.cardBorder} ${styles.cardBg} shadow-md`}>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold tracking-tight">Available Inbuilt Datasets (4 Ready to Test)</h3>
          </div>
          {onOpenUploadModal && (
            <button
              onClick={onOpenUploadModal}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 cursor-pointer"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Or Upload Custom CSV</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {INBUILT_DATASETS.map((dataset) => {
            const isSelected = currentDatasetId === dataset.id;
            return (
              <button
                key={dataset.id}
                onClick={() => onSelectDatasetPreset && onSelectDatasetPreset(dataset.id)}
                className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'border-cyan-500/80 bg-cyan-950/30 text-white ring-1 ring-cyan-500/50 shadow-md shadow-cyan-950/20'
                    : isDark
                    ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 hover:border-slate-700 text-slate-300'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-400">
                    {dataset.badge}
                  </span>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400">
                      <CheckCircle2 className="h-3 w-3" /> Selected
                    </span>
                  )}
                </div>
                <div className="font-bold text-xs line-clamp-1">{dataset.name}</div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                  {dataset.description}
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{dataset.campaigns.length} campaigns</span>
                  <span className="text-cyan-400 font-bold">{dataset.averageRoas}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Raw Data Preview Table (Before Running Analysis) */}
      <div className={`p-5 rounded-2xl border ${styles.cardBorder} ${styles.cardBg} shadow-md`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Table className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold tracking-tight">Dataset Raw Rows Preview (First 8 of {campaigns.length})</h3>
          </div>
          <button
            onClick={() => setShowDataPreview(!showDataPreview)}
            className="text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
          >
            {showDataPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>

        {showDataPreview && (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-850/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Campaign Name</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Audience</th>
                  <th className="py-2.5 px-3 text-right">Ad Spend</th>
                  <th className="py-2.5 px-3 text-right">Clicks</th>
                  <th className="py-2.5 px-3 text-right">CTR</th>
                  <th className="py-2.5 px-3 text-right">CPC</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                  <th className="py-2.5 px-3 text-right">ROAS</th>
                  <th className="py-2.5 px-3 text-center">Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {campaigns.slice(0, 8).map((c) => (
                  <tr key={c.campaign_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3 text-slate-400 font-bold">{c.campaign_id}</td>
                    <td className="py-2 px-3 font-sans font-medium text-slate-200 truncate max-w-[160px]">
                      {c.campaign_name}
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-300">{c.channel}</td>
                    <td className="py-2 px-3 font-sans text-slate-400">{c.audience_type}</td>
                    <td className="py-2 px-3 text-right text-slate-200">
                      ${c.ad_spend.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300">
                      {c.clicks.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-cyan-400">{c.ctr.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-right text-slate-300">${c.cpc.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-bold">
                      ${c.revenue.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-200">
                      {c.roas.toFixed(2)}x
                    </td>
                    <td className="py-2 px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.performance_tier === 'High'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : c.performance_tier === 'Medium'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {c.performance_tier || 'Medium'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
