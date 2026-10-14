import { Campaign, PerformanceTier } from '../types/campaign';
import { INITIAL_CAMPAIGNS } from './benchmarkDataset';

export interface DatasetPreset {
  id: string;
  name: string;
  badge: string;
  category: string;
  description: string;
  industry: string;
  campaignsCount: number;
  averageRoas: string;
  topChannel: string;
  primaryChannel?: string;
  campaigns: Campaign[];
}

export type InbuiltDatasetInfo = DatasetPreset;

// Dataset 1: Omnichannel E-Commerce & Retail (50 campaigns)
export const ECOMMERCE_DATASET: Campaign[] = [...INITIAL_CAMPAIGNS];

// Dataset 2: B2B SaaS & Enterprise Tech (45 campaigns)
export const B2B_SAAS_DATASET: Campaign[] = [
  {
    campaign_id: 'SAAS-201',
    campaign_name: 'Enterprise ERP Whitepaper Download',
    channel: 'LinkedIn',
    audience_type: 'B2B',
    ad_spend: 8500,
    impressions: 92000,
    clicks: 1380,
    ctr: 1.5,
    cpc: 6.16,
    conversions: 110,
    conversion_rate: 7.97,
    revenue: 38500,
    roas: 4.53,
    creative_quality_score: 9.1,
    target_objective: 'Lead Gen',
    performance_tier: 'High'
  },
  {
    campaign_id: 'SAAS-202',
    campaign_name: 'Cloud Security Demo Signups',
    channel: 'Google Ads',
    audience_type: 'B2B',
    ad_spend: 11200,
    impressions: 115000,
    clicks: 2875,
    ctr: 2.5,
    cpc: 3.90,
    conversions: 185,
    conversion_rate: 6.43,
    revenue: 46250,
    roas: 4.13,
    creative_quality_score: 8.7,
    target_objective: 'Sales',
    performance_tier: 'High'
  },
  {
    campaign_id: 'SAAS-203',
    campaign_name: 'CTO Thought Leadership Video',
    channel: 'YouTube',
    audience_type: 'B2B',
    ad_spend: 6400,
    impressions: 160000,
    clicks: 2400,
    ctr: 1.5,
    cpc: 2.67,
    conversions: 84,
    conversion_rate: 3.50,
    revenue: 21000,
    roas: 3.28,
    creative_quality_score: 8.2,
    target_objective: 'Awareness',
    performance_tier: 'Medium'
  },
  {
    campaign_id: 'SAAS-204',
    campaign_name: 'Product-Led Growth Free Trial',
    channel: 'Google Ads',
    audience_type: 'B2B',
    ad_spend: 7800,
    impressions: 140000,
    clicks: 3500,
    ctr: 2.5,
    cpc: 2.23,
    conversions: 280,
    conversion_rate: 8.00,
    revenue: 28000,
    roas: 3.59,
    creative_quality_score: 8.0,
    target_objective: 'Lead Gen',
    performance_tier: 'High'
  },
  {
    campaign_id: 'SAAS-205',
    campaign_name: 'C-Level Executive Retargeting',
    channel: 'LinkedIn',
    audience_type: 'B2B',
    ad_spend: 9600,
    impressions: 80000,
    clicks: 960,
    ctr: 1.2,
    cpc: 10.00,
    conversions: 92,
    conversion_rate: 9.58,
    revenue: 41400,
    roas: 4.31,
    creative_quality_score: 9.0,
    target_objective: 'Sales',
    performance_tier: 'High'
  },
  {
    campaign_id: 'SAAS-206',
    campaign_name: 'DevOps Tooling Competitor Comparison',
    channel: 'Google Ads',
    audience_type: 'B2B',
    ad_spend: 5200,
    impressions: 65000,
    clicks: 1625,
    ctr: 2.5,
    cpc: 3.20,
    conversions: 115,
    conversion_rate: 7.08,
    revenue: 17250,
    roas: 3.32,
    creative_quality_score: 7.8,
    target_objective: 'Sales',
    performance_tier: 'Medium'
  },
  {
    campaign_id: 'SAAS-207',
    campaign_name: 'Quarterly Product Webinar Blast',
    channel: 'Email',
    audience_type: 'B2B',
    ad_spend: 1800,
    impressions: 45000,
    clicks: 4500,
    ctr: 10.0,
    cpc: 0.40,
    conversions: 410,
    conversion_rate: 9.11,
    revenue: 20500,
    roas: 11.39,
    creative_quality_score: 9.4,
    target_objective: 'Lead Gen',
    performance_tier: 'High'
  },
  {
    campaign_id: 'SAAS-208',
    campaign_name: 'B2B Case Study Carousel',
    channel: 'LinkedIn',
    audience_type: 'B2B',
    ad_spend: 4800,
    impressions: 55000,
    clicks: 825,
    ctr: 1.5,
    cpc: 5.82,
    conversions: 58,
    conversion_rate: 7.03,
    revenue: 14500,
    roas: 3.02,
    creative_quality_score: 7.2,
    target_objective: 'Lead Gen',
    performance_tier: 'Medium'
  },
  {
    campaign_id: 'SAAS-209',
    campaign_name: 'IT Infrastructure Broad Search',
    channel: 'Google Ads',
    audience_type: 'B2B',
    ad_spend: 6200,
    impressions: 110000,
    clicks: 2200,
    ctr: 2.0,
    cpc: 2.82,
    conversions: 75,
    conversion_rate: 3.41,
    revenue: 10500,
    roas: 1.69,
    creative_quality_score: 5.4,
    target_objective: 'Traffic',
    performance_tier: 'Low'
  },
  {
    campaign_id: 'SAAS-210',
    campaign_name: 'SaaS Churn Reactivation Nurture',
    channel: 'Email',
    audience_type: 'B2B',
    ad_spend: 1200,
    impressions: 28000,
    clicks: 3360,
    ctr: 12.0,
    cpc: 0.36,
    conversions: 195,
    conversion_rate: 5.80,
    revenue: 9750,
    roas: 8.13,
    creative_quality_score: 8.9,
    target_objective: 'Sales',
    performance_tier: 'High'
  },
  // Additional realistic B2B rows up to 45
  ...Array.from({ length: 35 }, (_, idx) => {
    const channels: ('LinkedIn' | 'Google Ads' | 'YouTube' | 'Email')[] = ['LinkedIn', 'Google Ads', 'YouTube', 'Email'];
    const channel = channels[idx % channels.length];
    const spend = Math.round(2500 + (idx * 210));
    const cpc = channel === 'LinkedIn' ? 6.5 : channel === 'Google Ads' ? 3.4 : channel === 'YouTube' ? 2.1 : 0.45;
    const clicks = Math.round(spend / cpc);
    const ctr = channel === 'Email' ? 9.5 : channel === 'LinkedIn' ? 1.4 : 2.6;
    const impressions = Math.round(clicks / (ctr / 100));
    const cvr = 4.5 + ((idx * 3) % 6);
    const conversions = Math.max(5, Math.round(clicks * (cvr / 100)));
    const valPerConv = channel === 'LinkedIn' ? 320 : channel === 'Google Ads' ? 220 : 180;
    const revenue = Math.round(conversions * valPerConv * (0.8 + ((idx % 5) * 0.1)));
    const roas = Number((revenue / spend).toFixed(2));
    const score = Number((6.2 + ((idx % 7) * 0.5)).toFixed(1));
    const tier: PerformanceTier = roas >= 3.5 ? 'High' : roas >= 2.0 ? 'Medium' : 'Low';

    return {
      campaign_id: `SAAS-${211 + idx}`,
      campaign_name: `B2B Enterprise Cohort ${idx + 1} (${channel})`,
      channel,
      audience_type: 'B2B' as const,
      ad_spend: spend,
      impressions,
      clicks,
      ctr,
      cpc,
      conversions,
      conversion_rate: Number(cvr.toFixed(2)),
      revenue,
      roas,
      creative_quality_score: score,
      target_objective: idx % 3 === 0 ? 'Lead Gen' as const : 'Sales' as const,
      performance_tier: tier
    };
  })
];

