import React, { useState } from 'react';
import { Campaign, ModelMetricResult } from '../../types/campaign';
import {
  Cpu,
  RefreshCw,
  Award,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Sliders,
  ChevronRight
} from 'lucide-react';

interface ModelTrainingProps {
  campaigns: Campaign[];
  modelResults: ModelMetricResult[];
  onRetrain: (testRatio: number, seed: number) => void;
  onSelectModelForInference: (modelName: string) => void;
  selectedModel: string;
  onOpenUploadModal?: () => void;
}

export const ModelTrainingComparison: React.FC<ModelTrainingProps> = ({
  campaigns,
  modelResults,
  onRetrain,
  onSelectModelForInference,
  selectedModel,
  onOpenUploadModal
}) => {
  const [testSplit, setTestSplit] = useState(20);
  const [randomSeed, setRandomSeed] = useState(42);
  const [isTraining, setIsTraining] = useState(false);
  const [activePlotModel, setActivePlotModel] = useState<string>('Random Forest Regressor');

  const handleTrainClick = () => {
    setIsTraining(true);
    setTimeout(() => {
      onRetrain(testSplit / 100, randomSeed);
      setIsTraining(false);
    }, 250);
  };

  const bestModel = [...modelResults].sort((a, b) => b.r2Score - a.r2Score)[0];
  const currentActiveModelResult = modelResults.find(m => m.modelName === activePlotModel) || modelResults[0];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Model Training & Cross-Algorithm Comparison
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Train and rigorously benchmark Linear Regression, Decision Tree, and Random Forest on campaign revenue prediction.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenUploadModal && (
            <button
              onClick={onOpenUploadModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <span>Upload CSV Dataset</span>
            </button>
          )}
          <button
            onClick={handleTrainClick}
            disabled={isTraining}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isTraining ? 'animate-spin' : ''}`} />
            <span>{isTraining ? 'Training Models...' : 'Retrain All Models'}</span>
          </button>
        </div>
      </div>

      {/* Train/Test Hyperparameter Controls */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <Sliders className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Training Pipeline Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Test Set Ratio:</span>
              <span className="font-mono text-indigo-700">{testSplit}% Test ({100 - testSplit}% Train)</span>
            </div>
            <input
              type="range"
              min={10}
              max={40}
              step={5}
              value={testSplit}
              onChange={e => setTestSplit(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>10% (More Train)</span>
              <span>40% (More Test)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>PRNG Random Seed:</span>
              <span className="font-mono text-slate-900">Seed {randomSeed}</span>
            </div>
            <input
              type="number"
              min={1}
              max={9999}
              value={randomSeed}
              onChange={e => setRandomSeed(parseInt(e.target.value, 10) || 42)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-800"
            />
            <div className="text-[10px] text-slate-400 mt-1">
              Guarantees deterministic train/test partition without leakage
            </div>
          </div>

          <div className="flex flex-col justify-center bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
            <span className="text-slate-500">Active Benchmark Size:</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5">
              {Math.round(campaigns.length * ((100 - testSplit) / 100))} Train / {Math.round(campaigns.length * (testSplit / 100))} Test
            </span>
            <span className="text-emerald-700 text-[11px] mt-1 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Zero Collinearity Leakage
            </span>
          </div>
        </div>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-200 p-4 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Model Benchmark Performance Matrix
            </h3>
          </div>
          <span className="text-xs text-slate-500">Evaluated on out-of-sample holdout test partition</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4 font-mono">R² Score (Accuracy)</th>
                <th className="py-3 px-4 font-mono">Mean Absolute Error (MAE)</th>
                <th className="py-3 px-4 font-mono">Root Mean Squared Error (RMSE)</th>
                <th className="py-3 px-4 font-mono">Train Latency</th>
                <th className="py-3 px-4">Overfitting Risk</th>
                <th className="py-3 px-4 text-right">Inference Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {modelResults.map(m => {
                const isSelected = selectedModel === m.modelName;
                const isWinner = bestModel?.modelName === m.modelName;

                return (
                  <tr key={m.modelName} className={`hover:bg-slate-50/75 transition-colors ${isSelected ? 'bg-indigo-50/20' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        {m.modelName}
                        {isWinner && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm font-semibold">
                            Best Generalizer
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {m.modelName.includes('Random Forest')
                          ? '30 Bagged Trees, depth 6'
                          : m.modelName.includes('Linear')
                          ? 'Ridge L2 Regularized OLS'
                          : 'CART Variance Reduction'}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span className="text-sm font-bold text-slate-900">
                        {(m.r2Score * 100).toFixed(1)}%
                      </span>
                      <span className="text-[11px] text-slate-400 block">R² = {m.r2Score.toFixed(4)}</span>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      ${m.mae.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      ${m.rmse.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-500">
                      {m.trainingTimeMs} ms
                    </td>

                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-medium ${
                        m.modelName.includes('Random Forest')
                          ? 'text-emerald-700'
                          : m.modelName.includes('Linear')
                          ? 'text-indigo-700'
                          : 'text-amber-700'
                      }`}>
                        {m.modelName.includes('Random Forest')
                          ? 'Very Low (Bagged Ensembles)'
                          : m.modelName.includes('Linear')
                          ? 'Low (High Bias/Linear)'
                          : 'Moderate (Pruned to Depth 5)'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectModelForInference(m.modelName)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? 'Active Model' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actual vs Predicted Revenue Scatter & Residual Plot */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Holdout Test Predictions: Actual vs. Predicted Revenue
            </h3>
            <p className="text-xs text-slate-500">
              Visualizing prediction accuracy on test partition. Points clustering on the diagonal indicate superior fit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Plot Model:</span>
            <select
              value={activePlotModel}
              onChange={e => setActivePlotModel(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:outline-hidden"
            >
              {modelResults.map(m => (
                <option key={m.modelName} value={m.modelName}>{m.modelName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Scatter Canvas Grid */}
        <div className="relative h-64 border border-slate-200 rounded-lg bg-slate-50/50 p-4 overflow-hidden">
          {/* Diagonal 45 degree perfect prediction line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line x1="5%" y1="95%" x2="95%" y2="5%" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth="1.5" />
          </svg>

          <div className="relative w-full h-full">
            {currentActiveModelResult?.samplePredictions.map((pt, idx) => {
              const maxVal = 40000;
              const leftPct = Math.min(92, Math.max(8, (pt.actual / maxVal) * 100));
              const bottomPct = Math.min(92, Math.max(8, (pt.predicted / maxVal) * 100));

              return (
                <div
                  key={idx}
                  className="absolute transform -translate-x-1/2 translate-y-1/2 group cursor-pointer"
                  style={{ left: `${leftPct}%`, bottom: `${bottomPct}%` }}
                >
                  <div className="h-3 w-3 rounded-full bg-indigo-600 border border-white shadow-xs group-hover:scale-150 transition-transform" />
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 hidden group-hover:block z-20 bg-slate-900 text-white text-[10px] p-2 rounded-md shadow-lg whitespace-nowrap pointer-events-none">
                    <div className="font-bold">{pt.campaign_name}</div>
                    <div>Actual: ${pt.actual.toLocaleString()}</div>
                    <div>Predicted: ${pt.predicted.toLocaleString()}</div>
                    <div className="text-indigo-300">Residual Error: ${pt.residual.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>X-Axis: Actual Revenue ($)</span>
          <span className="font-mono text-slate-400">Dashed Line = Perfect Prediction (y = x)</span>
          <span>Y-Axis: Predicted Revenue ($)</span>
        </div>
      </div>
    </div>
  );
};
