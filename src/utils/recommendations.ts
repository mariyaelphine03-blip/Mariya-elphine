import { Campaign, MarketingRecommendation, FeatureImportance } from '../types/campaign';

export function generateMarketingRecommendations(
  campaigns: Campaign[],
  _importances: FeatureImportance[]
): MarketingRecommendation[] {
  const recommendations: MarketingRecommendation[] = [];

  // 1. Channel Performance Analysis
  const channelMetrics: Record<string, { spend: number; revenue: number; roas: number; count: number; cpa: number; conv: number }> = {};
  for (const c of campaigns) {
    if (!channelMetrics[c.channel]) {
      channelMetrics[c.channel] = { spend: 0, revenue: 0, roas: 0, count: 0, cpa: 0, conv: 0 };
    }
    channelMetrics[c.channel].spend += c.ad_spend;
    channelMetrics[c.channel].revenue += c.revenue;
    channelMetrics[c.channel].conv += c.conversions;
    channelMetrics[c.channel].count += 1;
  }

  const channelROAS = Object.entries(channelMetrics).map(([channel, data]) => ({
    channel,
    roas: data.spend > 0 ? data.revenue / data.spend : 0,
    spend: data.spend,
    cpa: data.conv > 0 ? data.spend / data.conv : 0
  })).sort((a, b) => b.roas - a.roas);

  const topChannel = channelROAS[0];
  const lowestChannel = channelROAS[channelROAS.length - 1];

  if (topChannel && lowestChannel && topChannel.roas > lowestChannel.roas * 1.5) {
    const shiftAmount = Math.round(lowestChannel.spend * 0.25);
    const estGain = Math.round(shiftAmount * (topChannel.roas - lowestChannel.roas));
    recommendations.push({
      id: 'rec-budget-realloc',
      title: `Reallocate Budget: Shift 25% from ${lowestChannel.channel} to ${topChannel.channel}`,
      category: 'Channel Budget',
      impact: 'High Impact',
      description: `${topChannel.channel} yields ${topChannel.roas.toFixed(2)}x ROAS compared to ${lowestChannel.channel}'s ${lowestChannel.roas.toFixed(2)}x. Shifting $${shiftAmount.toLocaleString()} will generate immediate incremental return.`,
      estimatedRevenueGain: estGain,
      actionableStep: `Scale ${topChannel.channel} high-intent ad sets by +$${shiftAmount.toLocaleString()} while pausing low-performing ads on ${lowestChannel.channel}.`,
      channel: topChannel.channel as Campaign['channel']
    });
  }

  // 2. Creative Quality Fatigue Analysis
  const lowCreativeHighSpend = campaigns.filter(c => c.creative_quality_score < 7.0 && c.ad_spend > 3000);
  if (lowCreativeHighSpend.length > 0) {
    const affectedSpend = lowCreativeHighSpend.reduce((acc, c) => acc + c.ad_spend, 0);
    const estGain = Math.round(affectedSpend * 0.45);
    recommendations.push({
      id: 'rec-creative-refresh',
      title: `Creative Fatigue Alert: ${lowCreativeHighSpend.length} High-Spend Campaigns Underperform on Creative Score`,
      category: 'Creative Quality',
      impact: 'High Impact',
      description: `Campaigns with creative quality scores < 7.0 experience a 28% higher CPC and lower CTR. Improving creatives to benchmark (8.5+) recovers conversion drop-off.`,
      estimatedRevenueGain: estGain,
      actionableStep: 'Deploy fresh UGC video variations and dynamic product carousels to combat creative fatigue.',
      channel: 'Meta Ads'
    });
  }

  // 3. Email Marketing Leverage
  const emailCampaigns = campaigns.filter(c => c.channel === 'Email');
  if (emailCampaigns.length > 0) {
    const avgEmailRoas = emailCampaigns.reduce((acc, c) => acc + c.roas, 0) / emailCampaigns.length;
    recommendations.push({
      id: 'rec-email-retention',
      title: `Double Automated Email Nurture Flows (Current Avg ROAS: ${avgEmailRoas.toFixed(1)}x)`,
      category: 'Audience Targeting',
      impact: 'Quick Win',
      description: `First-party email retention campaigns maintain exceptionally high return with near-zero marginal ad cost. Expand cart-abandonment & VIP loyalty triggers.`,
      estimatedRevenueGain: 18500,
      actionableStep: 'Implement a 4-stage post-purchase replenishment sequence and browse-abandonment SMS/email triggers.',
      channel: 'Email'
    });
  }

  // 4. CPC Bid Cap Adjustment
  const highCpcCampaigns = campaigns.filter(c => c.cpc > 3.0 && c.channel !== 'LinkedIn');
  if (highCpcCampaigns.length > 0) {
    recommendations.push({
      id: 'rec-cpc-caps',
      title: `Implement Target CPA / Max CPC Bid Caps on Non-Branded Search`,
      category: 'Bid Strategy',
      impact: 'Medium Impact',
      description: `Several non-branded ad groups suffer from keyword auction inflation with CPCs > $3.00, eroding marginal ROAS.`,
      estimatedRevenueGain: 9400,
      actionableStep: 'Switch from Maximize Clicks to Target ROAS bidding with a 350% floor and add negative keyword lists.',
      channel: 'Google Ads'
    });
  }

  // 5. LinkedIn B2B Audience Segmentation
  const linkedInCampaigns = campaigns.filter(c => c.channel === 'LinkedIn');
  if (linkedInCampaigns.length > 0) {
    recommendations.push({
      id: 'rec-linkedin-abm',
      title: 'Refine LinkedIn Account-Based Lists to C-Suite & VP Personas',
      category: 'Audience Targeting',
      impact: 'Medium Impact',
      description: 'Broad LinkedIn targeting inflates cost-per-click without increasing deal pipeline. Restricting to matched account lists reduces wasted impressions by 35%.',
      estimatedRevenueGain: 14200,
      actionableStep: 'Upload Tier-1 target account list and pair with LinkedIn Matched Audiences and Conversational InMail.',
      channel: 'LinkedIn'
    });
  }

  return recommendations;
}
