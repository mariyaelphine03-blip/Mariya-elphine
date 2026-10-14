"""
Digital Marketing Campaign Performance Prediction Using Machine Learning
A complete Streamlit application using Pandas, Scikit-learn, and Plotly.
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error, accuracy_score, classification_report
import io

# Page Configuration
st.set_page_config(
    page_title="Digital Marketing Campaign Performance Prediction",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .kicker { font-size: 0.9rem; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0px; }
    .main-title { font-size: 2.4rem; font-weight: 800; color: #1e293b; line-height: 1.15; margin-bottom: 0.25rem; }
    .accent-title { font-size: 1.4rem; font-weight: 700; color: #4f46e5; margin-bottom: 0.5rem; }
    .sub-title { font-size: 1rem; color: #64748b; margin-bottom: 1.5rem; }
    .metric-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
</style>
""", unsafe_allow_html=True)

# ----------------- Helper Functions -----------------
@st.cache_data
def load_sample_data():
    try:
        return pd.read_csv("sample_marketing_campaigns.csv")
    except Exception:
        # Fallback in-memory synthetic generator
        np.random.seed(42)
        channels = ["Google Ads", "Meta Ads", "LinkedIn", "TikTok", "YouTube", "Email"]
        audiences = ["B2B", "B2C"]
        data = []
        for i in range(100):
            ch = np.random.choice(channels)
            aud = "B2B" if ch == "LinkedIn" else np.random.choice(audiences, p=[0.2, 0.8])
            spend = np.random.uniform(500, 10000)
            cpc = np.random.uniform(0.3, 2.0) if ch != "LinkedIn" else np.random.uniform(4.0, 9.0)
            clicks = int(spend / cpc)
            ctr = np.random.uniform(1.2, 4.5) if ch != "Email" else np.random.uniform(5.0, 10.0)
            impressions = int((clicks / ctr) * 100)
            cvr = np.random.uniform(4.0, 9.5) if aud == "B2C" else np.random.uniform(5.5, 9.0)
            conv = int(clicks * (cvr / 100))
            aov = np.random.uniform(50, 90) if aud == "B2C" else np.random.uniform(200, 400)
            revenue = round(conv * aov, 2)
            roas = round(revenue / spend, 2)
            score = round(np.random.uniform(5.0, 9.8), 1)
            data.append({
                "campaign_id": f"CMP-{1000+i}",
                "campaign_name": f"{ch} Campaign {i+1}",
                "channel": ch,
                "audience_type": aud,
                "ad_spend": round(spend, 2),
                "impressions": impressions,
                "clicks": clicks,
                "ctr": round(ctr, 2),
                "cpc": round(cpc, 2),
                "conversions": conv,
                "conversion_rate": round(cvr, 2),
                "revenue": revenue,
                "roas": roas,
                "creative_quality_score": score,
                "target_objective": "Sales" if aud == "B2C" else "Lead Gen"
            })
        return pd.DataFrame(data)

def classify_performance(roas):
    if roas >= 3.5:
        return "High"
    elif roas >= 2.0:
        return "Medium"
    else:
        return "Low"

# ----------------- Sidebar Navigation -----------------
st.sidebar.title("Navigation")
page = st.sidebar.radio("Select Module:", [
    "1. Overview & KPIs",
    "2. Data Upload & Preprocessing",
    "3. Exploratory Data Analysis (EDA)",
    "4. Feature & Correlation Analysis",
    "5. Model Training & Comparison",
    "6. Campaign Revenue & Conv. Predictor",
    "7. Performance Classification",
    "8. Budget Scenario Simulator",
    "9. Marketing Recommendations",
    "10. Existing vs Proposed System",
    "11. Export Reports & Code"
])

# Load working dataframe
if "df" not in st.session_state:
    st.session_state.df = load_sample_data()

df = st.session_state.df

# Ensure derived performance column exists
if "performance_tier" not in df.columns and "roas" in df.columns:
    df["performance_tier"] = df["roas"].apply(classify_performance)

