import React, { useState } from 'react';
import { MarketingRecommendation } from '../../types/campaign';
import {
  Lightbulb,
  TrendingUp,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Filter,
  UploadCloud
} from 'lucide-react';

interface RecsProps {
  recommendations: MarketingRecommendation[];
  onOpenUploadModal?: () => void;
}

export const MarketingRecommendations: React.FC<RecsProps> = ({ recommendations, onOpenUploadModal }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredRecs = recommendations.filter(r => {
    return selectedCategory === 'All' || r.category === selectedCategory;
  });

  const totalProjectedGain = recommendations.reduce((acc, r) => acc + r.estimatedRevenueGain, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Data-Driven Marketing Recommendations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Algorithmic diagnostics derived from Random Forest feature importance rankings, marginal yield drop-offs, and spend elasticity analysis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenUploadModal && (
            <button
              onClick={onOpenUploadModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <UploadCloud className="h-3.5 w-3.5 text-cyan-400" />
              <span>Upload CSV Dataset</span>
            </button>
          )}

          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <div className="text-xs">
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Estimated Pipeline Upside:</span>{' '}
              <strong className="text-emerald-900 dark:text-emerald-200 font-mono font-bold">+${totalProjectedGain.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">Filter Strategy Domain:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:outline-hidden"
          >
            <option value="All">All Categories ({recommendations.length})</option>
            <option value="Channel Budget">Channel Budget Reallocation</option>
            <option value="Creative Quality">Creative Quality & Fatigue</option>
            <option value="Bid Strategy">Bid Strategy & CPC Caps</option>
            <option value="Audience Targeting">Audience Targeting & Retention</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Prioritized by expected incremental ROAS return
        </div>
      </div>

      {/* Recommendations Cards */}
      <div className="space-y-4">
        {filteredRecs.map(rec => (
          <div
            key={rec.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3 transition-shadow hover:shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold ${
                  rec.impact === 'High Impact'
                    ? 'text-indigo-700'
                    : rec.impact === 'Quick Win'
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}>
                  [{rec.impact.toUpperCase()}]
                </span>
                <span className="text-xs font-semibold text-slate-500">· {rec.category}</span>
                {rec.channel && <span className="text-xs text-slate-400 font-mono">· {rec.channel}</span>}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+${rec.estimatedRevenueGain.toLocaleString()} Projected Gain</span>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900">
              {rec.title}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              {rec.description}
            </p>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2.5">
              <ArrowRight className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-800">
                <strong className="text-slate-900">Recommended Action:</strong> {rec.actionableStep}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
