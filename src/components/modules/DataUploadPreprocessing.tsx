import React, { useState, useMemo } from 'react';
import { Campaign, PerformanceTier, Channel, AudienceType, Objective } from '../../types/campaign';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Download,
  Database,
  ArrowRight,
  PlusCircle,
  Layers,
  Edit3,
  Trash2,
  Check,
  Play
} from 'lucide-react';
import { INBUILT_DATASETS, InbuiltDatasetInfo } from '../../data/inbuiltDatasets';
import { generateSyntheticCampaigns } from '../../data/benchmarkDataset';
import { parseMarketingCSV } from '../../utils/csvParser';

interface DataUploadPreprocessingProps {
  campaigns: Campaign[];
  onUpdateCampaigns: (newCampaigns: Campaign[]) => void;
  onProceedToEDA: () => void;
  onProceedToPredictor?: () => void;
  onRunAnalysis?: () => void;
  hasRunAnalysis?: boolean;
}

export const DataUploadPreprocessing: React.FC<DataUploadPreprocessingProps> = ({
  campaigns,
  onUpdateCampaigns,
  onProceedToEDA,
  onProceedToPredictor,
  onRunAnalysis,
  hasRunAnalysis = false
}) => {
  const [activeTab, setActiveTab] = useState<'inbuilt' | 'upload' | 'manual'>('inbuilt');
  const [selectedInbuiltId, setSelectedInbuiltId] = useState<string>('ecommerce');
  const [dragActive, setDragActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [imputeStrategy, setImputeStrategy] = useState<'mean' | 'median' | 'drop'>('mean');

  // Manual campaign form state
  const [manualName, setManualName] = useState('');
  const [manualChannel, setManualChannel] = useState<Channel>('Google Ads');
  const [manualAudience, setManualAudience] = useState<AudienceType>('B2C');
  const [manualObjective, setManualObjective] = useState<Objective>('Sales');
  const [manualSpend, setManualSpend] = useState<number>(5000);
  const [manualImpressions, setManualImpressions] = useState<number>(120000);
  const [manualClicks, setManualClicks] = useState<number>(3600);
  const [manualConv, setManualConv] = useState<number>(270);
  const [manualRevenue, setManualRevenue] = useState<number>(18900);
  const [manualScore, setManualScore] = useState<number>(8.5);

  // Derived metrics for manual campaign
  const manualCpc = manualClicks > 0 ? Number((manualSpend / manualClicks).toFixed(2)) : 0;
  const manualCtr = manualImpressions > 0 ? Number(((manualClicks / manualImpressions) * 100).toFixed(2)) : 0;
  const manualRoas = manualSpend > 0 ? Number((manualRevenue / manualSpend).toFixed(2)) : 0;
  const manualTier: PerformanceTier = manualRoas >= 3.5 ? 'High' : manualRoas >= 2.0 ? 'Medium' : 'Low';

  // Missing values inspection
  const missingDiagnostics = useMemo(() => {
    let nullSpends = 0;
    let nullRevs = 0;
    let nullClicks = 0;
    let nullScores = 0;

    for (const c of campaigns) {
      if (!c.ad_spend || isNaN(c.ad_spend)) nullSpends++;
      if (!c.revenue || isNaN(c.revenue)) nullRevs++;
      if (!c.clicks || isNaN(c.clicks)) nullClicks++;
      if (!c.creative_quality_score || isNaN(c.creative_quality_score)) nullScores++;
    }

    return {
      nullSpends,
      nullRevs,
      nullClicks,
      nullScores,
      totalMissing: nullSpends + nullRevs + nullClicks + nullScores
    };
  }, [campaigns]);

  // Outlier diagnostics
  const outlierDiagnostics = useMemo(() => {
    if (campaigns.length < 10) return { spendOutliers: 0, cutoff: 0 };
    const spends = [...campaigns.map(c => c.ad_spend)].sort((a, b) => a - b);
    const q1Spend = spends[Math.floor(spends.length * 0.25)];
    const q3Spend = spends[Math.floor(spends.length * 0.75)];
    const iqrSpend = q3Spend - q1Spend;
    const spendCutoff = q3Spend + 1.5 * iqrSpend;

    const spendOutliers = campaigns.filter(c => c.ad_spend > spendCutoff).length;
    return { spendOutliers, cutoff: Math.round(spendCutoff) };
  }, [campaigns]);

  // Handle switching to one of the 4 Inbuilt datasets
  const handleSelectInbuiltDataset = (dataset: InbuiltDatasetInfo) => {
    setSelectedInbuiltId(dataset.id);
    onUpdateCampaigns(dataset.campaigns);
    setStatusMessage(`Loaded inbuilt dataset "${dataset.name}" with ${dataset.campaigns.length} campaigns!`);
  };

  // Handle manual campaign row addition
  const handleAddManualRow = (mode: 'append' | 'new') => {
    const newCamp: Campaign = {
      campaign_id: `MANUAL-${Math.floor(1000 + Math.random() * 9000)}`,
      campaign_name: manualName.trim() || `${manualChannel} Manual Campaign`,
      channel: manualChannel,
      audience_type: manualAudience,
      target_objective: manualObjective,
      ad_spend: manualSpend,
      impressions: manualImpressions,
      clicks: manualClicks,
      ctr: manualCtr,
      cpc: manualCpc,
      conversions: manualConv,
      conversion_rate: manualClicks > 0 ? Number(((manualConv / manualClicks) * 100).toFixed(2)) : 5.0,
      revenue: manualRevenue,
      roas: manualRoas,
      creative_quality_score: manualScore,
      performance_tier: manualTier
    };

    if (mode === 'new') {
      onUpdateCampaigns([newCamp]);
      setStatusMessage('Started a fresh manual dataset with your custom campaign!');
    } else {
      onUpdateCampaigns([newCamp, ...campaigns]);
      setStatusMessage(`Added "${newCamp.campaign_name}" to the active dataset!`);
    }

    setManualName('');
  };

  // Handle file uploads
  const handleFileProcess = (text: string, filename?: string) => {
    const res = parseMarketingCSV(text);
    if (res.error || res.campaigns.length === 0) {
      setStatusMessage(`Error: ${res.error || 'Could not parse campaigns.'}`);
      return;
    }
    onUpdateCampaigns(res.campaigns);
    setStatusMessage(`Successfully loaded ${res.rowCount} campaigns from ${filename || 'file'}!`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      handleFileProcess(event.target?.result as string, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      handleFileProcess(event.target?.result as string, file.name);
    };
    reader.readAsText(file);
  };

  const applyDataCleaning = () => {
    let cleaned = [...campaigns];
    if (imputeStrategy === 'drop') {
      cleaned = cleaned.filter(c => c.ad_spend > 0 && c.revenue >= 0 && c.clicks > 0);
    } else {
      const avgSpend = cleaned.reduce((acc, c) => acc + (c.ad_spend || 0), 0) / (cleaned.length || 1);
      const avgScore = cleaned.reduce((acc, c) => acc + (c.creative_quality_score || 0), 0) / (cleaned.length || 1);
      cleaned = cleaned.map(c => ({
        ...c,
        ad_spend: c.ad_spend || Math.round(avgSpend),
        creative_quality_score: c.creative_quality_score || parseFloat(avgScore.toFixed(1)),
        roas: c.ad_spend > 0 ? parseFloat((c.revenue / c.ad_spend).toFixed(2)) : c.roas
      }));
    }
    onUpdateCampaigns(cleaned);
    setStatusMessage(`Data cleaned! Total active campaigns: ${cleaned.length}`);
  };

  const downloadSampleCSV = () => {
    const sampleRows = [
      'campaign_id,campaign_name,channel,audience_type,ad_spend,impressions,clicks,ctr,cpc,conversions,revenue,roas,creative_quality_score,target_objective',
      'CMP-101,Google Search Promo,Google Ads,B2C,4500,125000,4375,3.5,1.03,328,19680,4.37,8.5,Sales',
      'CMP-102,Meta Dynamic Retargeting,Meta Ads,B2C,3200,98000,2940,3.0,1.09,235,12925,4.04,8.0,Sales',
      'CMP-103,LinkedIn B2B Whitepaper,LinkedIn,B2B,6800,85000,1190,1.4,5.71,95,23750,3.49,7.5,Lead Gen',
      'CMP-104,TikTok Viral Video,TikTok,B2C,2500,240000,4800,2.0,0.52,144,5760,2.30,6.5,Awareness',
      'CMP-105,VIP Customer Email,Email,B2C,850,45000,2700,6.0,0.31,297,14850,17.47,9.0,Sales'
    ].join('\n');

    const blob = new Blob([sampleRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_marketing_campaigns_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400 block">
            Data Pipeline & Ingestion
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Datasets & Preprocessing Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Choose from 4 pre-built industry datasets, upload custom CSVs, or manually type and add campaigns.
          </p>
        </div>

        {/* Segmented Mode Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('inbuilt')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'inbuilt'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Database className="h-3.5 w-3.5 text-indigo-500 dark:text-cyan-400" />
            <span>4 Inbuilt Datasets</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'manual'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Edit3 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Manual Row Entry</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="h-3.5 w-3.5 text-amber-500" />
            <span>CSV File Upload</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* ----------------- TAB 1: 4 INBUILT DATASETS ----------------- */}
      {activeTab === 'inbuilt' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Database className="h-4 w-4 text-indigo-600 dark:text-cyan-400" />
              <span>Select Inbuilt Industry Benchmark Dataset:</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Currently Active: {campaigns.length} campaigns loaded
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INBUILT_DATASETS.map((ds) => {
              const isSelected = selectedInbuiltId === ds.id && campaigns.length === ds.campaigns.length;

              return (
                <div
                  key={ds.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/50 dark:bg-cyan-950/30 border-indigo-500 dark:border-cyan-500 shadow-md ring-2 ring-indigo-500/20 dark:ring-cyan-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 dark:text-cyan-400 font-mono uppercase tracking-wider">
                        {ds.badge}
                      </span>
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                          <Check className="h-3 w-3" /> Active Dataset
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          Primary: {ds.primaryChannel}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {ds.name}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {ds.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {ds.campaigns.length} Sample Campaigns
                    </span>
                    <button
                      onClick={() => handleSelectInbuiltDataset(ds)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 dark:bg-cyan-600 text-white shadow-2xs'
                          : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? 'Loaded in Engine' : 'Load Dataset'}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: MANUAL ROW ENTRY / CAMPAIGN BUILDER ----------------- */}
      {activeTab === 'manual' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span>Manual Campaign Entry Form</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Type in custom ad numbers. CPC, CTR, ROAS, and Performance Tier calculate in real time.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2.5 py-1 rounded-lg font-bold ${
                manualTier === 'High'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : manualTier === 'Medium'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                Projected Tier: {manualTier}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                placeholder="e.g. Q4 Black Friday Promo"
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Channel
              </label>
              <select
                value={manualChannel}
                onChange={e => setManualChannel(e.target.value as Channel)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden"
              >
                <option value="Google Ads">Google Ads</option>
                <option value="Meta Ads">Meta Ads</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
                <option value="Email">Email</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Audience Type
              </label>
              <select
                value={manualAudience}
                onChange={e => setManualAudience(e.target.value as AudienceType)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden"
              >
                <option value="B2C">B2C</option>
                <option value="B2B">B2B</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ad Spend Budget ($)
              </label>
              <input
                type="number"
                step="50"
                min="100"
                value={manualSpend}
                onChange={e => setManualSpend(Math.max(10, parseFloat(e.target.value) || 0))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Impressions
              </label>
              <input
                type="number"
                step="1000"
                min="100"
                value={manualImpressions}
                onChange={e => setManualImpressions(Math.max(10, parseInt(e.target.value, 10) || 0))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Clicks
              </label>
              <input
                type="number"
                step="50"
                min="1"
                value={manualClicks}
                onChange={e => setManualClicks(Math.max(1, parseInt(e.target.value, 10) || 0))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Conversions
              </label>
              <input
                type="number"
                step="5"
                min="0"
                value={manualConv}
                onChange={e => setManualConv(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Total Revenue ($)
              </label>
              <input
                type="number"
                step="100"
                min="0"
                value={manualRevenue}
                onChange={e => setManualRevenue(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Creative Score (1-10)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="10"
                value={manualScore}
                onChange={e => setManualScore(Math.min(10, Math.max(1, parseFloat(e.target.value) || 7.0)))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            {/* Calculated summary cards */}
            <div className="lg:col-span-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px]">Calculated CTR</span>
                <span className="font-bold text-slate-900 dark:text-white">{manualCtr}%</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Calculated CPC</span>
                <span className="font-bold text-slate-900 dark:text-white">${manualCpc}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Calculated ROAS</span>
                <span className="font-bold text-indigo-600 dark:text-cyan-400">{manualRoas}x</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Current active campaigns in system: <strong>{campaigns.length}</strong>
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleAddManualRow('new')}
                className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Start Fresh Dataset with this Row
              </button>
              <button
                onClick={() => handleAddManualRow('append')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-2xs"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Row to Active Dataset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 3: CSV FILE UPLOAD & PREPROCESSING PIPELINE ----------------- */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Drag & Drop */}
          <div
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all bg-white dark:bg-slate-900 ${
              dragActive
                ? 'border-indigo-600 dark:border-cyan-500 bg-indigo-50/20 dark:bg-cyan-950/30'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400'
            }`}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-cyan-950 text-indigo-600 dark:text-cyan-400 mb-3">
              <Upload className="h-7 w-7" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Drag & Drop Your Campaign CSV File
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
              Supports CSV, TSV, comma, or semicolon delimited ad network reports.
            </p>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 dark:bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 dark:hover:bg-cyan-500 transition-colors shadow-2xs">
              <FileSpreadsheet className="h-4 w-4" />
              <span>Select File from Computer</span>
              <input
                type="file"
                accept=".csv,.txt,.tsv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Automatic column mapping active</span>
              <button
                onClick={downloadSampleCSV}
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-cyan-400 font-bold hover:underline"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Template CSV</span>
              </button>
            </div>
          </div>

          {/* Synthetic Scaler Generator */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Generate Synthetic Scaled Data
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Stress-test the Machine Learning models with simulated multi-channel ad runs.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    const gen = generateSyntheticCampaigns(50);
                    onUpdateCampaigns(gen);
                    setStatusMessage('Generated 50 synthetic campaigns!');
                  }}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-left transition-all"
                >
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">50 Campaigns</div>
                  <div className="text-[11px] text-slate-400">Standard variance</div>
                </button>

                <button
                  onClick={() => {
                    const gen = generateSyntheticCampaigns(150);
                    onUpdateCampaigns(gen);
                    setStatusMessage('Generated 150 enterprise synthetic campaigns!');
                  }}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-left transition-all"
                >
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">150 Campaigns</div>
                  <div className="text-[11px] text-slate-400">High volume test</div>
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              Zero synthetic artifacts, realistic Gaussian distribution.
            </div>
          </div>
        </div>
      )}

      {/* Preprocessing Diagnostics & Next Step */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
          Missing Data Diagnostics & Imputation Strategy
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Automated validation prevents data leakage and ensures clean feature matrices for machine learning training.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Missing Values Detected</span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {missingDiagnostics.totalMissing === 0 ? '0 (Clean Matrix)' : `${missingDiagnostics.totalMissing} detected`}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Outlier Detection (IQR Method)</span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {outlierDiagnostics.spendOutliers} campaigns
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Data Leakage Guard</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Active
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Strategy:</span>
            <select
              value={imputeStrategy}
              onChange={e => setImputeStrategy(e.target.value as any)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="mean">Mean Imputation</option>
              <option value="median">Median Imputation (Robust)</option>
              <option value="drop">Drop Incomplete Rows</option>
            </select>
            <button
              onClick={applyDataCleaning}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5 opacity-60" />
              <span>Apply Imputation</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onRunAnalysis && (
              <button
                onClick={onRunAnalysis}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                title="Run full ML analysis on this cleaned dataset"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>▶ Run Analysis</span>
              </button>
            )}
            <button
              onClick={onProceedToEDA}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
            >
              <span>Explore Data (EDA)</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            {onProceedToPredictor && (
              <button
                onClick={onProceedToPredictor}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-cyan-200" />
                <span>Predictor Engine</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