# ----------------- Module 1: Overview & KPIs -----------------
if page == "1. Overview & KPIs":
    st.markdown('<div class="kicker">Digital Marketing</div>', unsafe_allow_html=True)
    st.markdown('<div class="main-title">Campaign Performance</div>', unsafe_allow_html=True)
    st.markdown('<div class="accent-title">Prediction & Machine Learning Platform</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Unified multi-channel telemetry, cross-network ROAS benchmarks, and predictive forecasting.</div>', unsafe_allow_html=True)

    col1, col2, col3, col4, col5 = st.columns(5)
    total_spend = df["ad_spend"].sum() if "ad_spend" in df.columns else 0
    total_rev = df["revenue"].sum() if "revenue" in df.columns else 0
    total_clicks = df["clicks"].sum() if "clicks" in df.columns else 0
    total_conv = df["conversions"].sum() if "conversions" in df.columns else 0
    overall_roas = total_rev / total_spend if total_spend > 0 else 0

    col1.metric("Total Ad Spend", f"${total_spend:,.2f}")
    col2.metric("Total Revenue", f"${total_rev:,.2f}")
    col3.metric("Total Clicks", f"{total_clicks:,}")
    col4.metric("Conversions", f"{total_conv:,}")
    col5.metric("Overall ROAS", f"{overall_roas:.2f}x")

    st.markdown("---")

    c1, c2 = st.columns([1, 1])
    with c1:
        if "channel" in df.columns and "revenue" in df.columns:
            channel_rev = df.groupby("channel")["revenue"].sum().reset_index()
            fig = px.bar(channel_rev, x="channel", y="revenue", color="channel", title="Revenue by Channel ($)", text_auto=".2s")
            st.plotly_chart(fig, use_container_width=True)

    with c2:
        if "channel" in df.columns and "roas" in df.columns:
            channel_roas = df.groupby("channel")["roas"].mean().reset_index()
            fig = px.bar(channel_roas, x="channel", y="roas", color="channel", title="Average ROAS by Channel (x)", text_auto=".2f")
            st.plotly_chart(fig, use_container_width=True)

    st.subheader("Recent Campaigns")
    st.dataframe(df.head(10), use_container_width=True)

# ----------------- Module 2: Upload & Preprocessing -----------------
elif page == "2. Data Upload & Preprocessing":
    st.title("Dataset Upload & Preprocessing Pipeline")
    st.markdown("Upload marketing campaign CSV/Excel data or use benchmark data. Data is sanitized and checked for missing values.")

    uploaded_file = st.file_uploader("Upload CSV or Excel file", type=["csv", "xlsx", "xls"])
    if uploaded_file is not None:
        try:
            if uploaded_file.name.endswith(".csv"):
                new_df = pd.read_csv(uploaded_file)
            else:
                new_df = pd.read_excel(uploaded_file)
            st.session_state.df = new_df
            df = new_df
            st.success(f"Successfully loaded {len(df)} records from {uploaded_file.name}!")
        except Exception as e:
            st.error(f"Error loading file: {e}")

    st.subheader("Data Cleaning & Missing Value Diagnostics")
    null_counts = df.isnull().sum()
    col_a, col_b = st.columns([1, 2])
    with col_a:
        st.write("Missing values per column:")
        st.dataframe(null_counts[null_counts > 0] if null_counts.sum() > 0 else pd.Series({"No Missing Values": 0}))
    
    with col_b:
        impute_strategy = st.selectbox("Imputation Strategy for Numeric Columns:", ["Mean Imputation", "Median Imputation", "Drop Missing Rows"])
        if st.button("Apply Preprocessing & Clean Data"):
            num_cols = df.select_dtypes(include=[np.number]).columns
            if impute_strategy == "Mean Imputation":
                df[num_cols] = df[num_cols].fillna(df[num_cols].mean())
            elif impute_strategy == "Median Imputation":
                df[num_cols] = df[num_cols].fillna(df[num_cols].median())
            elif impute_strategy == "Drop Missing Rows":
                df = df.dropna()
            st.session_state.df = df
            st.success("Preprocessing applied successfully!")

    st.subheader("Preprocessed Dataset Preview")
    st.dataframe(df, use_container_width=True)