// Dataset 3: Mobile App & D2C Viral Growth (45 campaigns)
export const MOBILE_APP_DATASET: Campaign[] = [
  {
    campaign_id: 'APP-301',
    campaign_name: 'TikTok Creator Challenge Viral UGC',
    channel: 'TikTok',
    audience_type: 'B2C',
    ad_spend: 4200,
    impressions: 420000,
    clicks: 12600,
    ctr: 3.0,
    cpc: 0.33,
    conversions: 1890,
    conversion_rate: 15.0,
    revenue: 22680,
    roas: 5.40,
    creative_quality_score: 9.6,
    target_objective: 'Sales',
    performance_tier: 'High'
  },
  {
    campaign_id: 'APP-302',
    campaign_name: 'Meta Reels Direct In-App Install',
    channel: 'Meta Ads',
    audience_type: 'B2C',
    ad_spend: 5500,
    impressions: 310000,
    clicks: 9300,
    ctr: 3.0,
    cpc: 0.59,
    conversions: 1116,
    conversion_rate: 12.0,
    revenue: 23436,
    roas: 4.26,
    creative_quality_score: 9.0,
    target_objective: 'Sales',
    performance_tier: 'High'
  },
  {
    campaign_id: 'APP-303',
    campaign_name: 'Google Universal App Campaigns (UAC)',
    channel: 'Google Ads',
    audience_type: 'B2C',
    ad_spend: 6800,
    impressions: 340000,
    clicks: 10200,
    ctr: 3.0,
    cpc: 0.67,
    conversions: 1224,
    conversion_rate: 12.0,
    revenue: 24480,
    roas: 3.60,
    creative_quality_score: 8.5,
    target_objective: 'Traffic',
    performance_tier: 'High'
  },
  {
    campaign_id: 'APP-304',
    campaign_name: 'Influencer Spark Ad Amplify',
    channel: 'TikTok',
    audience_type: 'B2C',
    ad_spend: 3800,
    impressions: 290000,
    clicks: 8700,
    ctr: 3.0,
    cpc: 0.44,
    conversions: 957,
    conversion_rate: 11.0,
    revenue: 16269,
    roas: 4.28,
    creative_quality_score: 8.8,
    target_objective: 'Sales',
    performance_tier: 'High'
  },
  {
    campaign_id: 'APP-305',
    campaign_name: 'YouTube Shorts Interactive Gameplay Ad',
    channel: 'YouTube',
    audience_type: 'B2C',
    ad_spend: 4900,
    impressions: 280000,
    clicks: 6160,
    ctr: 2.2,
    cpc: 0.80,
    conversions: 554,
    conversion_rate: 9.0,
    revenue: 13850,
    roas: 2.83,
    creative_quality_score: 7.6,
    target_objective: 'Awareness',
    performance_tier: 'Medium'
  },
  {
    campaign_id: 'APP-306',
    campaign_name: 'Lapsed Gamer Retention Push',
    channel: 'Email',
    audience_type: 'B2C',
    ad_spend: 900,
    impressions: 60000,
    clicks: 7200,
    ctr: 12.0,
    cpc: 0.13,
    conversions: 1080,
    conversion_rate: 15.0,
    revenue: 12960,
    roas: 14.40,
    creative_quality_score: 9.2,
    target_objective: 'Sales',
    performance_tier: 'High'
  },
  {
    campaign_id: 'APP-307',
    campaign_name: 'Broad Audience Lifestyle Video Blast',
    channel: 'Meta Ads',
    audience_type: 'B2C',
    ad_spend: 4100,
    impressions: 220000,
    clicks: 4400,
    ctr: 2.0,
    cpc: 0.93,
    conversions: 220,
    conversion_rate: 5.0,
    revenue: 5500,
    roas: 1.34,
    creative_quality_score: 5.5,
    target_objective: 'Traffic',
    performance_tier: 'Low'
  },
  // Additional realistic Mobile App campaigns up to 45
  ...Array.from({ length: 38 }, (_, idx) => {
    const channels: ('TikTok' | 'Meta Ads' | 'Google Ads' | 'YouTube')[] = ['TikTok', 'Meta Ads', 'Google Ads', 'YouTube'];
    const channel = channels[idx % channels.length];
    const spend = Math.round(1800 + (idx * 160));
    const cpc = channel === 'TikTok' ? 0.38 : channel === 'Meta Ads' ? 0.65 : channel === 'Google Ads' ? 0.75 : 0.82;
    const clicks = Math.round(spend / cpc);
    const ctr = channel === 'TikTok' ? 3.4 : 2.5;
    const impressions = Math.round(clicks / (ctr / 100));
    const cvr = 7.0 + ((idx * 2) % 8);
    const conversions = Math.max(15, Math.round(clicks * (cvr / 100)));
    const revenue = Math.round(conversions * (16 + ((idx % 4) * 4)));
    const roas = Number((revenue / spend).toFixed(2));
    const score = Number((6.8 + ((idx % 6) * 0.5)).toFixed(1));
    const tier: PerformanceTier = roas >= 3.5 ? 'High' : roas >= 2.0 ? 'Medium' : 'Low';

    return {
      campaign_id: `APP-${308 + idx}`,
      campaign_name: `Growth Funnel Wave ${idx + 1} (${channel})`,
      channel,
      audience_type: 'B2C' as const,
      ad_spend: spend,
      impressions,
      clicks,
      ctr,
      cpc,
      conversions,
      conversion_rate: Number(cvr.toFixed(2)),
      revenue,
      roas,
      creative_quality_score: score,
      target_objective: idx % 2 === 0 ? 'Sales' as const : 'Traffic' as const,
      performance_tier: tier
    };
  })
];

