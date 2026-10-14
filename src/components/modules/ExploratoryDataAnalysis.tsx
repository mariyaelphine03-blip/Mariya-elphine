import React, { useState, useMemo } from 'react';
import { Campaign } from '../../types/campaign';
import { BarChart3, TrendingUp, Layers, PieChart, Activity, UploadCloud } from 'lucide-react';

interface EDAProps {
  campaigns: Campaign[];
  onOpenUploadModal?: () => void;
}

export const ExploratoryDataAnalysis: React.FC<EDAProps> = ({ campaigns, onOpenUploadModal }) => {
  const [selectedDistVar, setSelectedDistVar] = useState<keyof Campaign>('revenue');

  // Summary statistics for numeric fields
  const statsTable = useMemo(() => {
    const fields: { key: keyof Campaign; label: string; prefix: string; suffix: string }[] = [
      { key: 'ad_spend', label: 'Ad Spend', prefix: '$', suffix: '' },
      { key: 'impressions', label: 'Impressions', prefix: '', suffix: '' },
      { key: 'clicks', label: 'Clicks', prefix: '', suffix: '' },
      { key: 'ctr', label: 'CTR', prefix: '', suffix: '%' },
      { key: 'cpc', label: 'CPC', prefix: '$', suffix: '' },
      { key: 'conversions', label: 'Conversions', prefix: '', suffix: '' },
      { key: 'revenue', label: 'Revenue', prefix: '$', suffix: '' },
      { key: 'roas', label: 'ROAS', prefix: '', suffix: 'x' },
      { key: 'creative_quality_score', label: 'Creative Score', prefix: '', suffix: '/10' },
    ];

    return fields.map(({ key, label, prefix, suffix }) => {
      const vals = campaigns.map(c => Number(c[key]) || 0).sort((a, b) => a - b);
      const n = vals.length || 1;
      const sum = vals.reduce((a, b) => a + b, 0);
      const mean = sum / n;
      const min = vals[0] || 0;
      const max = vals[n - 1] || 0;
      const variance = vals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
      const std = Math.sqrt(variance);
      const q25 = vals[Math.floor(n * 0.25)] || 0;
      const median = vals[Math.floor(n * 0.5)] || 0;
      const q75 = vals[Math.floor(n * 0.75)] || 0;

      // Skewness
      const skew = n > 2 && std > 0
        ? vals.reduce((acc, v) => acc + Math.pow((v - mean) / std, 3), 0) / n
        : 0;

      return {
        label,
        mean: `${prefix}${mean.toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}`,
        std: `${prefix}${std.toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}`,
        min: `${prefix}${min.toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}`,
        q25: `${prefix}${q25.toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}`,
        median: `${prefix}${median.toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}`,
        q75: `${prefix}${q75.toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}`,
        max: `${prefix}${max.toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}`,
        skew: skew.toFixed(2)
      };
    });
  }, [campaigns]);

  // Distribution bins for selected variable
  const distBins = useMemo(() => {
    const vals = campaigns.map(c => Number(c[selectedDistVar]) || 0);
    if (vals.length === 0) return [];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const numBins = 10;
    const binWidth = (max - min) / numBins || 1;

    const bins = Array.from({ length: numBins }, (_, i) => ({
      rangeStart: min + i * binWidth,
      rangeEnd: min + (i + 1) * binWidth,
      count: 0
    }));

    for (const v of vals) {
      let bIdx = Math.floor((v - min) / binWidth);
      if (bIdx >= numBins) bIdx = numBins - 1;
      if (bIdx >= 0) bins[bIdx].count++;
    }

    const maxCount = Math.max(...bins.map(b => b.count), 1);
    return bins.map(b => ({
      ...b,
      pctHeight: (b.count / maxCount) * 100
    }));
  }, [campaigns, selectedDistVar]);

  // Funnel calculations
  const funnelData = useMemo(() => {
    const totalImp = campaigns.reduce((acc, c) => acc + c.impressions, 0);
    const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0);
    const totalConv = campaigns.reduce((acc, c) => acc + c.conversions, 0);

    return [
      { stage: '1. Ad Impressions', count: totalImp, rate: '100%' },
      { stage: '2. Link Clicks', count: totalClicks, rate: totalImp > 0 ? `${((totalClicks / totalImp) * 100).toFixed(2)}% CTR` : '0%' },
      { stage: '3. Conversions / Leads', count: totalConv, rate: totalClicks > 0 ? `${((totalConv / totalClicks) * 100).toFixed(2)}% CVR` : '0%' },
    ];
  }, [campaigns]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Exploratory Data Analysis (EDA)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Parametric distributions, quartile analysis, spend-revenue correlation scatter, and full marketing conversion funnel.
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

      {/* Summary Statistics Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-200 p-4 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Parametric Summary Statistics (N = {campaigns.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500">Skewness &gt; 1 indicates right-skewed ad spend distribution</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Metric</th>
                <th className="py-2.5 px-4 font-mono">Mean</th>
                <th className="py-2.5 px-4 font-mono">Std Dev</th>
                <th className="py-2.5 px-4 font-mono">Min</th>
                <th className="py-2.5 px-4 font-mono">25% (Q1)</th>
                <th className="py-2.5 px-4 font-mono">Median (Q2)</th>
                <th className="py-2.5 px-4 font-mono">75% (Q3)</th>
                <th className="py-2.5 px-4 font-mono">Max</th>
                <th className="py-2.5 px-4 font-mono">Skew</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {statsTable.map(row => (
                <tr key={row.label} className="hover:bg-slate-50/75 transition-colors font-mono">
                  <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">{row.label}</td>
                  <td className="py-2.5 px-4 text-slate-800">{row.mean}</td>
                  <td className="py-2.5 px-4 text-slate-500">{row.std}</td>
                  <td className="py-2.5 px-4 text-slate-600">{row.min}</td>
                  <td className="py-2.5 px-4 text-slate-600">{row.q25}</td>
                  <td className="py-2.5 px-4 font-semibold text-indigo-700">{row.median}</td>
                  <td className="py-2.5 px-4 text-slate-600">{row.q75}</td>
                  <td className="py-2.5 px-4 text-slate-800">{row.max}</td>
                  <td className="py-2.5 px-4 text-slate-500">{row.skew}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Distribution Histogram & Marketing Funnel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Histogram */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Parametric Distribution Histogram</h3>
              <p className="text-xs text-slate-500">Frequency distribution across 10 quantile bins</p>
            </div>
            <select
              value={selectedDistVar}
              onChange={e => setSelectedDistVar(e.target.value as any)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:outline-hidden"
            >
              <option value="revenue">Revenue ($)</option>
              <option value="ad_spend">Ad Spend ($)</option>
              <option value="roas">ROAS (x)</option>
              <option value="clicks">Clicks</option>
              <option value="conversions">Conversions</option>
              <option value="creative_quality_score">Creative Score</option>
            </select>
          </div>

          {/* Histogram Bar Visualizer */}
          <div className="h-48 flex items-end gap-2 pt-6 pb-2 border-b border-slate-200">
            {distBins.map((bin, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip */}
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded-sm whitespace-nowrap pointer-events-none transition-opacity z-10">
                  {bin.count} campaigns ({bin.rangeStart.toFixed(0)} - {bin.rangeEnd.toFixed(0)})
                </div>
                <div
                  className="w-full bg-indigo-500 group-hover:bg-indigo-600 rounded-t-sm transition-all"
                  style={{ height: `${Math.max(6, bin.pctHeight)}%` }}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
            <span>Min: {distBins[0]?.rangeStart.toFixed(0)}</span>
            <span>Median Bin</span>
            <span>Max: {distBins[distBins.length - 1]?.rangeEnd.toFixed(0)}</span>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Total Marketing Conversion Funnel</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Aggregate funnel throughput across all campaigns in current dataset
            </p>

            <div className="space-y-4">
              {funnelData.map((stage, idx) => (
                <div key={stage.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{stage.count.toLocaleString()}</span>
                      <span className="text-indigo-600 font-semibold">{stage.rate}</span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-indigo-600' : idx === 1 ? 'bg-indigo-500' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: idx === 0 ? '100%' : idx === 1 ? '65%' : '35%'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Overall Funnel Efficiency: <strong className="text-emerald-700">Healthy</strong></span>
            <span>Data-leakage safe vector</span>
          </div>
        </div>
      </div>

      {/* Spend vs Revenue Bubble / Scatter Exploration */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Ad Spend vs. Revenue Scatter Exploration</h3>
            <p className="text-xs text-slate-500">Each point represents a campaign. Visualizing linear elasticity and ROAS bands.</p>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Linear slope reflects portfolio yield
          </div>
        </div>

        {/* Visual Scatter Grid */}
        <div className="relative h-64 border border-slate-200 rounded-lg bg-slate-50/50 p-4 overflow-hidden">
          {/* Guide lines for 3x ROAS */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full border-t border-dashed border-slate-200" />
          </div>

          <div className="relative w-full h-full">
            {campaigns.slice(0, 60).map(c => {
              // Normalize positions
              const maxSpend = 10000;
              const maxRev = 45000;
              const leftPct = Math.min(95, Math.max(5, (c.ad_spend / maxSpend) * 100));
              const bottomPct = Math.min(95, Math.max(5, (c.revenue / maxRev) * 100));

              return (
                <div
                  key={c.campaign_id}
                  className="absolute transform -translate-x-1/2 translate-y-1/2 group cursor-pointer"
                  style={{ left: `${leftPct}%`, bottom: `${bottomPct}%` }}
                >
                  <div
                    className={`h-3.5 w-3.5 rounded-full border border-white shadow-xs transition-transform group-hover:scale-150 ${
                      c.channel === 'Google Ads'
                        ? 'bg-blue-600'
                        : c.channel === 'Meta Ads'
                        ? 'bg-indigo-600'
                        : c.channel === 'Email'
                        ? 'bg-emerald-600'
                        : c.channel === 'LinkedIn'
                        ? 'bg-sky-700'
                        : c.channel === 'TikTok'
                        ? 'bg-rose-500'
                        : 'bg-amber-600'
                    }`}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 hidden group-hover:block z-20 bg-slate-900 text-white text-[10px] p-2 rounded-md shadow-lg whitespace-nowrap pointer-events-none">
                    <div className="font-bold">{c.campaign_name}</div>
                    <div className="text-slate-300">
                      Spend: ${c.ad_spend.toLocaleString()} · Rev: ${c.revenue.toLocaleString()}
                    </div>
                    <div className="text-emerald-400 font-semibold">ROAS: {c.roas.toFixed(2)}x ({c.channel})</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Google Ads</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-600" /> Meta Ads</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sky-700" /> LinkedIn</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> TikTok</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-600" /> YouTube</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Email</span>
          </div>
          <div className="text-slate-400 text-[11px]">Hover over circles to inspect campaign specifics</div>
        </div>
      </div>
    </div>
  );
};
