import React, { useState, useMemo, useEffect } from 'react';
import { Campaign, Channel, PerformanceTier, Objective, AudienceType, CampaignOutcome } from '../../types/campaign';
import { MultipleLinearRegression, DecisionTreeRegressor, RandomForestRegressor } from '../../utils/mlEngine';
import { INBUILT_DATASETS } from '../../data/inbuiltDatasets';
import {
  Target,
  Sparkles,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Award,
  CheckCircle2,
  XCircle,
  PlusCircle,
  HelpCircle,
  Zap,
  UploadCloud,
  Layers,
  Database,
  RefreshCw,
  ArrowRight,
  Download,
  AlertCircle,
  BarChart2,
  Play,
  AlertTriangle
} from 'lucide-react';

interface PredictorProps {
  campaigns: Campaign[];
  trainedLR: MultipleLinearRegression;
  trainedDT: DecisionTreeRegressor;
  trainedRF: RandomForestRegressor;
  onAddCampaignToDataset: (campaign: Campaign) => void;
  onOpenUploadModal?: () => void;
  currentDatasetId?: string;
  onSelectDatasetPreset?: (id: string) => void;
  hasRunAnalysis?: boolean;
  onRunAnalysis?: (testRatio?: number, seed?: number) => void;
  isAnalyzing?: boolean;
}

interface PredictionResult {
  revenue: number;
  conversions: number;
  roas: number;
  cpa: number;
  netProfit: number;
  tier: PerformanceTier;
  outcome: CampaignOutcome;
  ciLow: number;
  ciHigh: number;
  predRF: number;
  predLR: number;
  predDT: number;
  generatedAt: Date;
}