// Dataset 4: FinTech & BFSI High-Value Acquisition (40 campaigns)
export const FINTECH_DATASET: Campaign[] = [
  {
    campaign_id: 'FIN-401',
    campaign_name: 'High-Yield Savings Intent Search',
    channel: 'Google Ads',
    audience_type: 'B2C',
    ad_spend: 9500,
    impressions: 95000,
    clicks: 2850,
    ctr: 3.0,
    cpc: 3.33,
    conversions: 256,
    conversion_rate: 8.98,
    revenue: 43520,
    roas: 4.58,
    creative_quality_score: 9.3,
    target_objective: 'Sales',
    performance_tier: 'High'
  },
  {
    campaign_id: 'FIN-402',
    campaign_name: 'Corporate Card Cashback Campaign',
    channel: 'LinkedIn',
    audience_type: 'B2B',
    ad_spend: 12000,
    impressions: 100000,
    clicks: 1500,
    ctr: 1.5,
    cpc: 8.00,
    conversions: 135,
    conversion_rate: 9.00,
    revenue: 54000,
    roas: 4.50,
    creative_quality_score: 9.1,
    target_objective: 'Lead Gen',
    performance_tier: 'High'
  },
  {
    campaign_id: 'FIN-403',
    campaign_name: 'Automated Wealth Portfolio Retargeting',
    channel: 'Meta Ads',
    audience_type: 'B2C',
    ad_spend: 6800,
    impressions: 115000,
    clicks: 2990,
    ctr: 2.6,
    cpc: 2.27,
    conversions: 194,
    conversion_rate: 6.49,
    revenue: 27160,
    roas: 3.99,
    creative_quality_score: 8.4,
    target_objective: 'Sales',
    performance_tier: 'High'
  },
  {
    campaign_id: 'FIN-404',
    campaign_name: 'FinTech Tax Season Explainer Video',
    channel: 'YouTube',
    audience_type: 'B2C',
    ad_spend: 5800,
    impressions: 145000,
    clicks: 2610,
    ctr: 1.8,
    cpc: 2.22,
    conversions: 105,
    conversion_rate: 4.02,
    revenue: 17850,
    roas: 3.08,
    creative_quality_score: 8.0,
    target_objective: 'Awareness',
    performance_tier: 'Medium'
  },
  {
    campaign_id: 'FIN-405',
    campaign_name: 'Mortgage Refinance Broad Match',
    channel: 'Google Ads',
    audience_type: 'B2C',
    ad_spend: 8200,
    impressions: 82000,
    clicks: 1640,
    ctr: 2.0,
    cpc: 5.00,
    conversions: 45,
    conversion_rate: 2.74,
    revenue: 12600,
    roas: 1.54,
    creative_quality_score: 5.8,
    target_objective: 'Lead Gen',
    performance_tier: 'Low'
  },
  {
    campaign_id: 'FIN-406',
    campaign_name: 'VIP Investor VIP Onboarding Email',
    channel: 'Email',
    audience_type: 'Both',
    ad_spend: 1400,
    impressions: 32000,
    clicks: 4160,
    ctr: 13.0,
    cpc: 0.34,
    conversions: 332,
    conversion_rate: 7.98,
    revenue: 26560,
    roas: 18.97,
    creative_quality_score: 9.7,
    target_objective: 'Sales',
    performance_tier: 'High'
  },
  // Additional realistic FinTech campaigns up to 40
  ...Array.from({ length: 34 }, (_, idx) => {
    const channels: ('Google Ads' | 'LinkedIn' | 'Meta Ads' | 'YouTube' | 'Email')[] = ['Google Ads', 'LinkedIn', 'Meta Ads', 'YouTube', 'Email'];
    const channel = channels[idx % channels.length];
    const spend = Math.round(3200 + (idx * 240));
    const cpc = channel === 'LinkedIn' ? 7.8 : channel === 'Google Ads' ? 3.8 : channel === 'Meta Ads' ? 2.1 : channel === 'YouTube' ? 1.9 : 0.35;
    const clicks = Math.round(spend / cpc);
    const ctr = channel === 'Email' ? 10.5 : channel === 'LinkedIn' ? 1.6 : 2.8;
    const impressions = Math.round(clicks / (ctr / 100));
    const cvr = 4.8 + ((idx * 2.5) % 6);
    const conversions = Math.max(8, Math.round(clicks * (cvr / 100)));
    const revPerConv = channel === 'LinkedIn' ? 380 : channel === 'Google Ads' ? 240 : 160;
    const revenue = Math.round(conversions * revPerConv);
    const roas = Number((revenue / spend).toFixed(2));
    const score = Number((6.5 + ((idx % 7) * 0.5)).toFixed(1));
    const tier: PerformanceTier = roas >= 3.5 ? 'High' : roas >= 2.0 ? 'Medium' : 'Low';

    return {
      campaign_id: `FIN-${407 + idx}`,
      campaign_name: `BFSI Acquisition Segment ${idx + 1} (${channel})`,
      channel,
      audience_type: idx % 2 === 0 ? 'B2C' as const : 'B2B' as const,
      ad_spend: spend,
      impressions,
      clicks,
      ctr,
      cpc,
      conversions,
      conversion_rate: Number(cvr.toFixed(2)),
      revenue,
      roas,
      creative_quality_score: score,
      target_objective: idx % 3 === 0 ? 'Lead Gen' as const : 'Sales' as const,
      performance_tier: tier
    };
  })
];

