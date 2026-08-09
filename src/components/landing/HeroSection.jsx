import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  Sparkles,
  PieChart,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import Badge from '../common/Badge';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 lg:pt-20 pb-16 lg:pb-28">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Badge Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Next-Gen Smart Financial Engine</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-600/80 dark:text-emerald-400/80">v1.0 Ready</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Smart Financial Clarity for Modern Personal Wealth
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
            Effortlessly monitor daily expenses, track income streams, enforce custom budgets, and unlock deep financial analytics with continuous Firebase cloud persistence.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm rounded-xl border border-slate-800 dark:border-slate-700 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Explore Live Dashboard</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Firebase Security Standard
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-500" /> Instant Cloud Sync
            </span>
          </div>
        </div>

        {/* Dashboard Visual Preview Mockup */}
        <div className="mt-12 sm:mt-16 relative max-w-5xl mx-auto">
          {/* Decorative Glow */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur-xl opacity-20 dark:opacity-30" />

          <div className="relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-4 sm:p-6 lg:p-8">
            {/* Window bar control */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 ml-2">
                  SmartExpense Dashboard Overview
                </span>
              </div>
              <Badge variant="success" size="sm" dot>
                Live Engine Demo
              </Badge>
            </div>

            {/* Dashboard Mock Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Net Worth</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">$24,850.40</span>
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" /> +14.2%
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly Expenses</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">$3,120.80</span>
                  <span className="text-xs font-bold text-rose-500 flex items-center gap-0.5">
                    <TrendingDown className="w-3.5 h-3.5" /> -4.8%
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Budget Health</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">82% On Track</span>
                  <span className="text-xs font-bold text-teal-500 flex items-center gap-0.5">
                    <PieChart className="w-3.5 h-3.5" /> Optimal
                  </span>
                </div>
              </div>
            </div>

            {/* Mock Chart & Ledger Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between h-44">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Cash Flow Trend (6 Months)</span>
                  <span className="text-emerald-500">Income vs Expenses</span>
                </div>
                {/* Visual SVG Chart wave */}
                <div className="w-full h-24 pt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 80 Q 60 20, 120 50 T 240 30 T 360 10 L 400 25 L 400 100 L 0 100 Z"
                      fill="url(#chartGrad)"
                    />
                    <path
                      d="M0 80 Q 60 20, 120 50 T 240 30 T 360 10 L 400 25"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3"
                    />
                  </svg>
                </div>
              </div>

              {/* Mini Ledger */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 space-y-3 text-xs">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Recent Activity</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 shadow-2xs">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Grocery Supermarket</p>
                      <p className="text-[10px] text-slate-400">Food & Dining</p>
                    </div>
                    <span className="font-bold text-rose-500">-$84.20</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 shadow-2xs">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Monthly Salary</p>
                      <p className="text-[10px] text-slate-400">Primary Income</p>
                    </div>
                    <span className="font-bold text-emerald-500">+$4,500.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
