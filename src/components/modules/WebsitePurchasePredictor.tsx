import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CircleCheck, CircleX, Info, ShoppingCart, Users } from 'lucide-react';
import { Campaign, Channel } from '../../types/campaign';

interface WebsitePurchasePredictorProps {
  campaigns: Campaign[];
}

interface ChannelPurchaseSummary {
  channel: Channel;
  clicks: number;
  purchases: number;
  nonPurchases: number;
}

const CHANNELS: Channel[] = ['Google Ads', 'Meta Ads', 'LinkedIn', 'TikTok', 'YouTube', 'Email'];

const formatCount = (value: number) => new Intl.NumberFormat().format(value);
const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

export const WebsitePurchasePredictor: React.FC<WebsitePurchasePredictorProps> = ({ campaigns }) => {
  const salesCampaigns = useMemo(
    () => campaigns.filter(campaign => campaign.target_objective === 'Sales'),
    [campaigns]
  );

  const channelSummaries = useMemo<ChannelPurchaseSummary[]>(() => {
    return CHANNELS.map(channel => {
      const matchingCampaigns = salesCampaigns.filter(campaign => campaign.channel === channel);
      const clicks = matchingCampaigns.reduce(
        (total, campaign) => total + Math.max(0, Math.round(campaign.clicks || 0)),
        0
      );
      const purchases = matchingCampaigns.reduce((total, campaign) => {
        const clicksForCampaign = Math.max(0, Math.round(campaign.clicks || 0));
        const conversions = Math.max(0, Math.round(campaign.conversions || 0));
        return total + Math.min(clicksForCampaign, conversions);
      }, 0);

      return {
        channel,
        clicks,
        purchases,
        nonPurchases: Math.max(0, clicks - purchases)
      };
    });
  }, [salesCampaigns]);

  const totalSummary = useMemo(
    () => channelSummaries.reduce(
      (summary, channel) => ({
        clicks: summary.clicks + channel.clicks,
        purchases: summary.purchases + channel.purchases,
        nonPurchases: summary.nonPurchases + channel.nonPurchases
      }),
      { clicks: 0, purchases: 0, nonPurchases: 0 }
    ),
    [channelSummaries]
  );

  const [selectedChannel, setSelectedChannel] = useState<Channel>('Google Ads');
  const [detailsChannel, setDetailsChannel] = useState<Channel | null>(null);
  const [visitorCount, setVisitorCount] = useState(100);
  const [prediction, setPrediction] = useState<{
    channel: Channel;
    visitors: number;
    purchaseRate: number;
    expectedPurchases: number;
    expectedNonPurchases: number;
    source: 'channel' | 'overall';
  } | null>(null);

  useEffect(() => {
    setPrediction(null);
  }, [campaigns]);

  const runPrediction = () => {
    const selectedSummary = channelSummaries.find(summary => summary.channel === selectedChannel);
    const channelPurchaseRate = selectedSummary && selectedSummary.clicks > 0
      ? selectedSummary.purchases / selectedSummary.clicks
      : undefined;
    const purchaseRate = channelPurchaseRate !== undefined
      ? channelPurchaseRate
      : totalSummary.clicks > 0
        ? totalSummary.purchases / totalSummary.clicks
        : 0;
    const visitors = Math.max(1, Math.floor(visitorCount) || 1);
    const expectedPurchases = visitors * purchaseRate;

    setPrediction({
      channel: selectedChannel,
      visitors,
      purchaseRate,
      expectedPurchases,
      expectedNonPurchases: visitors - expectedPurchases,
      source: channelPurchaseRate !== undefined ? 'channel' : 'overall'
    });
  };

  const cardClass = 'rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1.5">
          <ShoppingCart className="h-3.5 w-3.5" />
          Purchase / No Purchase
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Website Purchase Predictor
        </h2>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Compare purchase and non-purchase activity by marketing source, then estimate outcomes for future visits using the active dataset&apos;s historical Sales conversion rate.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Sales clicks analyzed"
          value={formatCount(totalSummary.clicks)}
          detail={`${salesCampaigns.length} Sales campaigns`}
          icon={<Users className="h-4 w-4" />}
          color="cyan"
        />
        <SummaryCard
          label="Purchased"
          value={formatCount(totalSummary.purchases)}
          detail={totalSummary.clicks ? `${formatPercent(totalSummary.purchases / totalSummary.clicks)} purchase rate` : 'No Sales click history'}
          icon={<CircleCheck className="h-4 w-4" />}
          color="emerald"
        />
        <SummaryCard
          label="Did not purchase"
          value={formatCount(totalSummary.nonPurchases)}
          detail="Sales clicks without a conversion"
          icon={<CircleX className="h-4 w-4" />}
          color="rose"
        />
      </div>

      <section className={cardClass}>
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Purchase outcome by website / source</h3>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Source names reflect the channels available in this project&apos;s campaign dataset.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="pb-3 pr-4 font-semibold">Website / Source</th>
                <th className="pb-3 pr-4 text-right font-semibold">Sales clicks</th>
                <th className="pb-3 pr-4 text-right font-semibold">Purchased</th>
                <th className="pb-3 pr-4 text-right font-semibold">Did not purchase</th>
                <th className="pb-3 pr-4 text-right font-semibold">Purchase rate</th>
                <th className="pb-3 text-right font-semibold">Product details</th>
              </tr>
            </thead>
            <tbody>
              {channelSummaries.map(summary => {
                const matchingCampaigns = salesCampaigns.filter(campaign => campaign.channel === summary.channel);
                const detailsId = `purchase-details-${summary.channel.replace(/\s+/g, '-').toLowerCase()}`;
                const isExpanded = detailsChannel === summary.channel;

                return (
                  <React.Fragment key={summary.channel}>
                    <tr className="border-b border-slate-100 dark:border-slate-800/70">
                      <td className="py-3 pr-4 font-semibold text-slate-800 dark:text-slate-200">{summary.channel}</td>
                      <td className="py-3 pr-4 text-right tabular-nums text-slate-600 dark:text-slate-300">{formatCount(summary.clicks)}</td>
                      <td className="py-3 pr-4 text-right font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{formatCount(summary.purchases)}</td>
                      <td className="py-3 pr-4 text-right font-semibold tabular-nums text-rose-600 dark:text-rose-400">{formatCount(summary.nonPurchases)}</td>
                      <td className="py-3 pr-4 text-right tabular-nums text-slate-700 dark:text-slate-200">
                        {summary.clicks > 0 ? formatPercent(summary.purchases / summary.clicks) : 'No data'}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls={detailsId}
                          disabled={matchingCampaigns.length === 0}
                          onClick={() => setDetailsChannel(isExpanded ? null : summary.channel)}
                          className="rounded-md border border-cyan-500/30 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-700 transition-colors hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-40 dark:text-cyan-300"
                        >
                          {isExpanded ? 'Hide details' : 'View purchases'}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr id={detailsId} className="border-b border-slate-100 dark:border-slate-800/70">
                        <td colSpan={6} className="bg-slate-50/80 p-3 dark:bg-slate-950/50">
                          <div className="mb-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            Purchased product / campaign labels • {summary.channel}
                          </div>
                          {matchingCampaigns.some(campaign => Math.min(
                            Math.max(0, Math.round(campaign.clicks || 0)),
                            Math.max(0, Math.round(campaign.conversions || 0))
                          ) > 0) ? (
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[480px] text-left text-[11px]">
                                <thead>
                                  <tr className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    <th className="pb-2 pr-4 font-semibold">Product / campaign name</th>
                                    <th className="pb-2 pr-4 text-right font-semibold">Purchases</th>
                                    <th className="pb-2 pr-4 text-right font-semibold">Sales clicks</th>
                                    <th className="pb-2 text-right font-semibold">Campaign revenue</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {matchingCampaigns.map(campaign => {
                                    const campaignPurchases = Math.min(
                                      Math.max(0, Math.round(campaign.clicks || 0)),
                                      Math.max(0, Math.round(campaign.conversions || 0))
                                    );
                                    if (campaignPurchases === 0) return null;

                                    return (
                                      <tr key={campaign.campaign_id} className="border-t border-slate-200/70 dark:border-slate-800">
                                        <td className="py-2 pr-4 font-medium text-slate-800 dark:text-slate-200">
                                          {campaign.campaign_name}
                                          <span className="ml-2 font-mono text-[10px] text-slate-400">{campaign.campaign_id}</span>
                                        </td>
                                        <td className="py-2 pr-4 text-right font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{formatCount(campaignPurchases)}</td>
                                        <td className="py-2 pr-4 text-right tabular-nums text-slate-600 dark:text-slate-300">{formatCount(Math.max(0, Math.round(campaign.clicks || 0)))}</td>
                                        <td className="py-2 text-right tabular-nums text-slate-700 dark:text-slate-200">${formatCount(Math.round(campaign.revenue || 0))}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              No purchases are recorded for this source in the active Sales campaigns.
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className={cardClass}>
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Predict purchases for upcoming visits</h3>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            The estimate applies the selected source&apos;s historical Sales purchase rate to your expected visit count.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Website / marketing source</span>
            <select
              value={selectedChannel}
              onChange={event => {
                setSelectedChannel(event.target.value as Channel);
                setPrediction(null);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              {CHANNELS.map(channel => <option key={channel} value={channel}>{channel}</option>)}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Expected visits / clicks</span>
            <input
              type="number"
              min={1}
              step={1}
              value={visitorCount}
              onChange={event => {
                setVisitorCount(Math.max(1, Number(event.target.value) || 1));
                setPrediction(null);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </label>
          <button
            onClick={runPrediction}
            disabled={totalSummary.clicks === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Predict purchases <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {totalSummary.clicks === 0 && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            No Sales click history is available in this dataset, so a purchase prediction cannot be calculated. Add Sales campaign data and run analysis again.
          </div>
        )}

        {prediction && (
          <div className="mt-5 rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">
                  Prediction • {prediction.channel}
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  Estimated from {prediction.source === 'channel' ? `${prediction.channel} Sales history` : 'all Sales-channel history'}.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">{formatPercent(prediction.purchaseRate)}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">purchase probability per visit</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <PredictionMetric label="Expected visits" value={formatCount(prediction.visitors)} />
              <PredictionMetric label="Expected purchases" value={prediction.expectedPurchases.toFixed(1)} positive />
              <PredictionMetric label="Expected no-purchases" value={prediction.expectedNonPurchases.toFixed(1)} />
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
              This is a historical-rate estimate, not a guarantee. Results may be less reliable when the selected source has a small sample or uses the overall fallback.
            </p>
          </div>
        )}
      </section>

      <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500" />
        Only campaigns whose objective is Sales are included. Their conversions are treated as purchases; remaining clicks are treated as non-purchases. Lead-gen, traffic, and awareness conversions are excluded.
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  color: 'cyan' | 'emerald' | 'rose';
}> = ({ label, value, detail, icon, color }) => {
  const colorClasses = {
    cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorClasses[color]}`}>{icon}</span>
      </div>
      <div className="mt-2 text-2xl font-black tabular-nums text-slate-900 dark:text-slate-100">{value}</div>
      <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{detail}</div>
    </div>
  );
};

const PredictionMetric: React.FC<{ label: string; value: string; positive?: boolean }> = ({ label, value, positive = false }) => (
  <div className="rounded-lg border border-slate-200 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-950/60">
    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
    <div className={`mt-1 text-lg font-bold tabular-nums ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
      {value}
    </div>
  </div>
);