// All 4 Inbuilt Datasets combined into one overarching multi-project pool (180 campaigns)
export const ALL_PROJECTS_DATASET: Campaign[] = [
  ...ECOMMERCE_DATASET,
  ...B2B_SAAS_DATASET,
  ...MOBILE_APP_DATASET,
  ...FINTECH_DATASET
];

// All Inbuilt Datasets with metadata catalog
export const INBUILT_DATASETS: DatasetPreset[] = [
  {
    id: 'ecommerce',
    name: 'E-Commerce & Retail Omnichannel',
    badge: '50 Campaigns',
    category: 'Retail & D2C',
    description: 'High transaction frequency, Google Shopping, Meta Dynamic Product Ads, TikTok Shop, and seasonal revenue multipliers.',
    industry: 'E-Commerce & Retail',
    campaignsCount: 50,
    averageRoas: '4.1x',
    topChannel: 'Google Ads & Meta',
    primaryChannel: 'Google Ads & Meta',
    campaigns: ECOMMERCE_DATASET
  },
  {
    id: 'saas',
    name: 'B2B SaaS & Enterprise Tech',
    badge: '45 Campaigns',
    category: 'Enterprise Software',
    description: 'High Contract Value (ACV), multi-touch attribution, LinkedIn ABM targeting, demo requests, and whitepaper downloads.',
    industry: 'B2B SaaS / Tech',
    campaignsCount: 45,
    averageRoas: '3.8x',
    topChannel: 'LinkedIn & Google Search',
    primaryChannel: 'LinkedIn & Google Search',
    campaigns: B2B_SAAS_DATASET
  },
  {
    id: 'mobile_app',
    name: 'Mobile App & D2C Viral Growth',
    badge: '45 Campaigns',
    category: 'Consumer Tech',
    description: 'Mass impression volume, TikTok UGC creator blitzes, Meta Reels install flows, micro-cost CPCs, and rapid viral scaling.',
    industry: 'Mobile Apps / Gaming',
    campaignsCount: 45,
    averageRoas: '4.3x',
    topChannel: 'TikTok & Meta Reels',
    primaryChannel: 'TikTok & Meta Reels',
    campaigns: MOBILE_APP_DATASET
  },
  {
    id: 'fintech',
    name: 'FinTech & BFSI High-Value Acquisition',
    badge: '40 Campaigns',
    category: 'Financial Services',
    description: 'High-intent search queries, credit & banking signups, investment management, strict compliance and risk-adjusted CPA.',
    industry: 'Banking & FinTech',
    campaignsCount: 40,
    averageRoas: '4.5x',
    topChannel: 'Google Search & LinkedIn',
    primaryChannel: 'Google Search & LinkedIn',
    campaigns: FINTECH_DATASET
  },
  {
    id: 'all_projects',
    name: 'All 4 Benchmark Projects Combined',
    badge: '180 Campaigns',
    category: 'Cross-Industry Overall',
    description: 'Combined multi-project benchmark merging E-Commerce, B2B SaaS, Mobile Apps, and FinTech into an overarching 180-campaign machine learning pipeline.',
    industry: 'Cross-Industry Multi-Project',
    campaignsCount: 180,
    averageRoas: '4.2x',
    topChannel: 'Google Ads, Meta, LinkedIn, TikTok',
    primaryChannel: 'Google Ads, Meta, LinkedIn, TikTok',
    campaigns: ALL_PROJECTS_DATASET
  }
];
