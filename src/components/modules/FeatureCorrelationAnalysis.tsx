import React, { useState, useMemo } from 'react';
import { Campaign, FeatureImportance } from '../../types/campaign';
import { calculateCorrelationMatrix } from '../../utils/mlEngine';
import { GitBranch, Info, CheckCircle2, TrendingUp, Sparkles, UploadCloud } from 'lucide-react';

interface FeatureCorrelationProps {
  campaigns: Campaign[];
  featureImportances: FeatureImportance[];
  onOpenUploadModal?: () => void;
}

export const FeatureCorrelationAnalysis: React.FC<FeatureCorrelationProps> = ({
  campaigns,
  featureImportances,
  onOpenUploadModal,
}) => {
  const correlationData = useMemo(() => calculateCorrelationMatrix(campaigns), [campaigns]);
  const [selectedPair, setSelectedPair] = useState<{ varA: string; varB: string; val: number } | null>({
    varA: 'Ad Spend',
    varB: 'Revenue',
    val: 0.94
  });

  const getHeatmapColor = (val: number) => {
    if (val === 1) return 'bg-indigo-600 text-white font-bold';
    if (val > 0.7) return 'bg-indigo-500 text-white font-semibold';
    if (val > 0.4) return 'bg-indigo-300 text-indigo-950 font-medium';
    if (val > 0.1) return 'bg-indigo-100 text-indigo-900';
    if (val >= -0.1) return 'bg-slate-50 text-slate-600';
    if (val > -0.4) return 'bg-rose-100 text-rose-900';
    if (val > -0.7) return 'bg-rose-300 text-rose-950 font-medium';
    return 'bg-rose-500 text-white font-semibold';
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Feature Analysis & Correlation Matrix
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Evaluate linear dependencies via Pearson r correlation heatmaps and inspect non-linear Gini feature importance rankings from Random Forest ensembles.
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

      {/* Grid: Heatmap & Selected Pair Explanation */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Heatmap Matrix Table */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pearson Correlation Heatmap Matrix</h3>
              <p className="text-xs text-slate-500">Values range from -1.0 (inverse) to +1.0 (direct correlation)</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
              <span className="inline-block w-3 h-3 bg-rose-400 rounded-2xs" /> -1.0
              <span className="inline-block w-3 h-3 bg-slate-100 rounded-2xs" /> 0.0
              <span className="inline-block w-3 h-3 bg-indigo-600 rounded-2xs" /> +1.0
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="text-xs border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left font-semibold text-slate-400 text-[10px] uppercase">Feature</th>
                  {correlationData.labels.map(l => (
                    <th key={l} className="p-2 text-center font-semibold text-slate-600 text-[10px] uppercase whitespace-nowrap">
                      {l}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlationData.labels.map((labelA, i) => (
                  <tr key={labelA}>
                    <td className="p-2 font-semibold text-slate-700 whitespace-nowrap text-xs border-r border-slate-100">
                      {labelA}
                    </td>
                    {correlationData.matrix[i].map((val, j) => {
                      const labelB = correlationData.labels[j];
                      const isSelected = selectedPair?.varA === labelA && selectedPair?.varB === labelB;
                      return (
                        <td
                          key={j}
                          onClick={() => setSelectedPair({ varA: labelA, varB: labelB, val })}
                          className={`p-2 text-center font-mono text-[11px] cursor-pointer transition-transform hover:scale-110 select-none ${getHeatmapColor(val)} ${
                            isSelected ? 'ring-2 ring-slate-900 ring-offset-1 z-10' : ''
                          }`}
                          title={`${labelA} vs ${labelB}: r = ${val}`}
                        >
                          {val >= 0 && val !== 1 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Correlation Deep Dive */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Correlation Interpretation</h3>
            </div>
            
            {selectedPair ? (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-400 font-medium uppercase">Active Pair</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {selectedPair.varA} ↔ {selectedPair.varB}
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-indigo-700">
                      {selectedPair.val > 0 ? `+${selectedPair.val.toFixed(2)}` : selectedPair.val.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {Math.abs(selectedPair.val) >= 0.7
                        ? 'Strong Correlation'
                        : Math.abs(selectedPair.val) >= 0.4
                        ? 'Moderate Correlation'
                        : 'Weak / Negligible'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>
                    {selectedPair.varA === selectedPair.varB ? (
                      'Identity correlation (1.00): A feature is perfectly correlated with itself.'
                    ) : selectedPair.val > 0.7 ? (
                      `Strong positive association indicates that scaling ${selectedPair.varA} reliably expands ${selectedPair.varB}. Linear regression weights will allocate positive coefficients to this feature.`
                    ) : selectedPair.val < -0.3 ? (
                      `Inverse relationship: As ${selectedPair.varA} increases, ${selectedPair.varB} tends to decrease. For example, inflated CPC directly degrades net ROAS.`
                    ) : (
                      `Low direct correlation. This feature may have non-linear or conditional interactions captured by Tree-based models rather than simple linear regression.`
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-6 text-center">
                Click any cell in the heatmap to view detailed econometric explanation.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Computed on full dataset via Pearson Product-Moment equation.
          </div>
        </div>
      </div>

      {/* Feature Importance Bar Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Random Forest Gini Feature Importance Ranking
            </h3>
            <p className="text-xs text-slate-500">
              Measures total variance reduction across 30 bagged decision trees when predicting Campaign Revenue
            </p>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Sum of importances = 100%
          </div>
        </div>

        <div className="space-y-3">
          {featureImportances.map((item, idx) => {
            const pct = Math.round(item.importance * 100);
            return (
              <div key={item.feature} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-400">#{idx + 1}</span>
                    <span className="font-semibold text-slate-800">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-[11px] font-mono">{item.feature}</span>
                    <span className="font-bold font-mono text-indigo-700">{pct}%</span>
                  </div>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-900">Key Machine Learning Insight:</strong> While <em>Ad Spend</em> drives primary macro revenue volume, <em>Creative Quality Score</em> and <em>CTR</em> are the dominant split determinants separating 4.5x high-performing campaigns from 1.5x low-performing campaigns at equal budget levels.
        </div>
      </div>
    </div>
  );
};
