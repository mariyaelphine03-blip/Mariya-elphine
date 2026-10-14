import React, { useState, useMemo } from 'react';
import { Campaign, CampaignOutcome, PerformanceTier } from '../../types/campaign';
import { trainAndEvaluateClassifier, isCampaignSuccessful } from '../../utils/mlEngine';
import { useAppTheme } from '../../context/ThemeContext';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UploadCloud,
  TrendingUp,
  TrendingDown,
  Sliders,
  DollarSign,
  Target,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Check,
  Percent
} from 'lucide-react';

interface ClassificationProps {
  campaigns: Campaign[];
  onOpenUploadModal?: () => void;
}

export const PerformanceClassification: React.FC<ClassificationProps> = ({
  campaigns,
  onOpenUploadModal
}) => {
  const { styles } = useAppTheme();
  const [roasThreshold, setRoasThreshold] = useState<number>(2.0);
  const [filterOutcome, setFilterOutcome] = useState<'All' | 'Successful' | 'Unsuccessful'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showThreeTierMatrix, setShowThreeTierMatrix] = useState(false);

  // Train and evaluate classifier with active threshold
  const clfResult = useMemo(
    () => trainAndEvaluateClassifier(campaigns, roasThreshold),
    [campaigns, roasThreshold]
  );

  // Categorize campaigns into Successful and Unsuccessful
  const evaluatedCampaigns = useMemo(() => {
    return campaigns.map(c => {
      const isSuccess = isCampaignSuccessful(c, roasThreshold);
      const outcome: CampaignOutcome = isSuccess ? 'Successful' : 'Unsuccessful';
      const netProfit = (c.revenue || 0) - (c.ad_spend || 0);
      return {
        ...c,
        calculatedOutcome: outcome,
        netProfit
      };
    });
  }, [campaigns, roasThreshold]);

  // Aggregate statistics for Successful vs Unsuccessful
  const stats = useMemo(() => {
    const successful = evaluatedCampaigns.filter(c => c.calculatedOutcome === 'Successful');
    const unsuccessful = evaluatedCampaigns.filter(c => c.calculatedOutcome === 'Unsuccessful');

    const total = evaluatedCampaigns.length || 1;
    const successRate = ((successful.length / total) * 100).toFixed(1);
    const unsuccessRate = ((unsuccessful.length / total) * 100).toFixed(1);

    const successRevenue = successful.reduce((acc, c) => acc + c.revenue, 0);
    const successSpend = successful.reduce((acc, c) => acc + c.ad_spend, 0);
    const successAvgRoas = successSpend > 0 ? (successRevenue / successSpend).toFixed(2) : '0.00';
    const successProfit = successRevenue - successSpend;

    const unsuccessRevenue = unsuccessful.reduce((acc, c) => acc + c.revenue, 0);
    const unsuccessSpend = unsuccessful.reduce((acc, c) => acc + c.ad_spend, 0);
    const unsuccessAvgRoas = unsuccessSpend > 0 ? (unsuccessRevenue / unsuccessSpend).toFixed(2) : '0.00';
    const unsuccessLoss = unsuccessSpend - unsuccessRevenue;

    return {
      successfulCount: successful.length,
      unsuccessfulCount: unsuccessful.length,
      successRate,
      unsuccessRate,
      successRevenue,
      successSpend,
      successAvgRoas,
      successProfit,
      unsuccessRevenue,
      unsuccessSpend,
      unsuccessAvgRoas,
      unsuccessLoss
    };
  }, [evaluatedCampaigns]);

  // Filtered campaigns for table view
  const filteredList = useMemo(() => {
    return evaluatedCampaigns.filter(c => {
      const matchFilter =
        filterOutcome === 'All' || c.calculatedOutcome === filterOutcome;
      const matchSearch =
        c.campaign_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.campaign_id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [evaluatedCampaigns, filterOutcome, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-bold mb-1.5 uppercase tracking-wide">
            Binary ML Classifier
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Campaign Success Classification: Successful vs Unsuccessful</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Machine Learning Decision Tree classifying each marketing campaign into <strong>Successful</strong> (profitable scale candidate) or <strong>Unsuccessful</strong> (unprofitable / capital bleed) based on capital return thresholds.
          </p>
        </div>

        {onOpenUploadModal && (
          <button
            onClick={onOpenUploadModal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer shrink-0"
          >
            <UploadCloud className="h-3.5 w-3.5 text-cyan-400" />
            <span>Upload CSV Dataset</span>
          </button>
        )}
      </div>

      {/* Threshold Controller Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-cyan-400 flex items-center justify-center">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Success Qualification Benchmark
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Campaigns with ROAS ≥ {roasThreshold.toFixed(1)}x qualify as <strong className="text-emerald-500">Successful</strong>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setRoasThreshold(1.5)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                roasThreshold === 1.5
                  ? 'bg-cyan-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              1.5x (Breakeven)
            </button>
            <button
              onClick={() => setRoasThreshold(2.0)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                roasThreshold === 2.0
                  ? 'bg-cyan-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              2.0x (Profitable - Default)
            </button>
            <button
              onClick={() => setRoasThreshold(2.5)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                roasThreshold === 2.5
                  ? 'bg-cyan-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              2.5x (High Return)
            </button>
            <button
              onClick={() => setRoasThreshold(3.0)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                roasThreshold === 3.0
                  ? 'bg-cyan-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              3.0x (Aggressive)
            </button>
          </div>
        </div>
      </div>

      {/* HERO OUTCOME SUMMARY: SUCCESSFUL vs UNSUCCESSFUL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Successful Campaigns */}
        <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-emerald-500/10 to-transparent dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 p-5 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Successful Campaigns
            </span>
            <div className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {stats.successfulCount}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
              {stats.successRate}% of total
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-emerald-500/20 text-xs space-y-1 text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span>Avg ROAS:</span>
              <strong className="font-mono text-emerald-500">{stats.successAvgRoas}x</strong>
            </div>
            <div className="flex justify-between">
              <span>Net Profit:</span>
              <strong className="font-mono text-emerald-500">+${stats.successProfit.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Unsuccessful Campaigns */}
        <div className="rounded-xl border border-rose-500/30 bg-gradient-to-br from-rose-500/5 via-rose-500/10 to-transparent dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-900 p-5 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Unsuccessful Campaigns
            </span>
            <div className="h-7 w-7 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
              {stats.unsuccessfulCount}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-300">
              {stats.unsuccessRate}% of total
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-rose-500/20 text-xs space-y-1 text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span>Avg ROAS:</span>
              <strong className="font-mono text-rose-500">{stats.unsuccessAvgRoas}x</strong>
            </div>
            <div className="flex justify-between">
              <span>Capital Bleed:</span>
              <strong className="font-mono text-rose-500">
                {stats.unsuccessLoss > 0 ? `-$${stats.unsuccessLoss.toLocaleString()}` : '$0'}
              </strong>
            </div>
          </div>
        </div>

        {/* Card 3: Model Accuracy */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Binary Classification Accuracy
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-cyan-500 dark:text-cyan-400">
              {clfResult.binaryAccuracy}%
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Holdout</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
            Successful vs Unsuccessful split verified across {campaigns.length} campaigns.
          </div>
        </div>

        {/* Card 4: F1 Score & Precision */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Model Precision / F1 Score
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-indigo-500 dark:text-indigo-400">
              {clfResult.binaryF1Score}%
            </span>
            <span className="text-[11px] text-slate-400 font-mono">F1-Score</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
            High positive predictive power with minimal False Positives.
          </div>
        </div>
      </div>

      {/* Grid: Confusion Matrix & Playbooks */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 2x2 Binary Confusion Matrix for Successful vs Unsuccessful (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Confusion Matrix: Successful vs Unsuccessful</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ground truth outcome versus Machine Learning predicted outcome
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 font-mono font-bold">
              2x2 Binary Matrix
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead>
                <tr>
                  <th className="p-3 text-left font-semibold text-slate-400 text-[10px] uppercase">
                    Actual \ Predicted
                  </th>
                  <th className="p-3 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 rounded-t-lg">
                    Pred: Successful
                  </th>
                  <th className="p-3 font-bold text-rose-600 dark:text-rose-400 bg-rose-500/5 rounded-t-lg">
                    Pred: Unsuccessful
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                <tr>
                  <td className="p-3 text-left font-sans font-semibold text-emerald-700 dark:text-emerald-300">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span>Actual: Successful</span>
                    </div>
                  </td>
                  <td className="p-3 bg-emerald-500/15 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-base">
                    {clfResult.binaryConfusionMatrix.successful.successful}
                    <div className="text-[10px] font-sans text-emerald-600 dark:text-emerald-400 font-normal">
                      True Positive (TP)
                    </div>
                  </td>
                  <td className="p-3 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400">
                    {clfResult.binaryConfusionMatrix.successful.unsuccessful}
                    <div className="text-[10px] font-sans text-slate-400 font-normal">
                      False Negative (FN)
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-left font-sans font-semibold text-rose-700 dark:text-rose-300">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                      <span>Actual: Unsuccessful</span>
                    </div>
                  </td>
                  <td className="p-3 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400">
                    {clfResult.binaryConfusionMatrix.unsuccessful.successful}
                    <div className="text-[10px] font-sans text-slate-400 font-normal">
                      False Positive (FP)
                    </div>
                  </td>
                  <td className="p-3 bg-rose-500/15 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-bold text-base">
                    {clfResult.binaryConfusionMatrix.unsuccessful.unsuccessful}
                    <div className="text-[10px] font-sans text-rose-600 dark:text-rose-400 font-normal">
                      True Negative (TN)
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Sensitivity (Recall): <strong>{clfResult.binaryRecall}%</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-indigo-400" />
              <span>Precision: <strong>{clfResult.binaryPrecision}%</strong></span>
            </span>
          </div>

          {/* Toggle for 3-Tier Multi-class Matrix */}
          <div className="pt-1">
            <button
              onClick={() => setShowThreeTierMatrix(!showThreeTierMatrix)}
              className="text-xs text-indigo-600 dark:text-cyan-400 hover:underline font-medium cursor-pointer"
            >
              {showThreeTierMatrix ? 'Hide Granular 3-Tier Matrix ▲' : 'Show Granular 3-Tier (High / Med / Low) Matrix ▼'}
            </button>

            {showThreeTierMatrix && (
              <div className="mt-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Multi-Class 3-Tier Distribution:
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-center text-xs">
                    <thead>
                      <tr>
                        <th className="p-1.5 text-left text-[10px] text-slate-400">Actual \ Pred</th>
                        <th className="p-1.5 text-emerald-500">Pred: High</th>
                        <th className="p-1.5 text-amber-500">Pred: Med</th>
                        <th className="p-1.5 text-rose-500">Pred: Low</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                      <tr>
                        <td className="p-1.5 text-left text-emerald-600 font-sans">High</td>
                        <td className="p-1.5 bg-emerald-500/10 font-bold">{clfResult.confusionMatrix.high.high}</td>
                        <td className="p-1.5">{clfResult.confusionMatrix.high.medium}</td>
                        <td className="p-1.5">{clfResult.confusionMatrix.high.low}</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 text-left text-amber-600 font-sans">Medium</td>
                        <td className="p-1.5">{clfResult.confusionMatrix.medium.high}</td>
                        <td className="p-1.5 bg-amber-500/10 font-bold">{clfResult.confusionMatrix.medium.medium}</td>
                        <td className="p-1.5">{clfResult.confusionMatrix.medium.low}</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 text-left text-rose-600 font-sans">Low</td>
                        <td className="p-1.5">{clfResult.confusionMatrix.low.high}</td>
                        <td className="p-1.5">{clfResult.confusionMatrix.low.medium}</td>
                        <td className="p-1.5 bg-rose-500/10 font-bold">{clfResult.confusionMatrix.low.low}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Marketer Action Playbooks (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Strategic Playbook by Classification
            </h3>

            {/* Playbook A: Successful Campaigns */}
            <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Playbook for "Successful" ({stats.successfulCount} campaigns)</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Profitable capital multipliers yielding ROAS ≥ {roasThreshold.toFixed(1)}x.
              </p>
              <ul className="text-[11px] text-emerald-600 dark:text-emerald-400/90 space-y-1 pt-1 list-disc list-inside">
                <li>Increase daily ad spend by +20% every 48 hours</li>
                <li>Extract creative hooks to build lookalike audience campaigns</li>
                <li>Scale budget into peak conversion days and target demographics</li>
              </ul>
            </div>

            {/* Playbook B: Unsuccessful Campaigns */}
            <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400">
                <XCircle className="h-4 w-4" />
                <span>Playbook for "Unsuccessful" ({stats.unsuccessfulCount} campaigns)</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Unprofitable return below {roasThreshold.toFixed(1)}x ROAS causing capital bleed.
              </p>
              <ul className="text-[11px] text-rose-600 dark:text-rose-400/90 space-y-1 pt-1 list-disc list-inside">
                <li>Immediate pause or bid reduction on bottom performers</li>
                <li>Creative audit: Replace creatives with quality score &lt; 6.5</li>
                <li>Restrict targeting to warm retargeting lists to recover profitability</li>
              </ul>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
            ML Decision Tree automatically adjusts classifications whenever the dataset or threshold changes.
          </div>
        </div>
      </div>

      {/* FILTERABLE CAMPAIGNS TABLE: SUCCESSFUL vs UNSUCCESSFUL */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        {/* Table Controls */}
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Buttons */}
            <button
              onClick={() => setFilterOutcome('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterOutcome === 'All'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              All Campaigns ({campaigns.length})
            </button>
            <button
              onClick={() => setFilterOutcome('Successful')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterOutcome === 'Successful'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Successful ({stats.successfulCount})</span>
            </button>
            <button
              onClick={() => setFilterOutcome('Unsuccessful')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterOutcome === 'Unsuccessful'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
              }`}
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Unsuccessful ({stats.unsuccessfulCount})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full sm:w-60 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4 text-center">Classification Outcome</th>
                <th className="py-3 px-4 text-right">Ad Spend</th>
                <th className="py-3 px-4 text-right">Revenue</th>
                <th className="py-3 px-4 text-right">ROAS</th>
                <th className="py-3 px-4 text-right">Net Profit / Loss</th>
                <th className="py-3 px-4 text-center">Creative Score</th>
                <th className="py-3 px-4">Prescribed Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {filteredList.slice(0, 30).map(c => {
                const isSuccess = c.calculatedOutcome === 'Successful';
                return (
                  <tr
                    key={c.campaign_id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-900 dark:text-slate-100 max-w-[200px] truncate">
                      <div>{c.campaign_name}</div>
                      <span className="text-[10px] font-mono text-slate-400">{c.campaign_id}</span>
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-600 dark:text-slate-400">
                      {c.channel}
                    </td>
                    <td className="py-2.5 px-4 text-center font-sans">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isSuccess
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        }`}
                      >
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
                    <td className="py-2.5 px-4 text-right text-slate-700 dark:text-slate-300">
                      ${c.ad_spend.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                      ${c.revenue.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <span
                        className={`font-bold ${
                          isSuccess
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {c.roas.toFixed(2)}x
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <span
                        className={
                          c.netProfit >= 0
                            ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                            : 'text-rose-600 dark:text-rose-400 font-semibold'
                        }
                      >
                        {c.netProfit >= 0 ? `+$${c.netProfit.toLocaleString()}` : `-$${Math.abs(c.netProfit).toLocaleString()}`}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {c.creative_quality_score.toFixed(1)}/10
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-sans text-xs">
                      {isSuccess ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Scale budget +20%
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-medium">
                          Pause / Revamp creative
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredList.length > 30 && (
          <div className="p-3 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
            Showing first 30 of {filteredList.length} campaigns matching filter.
          </div>
        )}
      </div>
    </div>
  );
};
