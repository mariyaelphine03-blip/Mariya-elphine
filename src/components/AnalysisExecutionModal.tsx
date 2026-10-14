import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, Cpu, Database, Sparkles, TrendingUp, BarChart3, Layers, X, ShieldCheck } from 'lucide-react';
import { useAppTheme } from '../context/ThemeContext';

interface AnalysisExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetName: string;
  campaignCount: number;
  onComplete: () => void;
}

interface StepItem {
  id: number;
  label: string;
  detail: string;
  category: 'data' | 'stats' | 'ml' | 'predict';
}

const PIPELINE_STEPS: StepItem[] = [
  { id: 1, label: 'Ingesting & Validating Dataset', detail: 'Parsing campaign dimensions, schema validation, checking missing values', category: 'data' },
  { id: 2, label: 'Extracting Channel Attribution', detail: 'Aggregating Ad Spend, Impressions, Clicks, CPC, and CTR across channels', category: 'stats' },
  { id: 3, label: 'Computing Pearson Correlation Matrix', detail: 'Generating 9x9 multi-feature correlation vectors and covariance metrics', category: 'stats' },
  { id: 4, label: 'Partitioning Train & Test Sets', detail: 'Stratified train/test splitting (80% training / 20% validation)', category: 'ml' },
  { id: 5, label: 'Fitting Multiple Linear Regression', detail: 'Solving OLS normal equations with Ridge L2 regularization (λ=1e-4)', category: 'ml' },
  { id: 6, label: 'Fitting Decision Tree Regressor', detail: 'Constructing binary decision splits (MSE impurity reduction, depth 4)', category: 'ml' },
  { id: 7, label: 'Training Random Forest Regressor', detail: 'Building 30 bootstrap ensemble trees & calculating feature importances', category: 'ml' },
  { id: 8, label: 'Training Campaign Success Classifier', detail: 'Fitting Binary Decision Tree for Successful vs Unsuccessful classifications', category: 'ml' },
  { id: 9, label: 'Computing Overall Project Predictions', detail: 'Executing ML inference across all campaigns, unlocking all analytical modules', category: 'predict' },
];

export const AnalysisExecutionModal: React.FC<AnalysisExecutionModalProps> = ({
  isOpen,
  onClose,
  datasetName,
  campaignCount,
  onComplete
}) => {
  const { styles, isDark } = useAppTheme();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setProgress(0);
      setIsFinished(false);
      return;
    }

    // Step progression animation
    const totalSteps = PIPELINE_STEPS.length;
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step <= totalSteps) {
        setCurrentStepIndex(step);
        setProgress(Math.round((step / totalSteps) * 100));
      } else {
        clearInterval(interval);
        setIsFinished(true);
        setTimeout(() => {
          onComplete();
        }, 600);
      }
    }, 180);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`w-full max-w-xl rounded-2xl border ${styles.cardBorder} ${isDark ? 'bg-slate-900/95 text-slate-100' : 'bg-white text-slate-900'} shadow-2xl overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-500/20">
              <Cpu className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">Machine Learning Execution Engine</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  ML Pipeline Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Processing <span className="font-semibold text-slate-200">{datasetName}</span> ({campaignCount} campaigns)
              </p>
            </div>
          </div>
          {isFinished && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Progress Bar & Status */}
        <div className="px-6 pt-5 pb-3">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
              {isFinished ? 'Analysis Complete!' : `Executing Step ${Math.min(currentStepIndex + 1, PIPELINE_STEPS.length)} of ${PIPELINE_STEPS.length}...`}
            </span>
            <span className="font-bold text-cyan-400">{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 transition-all duration-200 ease-out rounded-full shadow-lg shadow-cyan-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Execution Terminal / Steps list */}
        <div className="px-6 py-3 max-h-72 overflow-y-auto space-y-2">
          {PIPELINE_STEPS.map((step, idx) => {
            const isDone = currentStepIndex > idx;
            const isCurrent = currentStepIndex === idx;
            const isPending = currentStepIndex < idx;

            return (
              <div
                key={step.id}
                className={`p-2.5 rounded-xl border text-xs transition-all flex items-start gap-3 ${
                  isDone
                    ? isDark
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                      : 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                    : isCurrent
                    ? isDark
                      ? 'border-cyan-500/80 bg-cyan-950/40 text-cyan-100 ring-1 ring-cyan-500/50'
                      : 'border-indigo-300 bg-indigo-50/70 text-indigo-900 ring-1 ring-indigo-400'
                    : isDark
                    ? 'border-slate-800 bg-slate-800/30 text-slate-500'
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <div className="h-4 w-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center text-[9px] text-slate-500">
                      {step.id}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{step.label}</span>
                    <span className="text-[10px] uppercase font-mono tracking-wider opacity-75">
                      {isDone ? 'DONE' : isCurrent ? 'RUNNING' : 'QUEUED'}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-70 mt-0.5 line-clamp-1">{step.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-700/60 bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span>Random Forest • Ridge OLS • Decision Tree</span>
          </div>

          {isFinished ? (
            <button
              onClick={() => {
                onComplete();
                onClose();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-md cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Unlock Analysis Results</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span>Running Analysis...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
