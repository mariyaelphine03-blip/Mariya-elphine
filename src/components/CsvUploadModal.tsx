import React, { useState } from 'react';
import { Campaign } from '../types/campaign';
import { parseMarketingCSV } from '../utils/csvParser';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  Download,
  Copy,
  PlusCircle,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCampaigns: (campaigns: Campaign[], mode: 'replace' | 'append', navigateToPredictor?: boolean) => void;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  isOpen,
  onClose,
  onApplyCampaigns,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [rawText, setRawText] = useState('');
  const [parsedResult, setParsedResult] = useState<{
    campaigns: Campaign[];
    headers: string[];
    count: number;
    filename?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  if (!isOpen) return null;

  const processText = (text: string, filename?: string) => {
    setErrorMessage(null);
    const res = parseMarketingCSV(text);
    if (res.error || res.campaigns.length === 0) {
      setErrorMessage(res.error || 'Could not parse valid campaign records from this file.');
      setParsedResult(null);
      return;
    }
    setParsedResult({
      campaigns: res.campaigns,
      headers: res.headersFound,
      count: res.rowCount,
      filename
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processText(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processText(content, file.name);
    };
    reader.readAsText(file);
  };

  const handlePasteSubmit = () => {
    if (!rawText.trim()) {
      setErrorMessage('Please paste CSV text or tabular data first.');
      return;
    }
    processText(rawText, 'Pasted Data');
  };

  const handleConfirmImport = (navigateToPredictor = false) => {
    if (!parsedResult || parsedResult.campaigns.length === 0) return;
    onApplyCampaigns(parsedResult.campaigns, importMode, navigateToPredictor);
    onClose();
  };

  const downloadSampleTemplate = () => {
    const sample = [
      'campaign_id,campaign_name,channel,audience_type,ad_spend,impressions,clicks,ctr,cpc,conversions,revenue,roas,creative_quality_score,target_objective',
      'CMP-101,Google Search High Intent,Google Ads,B2C,5000,140000,4200,3.00,1.19,336,20160,4.03,8.5,Sales',
      'CMP-102,Meta Dynamic Retargeting,Meta Ads,B2C,3500,110000,3300,3.00,1.06,264,14520,4.15,8.2,Sales',
      'CMP-103,LinkedIn Executive ABM,LinkedIn,B2B,7000,80000,1200,1.50,5.83,96,24000,3.43,7.5,Lead Gen',
      'CMP-104,TikTok Creator Challenge,TikTok,B2C,2800,260000,5200,2.00,0.54,156,6240,2.23,6.8,Awareness',
      'CMP-105,VIP Customer Newsletter,Email,B2C,750,40000,2800,7.00,0.27,308,15400,20.53,9.2,Sales'
    ].join('\n');

    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_marketing_campaigns_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-cyan-950/60 text-indigo-600 dark:text-cyan-400">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Upload Campaign CSV File</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Import external ad data from any source (Google Ads, Meta, TikTok, Excel, CSV)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-4 space-y-4">
          {/* Tabs: Upload vs Paste */}
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <button
              onClick={() => setPasteMode(false)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                !pasteMode
                  ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Choose CSV File / Drag & Drop
            </button>
            <button
              onClick={() => setPasteMode(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                pasteMode
                  ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Paste CSV / Tabular Text
            </button>
          </div>

          {!pasteMode ? (
            /* Drag and drop upload box */
            <div
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                dragActive
                  ? 'border-indigo-600 dark:border-cyan-500 bg-indigo-50/20 dark:bg-cyan-950/30'
                  : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/40 dark:bg-slate-950/40'
              }`}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-cyan-950 text-indigo-600 dark:text-cyan-400 mb-2">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Drag and drop your CSV file here
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4">
                Supports .csv, .tsv, comma/tab separated files with automatic column detection
              </p>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 dark:bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 dark:hover:bg-cyan-500 transition-colors shadow-2xs">
                <Upload className="h-4 w-4" />
                <span>Browse File from Computer</span>
                <input
                  type="file"
                  accept=".csv,.txt,.tsv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            /* Direct text paste area */
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Paste CSV or Excel Table Rows:
              </label>
              <textarea
                rows={6}
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="campaign_name,channel,ad_spend,clicks,conversions,revenue&#10;Google Promo,Google Ads,4500,4200,320,18500&#10;Meta Retargeting,Meta Ads,3200,3000,240,12900"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden"
              />
              <button
                onClick={handlePasteSubmit}
                className="rounded-lg bg-slate-900 dark:bg-cyan-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-cyan-500 transition-colors"
              >
                Parse Pasted Rows
              </button>
            </div>
          )}

          {/* Error display */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Parsed Preview Card */}
          {parsedResult && (
            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    Successfully parsed {parsedResult.count} campaign rows from {parsedResult.filename || 'file'}!
                  </span>
                </div>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                  {parsedResult.headers.length} headers mapped
                </span>
              </div>

              {/* Quick sample preview */}
              <div className="overflow-x-auto text-[11px] bg-white dark:bg-slate-900 rounded-lg p-2 border border-emerald-100 dark:border-slate-800 max-h-36">
                <table className="w-full text-left font-mono">
                  <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-1 px-2 font-sans font-semibold">Campaign</th>
                      <th className="py-1 px-2">Channel</th>
                      <th className="py-1 px-2">Spend</th>
                      <th className="py-1 px-2">Revenue</th>
                      <th className="py-1 px-2">ROAS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {parsedResult.campaigns.slice(0, 4).map((c, i) => (
                      <tr key={i}>
                        <td className="py-1 px-2 font-sans font-medium text-slate-900 dark:text-slate-100 truncate max-w-[140px]">{c.campaign_name}</td>
                        <td className="py-1 px-2">{c.channel}</td>
                        <td className="py-1 px-2">${c.ad_spend.toLocaleString()}</td>
                        <td className="py-1 px-2 text-emerald-600 dark:text-emerald-400 font-semibold">${c.revenue.toLocaleString()}</td>
                        <td className="py-1 px-2 font-bold">{c.roas.toFixed(2)}x</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mode choice: Replace vs Append */}
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-1">
                <span>Import Method:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="accent-cyan-500"
                  />
                  <span>Replace current dataset ({parsedResult.count} campaigns)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="accent-cyan-500"
                  />
                  <span>Append / Merge with existing</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={downloadSampleTemplate}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-cyan-400 font-semibold hover:underline"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Sample CSV Template</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!parsedResult}
              onClick={() => handleConfirmImport(false)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Apply Dataset</span>
            </button>
            <button
              disabled={!parsedResult}
              onClick={() => handleConfirmImport(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-cyan-200" />
              <span>Apply & Go to Predictions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