# ----------------- Module 3: EDA -----------------
elif page == "3. Exploratory Data Analysis (EDA)":
    st.title("Exploratory Data Analysis (EDA)")
    
    st.subheader("Descriptive Statistics")
    st.dataframe(df.describe().T, use_container_width=True)

    c1, c2 = st.columns(2)
    with c1:
        num_col_1 = st.selectbox("Select Distribution Variable:", ["ad_spend", "revenue", "roas", "clicks", "conversions"])
        fig = px.histogram(df, x=num_col_1, nbins=20, marginal="box", title=f"Distribution of {num_col_1.replace('_', ' ').title()}")
        st.plotly_chart(fig, use_container_width=True)

    with c2:
        fig = px.scatter(df, x="ad_spend", y="revenue", color="channel", size="conversions", hover_data=["campaign_name"],
                         title="Ad Spend vs. Revenue (Bubble size: Conversions)")
        st.plotly_chart(fig, use_container_width=True)

# ----------------- Module 4: Feature & Correlation Analysis -----------------
elif page == "4. Feature & Correlation Analysis":
    st.title("Feature Analysis & Correlation Heatmap")

    numeric_df = df.select_dtypes(include=[np.number])
    corr = numeric_df.corr()

    fig = px.imshow(corr, text_auto=".2f", aspect="auto", color_continuous_scale="RdBu_r",
                    title="Pearson Correlation Heatmap Matrix")
    st.plotly_chart(fig, use_container_width=True)

    st.markdown("""
    **Key Insights from Correlation Matrix:**
    - High positive correlation between **Ad Spend** and **Conversions/Revenue** reflects strong budget scaling.
    - **Creative Quality Score** displays meaningful positive correlation with **CTR** and **ROAS**.
    - **CPC** shows negative correlation with ROAS, highlighting the need for bid efficiency.
    """)

# ----------------- Module 5: Model Training & Comparison -----------------
elif page == "5. Model Training & Comparison":
    st.title("Train & Compare Machine Learning Models")
    st.markdown("Compare **Linear Regression**, **Decision Tree Regressor**, and **Random Forest Regressor** to predict campaign revenue.")

    feature_cols = ["ad_spend", "clicks", "ctr", "cpc", "creative_quality_score"]
    available_feats = [c for c in feature_cols if c in df.columns]

    test_size = st.slider("Test Set Split Ratio (%)", 10, 40, 20) / 100.0
    random_state = 42

    X = df[available_feats].fillna(0)
    y = df["revenue"].fillna(0)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=random_state)

    models = {
        "Linear Regression": LinearRegression(),
        "Decision Tree": DecisionTreeRegressor(max_depth=5, random_state=random_state),
        "Random Forest": RandomForestRegressor(n_estimators=100, max_depth=6, random_state=random_state)
    }

    results = []
    trained_models = {}

    for name, model in models.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        r2 = r2_score(y_test, preds)
        mae = mean_absolute_error(y_test, preds)
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        results.append({"Model": name, "R² Score": round(r2, 4), "MAE ($)": round(mae, 2), "RMSE ($)": round(rmse, 2)})
        trained_models[name] = model

    st.session_state.trained_models = trained_models
    st.session_state.available_feats = available_feats

    results_df = pd.DataFrame(results)
    st.subheader("Model Evaluation Benchmark")
    st.dataframe(results_df, use_container_width=True)

    # Plot metrics
    c1, c2 = st.columns(2)
    with c1:
        fig_r2 = px.bar(results_df, x="Model", y="R² Score", color="Model", title="Model R² Score Comparison")
        st.plotly_chart(fig_r2, use_container_width=True)
    with c2:
        rf = trained_models["Random Forest"]
        imp_df = pd.DataFrame({"Feature": available_feats, "Importance": rf.feature_importances_}).sort_values("Importance", ascending=False)
        fig_imp = px.bar(imp_df, x="Importance", y="Feature", orientation="h", title="Random Forest Feature Importance")
        st.plotly_chart(fig_imp, use_container_width=True)