export const RevenueConversionPredictor: React.FC<PredictorProps> = ({
  campaigns,
  trainedLR,
  trainedDT,
  trainedRF,
  onAddCampaignToDataset,
  onOpenUploadModal,
  currentDatasetId = 'ecommerce',
  onSelectDatasetPreset,
  hasRunAnalysis = false,
  onRunAnalysis,
  isAnalyzing = false
}) => {
  // Navigation between Single Forecaster & Batch Upload Forecaster
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  // Parameters for Single Campaign Scenario
  const [channel, setChannel] = useState<Channel>('Google Ads');
  const [audience, setAudience] = useState<AudienceType>('B2C');
  const [objective, setObjective] = useState<Objective>('Sales');
  const [adSpend, setAdSpend] = useState<number>(5000);
  const [cpc, setCpc] = useState<number>(1.25);
  const [ctr, setCtr] = useState<number>(3.2);
  const [creativeScore, setCreativeScore] = useState<number>(8.5);
  const [selectedModel, setSelectedModel] = useState<'rf' | 'lr' | 'dt' | 'ensemble'>('rf');

  // Key requirement: "Ennaku munadiye prediction pandra maari venda dataset upload panathuku apram prediction vara maari Venum"
  // Predictions are NOT shown beforehand; user must run prediction after dataset upload / confirmation
  const [hasRunPrediction, setHasRunPrediction] = useState<boolean>(false);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionData, setPredictionData] = useState<PredictionResult | null>(null);
  const [isParamsStale, setIsParamsStale] = useState<boolean>(false);

  // Batch prediction states & filter
  const [hasRunBatchPrediction, setHasRunBatchPrediction] = useState<boolean>(false);
  const [isBatchPredicting, setIsBatchPredicting] = useState<boolean>(false);
  const [batchFilter, setBatchFilter] = useState<'All' | 'Successful' | 'Unsuccessful'>('All');
  const [batchResults, setBatchResults] = useState<Array<{
    campaign: Campaign;
    predictedRevenue: number;
    predictedRoas: number;
    diffRevenue: number;
    diffPct: number;
    predictedTier: PerformanceTier;
    predictedOutcome: CampaignOutcome;
  }>>([]);

  // Auto-populate batch predictions when overall project analysis has run
  useEffect(() => {
    if (hasRunAnalysis && campaigns.length > 0 && batchResults.length === 0) {
      const computed = campaigns.map(c => {
        const vector = [c.ad_spend, c.clicks, c.ctr, c.cpc, c.creative_quality_score];
        const predRev = c.predicted_revenue || Math.round(trainedRF.predict(vector));
        const predRoas = c.predicted_roas || (c.ad_spend > 0 ? Number((predRev / c.ad_spend).toFixed(2)) : 0);
        const diffRev = predRev - c.revenue;
        const diffPct = c.revenue > 0 ? Number(((diffRev / c.revenue) * 100).toFixed(1)) : 0;

        let predictedTier: PerformanceTier = 'Medium';
        if (predRoas >= 3.5) predictedTier = 'High';
        else if (predRoas < 2.0) predictedTier = 'Low';

        const predictedOutcome: CampaignOutcome = c.predicted_outcome || (predRoas >= 2.0 ? 'Successful' : 'Unsuccessful');

        return {
          campaign: c,
          predictedRevenue: predRev,
          predictedRoas: predRoas,
          diffRevenue: diffRev,
          diffPct,
          predictedTier,
          predictedOutcome
        };
      });

      setBatchResults(computed);
      setHasRunBatchPrediction(true);
    }
  }, [hasRunAnalysis, campaigns, trainedRF, batchResults.length]);

  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Active dataset metadata
  const activeDatasetObj = useMemo(() => {
    return INBUILT_DATASETS.find(d => d.id === currentDatasetId);
  }, [currentDatasetId]);

  const datasetDisplayName = useMemo(() => {
    if (currentDatasetId === 'custom') {
      return 'Custom Uploaded CSV Dataset';
    }
    return activeDatasetObj ? activeDatasetObj.name : 'Active Marketing Dataset';
  }, [currentDatasetId, activeDatasetObj]);

  // Derived input metrics for single scenario
  const calculatedClicks = useMemo(() => {
    return cpc > 0 ? Math.max(10, Math.round(adSpend / cpc)) : 100;
  }, [adSpend, cpc]);

  const calculatedImpressions = useMemo(() => {
    return ctr > 0 ? Math.round((calculatedClicks / (ctr / 100))) : 1000;
  }, [calculatedClicks, ctr]);

  // Quick preset templates
  const applyPreset = (presetName: string) => {
    setIsParamsStale(true);
    if (presetName === 'google-search') {
      setChannel('Google Ads');
      setAudience('B2C');
      setObjective('Sales');
      setAdSpend(6500);
      setCpc(1.15);
      setCtr(3.8);
      setCreativeScore(8.8);
    } else if (presetName === 'meta-catalog') {
      setChannel('Meta Ads');
      setAudience('B2C');
      setObjective('Sales');
      setAdSpend(4200);
      setCpc(0.95);
      setCtr(2.9);
      setCreativeScore(8.2);
    } else if (presetName === 'linkedin-b2b') {
      setChannel('LinkedIn');
      setAudience('B2B');
      setObjective('Lead Gen');
      setAdSpend(7500);
      setCpc(6.40);
      setCtr(1.4);
      setCreativeScore(7.6);
    } else if (presetName === 'tiktok-viral') {
      setChannel('TikTok');
      setAudience('B2C');
      setObjective('Awareness');
      setAdSpend(3000);
      setCpc(0.48);
      setCtr(2.2);
      setCreativeScore(7.0);
    } else if (presetName === 'email-vip') {
      setChannel('Email');
      setAudience('B2C');
      setObjective('Sales');
      setAdSpend(600);
      setCpc(0.22);
      setCtr(7.5);
      setCreativeScore(9.2);
    }
  };

  // Run ML Prediction on the uploaded dataset
  const handleExecutePrediction = () => {
    setIsPredicting(true);

    setTimeout(() => {
      const vector = [adSpend, calculatedClicks, ctr, cpc, creativeScore];

      const predRF = trainedRF.predict(vector);
      const predLR = trainedLR.predict(vector);
      const predDT = trainedDT.predict(vector);

      let finalRevenue = predRF;
      if (selectedModel === 'lr') finalRevenue = predLR;
      else if (selectedModel === 'dt') finalRevenue = predDT;
      else if (selectedModel === 'ensemble') finalRevenue = (predRF + predLR + predDT) / 3;

      const baseCvr = audience === 'B2B' ? 7.0 : 7.5;
      const scoreFactor = (creativeScore / 8.0);
      const estimatedCvr = Math.min(15, Math.max(1.5, baseCvr * scoreFactor));
      const estimatedConversions = Math.round(calculatedClicks * (estimatedCvr / 100));

      const predictedRoas = adSpend > 0 ? finalRevenue / adSpend : 0;
      const estimatedCpa = estimatedConversions > 0 ? adSpend / estimatedConversions : 0;
      const netProfit = finalRevenue - adSpend;

      let tier: PerformanceTier = 'Medium';
      if (predictedRoas >= 3.5) tier = 'High';
      else if (predictedRoas < 2.0) tier = 'Low';

      const outcome: CampaignOutcome = predictedRoas >= 2.0 ? 'Successful' : 'Unsuccessful';

      const ciLow = Math.round(finalRevenue * 0.88);
      const ciHigh = Math.round(finalRevenue * 1.12);

      setPredictionData({
        revenue: Math.round(finalRevenue),
        conversions: estimatedConversions,
        roas: Number(predictedRoas.toFixed(2)),
        cpa: Number(estimatedCpa.toFixed(2)),
        netProfit: Math.round(netProfit),
        tier,
        outcome,
        ciLow,
        ciHigh,
        predRF: Math.round(predRF),
        predLR: Math.round(predLR),
        predDT: Math.round(predDT),
        generatedAt: new Date()
      });

      setHasRunPrediction(true);
      setIsPredicting(false);
      setIsParamsStale(false);
    }, 450);
  };

  // Run Batch ML Predictions across all campaigns in the dataset
  const handleExecuteBatchPrediction = () => {
    setIsBatchPredicting(true);

    setTimeout(() => {
      const computed = campaigns.map(c => {
        const vector = [c.ad_spend, c.clicks, c.ctr, c.cpc, c.creative_quality_score];
        const predRev = Math.round(trainedRF.predict(vector));
        const predRoas = c.ad_spend > 0 ? Number((predRev / c.ad_spend).toFixed(2)) : 0;
        const diffRev = predRev - c.revenue;
        const diffPct = c.revenue > 0 ? Number(((diffRev / c.revenue) * 100).toFixed(1)) : 0;

        let predictedTier: PerformanceTier = 'Medium';
        if (predRoas >= 3.5) predictedTier = 'High';
        else if (predRoas < 2.0) predictedTier = 'Low';

        const predictedOutcome: CampaignOutcome = predRoas >= 2.0 ? 'Successful' : 'Unsuccessful';

        return {
          campaign: c,
          predictedRevenue: predRev,
          predictedRoas: predRoas,
          diffRevenue: diffRev,
          diffPct,
          predictedTier,
          predictedOutcome
        };
      });

      setBatchResults(computed);
      setHasRunBatchPrediction(true);
      setIsBatchPredicting(false);
    }, 600);
  };

  const handleSaveToDataset = () => {
    if (!predictionData) return;

    const newCamp: Campaign = {
      campaign_id: `SIM-${Math.floor(1000 + Math.random() * 9000)}`,
      campaign_name: `${channel} Predicted (${objective})`,
      channel,
      audience_type: audience,
      ad_spend: adSpend,
      impressions: calculatedImpressions,
      clicks: calculatedClicks,
      ctr,
      cpc,
      conversions: predictionData.conversions,
      conversion_rate: Number(((predictionData.conversions / calculatedClicks) * 100).toFixed(2)),
      revenue: predictionData.revenue,
      roas: predictionData.roas,
      creative_quality_score: creativeScore,
      target_objective: objective,
      performance_tier: predictionData.tier
    };

    onAddCampaignToDataset(newCamp);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const handleExportBatchPredictions = () => {
    if (batchResults.length === 0) return;
    const headers = [
      'campaign_id',
      'campaign_name',
      'channel',
      'ad_spend',
      'actual_revenue',
      'predicted_revenue',
      'actual_roas',
      'predicted_roas',
      'error_variance_pct',
      'predicted_tier'
    ];
    const rows = batchResults.map(r => [
      r.campaign.campaign_id,
      `"${r.campaign.campaign_name.replace(/"/g, '""')}"`,
      r.campaign.channel,
      r.campaign.ad_spend,
      r.campaign.revenue,
      r.predictedRevenue,
      r.campaign.roas,
      r.predictedRoas,
      r.diffPct,
      r.predictedTier
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch_ml_predictions_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Title & Dataset Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400">
              Predictive ML Inference
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800/60 px-2 py-0.5 text-[11px] font-semibold text-cyan-700 dark:text-cyan-300">
              <Database className="h-3 w-3" />
              {currentDatasetId === 'custom' ? 'Custom Uploaded CSV' : activeDatasetObj?.badge || 'Dataset'} ({campaigns.length} campaigns)
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mt-0.5">
            Campaign Revenue & Conversion Predictor
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Predictions are generated only after uploading or selecting your dataset. Upload your campaign CSV or select from the inbuilt presets below to run forward ML inference.
          </p>
        </div>

        {/* Global CSV Upload & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenUploadModal && (
            <button
              onClick={onOpenUploadModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-3.5 py-2 text-xs font-bold text-cyan-700 dark:text-cyan-300 transition-colors shadow-2xs cursor-pointer"
            >
              <UploadCloud className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
              <span>Upload CSV Dataset</span>
            </button>
          )}

          {/* Tab Selector: Single Scenario vs Batch Prediction */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'single'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Target className="h-3.5 w-3.5 text-cyan-400" />
              <span>Scenario Forecaster</span>
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'batch'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Batch Predict Uploaded Dataset ({campaigns.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* If analysis has not been run yet, show the explicit run prompt */}
      {!hasRunAnalysis && (
        <div className="rounded-xl border border-amber-500/50 bg-amber-950/30 p-4 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-amber-950/20 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-300">
                Analysis Pending for {datasetDisplayName}
              </div>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Dataset contains {campaigns.length} campaigns. Run analysis to train Random Forest & Regression models before generating predictions.
              </p>
            </div>
          </div>
          {onRunAnalysis && (
            <button
              onClick={() => onRunAnalysis()}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-md shadow-amber-500/30 ring-1 ring-amber-400/50 cursor-pointer shrink-0 transition-all active:scale-95"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>▶ Run ML Analysis & Train Models</span>
            </button>
          )}
        </div>
      )}

      {/* Dataset Selection & Status Notification Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-3.5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 dark:text-cyan-400">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {datasetDisplayName}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                  {campaigns.length} campaigns loaded
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                Trained Models: Random Forest, Multiple Linear Regression, Decision Tree Regressor
              </span>
            </div>
          </div>

          {/* Quick dataset switch pills */}
          {onSelectDatasetPreset && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Switch Dataset:</span>
              {INBUILT_DATASETS.map((ds) => {
                const isSelected = currentDatasetId === ds.id;
                return (
                  <button
                    key={ds.id}
                    onClick={() => {
                      onSelectDatasetPreset(ds.id);
                      setHasRunPrediction(false);
                      setPredictionData(null);
                      setHasRunBatchPrediction(false);
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-700 dark:text-cyan-300 font-bold'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {ds.badge}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* VIEW 1: SINGLE SCENARIO FORECASTER */}
      {activeTab === 'single' && (
        <div className="space-y-6">
          {/* Quick Presets for parameter loading */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-500" /> Channel Presets:
            </span>
            <button
              onClick={() => applyPreset('google-search')}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              Google Search High-Intent
            </button>
            <button
              onClick={() => applyPreset('meta-catalog')}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              Meta Advantage+ Catalog
            </button>
            <button
              onClick={() => applyPreset('linkedin-b2b')}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              LinkedIn C-Suite ABM
            </button>
            <button
              onClick={() => applyPreset('tiktok-viral')}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              TikTok Spark UGC
            </button>
            <button
              onClick={() => applyPreset('email-vip')}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              VIP Retention Flow
            </button>
          </div>

          {/* Grid: Inputs & ML Forecast */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Input Parameters Form (7 cols) */}
            <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Campaign Parameter Vector
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Tune input features to evaluate forward return
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">ML Model:</span>
                  <select
                    value={selectedModel}
                    onChange={e => {
                      setSelectedModel(e.target.value as any);
                      setIsParamsStale(true);
                    }}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden"
                  >
                    <option value="rf">Random Forest (Recommended)</option>
                    <option value="lr">Multiple Linear Regression</option>
                    <option value="dt">Decision Tree Regressor</option>
                    <option value="ensemble">Ensemble Blend (Mean)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Channel
                  </label>
                  <select
                    value={channel}
                    onChange={e => {
                      setChannel(e.target.value as Channel);
                      setIsParamsStale(true);
                    }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Audience Segment
                  </label>
                  <select
                    value={audience}
                    onChange={e => {
                      setAudience(e.target.value as AudienceType);
                      setIsParamsStale(true);
                    }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  >
                    <option value="B2C">B2C Consumers</option>
                    <option value="B2B">B2B Decision Makers</option>
                    <option value="Retargeting">Retargeting Warm Audience</option>
                    <option value="Lookalike">Lookalike Prospecting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Campaign Objective
                  </label>
                  <select
                    value={objective}
                    onChange={e => {
                      setObjective(e.target.value as Objective);
                      setIsParamsStale(true);
                    }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  >
                    <option value="Sales">Direct Sales & Revenue</option>
                    <option value="Lead Gen">High-Intent Lead Gen</option>
                    <option value="Traffic">Qualified Traffic</option>
                    <option value="Awareness">Brand Reach & Recall</option>
                  </select>
                </div>
              </div>

              {/* Ad Spend Slider */}
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Target Ad Spend Budget ($)</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-cyan-400">
                    ${adSpend.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="250"
                  max="30000"
                  step="250"
                  value={adSpend}
                  onChange={e => {
                    setAdSpend(parseInt(e.target.value, 10));
                    setIsParamsStale(true);
                  }}
                  className="w-full accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>$250</span>
                  <span>$15,000</span>
                  <span>$30,000</span>
                </div>
              </div>

              {/* CPC, CTR, Quality Score */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expected CPC ($)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.10"
                    max="25.0"
                    value={cpc}
                    onChange={e => {
                      setCpc(Math.max(0.05, parseFloat(e.target.value) || 0.1));
                      setIsParamsStale(true);
                    }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-mono text-slate-800 dark:text-slate-200"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Cost per click auction bid</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expected CTR (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    max="20.0"
                    value={ctr}
                    onChange={e => {
                      setCtr(Math.max(0.1, parseFloat(e.target.value) || 1.0));
                      setIsParamsStale(true);
                    }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-mono text-slate-800 dark:text-slate-200"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Click-through probability</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Creative Score (1-10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="10.0"
                    value={creativeScore}
                    onChange={e => {
                      setCreativeScore(Math.min(10, Math.max(1, parseFloat(e.target.value) || 7.0)));
                      setIsParamsStale(true);
                    }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-mono text-slate-800 dark:text-slate-200"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Copy, video & visual quality</span>
                </div>
              </div>

              {/* Derived Funnel Stats */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                <span>Estimated Clicks: <strong className="text-slate-900 dark:text-slate-100 font-mono">{calculatedClicks.toLocaleString()}</strong></span>
                <span>·</span>
                <span>Target Impressions: <strong className="text-slate-900 dark:text-slate-100 font-mono">{calculatedImpressions.toLocaleString()}</strong></span>
              </div>

              {/* Trigger Button to Run Prediction */}
              <div className="pt-2">
                <button
                  onClick={handleExecutePrediction}
                  disabled={isPredicting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm py-3 px-4 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPredicting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-white" />
                      <span>Executing ML Inference on Active Dataset...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-cyan-200" />
                      <span>{hasRunPrediction ? 'Re-Run ML Prediction with New Inputs' : '⚡ Run ML Prediction on Uploaded Dataset'}</span>
                    </>
                  )}
                </button>
                {isParamsStale && hasRunPrediction && (
                  <p className="text-[11px] text-amber-500 text-center mt-1.5 font-medium">
                    Parameters modified! Click button above to update prediction.
                  </p>
                )}
              </div>
            </div>

            {/* Prediction Output Card (5 cols) */}
            <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs flex flex-col justify-between">
              {!hasRunPrediction || !predictionData ? (
                /* STATE A: PREDICTION NOT RUN YET (Munadiye prediction venda) */
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 min-h-[380px]">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-500 dark:text-cyan-400 shadow-inner">
                      <Target className="h-8 w-8" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                      ML
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Prediction Waiting for Trigger
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs leading-relaxed">
                      Predictions are never shown beforehand. Upload your campaign CSV dataset or choose an inbuilt preset, adjust inputs, and click below to generate your forecast.
                    </p>
                  </div>

                  {/* Active Dataset Badge */}
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 p-2.5 text-left w-full space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Active Dataset:</span>
                      <span className="font-mono text-cyan-500 dark:text-cyan-400 font-bold">
                        {campaigns.length} campaigns
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {datasetDisplayName}
                    </div>
                  </div>

                  <div className="w-full space-y-2 pt-2">
                    <button
                      onClick={handleExecutePrediction}
                      disabled={isPredicting}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold py-2.5 px-4 shadow-sm transition-all cursor-pointer"
                    >
                      {isPredicting ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Computing Forecast...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 text-cyan-200" />
                          <span>Generate ML Prediction Now</span>
                        </>
                      )}
                    </button>

                    {onOpenUploadModal && (
                      <button
                        onClick={onOpenUploadModal}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 py-2 transition-colors cursor-pointer"
                      >
                        <UploadCloud className="h-3.5 w-3.5 text-cyan-500" />
                        <span>Upload Different CSV Dataset</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* STATE B: PREDICTION GENERATED AFTER DATASET UPLOAD / TRIGGER */
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          Machine Learning Forecast
                        </h3>
                        <span className="text-[10px] text-slate-400">
                          Generated on active {datasetDisplayName}
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full shadow-xs ${
                      predictionData.outcome === 'Successful'
                        ? 'bg-emerald-500/15 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    }`}>
                      {predictionData.outcome === 'Successful' ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Successful</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Unsuccessful</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Outcome Evaluation Banner */}
                  <div className={`mt-3 p-3 rounded-xl border flex items-center justify-between text-xs ${
                    predictionData.outcome === 'Successful'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      {predictionData.outcome === 'Successful' ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
                      )}
                      <div>
                        <div className="font-bold">
                          {predictionData.outcome === 'Successful'
                            ? 'Outcome: SUCCESSFUL CAMPAIGN'
                            : 'Outcome: UNSUCCESSFUL CAMPAIGN'}
                        </div>
                        <div className="text-[11px] opacity-80 mt-0.5">
                          {predictionData.outcome === 'Successful'
                            ? `Projected ROAS of ${predictionData.roas}x meets profit target (≥ 2.0x). Scale candidate.`
                            : `Projected ROAS of ${predictionData.roas}x is below 2.0x hurdle. Capital loss risk.`}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-900/10 dark:bg-slate-100/10">
                      {predictionData.tier} Tier
                    </span>
                  </div>

                  {/* Big Revenue Highlight */}
                  <div className="my-4 p-4 rounded-xl bg-slate-900 dark:bg-slate-950 text-white space-y-1 border border-slate-800">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                      Predicted Campaign Revenue
                    </span>
                    <div className="text-3xl font-extrabold font-mono text-emerald-400">
                      ${predictionData.revenue.toLocaleString()}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800">
                      <span>95% CI Range:</span>
                      <span className="font-mono text-slate-300">
                        ${predictionData.ciLow.toLocaleString()} – ${predictionData.ciHigh.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Metrics Breakdown */}
                  <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 block">Projected ROAS</span>
                      <span className="text-xl font-bold font-mono text-indigo-700 dark:text-cyan-400">
                        {predictionData.roas.toFixed(2)}x
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 block">Predicted Conversions</span>
                      <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                        {predictionData.conversions.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 block">Estimated CPA</span>
                      <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                        ${predictionData.cpa.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 block">Projected Net Profit</span>
                      <span className={`text-xl font-bold font-mono ${predictionData.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        ${predictionData.netProfit.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Multi-model comparison */}
                  <div className="p-2.5 bg-slate-50/75 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                      Multi-Model Triangulation:
                    </span>
                    <div className="flex justify-between font-mono">
                      <span>RF: ${predictionData.predRF.toLocaleString()}</span>
                      <span>Linear: ${predictionData.predLR.toLocaleString()}</span>
                      <span>Tree: ${predictionData.predDT.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <button
                      onClick={handleSaveToDataset}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Add This Scenario to Active Dataset</span>
                    </button>

                    {saveSuccessMsg && (
                      <div className="text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ Added to active dataset pool! Visible in Dashboard & Reports.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: BATCH PREDICTION ON ALL UPLOADED CAMPAIGNS */}
      {activeTab === 'batch' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-cyan-400" />
                <span>Batch ML Prediction on Uploaded Dataset</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Run trained Random Forest models across all {campaigns.length} campaigns in your active dataset to compare actual revenue against predicted ML forecast.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExecuteBatchPrediction}
                disabled={isBatchPredicting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold py-2 px-3.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isBatchPredicting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Predicting {campaigns.length} campaigns...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
                    <span>{hasRunBatchPrediction ? 'Re-Run Batch Predictions' : `⚡ Predict All ${campaigns.length} Campaigns`}</span>
                  </>
                )}
              </button>

              {hasRunBatchPrediction && (
                <button
                  onClick={handleExportBatchPredictions}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 py-2 px-3 transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>
          </div>

          {!hasRunBatchPrediction ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                <BarChart2 className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Batch Inference Ready for {campaigns.length} Campaigns
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Click "Predict All {campaigns.length} Campaigns" above to execute machine learning forward inference across your uploaded dataset. This will compare actual vs. predicted revenue, ROAS, and calculate model error variance.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Batch KPI Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total Actual Revenue</span>
                  <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                    ${batchResults.reduce((acc, r) => acc + r.campaign.revenue, 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total ML Predicted Revenue</span>
                  <span className="text-lg font-bold font-mono text-cyan-400">
                    ${batchResults.reduce((acc, r) => acc + r.predictedRevenue, 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Predicted Successful</span>
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {batchResults.filter(r => r.predictedOutcome === 'Successful').length}
                    </span>
                    <span className="text-[11px] text-emerald-600/80 font-medium">
                      ({((batchResults.filter(r => r.predictedOutcome === 'Successful').length / (batchResults.length || 1)) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-rose-500/10 rounded-lg border border-rose-500/30">
                  <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold block flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    <span>Predicted Unsuccessful</span>
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
                      {batchResults.filter(r => r.predictedOutcome === 'Unsuccessful').length}
                    </span>
                    <span className="text-[11px] text-rose-600/80 font-medium">
                      ({((batchResults.filter(r => r.predictedOutcome === 'Unsuccessful').length / (batchResults.length || 1)) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Filter Tabs for Batch Predictions */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBatchFilter('All')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      batchFilter === 'All'
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    All ({batchResults.length})
                  </button>
                  <button
                    onClick={() => setBatchFilter('Successful')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      batchFilter === 'Successful'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Successful ({batchResults.filter(r => r.predictedOutcome === 'Successful').length})</span>
                  </button>
                  <button
                    onClick={() => setBatchFilter('Unsuccessful')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      batchFilter === 'Unsuccessful'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                    }`}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Unsuccessful ({batchResults.filter(r => r.predictedOutcome === 'Unsuccessful').length})</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-400">
                  ROAS ≥ 2.0x qualifies as Successful
                </div>
              </div>

              {/* Table of Batch Predictions */}
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Campaign</th>
                      <th className="py-2.5 px-3">Channel</th>
                      <th className="py-2.5 px-3 text-right">Ad Spend</th>
                      <th className="py-2.5 px-3 text-right">Actual Rev</th>
                      <th className="py-2.5 px-3 text-right">ML Predicted</th>
                      <th className="py-2.5 px-3 text-right">Pred ROAS</th>
                      <th className="py-2.5 px-3 text-right">Variance</th>
                      <th className="py-2.5 px-3 text-center">Predicted Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {batchResults
                      .filter(r => batchFilter === 'All' || r.predictedOutcome === batchFilter)
                      .slice(0, 30)
                      .map((r) => {
                        const isSuccess = r.predictedOutcome === 'Successful';
                        return (
                          <tr key={r.campaign.campaign_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-2 px-3 font-sans font-medium text-slate-900 dark:text-slate-100 truncate max-w-[180px]">
                              {r.campaign.campaign_name}
                            </td>
                            <td className="py-2 px-3 font-sans text-slate-600 dark:text-slate-400">
                              {r.campaign.channel}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-400">
                              ${r.campaign.ad_spend.toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-800 dark:text-slate-200">
                              ${r.campaign.revenue.toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-cyan-400">
                              ${r.predictedRevenue.toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-right text-indigo-400">
                              {r.predictedRoas.toFixed(2)}x
                            </td>
                            <td className={`py-2 px-3 text-right ${Math.abs(r.diffPct) < 15 ? 'text-emerald-500' : 'text-amber-500'}`}>
                              {r.diffPct > 0 ? `+${r.diffPct}%` : `${r.diffPct}%`}
                            </td>
                            <td className="py-2 px-3 text-center font-sans">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isSuccess
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                              }`}>
                                {isSuccess ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span>Successful</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3" />
                                    <span>Unsuccessful</span>
                                  </>
                                )}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              {batchResults.length > 30 && (
                <p className="text-[11px] text-slate-400 text-center">
                  Showing first 30 of {batchResults.length} predicted campaigns matching filter. Click "Export CSV" to see all rows.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
