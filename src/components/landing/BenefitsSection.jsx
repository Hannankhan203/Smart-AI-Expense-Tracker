import React from 'react';
import {
  CheckCircle2,
  Target,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Compass,
} from 'lucide-react';
import Badge from '../common/Badge';

export default function BenefitsSection() {
  const benefits = [
    {
      title: 'Complete Financial Visibility',
      desc: 'No more guessing where your paycheck disappeared. See every dollar grouped by clear categories.',
      icon: Compass,
    },
    {
      title: 'Proactive Overspending Alerts',
      desc: 'Set custom thresholds for dining out or shopping, and receive immediate alerts before you break budget limits.',
      icon: ShieldAlert,
    },
    {
      title: 'Accelerated Savings Goals',
      desc: 'Track monthly surplus growth and allocate surplus cash towards emergency funds or investments.',
      icon: Target,
    },
    {
      title: 'Stress-Free Money Management',
      desc: 'Streamlined input forms, clean dashboards, and responsive mobile layouts make daily logging effortless.',
      icon: Sparkles,
    },
  ];

  return (
    <section id="benefits" className="py-16 sm:py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Text Content */}
          <div className="space-y-6">
            <Badge variant="indigo" size="md">
              Why SmartExpense
            </Badge>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              Transform Financial Uncertainty into Actionable Confidence
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Traditional spreadsheets are clumsy and outdated. SmartExpense brings modern fintech clarity to your personal finances with automated insights, intuitive budgeting tools, and structured tracking.
            </p>

            <div className="space-y-4 pt-2">
              {benefits.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Visual Box */}
          <div className="relative">
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Average User Financial Impact
                  </p>
                  <h3 className="text-2xl font-bold text-white mt-1">+28% Savings Rate</h3>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="py-6 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Housing & Bills (Target: 40%)</span>
                    <span className="text-emerald-400">34.2% (Healthy)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[34.2%] h-full bg-emerald-500 rounded-full" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Food & Dining (Target: 20%)</span>
                    <span className="text-amber-400">18.5% (On Track)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[18.5%] h-full bg-amber-500 rounded-full" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Monthly Savings & Investing</span>
                    <span className="text-emerald-400">28.4% (Exceeded)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[28.4%] h-full bg-emerald-400 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Real-time budget calculation
                </span>
                <span className="text-emerald-400 font-semibold">Live Preview</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