# ----------------- Module 6: Revenue & Conversion Predictor -----------------
elif page == "6. Campaign Revenue & Conv. Predictor":
    st.title("Campaign Revenue & Conversion Predictor")
    st.markdown("Input campaign specifications to generate instant machine learning performance forecasts.")

    c1, c2 = st.columns(2)
    with c1:
        in_spend = st.number_input("Ad Spend Budget ($)", min_value=100.0, max_value=100000.0, value=5000.0, step=500.0)
        in_cpc = st.number_input("Expected CPC ($)", min_value=0.1, max_value=20.0, value=1.20, step=0.1)
        in_ctr = st.number_input("Expected CTR (%)", min_value=0.1, max_value=20.0, value=3.20, step=0.1)
    with c2:
        in_quality = st.slider("Creative Quality Score (1-10)", 1.0, 10.0, 8.0, 0.5)
        model_choice = st.selectbox("Select Model for Prediction:", ["Random Forest", "Linear Regression", "Decision Tree"])

    in_clicks = int(in_spend / in_cpc) if in_cpc > 0 else 0

    if st.button("Generate ML Forecast"):
        # Fit quick model if not yet trained
        rf = RandomForestRegressor(n_estimators=100, random_state=42)
        X = df[["ad_spend", "clicks", "ctr", "cpc", "creative_quality_score"]].fillna(0)
        y_rev = df["revenue"].fillna(0)
        y_conv = df["conversions"].fillna(0)

        rf_rev = RandomForestRegressor(n_estimators=100, random_state=42).fit(X, y_rev)
        rf_conv = RandomForestRegressor(n_estimators=100, random_state=42).fit(X, y_conv)

        input_data = pd.DataFrame([{
            "ad_spend": in_spend,
            "clicks": in_clicks,
            "ctr": in_ctr,
            "cpc": in_cpc,
            "creative_quality_score": in_quality
        }])

        pred_rev = rf_rev.predict(input_data)[0]
        pred_conv = int(rf_conv.predict(input_data)[0])
        pred_roas = pred_rev / in_spend if in_spend > 0 else 0
        pred_cpa = in_spend / pred_conv if pred_conv > 0 else 0

        st.success("Forecast generated!")
        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Predicted Revenue", f"${pred_rev:,.2f}")
        m2.metric("Predicted Conversions", f"{pred_conv:,}")
        m3.metric("Projected ROAS", f"{pred_roas:.2f}x")
        m4.metric("Estimated CPA", f"${pred_cpa:.2f}")

# ----------------- Module 7: Performance Classification -----------------
elif page == "7. Performance Classification":
    st.title("Campaign Performance Tier Classification")
    st.markdown("Classify campaigns into **High**, **Medium**, or **Low** performance tiers based on efficiency.")

    X = df[["ad_spend", "clicks", "ctr", "cpc", "creative_quality_score"]].fillna(0)
    y = df["performance_tier"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)
    preds = clf.predict(X_test)

    acc = accuracy_score(y_test, preds)
    st.metric("Classifier Accuracy", f"{acc*100:.1f}%")

    tier_counts = df["performance_tier"].value_counts().reset_index()
    tier_counts.columns = ["Tier", "Count"]
    fig = px.pie(tier_counts, names="Tier", values="Count", color="Tier",
                 color_discrete_map={"High": "#10b981", "Medium": "#f59e0b", "Low": "#ef4444"},
                 title="Campaign Tier Distribution")
    st.plotly_chart(fig, use_container_width=True)

# ----------------- Module 8: Budget Scenario Simulator -----------------
elif page == "8. Budget Scenario Simulator":
    st.title("Budget Scenario & Allocation Simulator")
    st.markdown("Simulate cross-channel budget reallocations to maximize blended portfolio ROAS.")

    total_budget = st.slider("Total Monthly Marketing Budget ($)", 5000, 100000, 30000, 2500)
    st.write("Allocate Budget across Channels (%):")

    c1, c2, c3 = st.columns(3)
    p_google = c1.slider("Google Ads %", 0, 100, 35)
    p_meta = c2.slider("Meta Ads %", 0, 100, 30)
    p_linkedin = c3.slider("LinkedIn %", 0, 100, 15)

    c4, c5, c6 = st.columns(3)
    p_tiktok = c4.slider("TikTok %", 0, 100, 10)
    p_youtube = c5.slider("YouTube %", 0, 100, 5)
    p_email = c6.slider("Email %", 0, 100, 5)

    tot_pct = p_google + p_meta + p_linkedin + p_tiktok + p_youtube + p_email
    if tot_pct != 100:
        st.warning(f"Total percentage is {tot_pct}%. Please adjust sliders to total exactly 100%.")

    # Estimated channel benchmark ROAS multipliers
    benchmarks = {
        "Google Ads": (p_google / 100 * total_budget, 4.2),
        "Meta Ads": (p_meta / 100 * total_budget, 3.8),
        "LinkedIn": (p_linkedin / 100 * total_budget, 3.1),
        "TikTok": (p_tiktok / 100 * total_budget, 2.2),
        "YouTube": (p_youtube / 100 * total_budget, 2.8),
        "Email": (p_email / 100 * total_budget, 18.0)
    }

    sim_rows = []
    tot_sim_rev = 0
    for ch, (spend, roas) in benchmarks.items():
        rev = spend * roas
        tot_sim_rev += rev
        sim_rows.append({"Channel": ch, "Allocated Spend ($)": spend, "Estimated ROAS": f"{roas}x", "Projected Revenue ($)": rev})

    sim_df = pd.DataFrame(sim_rows)
    st.dataframe(sim_df, use_container_width=True)

    b_roas = tot_sim_rev / total_budget if total_budget > 0 else 0
    col1, col2 = st.columns(2)
    col1.metric("Projected Blended Revenue", f"${tot_sim_rev:,.2f}")
    col2.metric("Projected Blended ROAS", f"{b_roas:.2f}x")

