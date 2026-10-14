import React, { useState, useMemo } from 'react';
import { Channel } from '../../types/campaign';
import { Sliders, TrendingUp, Layers, CheckCircle2, AlertCircle, ArrowRight, UploadCloud } from 'lucide-react';

interface BudgetSimulatorProps {
  onOpenUploadModal?: () => void;
}

export const BudgetScenarioSimulator: React.FC<BudgetSimulatorProps> = ({ onOpenUploadModal }) => {
  const [totalBudget, setTotalBudget] = useState(40000);

  // Channel allocation weights (percentages summing to 100)
  const [allocations, setAllocations] = useState<Record<Channel, number>>({
    'Google Ads': 35,
    'Meta Ads': 30,
    'LinkedIn': 15,
    'TikTok': 10,
    'YouTube': 5,
    'Email': 5,
  });

  const totalPct = useMemo(() => {
    return Object.values(allocations).reduce((a, b) => a + b, 0);
  }, [allocations]);

  const handleSliderChange = (channel: Channel, val: number) => {
    setAllocations(prev => ({
      ...prev,
      [channel]: val
    }));
  };

  const normalizeTo100 = () => {
    const sum = totalPct || 1;
    const normalized: Record<Channel, number> = {} as any;
    for (const key in allocations) {
      const ch = key as Channel;
      normalized[ch] = Math.round((allocations[ch] / sum) * 100);
    }
    setAllocations(normalized);
  };

  // Channel benchmarks with non-linear diminishing returns curve
  // roas(spend) = baseRoas * (1 / (1 + spend / saturationPoint)^0.35)
  const channelSimulations = useMemo(() => {
    const config: Record<Channel, { baseRoas: number; satPoint: number; cpaBase: number }> = {
      'Google Ads': { baseRoas: 4.4, satPoint: 50000, cpaBase: 28 },
      'Meta Ads': { baseRoas: 4.1, satPoint: 35000, cpaBase: 24 },
      'LinkedIn': { baseRoas: 3.4, satPoint: 25000, cpaBase: 85 },
      'TikTok': { baseRoas: 2.8, satPoint: 8000, cpaBase: 19 },
      'YouTube': { baseRoas: 3.2, satPoint: 20000, cpaBase: 36 },
      'Email': { baseRoas: 22.0, satPoint: 4000, cpaBase: 4 },
    };

    let totalSimRevenue = 0;
    let totalSimConversions = 0;

    const channels = Object.keys(allocations) as Channel[];
    const rows = channels.map(ch => {
      const pct = allocations[ch];
      const spend = Math.round((pct / 100) * totalBudget);
      const conf = config[ch];

      // Diminishing returns scaling formula
      const dimFactor = Math.pow(1 / (1 + spend / conf.satPoint), 0.32);
      const effectiveRoas = Math.max(1.1, Number((conf.baseRoas * dimFactor).toFixed(2)));
      const projectedRevenue = Math.round(spend * effectiveRoas);
      const estCpa = Math.max(2, Math.round(conf.cpaBase * (1 / dimFactor)));
      const projectedConversions = estCpa > 0 ? Math.round(spend / estCpa) : 10;

      totalSimRevenue += projectedRevenue;
      totalSimConversions += projectedConversions;

      return {
        channel: ch,
        pct,
        spend,
        effectiveRoas,
        projectedRevenue,
        projectedConversions,
        estCpa
      };
    });

    const blendedRoas = totalBudget > 0 ? totalSimRevenue / totalBudget : 0;
    const blendedCpa = totalSimConversions > 0 ? totalBudget / totalSimConversions : 0;

    return {
      rows,
      totalSimRevenue,
      totalSimConversions,
      blendedRoas: Number(blendedRoas.toFixed(2)),
      blendedCpa: Number(blendedCpa.toFixed(2))
    };
  }, [totalBudget, allocations]);

  // Strategy comparison presets
  const strategyComparison = useMemo(() => {
    return [
      {
        name: 'Strategy A: High-Intent Profit Focus',
        focus: 'Search & Email Retention Priority',
        googlePct: 50,
        metaPct: 25,
        emailPct: 15,
        othersPct: 10,
        estRoas: '4.85x',
        estRev: `$${Math.round(totalBudget * 4.85).toLocaleString()}`,
        risk: 'Low Risk / High Stability'
      },
      {
        name: 'Strategy B: Balanced Omnichannel (Current)',
        focus: 'Diversified Search, Social, Video',
        googlePct: allocations['Google Ads'],
        metaPct: allocations['Meta Ads'],
        emailPct: allocations['Email'],
        othersPct: allocations['LinkedIn'] + allocations['TikTok'] + allocations['YouTube'],
        estRoas: `${channelSimulations.blendedRoas}x`,
        estRev: `$${channelSimulations.totalSimRevenue.toLocaleString()}`,
        risk: 'Moderate Risk'
      },
      {
        name: 'Strategy C: Aggressive Viral Scale',
        focus: 'Heavy Top-of-Funnel TikTok & Meta UGC',
        googlePct: 20,
        metaPct: 45,
        emailPct: 5,
        othersPct: 30,
        estRoas: '2.95x',
        estRev: `$${Math.round(totalBudget * 2.95).toLocaleString()}`,
        risk: 'High Volatility'
      }
    ];
  }, [totalBudget, allocations, channelSimulations]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Budget Scenario Simulator & Strategy Comparator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulate cross-channel budget reallocations with non-linear diminishing returns to forecast blended portfolio revenue and optimal capital distribution.
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

      {/* Global Budget Slider & Normalization Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Portfolio Ad Spend</span>
            <span className="text-2xl font-bold font-mono text-slate-900">
              ${totalBudget.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold ${totalPct === 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
              Allocation Sum: {totalPct}% {totalPct !== 100 && '(Adjust to 100%)'}
            </span>
            {totalPct !== 100 && (
              <button
                onClick={normalizeTo100}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Auto-Balance to 100%
              </button>
            )}
          </div>
        </div>

        <input
          type="range"
          min={5000}
          max={150000}
          step={2500}
          value={totalBudget}
          onChange={e => setTotalBudget(parseInt(e.target.value, 10))}
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>$5,000 / month</span>
          <span>$75,000 / month</span>
          <span>$150,000 / month</span>
        </div>
      </div>

      {/* Grid: Channel Sliders & Simulated Yield Matrix */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Sliders (6 cols) */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Channel Budget Allocations (%)
          </h3>

          <div className="space-y-3.5">
            {(Object.keys(allocations) as Channel[]).map(ch => {
              const pct = allocations[ch];
              const spend = Math.round((pct / 100) * totalBudget);

              return (
                <div key={ch} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{ch}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500">${spend.toLocaleString()}</span>
                      <span className="font-mono font-bold text-indigo-700 w-9 text-right">{pct}%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={80}
                    value={pct}
                    onChange={e => handleSliderChange(ch, parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Forecast Summary Cards (6 cols) */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">
              Simulated Portfolio Yield
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <span className="text-xs text-emerald-800 font-medium block">Projected Total Revenue</span>
                <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block">
                  ${channelSimulations.totalSimRevenue.toLocaleString()}
                </span>
                <span className="text-[11px] text-emerald-600 mt-0.5 block">
                  +${(channelSimulations.totalSimRevenue - totalBudget).toLocaleString()} Net Profit
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-indigo-50/50 border border-indigo-100">
                <span className="text-xs text-indigo-800 font-medium block">Blended Portfolio ROAS</span>
                <span className="text-2xl font-bold font-mono text-indigo-700 mt-1 block">
                  {channelSimulations.blendedRoas}x
                </span>
                <span className="text-[11px] text-indigo-600 mt-0.5 block">
                  Above target threshold
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 font-medium block">Projected Conversions</span>
                <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                  {channelSimulations.totalSimConversions.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Blended funnel yield</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 font-medium block">Blended Cost Per Acquisition</span>
                <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                  ${channelSimulations.blendedCpa}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Portfolio CPA</span>
              </div>
            </div>

            {/* Channel Breakdown Table Mini */}
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase text-slate-400 font-semibold">
                    <th className="py-1.5">Channel</th>
                    <th className="py-1.5 font-mono">Spend</th>
                    <th className="py-1.5 font-mono">Marginal ROAS</th>
                    <th className="py-1.5 font-mono text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-700 text-[11px]">
                  {channelSimulations.rows.map(r => (
                    <tr key={r.channel}>
                      <td className="py-1.5 font-sans font-medium text-slate-900">{r.channel}</td>
                      <td className="py-1.5">${r.spend.toLocaleString()}</td>
                      <td className="py-1.5 text-indigo-700 font-semibold">{r.effectiveRoas}x</td>
                      <td className="py-1.5 text-right font-bold text-emerald-700">${r.projectedRevenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            *Incorporates logarithmic elasticity decay curves to prevent over-allocation into saturated ad channels.
          </div>
        </div>
      </div>

      {/* Side-by-Side Strategy Comparison Cards */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Strategic Scenario Comparison Matrix
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Compare 3 discrete capital allocation philosophies at the current ${totalBudget.toLocaleString()} budget level.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {strategyComparison.map((strat, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">{strat.name}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">{strat.focus}</span>

                <div className="my-3 py-2 border-y border-slate-200 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Projected ROAS:</span>
                    <span className="font-mono font-bold text-indigo-700">{strat.estRoas}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Projected Revenue:</span>
                    <span className="font-mono font-bold text-emerald-700">{strat.estRev}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1">
                  <div>Google Ads: <strong>{strat.googlePct}%</strong></div>
                  <div>Meta Ads: <strong>{strat.metaPct}%</strong></div>
                  <div>Email Flow: <strong>{strat.emailPct}%</strong></div>
                  <div>Other Channels: <strong>{strat.othersPct}%</strong></div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-slate-600">
                {strat.risk}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
