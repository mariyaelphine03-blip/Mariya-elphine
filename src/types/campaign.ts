export type Channel = 'Google Ads' | 'Meta Ads' | 'LinkedIn' | 'TikTok' | 'YouTube' | 'Email';
export type AudienceType = 'B2B' | 'B2C' | 'Both';
export type Objective = 'Sales' | 'Lead Gen' | 'Traffic' | 'Awareness';
export type PerformanceTier = 'High' | 'Medium' | 'Low';
export type CampaignOutcome = 'Successful' | 'Unsuccessful';

export interface Campaign {
  campaign_id: string;
  campaign_name: string;
  channel: Channel;
  audience_type: AudienceType;
  ad_spend: number;
  impressions: number;
  clicks: number;
  ctr: number; // percentage, e.g. 3.5%
  cpc: number; // dollars
  conversions: number;
  conversion_rate: number; // percentage, e.g. 7.5%
  revenue: number;
  roas: number; // ratio, e.g. 4.37
  creative_quality_score: number; // 1 to 10
  target_objective: Objective;
  performance_tier?: PerformanceTier;
  outcome?: CampaignOutcome;
  predicted_revenue?: number;
  predicted_conversions?: number;
  predicted_roas?: number;
  predicted_outcome?: CampaignOutcome;
}

export interface ModelMetricResult {
  modelName: string;
  r2Score: number;
  mae: number;
  rmse: number;
  trainingTimeMs: number;
  featuresUsed: string[];
  equationOrTreeDepth?: string;
  samplePredictions: {
    actual: number;
    predicted: number;
    campaign_name: string;
    residual: number;
  }[];
}

export interface ClassificationMetricResult {
  modelName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: {
    high: { high: number; medium: number; low: number };
    medium: { high: number; medium: number; low: number };
    low: { high: number; medium: number; low: number };
  };
  binaryAccuracy: number;
  binaryPrecision: number;
  binaryRecall: number;
  binaryF1Score: number;
  binaryConfusionMatrix: {
    successful: { successful: number; unsuccessful: number };
    unsuccessful: { successful: number; unsuccessful: number };
  };
  successfulCount: number;
  unsuccessfulCount: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number; // 0 to 1
  label: string;
}

export interface CorrelationMatrix {
  variables: string[];
  labels: string[];
  matrix: number[][];
}

export interface MarketingRecommendation {
  id: string;
  title: string;
  category: 'Channel Budget' | 'Creative Quality' | 'Bid Strategy' | 'Audience Targeting' | 'Risk Mitigation';
  impact: 'High Impact' | 'Medium Impact' | 'Quick Win';
  description: string;
  estimatedRevenueGain: number;
  actionableStep: string;
  channel?: Channel;
}

export interface BudgetScenarioAllocation {
  channel: Channel;
  percentage: number;
  budget: number;
  estimatedRoas: number;
  projectedRevenue: number;
  projectedConversions: number;
}
