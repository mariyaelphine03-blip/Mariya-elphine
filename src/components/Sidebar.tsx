import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  BarChart3,
  GitBranch,
  Cpu,
  Target,
  Award,
  Sliders,
  Lightbulb,
  FileCode2,
  GitCompare,
  FileSpreadsheet
} from 'lucide-react';
import { useAppTheme } from '../context/ThemeContext';

export type NavModule =
  | 'overview'
  | 'upload'
  | 'eda'
  | 'correlation'
  | 'training'
  | 'predictor'
  | 'classification'
  | 'scenario'
  | 'recommendations'
  | 'comparison-systems'
  | 'export-code';

interface SidebarProps {
  currentModule: NavModule;
  onSelectModule: (module: NavModule) => void;
  campaignCount: number;
  hasRunAnalysis?: boolean;
  onOpenUploadModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  campaignCount,
  hasRunAnalysis = false,
  onOpenUploadModal,
}) => {
  const { styles, isDark } = useAppTheme();

  const navItems = [
    {
      group: 'Core Analytics',
      items: [
        {
          id: 'overview' as NavModule,
          label: 'KPIs & Dashboard',
          icon: LayoutDashboard,
          badge: `${campaignCount} runs`
        },
        {
          id: 'upload' as NavModule,
          label: 'Data Pipeline & Preprocess',
          icon: UploadCloud,
          badge: 'CSV/Excel'
        },
        {
          id: 'eda' as NavModule,
          label: 'Exploratory Analysis (EDA)',
          icon: BarChart3,
          badge: 'Distributions'
        },
        {
          id: 'correlation' as NavModule,
          label: 'Feature & Heatmap Analysis',
          icon: GitBranch,
          badge: 'Pearson Matrix'
        },
      ]
    },
    {
      group: 'Machine Learning',
      items: [
        {
          id: 'training' as NavModule,
          label: 'Model Training & Compare',
          icon: Cpu,
          badge: '3 Algorithms'
        },
        {
          id: 'predictor' as NavModule,
          label: 'Revenue & Conv. Predictor',
          icon: Target,
          badge: 'Inference'
        },
        {
          id: 'classification' as NavModule,
          label: 'Campaign Success Classifier',
          icon: Award,
          badge: 'Success/Fail'
        },
        {
          id: 'scenario' as NavModule,
          label: 'Budget Scenario Simulator',
          icon: Sliders,
          badge: 'What-If'
        },
      ]
    },
    {
      group: 'Strategy & Integration',
      items: [
        {
          id: 'recommendations' as NavModule,
          label: 'Marketing Recommendations',
          icon: Lightbulb,
          badge: 'Data-driven'
        },
        {
          id: 'comparison-systems' as NavModule,
          label: 'Existing vs Proposed System',
          icon: GitCompare,
          badge: 'GA4 / Meta / Ads'
        },
        {
          id: 'export-code' as NavModule,
          label: 'Python Code & Exports',
          icon: FileCode2,
          badge: 'Streamlit & CSV'
        },
      ]
    }
  ];

  return (
    <aside className={`w-64 shrink-0 border-r ${styles.sidebarBorder} ${styles.sidebarBg} flex flex-col justify-between h-[calc(100vh-73px)] overflow-y-auto transition-colors`}>
      <div className="p-4 space-y-5">
        {/* Distinct 3-line Branding Header in Sidebar */}
        <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
          <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
            Digital Marketing
          </div>
          <div className={`text-xs font-extrabold ${styles.textMain} leading-tight mt-0.5`}>
            Campaign Performance
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-[11px] font-black uppercase tracking-wider ${styles.accentText}`}>
              Prediction
            </span>
            <span className="text-[9px] px-1 py-0.2 rounded font-mono bg-cyan-950/70 text-cyan-300 border border-cyan-800/60">
              ML Engine
            </span>
          </div>
        </div>

        {navItems.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <h2 className={`px-3 text-[11px] font-semibold uppercase tracking-wider ${styles.textMuted}`}>
              {group.group}
            </h2>
            <div className="space-y-0.5 mt-2">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = currentModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectModule(item.id)}
                    className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? isDark ? 'bg-slate-800 text-white shadow-xs' : 'bg-slate-900 text-white'
                        : isDark
                        ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 ${
                          isActive
                            ? styles.accentText
                            : isDark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {!hasRunAnalysis && ['eda', 'correlation', 'training', 'predictor', 'classification', 'scenario', 'recommendations'].includes(item.id) ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/30">
                          Pending
                        </span>
                      ) : (
                        item.badge && (
                          <span
                            className={`text-[10px] ${
                              isActive
                                ? 'text-slate-300'
                                : 'text-slate-500'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info Box & Quick Upload Action */}
      <div className={`p-4 border-t ${styles.sidebarBorder} ${isDark ? 'bg-slate-950/60' : 'bg-slate-50'} space-y-3`}>
        {onOpenUploadModal && (
          <button
            onClick={onOpenUploadModal}
            className={`w-full flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors shadow-2xs ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
            }`}
          >
            <UploadCloud className="h-4 w-4" style={{ color: styles.dotColor }} />
            <span>Upload CSV File</span>
          </button>
        )}

        <div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
            <span className={styles.textMain}>ML Pipeline Status</span>
          </div>
          <p className={`text-[11px] ${styles.textMuted} mt-1 leading-relaxed`}>
            Trained with 0% data leakage on 80/20 train-test split. Full offline execution.
          </p>
        </div>
      </div>
    </aside>
  );
};
