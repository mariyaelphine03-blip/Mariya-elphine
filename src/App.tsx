/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Campaign } from './types/campaign';
import { INITIAL_CAMPAIGNS } from './data/benchmarkDataset';
import { INBUILT_DATASETS } from './data/inbuiltDatasets';
import { trainAndEvaluateModels } from './utils/mlEngine';
import { generateMarketingRecommendations } from './utils/recommendations';

import { ThemeProvider, useAppTheme } from './context/ThemeContext';
import { Header } from './components/Header';
import { Sidebar, NavModule } from './components/Sidebar';
import { CsvUploadModal } from './components/CsvUploadModal';
import { AnalysisExecutionModal } from './components/AnalysisExecutionModal';
import { EmptyAnalysisState } from './components/EmptyAnalysisState';
import { Play, Sparkles, CheckCircle2 } from 'lucide-react';

import { DashboardOverview } from './components/modules/DashboardOverview';
import { DataUploadPreprocessing } from './components/modules/DataUploadPreprocessing';
import { ExploratoryDataAnalysis } from './components/modules/ExploratoryDataAnalysis';
import { FeatureCorrelationAnalysis } from './components/modules/FeatureCorrelationAnalysis';
import { ModelTrainingComparison } from './components/modules/ModelTrainingComparison';
import { RevenueConversionPredictor } from './components/modules/RevenueConversionPredictor';
import { WebsitePurchasePredictor } from './components/modules/WebsitePurchasePredictor';
import { PerformanceClassification } from './components/modules/PerformanceClassification';
import { BudgetScenarioSimulator } from './components/modules/BudgetScenarioSimulator';
import { MarketingRecommendations } from './components/modules/MarketingRecommendations';
import { ExistingVsProposedSystem } from './components/modules/ExistingVsProposedSystem';
import { ExportAndCode } from './components/modules/ExportAndCode';

