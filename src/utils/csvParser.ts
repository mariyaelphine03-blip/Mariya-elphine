import { Campaign, PerformanceTier, Channel, AudienceType, Objective } from '../types/campaign';

/**
 * Universal robust CSV / TSV / Semicolon-delimited parser with intelligent column fuzzy-matching.
 */
export function parseMarketingCSV(rawText: string): {
  campaigns: Campaign[];
  headersFound: string[];
  rowCount: number;
  error?: string;
} {
  const cleanText = rawText.trim();
  if (!cleanText) {
    return { campaigns: [], headersFound: [], rowCount: 0, error: 'File is empty.' };
  }

  // Detect delimiter: comma, tab, semicolon, pipe
  const firstLine = cleanText.split('\n')[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';') && (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) delimiter = ';';
  else if (firstLine.includes('|')) delimiter = '|';

  // Parse CSV lines respecting quotes
  const lines: string[][] = [];
  const rawLines = cleanText.split(/\r?\n/);

  for (const rawLine of rawLines) {
    if (!rawLine.trim()) continue;
    const tokens: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < rawLine.length; i++) {
      const char = rawLine[i];
      if (char === '"') {
        if (insideQuotes && rawLine[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        tokens.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    tokens.push(current.trim());
    lines.push(tokens);
  }

  if (lines.length < 2) {
    return { campaigns: [], headersFound: [], rowCount: 0, error: 'CSV must contain at least a header and 1 data row.' };
  }

  const rawHeaders = lines[0];
  const normalizedHeaders = rawHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, '_'));

  // Fuzzy column detector
  const findCol = (patterns: string[]): number => {
    return normalizedHeaders.findIndex(h => patterns.some(p => h.includes(p)));
  };

  const idxName = findCol(['name', 'campaign', 'title', 'ad_group']);
  const idxId = findCol(['id', 'code', 'cmp_id', 'key']);
  const idxChannel = findCol(['channel', 'platform', 'network', 'source', 'publisher', 'medium']);
  const idxAudience = findCol(['audience', 'segment', 'type', 'target']);
  const idxObjective = findCol(['objective', 'goal', 'campaign_type']);
  const idxSpend = findCol(['spend', 'cost', 'budget', 'amount', 'investment', 'charge']);
  const idxRevenue = findCol(['revenue', 'rev', 'sales', 'value', 'income', 'conv_val', 'return']);
  const idxClicks = findCol(['clicks', 'click', 'traffic', 'visits', 'sessions']);
  const idxImp = findCol(['impressions', 'impression', 'imp', 'views', 'reach']);
  const idxCtr = findCol(['ctr', 'click_through', 'click_rate']);
  const idxCpc = findCol(['cpc', 'cost_per_click', 'avg_cpc']);
  const idxConv = findCol(['conversions', 'conversion', 'conv', 'leads', 'purchases', 'orders', 'sales_count']);
  const idxScore = findCol(['score', 'creative', 'quality', 'ad_score', 'rating']);
  const idxRoas = findCol(['roas', 'return_on_ad_spend', 'ratio', 'multiplier']);

  const parsedCampaigns: Campaign[] = [];

  for (let r = 1; r < lines.length; r++) {
    const row = lines[r];
    if (row.length === 0 || row.every(val => !val)) continue;

    const getStr = (idx: number, fallback: string): string => {
      return idx !== -1 && row[idx] ? row[idx].replace(/["']/g, '').trim() : fallback;
    };

    const getNum = (idx: number, fallback: number): number => {
      if (idx === -1 || row[idx] === undefined) return fallback;
      // Strip currency signs, commas, percentage signs
      const sanitized = row[idx].replace(/[$,\s%]/g, '');
      const num = parseFloat(sanitized);
      return isNaN(num) ? fallback : num;
    };

    // Extract core numbers
    let spend = getNum(idxSpend, -1);
    let rev = getNum(idxRevenue, -1);
    let clicks = Math.round(getNum(idxClicks, -1));
    let impressions = Math.round(getNum(idxImp, -1));
    let ctr = getNum(idxCtr, -1);
    let cpc = getNum(idxCpc, -1);
    let conv = Math.round(getNum(idxConv, -1));
    let score = getNum(idxScore, -1);
    let roas = getNum(idxRoas, -1);

    // If spend is missing, estimate from clicks and cpc
    if (spend <= 0) {
      if (clicks > 0 && cpc > 0) spend = Math.round(clicks * cpc);
      else spend = 1000;
    }

    // If clicks is missing
    if (clicks <= 0) {
      if (spend > 0 && cpc > 0) clicks = Math.max(1, Math.round(spend / cpc));
      else if (impressions > 0 && ctr > 0) clicks = Math.max(1, Math.round((impressions * ctr) / 100));
      else clicks = Math.max(10, Math.round(spend / 1.2));
    }

    // If impressions is missing
    if (impressions <= 0) {
      if (clicks > 0 && ctr > 0) impressions = Math.round((clicks / (ctr / 100)));
      else impressions = clicks * 40;
    }

    // If CTR is missing
    if (ctr <= 0) {
      if (impressions > 0 && clicks > 0) ctr = Number(((clicks / impressions) * 100).toFixed(2));
      else ctr = 2.5;
    }

    // If CPC is missing
    if (cpc <= 0) {
      if (spend > 0 && clicks > 0) cpc = Number((spend / clicks).toFixed(2));
      else cpc = 1.25;
    }

    // If Conversions is missing
    if (conv <= 0) {
      conv = Math.max(1, Math.round(clicks * 0.065));
    }

    // If Revenue is missing
    if (rev <= 0) {
      if (roas > 0 && spend > 0) rev = Math.round(spend * roas);
      else rev = Math.round(conv * 65);
    }

    // If ROAS is missing
    if (roas <= 0) {
      roas = spend > 0 ? Number((rev / spend).toFixed(2)) : 1.0;
    }

    // If creative score is missing
    if (score <= 0 || score > 10) {
      score = Number((6.0 + Math.random() * 3.5).toFixed(1));
    }

    // Channel detection
    const rawChannelStr = getStr(idxChannel, '').toLowerCase();
    let channel: Channel = 'Google Ads';
    if (rawChannelStr.includes('meta') || rawChannelStr.includes('facebook') || rawChannelStr.includes('instagram')) channel = 'Meta Ads';
    else if (rawChannelStr.includes('linkedin')) channel = 'LinkedIn';
    else if (rawChannelStr.includes('tiktok')) channel = 'TikTok';
    else if (rawChannelStr.includes('youtube')) channel = 'YouTube';
    else if (rawChannelStr.includes('email') || rawChannelStr.includes('newsletter') || rawChannelStr.includes('klaviyo')) channel = 'Email';
    else if (rawChannelStr.includes('google') || rawChannelStr.includes('search') || rawChannelStr.includes('pmax')) channel = 'Google Ads';

    // Audience
    const rawAudStr = getStr(idxAudience, '').toLowerCase();
    let audience: AudienceType = channel === 'LinkedIn' ? 'B2B' : 'B2C';
    if (rawAudStr.includes('b2b') || rawAudStr.includes('enterprise')) audience = 'B2B';
    else if (rawAudStr.includes('b2c') || rawAudStr.includes('consumer')) audience = 'B2C';

    // Objective
    const rawObjStr = getStr(idxObjective, '').toLowerCase();
    let objective: Objective = 'Sales';
    if (rawObjStr.includes('lead')) objective = 'Lead Gen';
    else if (rawObjStr.includes('traffic')) objective = 'Traffic';
    else if (rawObjStr.includes('aware') || rawObjStr.includes('brand')) objective = 'Awareness';

    // Tier
    let tier: PerformanceTier = 'Medium';
    if (roas >= 3.5) tier = 'High';
    else if (roas < 2.0) tier = 'Low';

    const campName = getStr(idxName, `${channel} Campaign ${r}`);
    const campId = getStr(idxId, `UPLOAD-${1000 + r}`);

    parsedCampaigns.push({
      campaign_id: campId,
      campaign_name: campName,
      channel,
      audience_type: audience,
      ad_spend: Number(spend.toFixed(2)),
      impressions,
      clicks,
      ctr: Number(ctr.toFixed(2)),
      cpc: Number(cpc.toFixed(2)),
      conversions: conv,
      conversion_rate: Number(((conv / (clicks || 1)) * 100).toFixed(2)),
      revenue: Number(rev.toFixed(2)),
      roas: Number(roas.toFixed(2)),
      creative_quality_score: Number(score.toFixed(1)),
      target_objective: objective,
      performance_tier: tier
    });
  }

  return {
    campaigns: parsedCampaigns,
    headersFound: rawHeaders,
    rowCount: parsedCampaigns.length
  };
}
