# Digital Marketing Campaign Performance Prediction Using Machine Learning

A full-stack, responsive Machine Learning web application designed to forecast campaign revenue, predict conversions, analyze feature correlation matrices, classify performance health tiers, and simulate multi-channel budget allocations.

---

## 🌟 Key Features

1. **Dashboard Overview**: Unified cross-channel telemetry for Total Ad Spend, Revenue, Conversions, Clicks, CPA, and blended ROAS across Google Ads, Meta Ads, LinkedIn, TikTok, YouTube, and Email.
2. **Data Pipeline & Preprocessing**: Upload CSV or Excel datasets with automated column mapping, missing value imputation (Mean/Median), outlier diagnostics (IQR), and zero-data-leakage verification.
3. **Exploratory Data Analysis (EDA)**: Parametric distribution histograms, summary statistics (Mean, Std, Min, Q1, Median, Q3, Max, Skewness), and a full marketing conversion funnel.
4. **Feature & Correlation Analysis**: Pearson $r$ correlation heatmap matrix with interactive pair explanations and Random Forest Gini feature importance rankings.
5. **Model Training & Comparison**: Train and benchmark **Multiple Linear Regression (Ridge OLS)**, **Decision Tree Regressor**, and **Random Forest Regressor** with customizable train/test split ratios and holdout test scatter/residual plots.
6. **Revenue & Conversion Predictor**: Interactive inference engine calculating predicted revenue, conversions, ROAS, CPA, and 95% confidence intervals based on target budget, CPC, CTR, and creative quality score.
7. **Website Purchase Predictor**: Purchase and non-purchase counts by marketing source, with purchase estimates for future visits based on historical Sales campaign conversion rates.
8. **Performance Tier Classifier**: Multi-class classification (High, Medium, Low Performance) with precision, recall, and confusion matrix diagnostics.
9. **Budget Scenario Simulator**: What-if budget allocator with non-linear diminishing returns modeling and side-by-side strategy comparisons.
10. **Data-Driven Marketing Recommendations**: Actionable budget reallocations and creative fatigue interventions with projected revenue upside calculations.
11. **Existing Systems vs Proposed System**: Architectural breakdown of Google Analytics 4, Google Ads, Meta Ads Manager, and Excel spreadsheets vs. the proposed ML pipeline.
12. **Export & Python Code**: 1-click CSV/JSON export, printable executive audit report, and the complete standalone Python/Streamlit codebase (`app.py`, `requirements.txt`).

---

## 🚀 Running the Python Streamlit App Locally

### 1. Prerequisites
Ensure Python 3.9+ is installed on your computer.

### 2. Setup Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Streamlit Application
```bash
streamlit run app.py
```
Open [http://localhost:8501](http://localhost:8501) in your browser.

---

## 📦 Project Structure

```
├── app.py                            # Streamlit Python ML application
├── requirements.txt                  # Python dependencies
├── sample_marketing_campaigns.csv    # Sample benchmark marketing dataset
├── package.json                      # Web application packages
├── index.html                        # HTML entry point
├── src/
│   ├── App.tsx                       # Main React ML application container
│   ├── types/campaign.ts             # TypeScript interfaces for campaigns & models
│   ├── data/benchmarkDataset.ts      # Multi-channel marketing campaign benchmark
│   ├── utils/
│   │   ├── mlEngine.ts               # ML algorithms (Ridge OLS, Decision Tree, Random Forest)
│   │   └── recommendations.ts        # Data-driven recommendations engine
│   └── components/
│       ├── Header.tsx                # App navigation and global metrics
│       ├── Sidebar.tsx               # Module navigation
│       └── modules/                  # Feature module implementations
└── README.md                         # Documentation & deployment guide
```