function AppContent() {
  const { styles, isDark } = useAppTheme();
  const [currentDatasetId, setCurrentDatasetId] = useState<string>('ecommerce');
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [currentModule, setCurrentModule] = useState<NavModule>('overview');
  const [selectedInferenceModel, setSelectedInferenceModel] = useState<string>('Random Forest Regressor');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Key requirement: "Ennaku dataset kuduthu rin button click panna tha analysis aaganum anda inbuilt dataset ..."
  // Analysis does NOT run automatically; user must click the RUN button for both inbuilt and uploaded datasets
  const [hasRunAnalysis, setHasRunAnalysis] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState<boolean>(false);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<string | null>(null);

  // Retrain state
  const [trainConfig, setTrainConfig] = useState<{ testRatio: number; seed: number }>({
    testRatio: 0.2,
    seed: 42
  });

  // Execute ML pipeline
  const mlPipeline = useMemo(() => {
    return trainAndEvaluateModels(campaigns, trainConfig.testRatio, trainConfig.seed);
  }, [campaigns, trainConfig]);

  // Derived recommendations
  const recommendations = useMemo(() => {
    return generateMarketingRecommendations(campaigns, mlPipeline.rfFeatureImportances);
  }, [campaigns, mlPipeline.rfFeatureImportances]);

  // Active dataset display name
  const datasetDisplayName = useMemo(() => {
    if (currentDatasetId === 'custom') return 'Custom Uploaded CSV';
    const found = INBUILT_DATASETS.find(d => d.id === currentDatasetId);
    return found ? found.name : 'Active Marketing Dataset';
  }, [currentDatasetId]);

  // Summary KPIs for Header
  const totalSpend = useMemo(() => campaigns.reduce((acc, c) => acc + c.ad_spend, 0), [campaigns]);
  const totalRevenue = useMemo(() => campaigns.reduce((acc, c) => acc + c.revenue, 0), [campaigns]);
  const overallRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  // Run analysis handler triggered by RUN button
  const handleRunAnalysis = useCallback((overrideSplit?: number, overrideSeed?: number) => {
    if (overrideSplit !== undefined || overrideSeed !== undefined) {
      setTrainConfig(prev => ({
        testRatio: overrideSplit !== undefined ? overrideSplit : prev.testRatio,
        seed: overrideSeed !== undefined ? overrideSeed : prev.seed
      }));
    }
    setIsAnalyzing(true);
    setIsAnalysisModalOpen(true);
  }, []);

  const handleAnalysisComplete = useCallback(() => {
    setIsAnalyzing(false);
    setHasRunAnalysis(true);
    setLastAnalyzedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    // Automatically compute ML predictions & Successful/Unsuccessful classifications for all campaigns in overall project
    setCampaigns(prev => prev.map(c => {
      const vector = [c.ad_spend, c.clicks, c.ctr, c.cpc, c.creative_quality_score];
      const predRev = Math.round(mlPipeline.trainedRF.predict(vector));
      const predRoas = c.ad_spend > 0 ? Number((predRev / c.ad_spend).toFixed(2)) : 0;
      const baseCvr = c.audience_type === 'B2B' ? 7.0 : 7.5;
      const estimatedCvr = Math.min(15, Math.max(1.5, baseCvr * (c.creative_quality_score / 8.0)));
      const predConv = Math.round(c.clicks * (estimatedCvr / 100));
      const isSuccess = predRoas >= 2.0;

      return {
        ...c,
        predicted_revenue: predRev,
        predicted_roas: predRoas,
        predicted_conversions: predConv,
        predicted_outcome: isSuccess ? 'Successful' : 'Unsuccessful',
        outcome: c.outcome || (c.roas >= 2.0 ? 'Successful' : 'Unsuccessful')
      };
    }));
  }, [mlPipeline]);

  const handleSelectDatasetPreset = useCallback((presetId: string) => {
    const found = INBUILT_DATASETS.find(d => d.id === presetId);
    if (found) {
      setCampaigns(found.campaigns);
      setCurrentDatasetId(found.id);
      // Explicit requirement: Switching inbuilt datasets resets analysis state until RUN button is clicked!
      setHasRunAnalysis(false);
      setIsAnalyzing(false);
    }
  }, []);

  const handleResetBenchmark = useCallback(() => {
    const defaultSet = INBUILT_DATASETS[0];
    setCampaigns(defaultSet ? defaultSet.campaigns : INITIAL_CAMPAIGNS);
    setCurrentDatasetId('ecommerce');
    setHasRunAnalysis(false);
    setIsAnalyzing(false);
  }, []);

  const handleExportCsv = useCallback(() => {
    const headers = [
      'campaign_id',
      'campaign_name',
      'channel',
      'audience_type',
      'ad_spend',
      'impressions',
      'clicks',
      'ctr',
      'cpc',
      'conversions',
      'conversion_rate',
      'revenue',
      'roas',
      'creative_quality_score',
      'performance_tier'
    ];
    const rows = campaigns.map(c => [
      c.campaign_id,
      `"${c.campaign_name.replace(/"/g, '""')}"`,
      c.channel,
      c.audience_type,
      c.ad_spend,
      c.impressions,
      c.clicks,
      c.ctr,
      c.cpc,
      c.conversions,
      c.conversion_rate,
      c.revenue,
      c.roas,
      c.creative_quality_score,
      c.performance_tier || (c.roas >= 3.5 ? 'High' : c.roas >= 2.0 ? 'Medium' : 'Low')
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `marketing_campaigns_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [campaigns]);

  const handleAddCampaign = useCallback((newCampaign: Campaign) => {
    setCampaigns(prev => [newCampaign, ...prev]);
  }, []);

  const handleApplyUploadedCampaigns = useCallback((uploaded: Campaign[], mode: 'replace' | 'append', navigateToPredictor?: boolean) => {
    if (mode === 'replace') {
      setCampaigns(uploaded);
    } else {
      setCampaigns(prev => [...uploaded, ...prev]);
    }
    setCurrentDatasetId('custom');
    setHasRunAnalysis(false); // Reset analysis state on custom upload until RUN button clicked
    setIsAnalyzing(false);
    if (navigateToPredictor) {
      setCurrentModule('predictor');
    }
  }, []);

  return (
    <div className={`min-h-screen ${styles.appBg} ${styles.textMain} flex flex-col font-sans antialiased transition-colors duration-200 selection:bg-cyan-500/20 selection:text-cyan-300`}>
      {/* Top Navigation Bar with 3-Line Title, 4 Inbuilt Datasets Switcher, Color Themes, & Universal CSV Upload */}
      <Header
        campaignCount={campaigns.length}
        totalSpend={totalSpend}
        totalRevenue={totalRevenue}
        overallRoas={overallRoas}
        currentDatasetId={currentDatasetId}
        hasRunAnalysis={hasRunAnalysis}
        isAnalyzing={isAnalyzing}
        onRunAnalysis={() => handleRunAnalysis()}
        onSelectDatasetPreset={handleSelectDatasetPreset}
        onResetBenchmark={handleResetBenchmark}
        onExportCsv={handleExportCsv}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar with Quick Upload Action */}
        <Sidebar
          currentModule={currentModule}
          onSelectModule={setCurrentModule}
          campaignCount={campaigns.length}
          hasRunAnalysis={hasRunAnalysis}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
        />

        {/* Dynamic Center Module Canvas */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Banner when unanalyzed in upload module */}
            {!hasRunAnalysis && currentModule === 'upload' && (
              <div className="rounded-2xl border border-amber-500/50 bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-amber-950/30 p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <Sparkles className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">Analysis Pending</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {datasetDisplayName} • {campaigns.length} campaigns
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Dataset is loaded. Click <strong>▶ Run Analysis</strong> to compute KPIs, correlations, and train predictive ML models.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRunAnalysis()}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-md shadow-cyan-500/30 ring-2 ring-cyan-400/50 cursor-pointer transition-all active:scale-95"
                  >
                    <Play className="h-3.5 w-3.5 fill-white text-white" />
                    <span>▶ Run Analysis Now</span>
                  </button>
                </div>
              </div>
            )}

            {currentModule === 'overview' && (
              <DashboardOverview
                campaigns={campaigns}
                onNavigateToPredictor={() => setCurrentModule('predictor')}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                currentDatasetId={currentDatasetId}
                onSelectDatasetPreset={handleSelectDatasetPreset}
                hasRunAnalysis={hasRunAnalysis}
                onRunAnalysis={handleRunAnalysis}
                isAnalyzing={isAnalyzing}
              />
            )}

            {currentModule === 'upload' && (
              <DataUploadPreprocessing
                campaigns={campaigns}
                onUpdateCampaigns={(newCamps) => {
                  setCampaigns(newCamps);
                  setCurrentDatasetId('custom');
                  setHasRunAnalysis(false);
                }}
                onProceedToEDA={() => setCurrentModule('eda')}
                onProceedToPredictor={() => setCurrentModule('predictor')}
                onRunAnalysis={() => handleRunAnalysis()}
                hasRunAnalysis={hasRunAnalysis}
              />
            )}

            {currentModule === 'eda' && (
              !hasRunAnalysis ? (
                <EmptyAnalysisState
                  moduleTitle="Exploratory Data Analysis"
                  moduleSubtitle="Statistical distributions, CTR/CPC metrics, funnel breakdowns, and channel comparisons will appear here after analysis."
                  moduleIcon="chart"
                  datasetDisplayName={datasetDisplayName}
                  currentDatasetId={currentDatasetId}
                  campaignCount={campaigns.length}
                  onRunAnalysis={() => handleRunAnalysis()}
                  isAnalyzing={isAnalyzing}
                  onOpenUploadModal={() => setIsUploadModalOpen(true)}
                  onSelectDatasetPreset={handleSelectDatasetPreset}
                />
              ) : (
                <ExploratoryDataAnalysis
                  campaigns={campaigns}
                  onOpenUploadModal={() => setIsUploadModalOpen(true)}
                />
              )
            )}

            {currentModule === 'correlation' && (
              !hasRunAnalysis ? (
                <EmptyAnalysisState
                  moduleTitle="Feature Correlation & Importance"
                  moduleSubtitle="Correlation heatmaps, Pearson coefficient matrices, and Random Forest feature importance rankings will appear here after analysis."
                  moduleIcon="target"
                  datasetDisplayName={datasetDisplayName}
                  currentDatasetId={currentDatasetId}
                  campaignCount={campaigns.length}
                  onRunAnalysis={() => handleRunAnalysis()}
                  isAnalyzing={isAnalyzing}
                  onOpenUploadModal={() => setIsUploadModalOpen(true)}
                  onSelectDatasetPreset={handleSelectDatasetPreset}
                />
              ) : (
                <FeatureCorrelationAnalysis
                  campaigns={campaigns}
                  featureImportances={mlPipeline.rfFeatureImportances}
                  onOpenUploadModal={() => setIsUploadModalOpen(true)}
                />
              )
            )}

            {currentModule === 'training' && (
              !hasRunAnalysis ? (
                <EmptyAnalysisState
                  moduleTitle="Machine Learning Model Evaluation"
                  moduleSubtitle="R² accuracy comparisons, MAE, RMSE metrics, regression plots, and residual diagnostics will be computed and displayed here after analysis."
                  moduleIcon="cpu"
                  datasetDisplayName={datasetDisplayName}
                  currentDatasetId={currentDatasetId}
                  campaignCount={campaigns.length}
                  onRunAnalysis={() => handleRunAnalysis()}
                  isAnalyzing={isAnalyzing}
                  onOpenUploadModal={() => setIsUploadModalOpen(true)}
                  onSelectDatasetPreset={handleSelectDatasetPreset}
                />
              ) : (
                <ModelTrainingComparison
                  campaigns={campaigns}
                  modelResults={mlPipeline.results}
                  onRetrain={(testRatio, seed) => setTrainConfig({ testRatio, seed })}
                  onSelectModelForInference={setSelectedInferenceModel}
                  selectedModel={selectedInferenceModel}
                  onOpenUploadModal={() => setIsUploadModalOpen(true)}
                />
              )
            )}

            {currentModule === 'predictor' && (
              !hasRunAnalysis ? (
                <EmptyAnalysisState
                  moduleTitle="Revenue & Conversion Predictor"
                  moduleSubtitle="Machine Learning models (Random Forest, Multiple Linear Regression, Decision Tree) must be trained on the active dataset first. Click below to run analysis, train models, and unlock revenue/conversion predictions."
                  moduleIcon="predict"
                  datasetDisplayName={datasetDisplayName}
                  currentDatasetId={currentDatasetId}
                  campaignCount={campaigns.length}
                  onRunAnalysis={() => handleRunAnalysis()}
                  isAnalyzing={isAnalyzing}
                  onOpenUploadModal={() => setIsUploadModalOpen(true)}
                  onSelectDatasetPreset={handleSelectDatasetPreset}
                />
              ) : (
                <RevenueConversionPredictor
                  campaigns={campaigns}
                  trainedLR={mlPipeline.trainedLR}
                  trainedDT={mlPipeline.trainedDT}
                  trainedRF={mlPipeline.trainedRF}
                  onAddCampaignToDataset={handleAddCampaign}
                  onOpenUploadModal={() => setIsUploadModalOpen(true)}
                  currentDatasetId={currentDatasetId}
                  onSelectDatasetPreset={handleSelectDatasetPreset}
                  hasRunAnalysis={hasRunAnalysis}
                  onRunAnalysis={() => handleRunAnalysis()}
                  isAnalyzing={isAnalyzing}
                />
              )
            )}

            {currentModule === 'classification' && (
              !hasRunAnalysis ? (
                <EmptyAnalysisState
                  moduleTitle="Campaign Success Classification (Successful vs Unsuccessful)"
                  moduleSubtitle="Machine Learning Decision Tree classifying campaigns into 'Successful' (profitable scale candidates) and 'Unsuccessful' (capital bleed), confusion matrices, and precision metrics will be generated after analysis."
                  moduleIcon="target"
                  datasetDisplayName={datasetDisplayName}
                  currentDatasetId={currentDatasetId}
                  campaignCount={campaigns.length}
                  onRunAnalysis={() => handleRunAnalysis()}
                  isAnalyzing={isAnalyzing}
                  onOpenUploadModal={() => setIsUploadModalOpen(true)}
                  onSelectDatasetPreset={handleSelectDatasetPreset}
                />
              ) : (
                <PerformanceClassification
                  campaigns={campaigns}
                  onOpenUploadModal={() => setIsUploadModalOpen(true)}
                />
              )
            )}

            {currentModule === 'website-purchases' && (
              !hasRunAnalysis ? (
                <EmptyAnalysisState
                  moduleTitle="Website Purchase Predictor"
                  moduleSubtitle="Run analysis to see purchases and non-purchases by marketing source, then estimate purchase likelihood for a chosen source and number of visitors. Only Sales campaign conversions are counted as purchases."
                  moduleIcon="predict"
                  datasetDisplayName={datasetDisplayName}
                  currentDatasetId={currentDatasetId}
                  campaignCount={campaigns.length}
                  onRunAnalysis={() => handleRunAnalysis()}
                  isAnalyzing={isAnalyzing}
                  onOpenUploadModal={() => setIsUploadModalOpen(true)}
                  onSelectDatasetPreset={handleSelectDatasetPreset}
                />
              ) : (
                <WebsitePurchasePredictor campaigns={campaigns} />
              )
            )}

            {currentModule === 'scenario' && (
              !hasRunAnalysis ? (
                <EmptyAnalysisState
                  moduleTitle="Budget Scenario Simulator"
                  moduleSubtitle="Interactive multi-channel budget simulations and ROI response frontiers will be generated after analysis."
                  moduleIcon="chart"
                  datasetDisplayName={datasetDisplayName}
                  currentDatasetId={currentDatasetId}
                  campaignCount={campaigns.length}
                  onRunAnalysis={() => handleRunAnalysis()}
                  isAnalyzing={isAnalyzing}
                  onOpenUploadModal={() => setIsUploadModalOpen(true)}
                  onSelectDatasetPreset={handleSelectDatasetPreset}
                />
              ) : (
                <BudgetScenarioSimulator
                  onOpenUploadModal={() => setIsUploadModalOpen(true)}
                />
              )
            )}

            {currentModule === 'recommendations' && (
              !hasRunAnalysis ? (
                <EmptyAnalysisState
                  moduleTitle="Marketing Recommendations"
                  moduleSubtitle="Actionable budget shift recommendations, underperforming channel alerts, and growth opportunities will be generated after analysis."
                  moduleIcon="bulb"
                  datasetDisplayName={datasetDisplayName}
                  currentDatasetId={currentDatasetId}
                  campaignCount={campaigns.length}
                  onRunAnalysis={() => handleRunAnalysis()}
                  isAnalyzing={isAnalyzing}
                  onOpenUploadModal={() => setIsUploadModalOpen(true)}
                  onSelectDatasetPreset={handleSelectDatasetPreset}
                />
              ) : (
                <MarketingRecommendations
                  recommendations={recommendations}
                  onOpenUploadModal={() => setIsUploadModalOpen(true)}
                />
              )
            )}

            {currentModule === 'comparison-systems' && (
              <ExistingVsProposedSystem
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
              />
            )}

            {currentModule === 'export-code' && (
              <ExportAndCode
                campaigns={campaigns}
                modelResults={mlPipeline.results}
              />
            )}
          </div>
        </main>
      </div>

      {/* Universal CSV Upload Modal (Accessible from any page / header) */}
      <CsvUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onApplyCampaigns={handleApplyUploadedCampaigns}
      />

      {/* Real-time ML Pipeline Execution Modal */}
      <AnalysisExecutionModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        datasetName={datasetDisplayName}
        campaignCount={campaigns.length}
        onComplete={handleAnalysisComplete}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
