import React, { useState, useEffect, useMemo } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Skeleton from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { useAppContext } from '../../context/AppContext';
import { subscribeToExpenses } from '../../services/expenseService';
import { subscribeToIncome } from '../../services/incomeService';
import { subscribeToBudgets, MONTH_NAMES } from '../../services/budgetService';
import { subscribeToCategories } from '../../services/categoryService';

// Chart.js imports & registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  Calendar,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  RotateCcw,
  Layers,
  Sparkles,
  Download,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// Register Chart.js Modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Vibrant Color Palette for Charts
const COLOR_PALETTE = [
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#6366f1', // Indigo
  '#ef4444', // Red
  '#84cc16', // Lime
];

export default function ReportsOverview() {
  const { user } = useAuth();
  const { theme } = useAppContext();
  const isDark = theme === 'dark';

  // Firestore Data State
  const [expenses, setExpenses] = useState([]);
  const [incomeList, setIncomeList] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Time & Filter State
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' or 1..12
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Subscriptions
  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);

    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount >= 3) setLoading(false);
    };

    const unsubExpenses = subscribeToExpenses(
      user.uid,
      (data) => {
        setExpenses(data || []);
        checkLoaded();
      },
      (err) => {
        console.error('Error loading expenses for reports:', err);
        checkLoaded();
      }
    );

    const unsubIncome = subscribeToIncome(
      user.uid,
      (data) => {
        setIncomeList(data || []);
        checkLoaded();
      },
      (err) => {
        console.error('Error loading income for reports:', err);
        checkLoaded();
      }
    );

    const unsubBudgets = subscribeToBudgets(
      user.uid,
      (data) => {
        setBudgets(data || []);
        checkLoaded();
      },
      (err) => {
        console.error('Error loading budgets for reports:', err);
        checkLoaded();
      }
    );

    const unsubCategories = subscribeToCategories(
      user.uid,
      (data) => {
        setCategories(data || []);
      },
      (err) => console.error('Error loading categories:', err)
    );

    return () => {
      unsubExpenses();
      unsubIncome();
      unsubBudgets();
      unsubCategories();
    };
  }, [user]);

  // Chart Theme Options Generator
  const getChartOptions = (titleStr = '') => {
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
    const tooltipBg = isDark ? '#0f172a' : '#ffffff';
    const tooltipText = isDark ? '#f8fafc' : '#0f172a';
    const tooltipBorder = isDark ? '#334155' : '#e2e8f0';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: textColor,
            font: { family: 'inherit', size: 11, weight: '600' },
            usePointStyle: true,
            boxWidth: 8,
          },
        },
        title: {
          display: !!titleStr,
          text: titleStr,
          color: textColor,
          font: { family: 'inherit', size: 13, weight: '700' },
        },
        tooltip: {
          backgroundColor: tooltipBg,
          titleColor: tooltipText,
          bodyColor: tooltipText,
          borderColor: tooltipBorder,
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          titleFont: { weight: 'bold', size: 12 },
          bodyFont: { size: 12 },
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || context.label || '';
              if (label) label += ': ';
              if (context.parsed.y !== undefined) {
                label += '$' + context.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2 });
              } else if (context.parsed !== undefined) {
                label += '$' + context.parsed.toLocaleString(undefined, { minimumFractionDigits: 2 });
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: textColor, font: { size: 11 } },
          grid: { color: gridColor },
        },
        y: {
          ticks: {
            color: textColor,
            font: { size: 11 },
            callback: (val) => `$${val}`,
          },
          grid: { color: gridColor },
        },
      },
    };
  };

  // Filter Helpers
  const isDateInSelectedPeriod = (dateStr) => {
    if (!dateStr) return false;
    const parts = dateStr.split('-');
    if (parts.length < 2) return false;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);

    if (y !== selectedYear) return false;
    if (selectedMonth !== 'all' && m !== parseInt(selectedMonth, 10)) return false;
    return true;
  };

  // Filtered Raw Datasets
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (!isDateInSelectedPeriod(e.expenseDate)) return false;
      if (selectedCategory !== 'all') {
        const catName = e.categoryName || e.categoryId;
        if (catName !== selectedCategory) return false;
      }
      return true;
    });
  }, [expenses, selectedYear, selectedMonth, selectedCategory]);

  const filteredIncome = useMemo(() => {
    return incomeList.filter((i) => isDateInSelectedPeriod(i.date));
  }, [incomeList, selectedYear, selectedMonth]);

  // Overall Financial Highlights
  const highlights = useMemo(() => {
    const totalInc = filteredIncome.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const totalExp = filteredExpenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const netSavings = totalInc - totalExp;
    const savingsRate = totalInc > 0 ? (netSavings / totalInc) * 100 : 0;

    // Daily Average (if month selected, divide by days in month; if all, divide by 365 or days passed)
    let daysCount = 30;
    if (selectedMonth !== 'all') {
      const m = parseInt(selectedMonth, 10);
      daysCount = new Date(selectedYear, m, 0).getDate();
    } else {
      daysCount = 365;
    }
    const avgDailySpend = totalExp / (daysCount || 1);

    return {
      totalInc,
      totalExp,
      netSavings,
      savingsRate,
      avgDailySpend,
      countExp: filteredExpenses.length,
      countInc: filteredIncome.length,
    };
  }, [filteredIncome, filteredExpenses, selectedMonth, selectedYear]);

  // 1. Monthly Income vs Expenses (12-Month Bar Chart)
  const monthlyComparisonData = useMemo(() => {
    const months = MONTH_NAMES.map((m) => m.slice(0, 3));
    const incomeByMonth = new Array(12).fill(0);
    const expensesByMonth = new Array(12).fill(0);

    incomeList.forEach((inc) => {
      if (inc.date) {
        const parts = inc.date.split('-');
        if (parts.length >= 2 && parseInt(parts[0], 10) === selectedYear) {
          const mIdx = parseInt(parts[1], 10) - 1;
          if (mIdx >= 0 && mIdx < 12) {
            incomeByMonth[mIdx] += parseFloat(inc.amount) || 0;
          }
        }
      }
    });

    expenses.forEach((exp) => {
      if (exp.expenseDate) {
        const parts = exp.expenseDate.split('-');
        if (parts.length >= 2 && parseInt(parts[0], 10) === selectedYear) {
          const mIdx = parseInt(parts[1], 10) - 1;
          if (mIdx >= 0 && mIdx < 12) {
            expensesByMonth[mIdx] += parseFloat(exp.amount) || 0;
          }
        }
      }
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Monthly Income',
          data: incomeByMonth,
          backgroundColor: '#10b981', // Emerald
          borderRadius: 6,
        },
        {
          label: 'Monthly Expenses',
          data: expensesByMonth,
          backgroundColor: '#ef4444', // Red
          borderRadius: 6,
        },
      ],
    };
  }, [incomeList, expenses, selectedYear]);

  // 2. Savings Trend Overview (12-Month Net Cash Flow Line Chart)
  const savingsTrendData = useMemo(() => {
    const months = MONTH_NAMES.map((m) => m.slice(0, 3));
    const netSavingsByMonth = new Array(12).fill(0);

    const monthlyInc = monthlyComparisonData.datasets[0].data;
    const monthlyExp = monthlyComparisonData.datasets[1].data;

    for (let i = 0; i < 12; i++) {
      netSavingsByMonth[i] = monthlyInc[i] - monthlyExp[i];
    }

    return {
      labels: months,
      datasets: [
        {
          label: 'Net Cash Flow ($)',
          data: netSavingsByMonth,
          borderColor: '#3b82f6',
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#3b82f6',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [monthlyComparisonData, isDark]);

  // 3. Category-wise Spending Breakdown (Doughnut Chart)
  const categorySpendingData = useMemo(() => {
    const catMap = {};

    filteredExpenses.forEach((exp) => {
      const cat = exp.categoryName || exp.categoryId || 'Uncategorized';
      catMap[cat] = (catMap[cat] || 0) + (parseFloat(exp.amount) || 0);
    });

    const labels = Object.keys(catMap);
    const data = Object.values(catMap);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: COLOR_PALETTE.slice(0, labels.length),
          borderWidth: 2,
          borderColor: isDark ? '#0f172a' : '#ffffff',
          hoverOffset: 6,
        },
      ],
    };
  }, [filteredExpenses, isDark]);

  // 4. Income Source Distribution (Pie Chart)
  const incomeSourceData = useMemo(() => {
    const sourceMap = {};

    filteredIncome.forEach((inc) => {
      const src = inc.source || 'Other Income';
      sourceMap[src] = (sourceMap[src] || 0) + (parseFloat(inc.amount) || 0);
    });

    const labels = Object.keys(sourceMap);
    const data = Object.values(sourceMap);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899'].slice(0, labels.length),
          borderWidth: 2,
          borderColor: isDark ? '#0f172a' : '#ffffff',
          hoverOffset: 6,
        },
      ],
    };
  }, [filteredIncome, isDark]);

  // 5. Daily Spending Trend (Line Chart)
  const dailySpendingData = useMemo(() => {
    let daysInPeriod = 30;
    const m = selectedMonth === 'all' ? now.getMonth() + 1 : parseInt(selectedMonth, 10);
    daysInPeriod = new Date(selectedYear, m, 0).getDate();

    const labels = Array.from({ length: daysInPeriod }, (_, i) => `Day ${i + 1}`);
    const dailySpend = new Array(daysInPeriod).fill(0);

    filteredExpenses.forEach((exp) => {
      if (exp.expenseDate) {
        const parts = exp.expenseDate.split('-');
        if (parts.length >= 3) {
          const expM = parseInt(parts[1], 10);
          const day = parseInt(parts[2], 10);
          if (expM === m && day >= 1 && day <= daysInPeriod) {
            dailySpend[day - 1] += parseFloat(exp.amount) || 0;
          }
        }
      }
    });

    return {
      labels,
      datasets: [
        {
          label: 'Daily Spending ($)',
          data: dailySpend,
          borderColor: '#f59e0b',
          backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.25,
          pointBackgroundColor: '#f59e0b',
          pointRadius: 3,
        },
      ],
    };
  }, [filteredExpenses, selectedMonth, selectedYear, isDark, now]);

  // 6. Weekly Spending Distribution (Bar Chart)
  const weeklySpendingData = useMemo(() => {
    const weeklySpend = [0, 0, 0, 0, 0]; // Weeks 1 to 5

    filteredExpenses.forEach((exp) => {
      if (exp.expenseDate) {
        const parts = exp.expenseDate.split('-');
        if (parts.length >= 3) {
          const day = parseInt(parts[2], 10);
          const weekIdx = Math.min(4, Math.floor((day - 1) / 7));
          weeklySpend[weekIdx] += parseFloat(exp.amount) || 0;
        }
      }
    });

    return {
      labels: ['Week 1 (Days 1-7)', 'Week 2 (Days 8-14)', 'Week 3 (Days 15-21)', 'Week 4 (Days 22-28)', 'Week 5 (29+)'],
      datasets: [
        {
          label: 'Weekly Spending ($)',
          data: weeklySpend,
          backgroundColor: '#8b5cf6', // Purple
          borderRadius: 8,
        },
      ],
    };
  }, [filteredExpenses]);

  // 7. Budget Performance vs Actual Spending (Bar Chart)
  const budgetPerformanceData = useMemo(() => {
    const activeBudgets = budgets.filter((b) => {
      if (b.year !== selectedYear) return false;
      if (selectedMonth !== 'all' && b.month !== parseInt(selectedMonth, 10)) return false;
      return true;
    });

    const catBudgetMap = {};
    activeBudgets.forEach((b) => {
      const cat = b.categoryName || b.categoryId || 'Other';
      catBudgetMap[cat] = (catBudgetMap[cat] || 0) + (parseFloat(b.monthlyLimit) || 0);
    });

    const catActualMap = {};
    filteredExpenses.forEach((e) => {
      const cat = e.categoryName || e.categoryId || 'Other';
      catActualMap[cat] = (catActualMap[cat] || 0) + (parseFloat(e.amount) || 0);
    });

    // Merge keys
    const allCats = Array.from(new Set([...Object.keys(catBudgetMap), ...Object.keys(catActualMap)]));

    const budgetLimits = allCats.map((cat) => catBudgetMap[cat] || 0);
    const actualSpent = allCats.map((cat) => catActualMap[cat] || 0);

    return {
      labels: allCats,
      datasets: [
        {
          label: 'Budget Limit ($)',
          data: budgetLimits,
          backgroundColor: '#3b82f6', // Blue
          borderRadius: 6,
        },
        {
          label: 'Actual Spent ($)',
          data: actualSpent,
          backgroundColor: '#f43f5e', // Rose
          borderRadius: 6,
        },
      ],
    };
  }, [budgets, filteredExpenses, selectedYear, selectedMonth]);

  // 8. Multi-Year Comparative Summary
  const yearlySummaryData = useMemo(() => {
    const years = [2024, 2025, 2026, 2027];
    const yearInc = new Array(years.length).fill(0);
    const yearExp = new Array(years.length).fill(0);

    incomeList.forEach((inc) => {
      if (inc.date) {
        const y = parseInt(inc.date.split('-')[0], 10);
        const yIdx = years.indexOf(y);
        if (yIdx !== -1) yearInc[yIdx] += parseFloat(inc.amount) || 0;
      }
    });

    expenses.forEach((exp) => {
      if (exp.expenseDate) {
        const y = parseInt(exp.expenseDate.split('-')[0], 10);
        const yIdx = years.indexOf(y);
        if (yIdx !== -1) yearExp[yIdx] += parseFloat(exp.amount) || 0;
      }
    });

    return {
      labels: years.map((y) => `FY ${y}`),
      datasets: [
        {
          label: 'Total Income ($)',
          data: yearInc,
          backgroundColor: '#10b981',
          borderRadius: 6,
        },
        {
          label: 'Total Expenses ($)',
          data: yearExp,
          backgroundColor: '#ec4899',
          borderRadius: 6,
        },
      ],
    };
  }, [incomeList, expenses]);

  // Pie/Doughnut options with legend on side
  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { family: 'inherit', size: 11, weight: '600' },
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: getChartOptions().plugins.tooltip,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header Controls Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight">Interactive Financial Reports</h2>
            <Badge variant="emerald" size="sm" className="font-mono">
              Live Chart.js Integration
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics powered by your Firestore database entries. Select period filters below to update all visualizers.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Year Selector */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200">
            <span className="text-slate-400 mr-1 font-semibold">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-transparent font-mono font-bold focus:outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y} className="bg-slate-900 text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200">
            <span className="text-slate-400 mr-1 font-semibold">Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">
                All Months (Full Year)
              </option>
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx + 1} className="bg-slate-900 text-white">
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200">
            <span className="text-slate-400 mr-1 font-semibold">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent font-medium focus:outline-none cursor-pointer max-w-[130px] truncate"
            >
              <option value="all" className="bg-slate-900 text-white">
                All Categories
              </option>
              {categories.map((c) => (
                <option key={c.id || c.categoryId} value={c.name} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {(selectedMonth !== 'all' || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSelectedMonth('all');
                setSelectedCategory('all');
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs transition-colors"
              title="Reset Period Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Income</p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                +${highlights.totalInc.toFixed(2)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">{highlights.countInc} income entries</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Expenses</p>
              <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 font-mono">
                -${highlights.totalExp.toFixed(2)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">{highlights.countExp} expense entries</p>
            </div>
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Net Savings</p>
              <h3
                className={`text-2xl font-bold mt-1 font-mono ${
                  highlights.netSavings >= 0
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {highlights.netSavings >= 0 ? '+' : ''}${highlights.netSavings.toFixed(2)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                {highlights.savingsRate.toFixed(1)}% savings rate
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Avg. Daily Spend</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">
                ${highlights.avgDailySpend.toFixed(2)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Estimated daily burn rate</p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* CHARTS GRID 1: Monthly Income vs Expenses & Savings Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Monthly Income vs Expenses */}
        <Card
          title="Monthly Income vs Expenses"
          subtitle={`Yearly financial progression for ${selectedYear}`}
        >
          <div className="h-72 w-full pt-2">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <Bar data={monthlyComparisonData} options={getChartOptions()} />
            )}
          </div>
        </Card>

        {/* Line Chart: Savings Trend Overview */}
        <Card
          title="Savings & Cash Flow Trend"
          subtitle={`Net monthly savings trajectory (${selectedYear})`}
        >
          <div className="h-72 w-full pt-2">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <Line data={savingsTrendData} options={getChartOptions()} />
            )}
          </div>
        </Card>
      </div>

      {/* CHARTS GRID 2: Category Breakdown & Income Source Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doughnut Chart: Category-wise Spending */}
        <Card
          title="Category-wise Spending"
          subtitle="Expense distribution across registered categories"
        >
          <div className="h-72 w-full pt-2">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : categorySpendingData.labels.length === 0 ? (
              <EmptyState
                icon={PieChartIcon}
                title="No Category Expenses"
                description="No expenses found for the selected year and period filters."
              />
            ) : (
              <Doughnut data={categorySpendingData} options={donutOptions} />
            )}
          </div>
        </Card>

        {/* Pie Chart: Income Source Distribution */}
        <Card
          title="Income Source Distribution"
          subtitle="Share of revenue by source"
        >
          <div className="h-72 w-full pt-2">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : incomeSourceData.labels.length === 0 ? (
              <EmptyState
                icon={PieChartIcon}
                title="No Income Sources"
                description="No income entries found for the selected period."
              />
            ) : (
              <Pie data={incomeSourceData} options={donutOptions} />
            )}
          </div>
        </Card>
      </div>

      {/* CHARTS GRID 3: Time Grain Analytics (Daily & Weekly Spending) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart: Daily Spending */}
        <Card
          title="Daily Spending Pattern"
          subtitle={`Day-by-day expense totals in ${
            selectedMonth === 'all' ? 'current month' : MONTH_NAMES[parseInt(selectedMonth, 10) - 1]
          } ${selectedYear}`}
        >
          <div className="h-72 w-full pt-2">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <Line data={dailySpendingData} options={getChartOptions()} />
            )}
          </div>
        </Card>

        {/* Bar Chart: Weekly Spending */}
        <Card
          title="Weekly Spending Distribution"
          subtitle="Aggregated expenses grouped by calendar week"
        >
          <div className="h-72 w-full pt-2">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <Bar data={weeklySpendingData} options={getChartOptions()} />
            )}
          </div>
        </Card>
      </div>

      {/* CHARTS GRID 4: Budget Performance & Yearly Multi-Year Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Budget Performance */}
        <Card
          title="Budget Performance vs Actual Spent"
          subtitle="Comparison of monthly budget caps against actual logged expenses"
        >
          <div className="h-72 w-full pt-2">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : budgetPerformanceData.labels.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No Active Budgets"
                description="Create monthly budget limits in the Budgets tab to compare performance here."
              />
            ) : (
              <Bar data={budgetPerformanceData} options={getChartOptions()} />
            )}
          </div>
        </Card>

        {/* Bar Chart: Multi-Year Summary */}
        <Card
          title="Yearly Financial Summary"
          subtitle="Annual overview comparing total income vs total expenses across years"
        >
          <div className="h-72 w-full pt-2">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <Bar data={yearlySummaryData} options={getChartOptions()} />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
