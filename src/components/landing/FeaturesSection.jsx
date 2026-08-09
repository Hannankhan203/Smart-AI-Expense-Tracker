import React from 'react';
import {
  TrendingDown,
  TrendingUp,
  PieChart,
  BarChart3,
  Database,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function FeaturesSection() {
  const features = [
    {
      icon: TrendingDown,
      title: 'Expense Tracking',
      description:
        'Log expenses instantly with custom tags, merchant notes, and exact date tracking for transparent spending habits.',
      badge: 'Core Feature',
      variant: 'rose',
    },
    {
      icon: TrendingUp,
      title: 'Income Management',
      description:
        'Record diverse earning streams from salary to side hustles and track gross vs net income growth month over month.',
      badge: 'Revenue Stream',
      variant: 'teal',
    },
    {
      icon: PieChart,
      title: 'Budget Management',
      description:
        'Establish category spending caps, monitor progress bars in real-time, and prevent budget overruns effortlessly.',
      badge: 'Smart Caps',
      variant: 'amber',
    },
    {
      icon: BarChart3,
      title: 'Financial Analytics',
      description:
        'Visualize cash flow velocity, expense proportions, and monthly savings trends with interactive data visualizers.',
      badge: 'Deep Insights',
      variant: 'indigo',
    },
    {
      icon: Database,
      title: 'Secure Firebase Storage',
      description:
        'Enjoy cloud persistence powered by Google Cloud Firestore with row-level security and strict data isolation.',
      badge: 'Cloud Sync',
      variant: 'success',
    },
    {
      icon: Zap,
      title: 'Real-Time Data Engine',
      description:
        'Experience zero-latency balance recalculations and instantaneous ledger updates across all device sessions.',
      badge: 'Instantaneous',
      variant: 'info',
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="success" size="md">
            Built for Financial Intelligence
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Comprehensive Suite for Modern Wealth Control
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Everything you need to eliminate money anxiety, build sustainable savings, and plan your financial future.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item) => {
            const IconComponent = item.icon;
            return (
              <Card
                key={item.title}
                hoverable
                className="h-full flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <Badge variant={item.variant} size="sm">
                      {item.badge}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Fully Integrated</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
