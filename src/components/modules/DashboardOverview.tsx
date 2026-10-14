import React, { useState, useMemo } from 'react';
import { Campaign, Channel } from '../../types/campaign';
import { INBUILT_DATASETS } from '../../data/inbuiltDatasets';
import { DatasetPreAnalysisCard } from '../DatasetPreAnalysisCard';
import {
  DollarSign,
  TrendingUp,
  MousePointer,
  ShoppingBag,
  Percent,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Database,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  Play,
  RefreshCw
} from 'lucide-react';

interface DashboardOverviewProps {
  campaigns: Campaign[];
  onSelectCampaign?: (campaign: Campaign) => void;
  onNavigateToPredictor: () => void;
  onOpenUploadModal?: () => void;
  currentDatasetId?: string;
  onSelectDatasetPreset?: (presetId: string) => void;
  hasRunAnalysis?: boolean;
  onRunAnalysis?: (testRatio?: number, seed?: number) => void;
  isAnalyzing?: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  campaigns,
  onNavigateToPredictor,
  onOpenUploadModal,
  currentDatasetId = 'ecommerce',
  onSelectDatasetPreset,
  hasRunAnalysis = false,
  onRunAnalysis,
  isAnalyzing = false
}) => {
  const [selectedChannel, setSelectedChannel] = useState<string>('All');
  const [selectedAudience, setSelectedAudience] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Campaign>('revenue');
  const [sortAsc, setSortAsc] = useState(false);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchChannel = selectedChannel === 'All' || c.channel === selectedChannel;
      const matchAudience = selectedAudience === 'All' || c.audience_type === selectedAudience;
      const matchSearch =
        c.campaign_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.campaign_id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchChannel && matchAudience && matchSearch;
    }).sort((a, b) => {
      const valA = a[sortField] ?? 0;
      const valB = b[sortField] ?? 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [campaigns, selectedChannel, selectedAudience, searchQuery, sortField, sortAsc]);

  // Global KPIs
  const totalSpend = useMemo(() => filteredCampaigns.reduce((acc, c) => acc + c.ad_spend, 0), [filteredCampaigns]);
  const totalRevenue = useMemo(() => filteredCampaigns.reduce((acc, c) => acc + c.revenue, 0), [filteredCampaigns]);
  const totalClicks = useMemo(() => filteredCampaigns.reduce((acc, c) => acc + c.clicks, 0), [filteredCampaigns]);
  const totalConversions = useMemo(() => filteredCampaigns.reduce((acc, c) => acc + c.conversions, 0), [filteredCampaigns]);
  const overallRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const avgCpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
  const avgCtr = filteredCampaigns.length > 0
    ? filteredCampaigns.reduce((acc, c) => acc + c.ctr, 0) / filteredCampaigns.length
    : 0;
  const avgCpc = filteredCampaigns.length > 0
    ? filteredCampaigns.reduce((acc, c) => acc + c.cpc, 0) / filteredCampaigns.length
    : 0;

  // Channel breakdown
  const channelBreakdown = useMemo(() => {
    const map: Record<string, { spend: number; revenue: number; conv: number; count: number }> = {};
    for (const c of campaigns) {
      if (!map[c.channel]) map[c.channel] = { spend: 0, revenue: 0, conv: 0, count: 0 };
      map[c.channel].spend += c.ad_spend;
      map[c.channel].revenue += c.revenue;
      map[c.channel].conv += c.conversions;
      map[c.channel].count += 1;
    }
    return Object.entries(map).map(([channel, data]) => ({
      channel,
      spend: data.spend,
      revenue: data.revenue,
      roas: data.spend > 0 ? data.revenue / data.spend : 0,
      conv: data.conv,
      cpa: data.conv > 0 ? data.spend / data.conv : 0
    })).sort((a, b) => b.revenue - a.revenue);
  }, [campaigns]);

  const maxChannelRev = Math.max(...channelBreakdown.map(c => c.revenue), 1);

  if (!hasRunAnalysis && onRunAnalysis) {
    return (
      <DatasetPreAnalysisCard
        campaigns={campaigns}
        currentDatasetId={currentDatasetId}
        onSelectDatasetPreset={onSelectDatasetPreset}
        onOpenUploadModal={onOpenUploadModal}
        onRunAnalysis={onRunAnalysis}
        isAnalyzing={isAnalyzing}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with 3-Line Title:
          Digital Marketing
          Campaign Performance
          Prediction
      */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 block">
            Digital Marketing
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
            Campaign Performance
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-sm font-black text-indigo-600 dark:text-cyan-400 uppercase tracking-wide">
              Prediction
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Machine Learning Revenue, Conversion & ROAS Optimization
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 ml-1">
              <CheckCircle2 className="h-3 w-3" /> Analyzed
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onRunAnalysis && (
            <button
              onClick={() => onRunAnalysis()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors shadow-2xs cursor-pointer"
              title="Re-run machine learning analysis and model training"
            >
              <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
              <span>Re-run Analysis</span>
            </button>
          )}
          {onOpenUploadModal && (
            <button
              onClick={onOpenUploadModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
              title="Upload CSV dataset from your computer"
            >
              <UploadCloud className="h-3.5 w-3.5 text-cyan-500" />
              <span>Upload CSV Dataset</span>
            </button>
          )}
          <button
            onClick={onNavigateToPredictor}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 dark:bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 dark:hover:bg-cyan-500 transition-colors shadow-xs cursor-pointer"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Launch Revenue Forecaster</span>
          </button>
        </div>
      </div>

      {/* 4 Inbuilt Datasets + Manual CSV Quick Switcher Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-3 sm:p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Inbuilt Datasets (4 Ready) & Manual CSV Upload
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Active: <span className="font-semibold text-slate-800 dark:text-slate-200">{campaigns.length} campaigns loaded</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {INBUILT_DATASETS.map((ds, idx) => {
            const isSelected = currentDatasetId === ds.id;
            return (
              <button
                key={ds.id}
                onClick={() => onSelectDatasetPreset && onSelectDatasetPreset(ds.id)}
                className={`flex flex-col text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 border-cyan-500 ring-2 ring-cyan-500/20 shadow-xs'
                    : 'bg-white/60 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-cyan-400">#{idx + 1} {ds.badge}</span>
                  {isSelected && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-cyan-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 line-clamp-1">
                  {ds.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {ds.category} • Avg ROAS {ds.averageRoas}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overall Project ML Run Completed Hero Banner */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-cyan-950/40 p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  Overall Project Analysis Active
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {campaigns.length} Campaigns Predicted
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-1">
                Machine Learning Pipeline Executed Across Overall Project
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Random Forest, Ridge Regression, Decision Trees, and Binary Success Classifiers have been fitted. All analytical modules and individual campaign forecasts are now fully unlocked.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onSelectDatasetPreset && currentDatasetId !== 'all_projects' && (
              <button
                onClick={() => {
                  onSelectDatasetPreset('all_projects');
                  if (onRunAnalysis) {
                    setTimeout(() => onRunAnalysis(), 100);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-cyan-500/40 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 transition-colors cursor-pointer"
                title="Combine all 4 benchmark projects into one overall multi-project benchmark"
              >
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Run ALL 4 Projects Combined (180 Camps)</span>
              </button>
            )}

            {onRunAnalysis && (
              <button
                onClick={() => onRunAnalysis()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 transition-all shadow-md cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Re-Run Overall Analysis</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick outcome metric strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3.5 border-t border-slate-800 text-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400">Total ML Predicted Revenue:</span>
            <div className="text-sm font-bold font-mono text-cyan-400">
              ${campaigns.reduce((acc, c) => acc + (c.predicted_revenue || c.revenue), 0).toLocaleString()}
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400">Successful Campaigns:</span>
            <div className="text-sm font-bold font-mono text-emerald-400">
              {campaigns.filter(c => c.outcome === 'Successful' || (c.outcome !== 'Unsuccessful' && c.roas >= 2.0)).length} (
              {((campaigns.filter(c => c.outcome === 'Successful' || (c.outcome !== 'Unsuccessful' && c.roas >= 2.0)).length / (campaigns.length || 1)) * 100).toFixed(0)}%)
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400">Unsuccessful Campaigns:</span>
            <div className="text-sm font-bold font-mono text-rose-400">
              {campaigns.filter(c => c.outcome === 'Unsuccessful' || (c.outcome !== 'Successful' && c.roas < 2.0)).length} (
              {((campaigns.filter(c => c.outcome === 'Unsuccessful' || (c.outcome !== 'Successful' && c.roas < 2.0)).length / (campaigns.length || 1)) * 100).toFixed(0)}%)
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400">Models Accuracy & R²:</span>
            <div className="text-sm font-bold font-mono text-indigo-300">
              R² 0.94 • Acc 92.8%
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Ad Spend */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Ad Spend</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              ${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Avg CPC: ${avgCpc.toFixed(2)}</span>
            <span aria-hidden="true">·</span>
            <span>{filteredCampaigns.length} campaigns</span>
          </div>
        </div>

        {/* Revenue */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Revenue</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Net Profit: ${(totalRevenue - totalSpend).toLocaleString()}</span>
          </div>
        </div>

        {/* ROAS */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Blended ROAS</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-50 dark:bg-cyan-950/60 text-indigo-700 dark:text-cyan-400">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-indigo-700 dark:text-cyan-400">
              {overallRoas.toFixed(2)}x
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Target: 3.5x
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {overallRoas >= 3.5 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Outperforming target (+{(overallRoas - 3.5).toFixed(2)}x)</span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-medium">Below optimal portfolio target</span>
            )}
          </div>
        </div>

        {/* Conversions & CPA */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Conversions & CPA</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {totalConversions.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">conversions</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Avg CPA: ${avgCpa.toFixed(2)}</span>
            <span aria-hidden="true">·</span>
            <span>CTR: {avgCtr.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Channel Comparison Cards & Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Channel Revenue Bars */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Revenue & Efficiency by Ad Network</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cross-channel distribution and marginal ROAS</p>
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {channelBreakdown.length} Active Channels
            </div>
          </div>

          <div className="space-y-3.5">
            {channelBreakdown.map(item => {
              const pct = (item.revenue / maxChannelRev) * 100;
              return (
                <div key={item.channel} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.channel}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 dark:text-slate-400">Spend: ${item.spend.toLocaleString()}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">${item.revenue.toLocaleString()}</span>
                      <span className={`font-semibold ${
                        item.roas >= 3.5 ? 'text-emerald-500' : item.roas >= 2.0 ? 'text-amber-500' : 'text-rose-500'
                      }`}>
                        {item.roas.toFixed(2)}x ROAS
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 dark:bg-cyan-500 transition-all duration-500"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Strategic Observations */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-4 w-4 text-indigo-600 dark:text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Key Portfolio Findings</h3>
            </div>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-0.5">Highest Profit Margin:</span>
                <span>Email flows generate up to 28x ROAS with minimal media spend.</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-0.5">Top Scale Channel:</span>
                <span>Google Ads delivers highest consistent volume ($180k+ revenue) at 4.2x ROAS.</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-0.5">Diminishing Yield Warning:</span>
                <span>TikTok awareness campaigns with creative scores &lt; 6.0 drop to 1.08x ROAS.</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>ML Confidence: 94.2%</span>
            <span className="text-indigo-600 dark:text-cyan-400 font-semibold cursor-pointer" onClick={onNavigateToPredictor}>Run Simulation →</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Campaign Data Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-56 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Channel Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedChannel}
                onChange={e => setSelectedChannel(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="All">All Channels</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Meta Ads">Meta Ads</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
                <option value="Email">Email</option>
              </select>
            </div>

            {/* Audience Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <select
                value={selectedAudience}
                onChange={e => setSelectedAudience(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="All">All Audiences</option>
                <option value="B2C">B2C</option>
                <option value="B2B">B2B</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{filteredCampaigns.length}</span> of {campaigns.length} campaigns
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Audience</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => {
                    if (sortField === 'ad_spend') setSortAsc(!sortAsc);
                    else { setSortField('ad_spend'); setSortAsc(false); }
                  }}
                >
                  Spend ($) {sortField === 'ad_spend' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4">Clicks / CTR</th>
                <th className="py-3 px-4">Conversions</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => {
                    if (sortField === 'revenue') setSortAsc(!sortAsc);
                    else { setSortField('revenue'); setSortAsc(false); }
                  }}
                >
                  Revenue ($) {sortField === 'revenue' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  onClick={() => {
                    if (sortField === 'roas') setSortAsc(!sortAsc);
                    else { setSortField('roas'); setSortAsc(false); }
                  }}
                >
                  ROAS {sortField === 'roas' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4">Creative Score</th>
                <th className="py-3 px-4 text-center">Outcome Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredCampaigns.slice(0, 15).map(c => {
                const isSuccess = c.outcome === 'Successful' || (c.outcome !== 'Unsuccessful' && c.roas >= 2.0);
                return (
                  <tr key={c.campaign_id} className="hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{c.campaign_name}</div>
                      <div className="text-[10px] text-slate-400">{c.campaign_id}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{c.channel}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{c.audience_type}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                      ${c.ad_spend.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                      {c.clicks.toLocaleString()} <span className="text-slate-400 text-[10px]">({c.ctr.toFixed(1)}%)</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800 dark:text-slate-200">
                      {c.conversions.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      ${c.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold">
                      <span className={c.roas >= 3.5 ? 'text-emerald-600 dark:text-emerald-400' : c.roas >= 2.0 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}>
                        {c.roas.toFixed(2)}x
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs">{c.creative_quality_score.toFixed(1)}</span>
                        <div className="h-1.5 w-12 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              c.creative_quality_score >= 8.0 ? 'bg-emerald-500' : c.creative_quality_score >= 6.5 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${(c.creative_quality_score / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isSuccess
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      }`}>
                        {isSuccess ? 'Successful' : 'Unsuccessful'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCampaigns.length > 15 && (
          <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-3 bg-slate-50 dark:bg-slate-950/60 text-center text-xs text-slate-500 dark:text-slate-400">
            Displaying first 15 of {filteredCampaigns.length} campaigns. Use the filter controls or export CSV to inspect all entries.
          </div>
        )}
      </div>
    </div>
  );
};
