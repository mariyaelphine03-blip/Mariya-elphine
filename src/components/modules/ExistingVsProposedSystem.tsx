import React from 'react';
import {
  GitCompare,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  UploadCloud
} from 'lucide-react';

interface ExistingVsProposedProps {
  onOpenUploadModal?: () => void;
}

export const ExistingVsProposedSystem: React.FC<ExistingVsProposedProps> = ({ onOpenUploadModal }) => {
  const existingSystems = [
    {
      name: 'Google Analytics 4 (GA4)',
      type: 'Web & App Analytics',
      features: [
        'Event-driven behavioral telemetry & clickstream tracking',
        'Multi-touch path exploration and user session journey mapping',
        'Standard conversion goal reporting and audience definitions'
      ],
      limitations: [
        'Strictly retrospective: reports what happened in the past with 24-48h attribution latency',
        'No predictive modeling for cross-channel capital reallocation',
        'Severe data thresholding and sampling on high-traffic properties',
        'Walled garden boundaries prevent direct ingest of raw Meta or TikTok auction logs'
      ]
    },
    {
      name: 'Google Ads',
      type: 'Search & Display Ad Network',
      features: [
        'Smart Bidding algorithms (Target CPA, Target ROAS, Maximize Conversions)',
        'Keyword intent matching, Performance Max automated asset combinations',
        'In-platform conversion tracking and customer match lists'
      ],
      limitations: [
        'Inherently biased: recommendations always urge increasing Google ad budgets',
        'Zero visibility into cross-platform return dynamics (e.g. Meta, LinkedIn, Email)',
        'Black-box machine learning algorithms without transparent feature importance weights',
        'Inability to run holistic portfolio what-if budget simulations'
      ]
    },
    {
      name: 'Meta Ads Manager',
      type: 'Social & Feed Ad Platform',
      features: [
        'Advantage+ shopping campaigns and Lookalike Audience generation',
        'Dynamic creative variations and rich video format delivery',
        'Aggregated Event Measurement protocol for mobile browsers'
      ],
      limitations: [
        'Severe attribution degradation following Apple iOS 14.5 ATT privacy framework',
        'Over-reports 1-day view-through conversions, artificially inflating reported ROAS',
        'Isolated ecosystem with no cross-channel deduplication against Google Search clicks',
        'Lack of regression modeling to forecast diminishing returns as budgets scale'
      ]
    },
    {
      name: 'Microsoft Excel / Spreadsheets',
      type: 'Manual Tabular Tool',
      features: [
        'Flexible cell calculations, SUMIFs, VLOOKUP / XLOOKUP formulas',
        'Custom pivot tables and basic static bar/pie chart generation',
        'Familiar interface accessible to non-technical marketing practitioners'
      ],
      limitations: [
        'Prone to catastrophic copy-paste human errors and broken formula links',
        'Cannot train non-linear machine learning algorithms (Decision Trees, Random Forests)',
        'Static snapshots requiring laborious weekly manual CSV exports',
        'Severe performance bottlenecks and formula crashes on datasets exceeding 50,000 rows'
      ]
    }
  ];

  const comparisonTable = [
    {
      dimension: 'Predictive ML Modeling',
      ga4: 'No (Historical only)',
      gAds: 'Siloed Black-Box',
      meta: 'Siloed Black-Box',
      excel: 'Formulas Only',
      proposed: 'Random Forest, Decision Tree & Ridge OLS'
    },
    {
      dimension: 'Cross-Network Unified Ingest',
      ga4: 'Limited (UTMs)',
      gAds: 'Google Only',
      meta: 'Meta Only',
      excel: 'Manual CSV Paste',
      proposed: 'Unified Ingestion (Google, Meta, TikTok, LinkedIn, Email)'
    },
    {
      dimension: 'What-If Budget Simulator',
      ga4: 'None',
      gAds: 'Google Performance Planner',
      meta: 'None',
      excel: 'Manual static math',
      proposed: 'Dynamic Non-linear Diminishing Returns Simulator'
    },
    {
      dimension: 'Feature Importance & Correlation',
      ga4: 'None',
      gAds: 'Hidden / Black-box',
      meta: 'Hidden / Black-box',
      excel: 'Basic CORREL function',
      proposed: 'Pearson Heatmaps & Gini Feature Importance Ranks'
    },
    {
      dimension: 'Automated Tier Classification',
      ga4: 'None',
      gAds: 'None',
      meta: 'None',
      excel: 'Nested IF Statements',
      proposed: 'Multi-Class Tree Classifier (High/Med/Low Tier)'
    },
    {
      dimension: 'Unbiased Optimization Advice',
      ga4: 'Neutral',
      gAds: 'Biased to Google',
      meta: 'Biased to Meta',
      excel: 'User-dependent',
      proposed: 'Objective Econometric Reallocations'
    },
    {
      dimension: 'Data Privacy & Execution',
      ga4: 'Cloud Hosted',
      gAds: 'Cloud Hosted',
      meta: 'Cloud Hosted',
      excel: 'Local File',
      proposed: '100% Client-Side In-Memory Execution'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Existing Systems vs. Proposed Machine Learning Platform
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Architectural evaluation comparing legacy siloed advertising tools and manual spreadsheets against our unified predictive machine learning solution.
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

      {/* Proposed System Highlight Banner */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">
              The Proposed System: Unified Multi-Channel Machine Learning Engine
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Unlike existing siloed platforms, this system combines multi-variable linear regression, pruned decision trees, and ensemble random forests in one cohesive dashboard. It empowers marketing teams to audit feature correlations, forecast revenue and conversions prior to spending capital, classify campaign health tiers, and simulate multi-channel budget trade-offs without data silos or platform bias.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 4 Legacy Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {existingSystems.map(sys => (
          <div key={sys.name} className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{sys.name}</h4>
                <span className="text-[11px] text-slate-500">{sys.type}</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">Legacy Tool</span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">Features:</span>
              <ul className="text-xs text-slate-600 space-y-1">
                {sys.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-slate-400 font-bold">·</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <span className="text-[11px] font-bold text-rose-700 block uppercase tracking-wider">Critical Limitations:</span>
              <ul className="text-xs text-rose-700/90 space-y-1">
                {sys.limitations.map((lim, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Comparative Evaluation Matrix Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-200 p-4 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Feature & Capability Comparison Matrix
            </h3>
          </div>
          <span className="text-xs text-slate-500">Comprehensive Architectural Evaluation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Capability Dimension</th>
                <th className="py-3 px-3">Google Analytics 4</th>
                <th className="py-3 px-3">Google Ads</th>
                <th className="py-3 px-3">Meta Ads</th>
                <th className="py-3 px-3">MS Excel</th>
                <th className="py-3 px-4 bg-indigo-50/75 text-indigo-950 font-bold">Proposed ML System</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {comparisonTable.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/75 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{row.dimension}</td>
                  <td className="py-3 px-3 text-slate-600">{row.ga4}</td>
                  <td className="py-3 px-3 text-slate-600">{row.gAds}</td>
                  <td className="py-3 px-3 text-slate-600">{row.meta}</td>
                  <td className="py-3 px-3 text-slate-600">{row.excel}</td>
                  <td className="py-3 px-4 font-semibold text-indigo-800 bg-indigo-50/40">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                      <span>{row.proposed}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
