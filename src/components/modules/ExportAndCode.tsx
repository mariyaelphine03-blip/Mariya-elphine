import React, { useState } from 'react';
import { Campaign, ModelMetricResult } from '../../types/campaign';
import {
  Download,
  FileCode2,
  Copy,
  Check,
  Printer,
  FileSpreadsheet,
  Terminal,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface ExportCodeProps {
  campaigns: Campaign[];
  modelResults: ModelMetricResult[];
}

export const ExportAndCode: React.FC<ExportCodeProps> = ({ campaigns, modelResults }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedReqs, setCopiedReqs] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'app.py' | 'requirements.txt' | 'instructions'>('app.py');

  const exportCSV = () => {
    const headers = [
      'campaign_id',
      'campaign_name',
      'channel',
      'audience_type',
      'target_objective',
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
      c.target_objective,
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
    link.download = `marketing_campaign_predictions_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const jsonStr = JSON.stringify(campaigns, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `marketing_campaigns_dataset.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const pythonCode = `"""
Digital Marketing Campaign Performance Prediction Using Machine Learning
Complete working Streamlit application with Pandas, Scikit-learn, and Plotly.
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error, accuracy_score

# 1. Page Configuration
st.set_page_config(page_title="Digital Marketing Campaign Performance Prediction", layout="wide", page_icon="📈")
st.title("Digital Marketing Campaign Performance Prediction")

# 2. Data Loading
@st.cache_data
def load_data():
    try:
        return pd.read_csv("sample_marketing_campaigns.csv")
    except Exception:
        # Synthetic generator fallback
        return pd.DataFrame({
            "ad_spend": np.random.uniform(1000, 10000, 60),
            "clicks": np.random.randint(500, 5000, 60),
            "ctr": np.random.uniform(1.5, 4.5, 60),
            "cpc": np.random.uniform(0.8, 3.5, 60),
            "creative_quality_score": np.random.uniform(6.0, 9.5, 60),
            "conversions": np.random.randint(50, 450, 60),
            "revenue": np.random.uniform(5000, 45000, 60),
            "roas": np.random.uniform(2.0, 5.5, 60)
        })

df = load_data()

# 3. Model Training
features = ["ad_spend", "clicks", "ctr", "cpc", "creative_quality_score"]
X = df[features].fillna(0)
y = df["revenue"].fillna(0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

models = {
    "Linear Regression": LinearRegression(),
    "Decision Tree": DecisionTreeRegressor(max_depth=5, random_state=42),
    "Random Forest": RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42)
}

scores = []
trained = {}
for name, m in models.items():
    m.fit(X_train, y_train)
    preds = m.predict(X_test)
    scores.append({
        "Model": name,
        "R2 Score": r2_score(y_test, preds),
        "MAE": mean_absolute_error(y_test, preds),
        "RMSE": np.sqrt(mean_squared_error(y_test, preds))
    })
    trained[name] = m

st.subheader("Model Benchmark Results")
st.dataframe(pd.DataFrame(scores))

# 4. Interactive Prediction
st.subheader("Predict Campaign Revenue")
c1, c2 = st.columns(2)
spend = c1.number_input("Ad Spend ($)", value=5000.0)
cpc_in = c1.number_input("Expected CPC ($)", value=1.20)
ctr_in = c2.number_input("Expected CTR (%)", value=3.2)
score_in = c2.slider("Creative Score", 1.0, 10.0, 8.5)
clicks_in = int(spend / cpc_in)

pred_rev = trained["Random Forest"].predict([[spend, clicks_in, ctr_in, cpc_in, score_in]])[0]
st.metric("Predicted Revenue", f"\${pred_rev:,.2f}", delta=f"{pred_rev/spend:.2f}x ROAS")
`;

  const reqsText = `streamlit>=1.35.0
pandas>=2.2.0
numpy>=1.26.0
scikit-learn>=1.4.0
plotly>=5.20.0
openpyxl>=3.1.2
`;

  const copyCode = (text: string, isReq: boolean) => {
    navigator.clipboard.writeText(text);
    if (isReq) {
      setCopiedReqs(true);
      setTimeout(() => setCopiedReqs(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Export Artifacts & Python Streamlit Codebase
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Download formatted predictions, generate executive summary audits, or inspect the standalone Python / Streamlit project files.
        </p>
      </div>

      {/* Export Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CSV Export */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Export Full CSV Dataset</h3>
            </div>
            <p className="text-xs text-slate-500">
              Download all {campaigns.length} campaigns with spend, clicks, conversions, revenue, ROAS, and performance tier labels.
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-2xs"
          >
            <Download className="h-4 w-4" />
            <span>Download CSV File</span>
          </button>
        </div>

        {/* JSON Export */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileCode2 className="h-5 w-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Export Machine JSON</h3>
            </div>
            <p className="text-xs text-slate-500">
              Structured JSON format containing normalized feature arrays and campaign metadata for downstream API ingestion.
            </p>
          </div>
          <button
            onClick={exportJSON}
            className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="h-4 w-4" />
            <span>Download JSON Payload</span>
          </button>
        </div>

        {/* Executive Print / PDF Report */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Printer className="h-5 w-5 text-slate-900" />
              <h3 className="text-sm font-bold text-slate-900">Executive Print / PDF Report</h3>
            </div>
            <p className="text-xs text-slate-500">
              Print a clean, executive-ready performance audit with model benchmark scores and strategic budget reallocations.
            </p>
          </div>
          <button
            onClick={handlePrintReport}
            className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <Printer className="h-4 w-4" />
            <span>Print Executive Audit</span>
          </button>
        </div>
      </div>

      {/* Python & Streamlit Code Repository Artifacts */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-200 p-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Python, Streamlit, Scikit-learn & Plotly Codebase
            </h3>
          </div>

          {/* Segmented Code Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setActiveCodeTab('app.py')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeCodeTab === 'app.py' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              app.py
            </button>
            <button
              onClick={() => setActiveCodeTab('requirements.txt')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeCodeTab === 'requirements.txt' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              requirements.txt
            </button>
            <button
              onClick={() => setActiveCodeTab('instructions')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeCodeTab === 'instructions' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Deployment Guide
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto relative">
          {activeCodeTab === 'app.py' && (
            <div>
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800">
                <span className="text-slate-400 text-[11px]">Streamlit Application Entrypoint (app.py)</span>
                <button
                  onClick={() => copyCode(pythonCode, false)}
                  className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-sm"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="text-slate-300 leading-relaxed max-h-96 overflow-y-auto">
                {pythonCode}
              </pre>
            </div>
          )}

          {activeCodeTab === 'requirements.txt' && (
            <div>
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800">
                <span className="text-slate-400 text-[11px]">Python PIP Dependencies (requirements.txt)</span>
                <button
                  onClick={() => copyCode(reqsText, true)}
                  className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-sm"
                >
                  {copiedReqs ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedReqs ? 'Copied' : 'Copy Dependencies'}</span>
                </button>
              </div>
              <pre className="text-emerald-400 leading-relaxed">
                {reqsText}
              </pre>
            </div>
          )}

          {activeCodeTab === 'instructions' && (
            <div className="font-sans text-xs text-slate-300 space-y-4 p-2">
              <h4 className="text-sm font-bold text-white font-mono">Step-by-Step Deployment Instructions:</h4>
              <div className="space-y-3">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-400 font-mono">Step 1: Environment Setup</span>
                  <p className="text-slate-300">Clone the repo and create an isolated Python virtual environment:</p>
                  <pre className="bg-black/60 p-2 rounded text-emerald-400 font-mono">python3 -m venv venv && source venv/bin/activate</pre>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-400 font-mono">Step 2: Install Required Packages</span>
                  <p className="text-slate-300">Install Pandas, Scikit-learn, Streamlit, and Plotly:</p>
                  <pre className="bg-black/60 p-2 rounded text-emerald-400 font-mono">pip install -r requirements.txt</pre>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-400 font-mono">Step 3: Launch Local Streamlit Web Server</span>
                  <p className="text-slate-300">Run the Streamlit application on localhost (port 8501):</p>
                  <pre className="bg-black/60 p-2 rounded text-emerald-400 font-mono">streamlit run app.py</pre>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-400 font-mono">Step 4: Deploying to Streamlit Cloud or Cloud Run</span>
                  <p className="text-slate-300">
                    Push `app.py`, `requirements.txt`, and `sample_marketing_campaigns.csv` to GitHub. Connect your GitHub repository to <strong>Streamlit Community Cloud</strong> or containerize using Docker for Google Cloud Run deployment.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