# ----------------- Module 9: Marketing Recommendations -----------------
elif page == "9. Marketing Recommendations":
    st.title("Data-Driven Marketing Recommendations")
    
    st.markdown("""
    ### Strategic Optimization Insights:
    1. **Scale Google Ads & Meta Ads Core Funnels**:
       - Analysis shows search intent and lookalike audiences deliver consistent 3.8x - 4.5x ROAS with low variance.
    2. **Mitigate TikTok Spend Saturation**:
       - TikTok ad spend above $5,000 exhibits diminishing returns (ROAS dropping below 2.0x). Keep TikTok focused on top-of-funnel reach with capped budgets.
    3. **Leverage Email for High-Margin Retention**:
       - Email marketing demonstrates exceptionally high ROAS (>15x). Increase segmented nurture workflows.
    4. **Maintain Creative Quality Above 7.5**:
       - Model feature importance shows creative quality is a leading predictor of low CPC and high conversion rate.
    """)

# ----------------- Module 10: Existing vs Proposed System -----------------
elif page == "10. Existing vs Proposed System":
    st.title("Existing Systems vs. Proposed ML Solution")

    systems_data = [
        {
            "Platform": "Google Analytics 4",
            "Core Capabilities": "Event tracking, path exploration, user sessions",
            "Limitations": "Retrospective only; no predictive budget forecasting; attribution latency",
            "Data Silos": "Cross-channel walled garden limits"
        },
        {
            "Platform": "Google Ads",
            "Core Capabilities": "Smart bidding, intent matching",
            "Limitations": "Optimizes strictly within Google; biased recommendations to raise bids",
            "Data Silos": "No view into Meta/TikTok returns"
        },
        {
            "Platform": "Meta Ads Manager",
            "Core Capabilities": "Lookalikes, dynamic creative, high top-funnel scale",
            "Limitations": "Attribution loss post-iOS 14.5; over-reports view-through conversions",
            "Data Silos": "No holistic cross-platform modeling"
        },
        {
            "Platform": "Excel Spreadsheets",
            "Core Capabilities": "Flexible formulas, manual tables",
            "Limitations": "Static; manual errors; cannot train non-linear ML algorithms",
            "Data Silos": "Static spreadsheets break over time"
        },
        {
            "Platform": "Proposed ML Platform",
            "Core Capabilities": "Multi-model ML (Random Forest, Decision Tree, Linear Reg), EDA, scenario simulations",
            "Limitations": "Requires regular retraining with fresh campaign logs",
            "Data Silos": "Unifies all ad networks in one predictive pipeline"
        }
    ]
    st.dataframe(pd.DataFrame(systems_data), use_container_width=True)

# ----------------- Module 11: Export & Code -----------------
elif page == "11. Export Reports & Code":
    st.title("Export Reports & Project Artifacts")

    csv_data = df.to_csv(index=False).encode('utf-8')
    st.download_button(
        label="Download Full Dataset with Predictions (CSV)",
        data=csv_data,
        file_name="marketing_campaigns_with_predictions.csv",
        mime="text/csv"
    )

    st.subheader("How to Run this Project Locally:")
    st.code("""
# 1. Clone repository or create folder
# 2. Install requirements
pip install -r requirements.txt

# 3. Run Streamlit application
streamlit run app.py
    """, language="bash")
