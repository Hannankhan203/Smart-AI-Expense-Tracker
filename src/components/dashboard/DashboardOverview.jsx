import React, { useState, useEffect, useMemo } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Skeleton from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { subscribeToExpenses, createExpense } from '../../services/expenseService';
import { subscribeToIncome, createIncome } from '../../services/incomeService';
import { subscribeToBudgets, MONTH_NAMES } from '../../services/budgetService';
import { subscribeToCategories } from '../../services/categoryService';
import ExpenseFormModal from '../expenses/ExpenseFormModal';
import IncomeFormModal from '../income/IncomeFormModal';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PieChart,
  BarChart3,
  Calendar,
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Tag,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Receipt,
  Filter,
} from 'lucide-react';

export default function DashboardOverview() {
  const { user } = useAuth();

  // Firestore Data State
  const [expenses, setExpenses] = useState([]);
  const [incomeList, setIncomeList] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);

  // Loading States
  const [loading, setLoading] = useState(true);

  // Period Filter State (defaults to current year & month)
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(now.getFullYear()); // e.g. 2026

  // Modal State for Quick Record
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 1. Real-Time Subscriptions via onSnapshot()
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount >= 3) setLoading(false);
    };

    // Realtime Expense Listener
    const unsubExpenses = subscribeToExpenses(
      user.uid,
      (data) => {
        setExpenses(data || []);
        checkLoaded();
      },
      (err) => {
        console.error('Realtime expenses error:', err);
        checkLoaded();
      }
    );

    // Realtime Income Listener
    const unsubIncome = subscribeToIncome(
      user.uid,
      (data) => {
        setIncomeList(data || []);
        checkLoaded();
      },
      (err) => {
        console.error('Realtime income error:', err);
        checkLoaded();
      }
    );

    // Realtime Budget Listener
    const unsubBudgets = subscribeToBudgets(
      user.uid,
      (data) => {
        setBudgets(data || []);
        checkLoaded();
      },
      (err) => {
        console.error('Realtime budgets error:', err);
        checkLoaded();
      }
    );

    // Realtime Category Listener
    const unsubCategories = subscribeToCategories(
      user.uid,
      (data) => {
        setCategories(data || []);
      },
      (err) => {
        console.error('Realtime categories error:', err);
      }
    );

    return () => {
      unsubExpenses();
      unsubIncome();
      unsubBudgets();
      unsubCategories();
    };
  }, [user]);

  // Helper for Date Matching
  const isSameMonthYear = (dateStr, month, year) => {
    if (!dateStr) return false;
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      return y === year && m === month;
    }
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) && d.getFullYear() === year && d.getMonth() + 1 === month;
  };

  // 2. Financial Calculations
  const metrics = useMemo(() => {
    // Overall All-Time Totals
    const totalIncome = incomeList.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const currentBalance = totalIncome - totalExpenses;
    const numberOfTransactions = incomeList.length + expenses.length;

    // Monthly Filtered Records
    const monthlyIncomeRecords = incomeList.filter((i) => isSameMonthYear(i.date, selectedMonth, selectedYear));
    const monthlyExpenseRecords = expenses.filter((e) => isSameMonthYear(e.expenseDate, selectedMonth, selectedYear));

    const monthlyIncome = monthlyIncomeRecords.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const monthlyExpenses = monthlyExpenseRecords.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const monthlySavings = monthlyIncome - monthlyExpenses;

    // Monthly Budget Limits
    const currentMonthBudgets = budgets.filter((b) => b.month === selectedMonth && b.year === selectedYear);
    const monthlyBudget = currentMonthBudgets.reduce((acc, curr) => acc + (parseFloat(curr.monthlyLimit) || 0), 0);
    const remainingBudget = monthlyBudget - monthlyExpenses;
    const budgetPercentage = monthlyBudget > 0 ? (monthlyExpenses / monthlyBudget) * 100 : 0;

    return {
      currentBalance,
      totalIncome,
      totalExpenses,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      monthlyBudget,
      remainingBudget,
      budgetPercentage,
      numberOfTransactions,
      monthlyIncomeRecordsCount: monthlyIncomeRecords.length,
      monthlyExpenseRecordsCount: monthlyExpenseRecords.length,
      monthlyExpenseRecords,
      currentMonthBudgets,
    };
  }, [incomeList, expenses, budgets, selectedMonth, selectedYear]);

  // 3. Category Spending Breakdown
  const categorySpending = useMemo(() => {
    // Map of spending by category ID or category name
    const spendingMap = {};

    metrics.monthlyExpenseRecords.forEach((exp) => {
      const catKey = exp.categoryName || exp.categoryId || 'Other';
      if (!spendingMap[catKey]) {
        spendingMap[catKey] = {
          name: catKey,
          spent: 0,
          budgetLimit: 0,
        };
      }
      spendingMap[catKey].spent += parseFloat(exp.amount) || 0;
    });

    // Merge in budget limits for current month
    metrics.currentMonthBudgets.forEach((b) => {
      const catKey = b.categoryName || b.categoryId || 'Other';
      if (!spendingMap[catKey]) {
        spendingMap[catKey] = {
          name: catKey,
          spent: 0,
          budgetLimit: 0,
        };
      }
      spendingMap[catKey].budgetLimit += parseFloat(b.monthlyLimit) || 0;
    });

    const items = Object.values(spendingMap).map((item) => {
      const pct = item.budgetLimit > 0 ? (item.spent / item.budgetLimit) * 100 : 0;
      return {
        ...item,
        percentage: pct,
      };
    });

    // Sort by spending descending
    return items.sort((a, b) => b.spent - a.spent);
  }, [metrics.monthlyExpenseRecords, metrics.currentMonthBudgets]);

  // 4. Combined Recent Transactions (Top 6)
  const recentTransactions = useMemo(() => {
    const normExpenses = expenses.map((e) => ({
      id: e.expenseId || e.id,
      type: 'expense',
      title: e.title || 'Expense',
      categoryOrSource: e.categoryName || 'Expense',
      amount: parseFloat(e.amount) || 0,
      date: e.expenseDate || '',
      paymentMethod: e.paymentMethod || 'Credit Card',
      receiptURL: e.receiptURL || null,
    }));

    const normIncome = incomeList.map((i) => ({
      id: i.incomeId || i.id,
      type: 'income',
      title: i.title || 'Income',
      categoryOrSource: i.source || 'Income',
      amount: parseFloat(i.amount) || 0,
      date: i.date || '',
      paymentMethod: 'Direct Deposit',
      receiptURL: null,
    }));

    const combined = [...normExpenses, ...normIncome];
    combined.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
    return combined.slice(0, 6);
  }, [expenses, incomeList]);

  // 5. Monthly Bar Chart Comparison (Last 6 Months)
  const monthlyTrendData = useMemo(() => {
    const trend = [];
    const currentDateObj = new Date(selectedYear, selectedMonth - 1, 1);

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDateObj);
      d.setMonth(d.getMonth() - i);

      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const monthLabel = `${MONTH_NAMES[m - 1].slice(0, 3)} ${y}`;

      const mInc = incomeList
        .filter((inc) => isSameMonthYear(inc.date, m, y))
        .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

      const mExp = expenses
        .filter((exp) => isSameMonthYear(exp.expenseDate, m, y))
        .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

      trend.push({
        label: monthLabel,
        income: mInc,
        expense: mExp,
      });
    }

    const maxVal = Math.max(100, ...trend.map((t) => Math.max(t.income, t.expense)));
    return { trend, maxVal };
  }, [incomeList, expenses, selectedMonth, selectedYear]);

  // Quick Expense Handler
  const handleCreateExpense = async (expenseData) => {
    if (!user?.uid) return;
    setSubmitting(true);
    try {
      await createExpense(user.uid, expenseData);
      setShowExpenseModal(false);
    } catch (err) {
      console.error('Error creating expense on dashboard:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Income Handler
  const handleCreateIncome = async (incomeData) => {
    if (!user?.uid) return;
    setSubmitting(true);
    try {
      await createIncome(user.uid, incomeData);
      setShowIncomeModal(false);
    } catch (err) {
      console.error('Error creating income on dashboard:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-indigo-600/10 border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Financial Health & Real-Time Analytics
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Syncing
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Period: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</strong> — Total {metrics.numberOfTransactions} transactions synced from Firestore.
            </p>
          </div>
        </div>

        {/* Action Controls: Period Selector & Quick Add */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1 mr-1.5" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-medium focus:outline-none pr-1"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-mono font-semibold focus:outline-none pl-1 border-l border-slate-200 dark:border-slate-700"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowIncomeModal(true)}
            className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Income
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowExpenseModal(true)}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Expense
          </Button>
        </div>
      </div>

      {/* 1. Core Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Balance */}
        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current Balance</p>
              {loading ? (
                <Skeleton className="h-8 w-32 mt-1" />
              ) : (
                <h3
                  className={`text-2xl font-bold mt-1 font-mono ${
                    metrics.currentBalance >= 0
                      ? 'text-slate-900 dark:text-slate-100'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  ${metrics.currentBalance.toFixed(2)}
                </h3>
              )}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
                <Wallet className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Total Income - Total Expenses</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Total Income */}
        <Card className="border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Income (All-Time)</p>
              {loading ? (
                <Skeleton className="h-8 w-32 mt-1" />
              ) : (
                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                  +${metrics.totalIncome.toFixed(2)}
                </h3>
              )}
              <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-1.5 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                <span>{incomeList.length} income transactions</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-800/40">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Total Expenses */}
        <Card className="border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Expenses (All-Time)</p>
              {loading ? (
                <Skeleton className="h-8 w-32 mt-1" />
              ) : (
                <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 font-mono">
                  -${metrics.totalExpenses.toFixed(2)}
                </h3>
              )}
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                <span>{expenses.length} expense transactions</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/40">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Total Number of Transactions */}
        <Card className="border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Transactions</p>
              {loading ? (
                <Skeleton className="h-8 w-20 mt-1" />
              ) : (
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">
                  {metrics.numberOfTransactions}
                </h3>
              )}
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1.5 flex items-center gap-1 font-medium">
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>Consolidated Ledger Count</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/40">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* 2. Monthly Detailed Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Income */}
        <Card className="bg-slate-50/50 dark:bg-slate-900/40">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Monthly Income ({MONTH_NAMES[selectedMonth - 1].slice(0, 3)})
          </p>
          <div className="text-xl font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
            +${metrics.monthlyIncome.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {metrics.monthlyIncomeRecordsCount} entries received
          </p>
        </Card>

        {/* Monthly Expenses */}
        <Card className="bg-slate-50/50 dark:bg-slate-900/40">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Monthly Expenses ({MONTH_NAMES[selectedMonth - 1].slice(0, 3)})
          </p>
          <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            -${metrics.monthlyExpenses.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {metrics.monthlyExpenseRecordsCount} expenses recorded
          </p>
        </Card>

        {/* Monthly Savings */}
        <Card className="bg-slate-50/50 dark:bg-slate-900/40">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Monthly Savings
          </p>
          <div
            className={`text-xl font-bold font-mono mt-1 ${
              metrics.monthlySavings >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {metrics.monthlySavings >= 0 ? '+' : ''}${metrics.monthlySavings.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {metrics.monthlyIncome > 0
              ? `${Math.max(0, Math.round((metrics.monthlySavings / metrics.monthlyIncome) * 100))}% savings rate`
              : 'Monthly Income - Monthly Expenses'}
          </p>
        </Card>

        {/* Monthly Budget & Remaining */}
        <Card className="bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Monthly Budget Cap
            </p>
            <Badge
              variant={
                metrics.budgetPercentage > 100
                  ? 'rose'
                  : metrics.budgetPercentage > 85
                  ? 'amber'
                  : 'emerald'
              }
              size="sm"
              className="font-mono"
            >
              {Math.round(metrics.budgetPercentage)}% Used
            </Badge>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            ${metrics.monthlyBudget.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Remaining:{' '}
            <strong
              className={`font-mono ${
                metrics.remainingBudget >= 0 ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              ${metrics.remainingBudget.toFixed(2)}
            </strong>
          </p>
        </Card>
      </div>

      {/* 3. Analytics Section: Income vs Expense Trend & Category Spending Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Monthly Comparison Bar Chart */}
        <Card
          title="Income vs Expenses Trends"
          subtitle={`6-Month financial comparison up to ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`}
          className="lg:col-span-2"
        >
          <div className="pt-3 space-y-4">
            {/* Legend Header */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/80 pb-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-teal-500 inline-block" />
                  Income
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
                  Expenses
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal">Real-Time Data</span>
            </div>

            {/* Custom SVG/Tailwind Bar Chart Rendering */}
            <div className="space-y-3 pt-1">
              {monthlyTrendData.trend.map((item) => {
                const incPct = monthlyTrendData.maxVal > 0 ? (item.income / monthlyTrendData.maxVal) * 100 : 0;
                const expPct = monthlyTrendData.maxVal > 0 ? (item.expense / monthlyTrendData.maxVal) * 100 : 0;

                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{item.label}</span>
                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span className="text-teal-600 dark:text-teal-400">+${item.income.toFixed(2)}</span>
                        <span className="text-rose-600 dark:text-rose-400">-${item.expense.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Bars Container */}
                    <div className="space-y-1">
                      {/* Income Bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-2.5 rounded-full overflow-hidden flex">
                        <div
                          className="bg-teal-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(1, incPct)}%` }}
                        />
                      </div>

                      {/* Expense Bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-2.5 rounded-full overflow-hidden flex">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(1, expPct)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Category Spending Progress & Budget Limits */}
        <Card
          title="Category Spending & Budgets"
          subtitle={`Spending breakdown for ${MONTH_NAMES[selectedMonth - 1]}`}
          className="lg:col-span-1"
        >
          {loading ? (
            <div className="space-y-3 pt-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : categorySpending.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <PieChart className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              No expense entries recorded for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}.
            </div>
          ) : (
            <div className="space-y-4 pt-2 max-h-[320px] overflow-y-auto pr-1">
              {categorySpending.map((cat) => (
                <div key={cat.name} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                      {cat.name}
                    </span>
                    <span className="font-mono font-medium text-slate-600 dark:text-slate-400">
                      ${cat.spent.toFixed(2)}
                      {cat.budgetLimit > 0 && (
                        <span className="text-[10px] text-slate-400">
                          {' '}/ ${cat.budgetLimit.toFixed(2)}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        cat.percentage > 100
                          ? 'bg-rose-500'
                          : cat.percentage > 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{
                        width: cat.budgetLimit > 0 ? `${Math.min(100, cat.percentage)}%` : '100%',
                      }}
                    />
                  </div>

                  {/* Budget Warning Banner if Over Budget */}
                  {cat.budgetLimit > 0 && cat.spent > cat.budgetLimit && (
                    <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Exceeded budget cap by ${(cat.spent - cat.budgetLimit).toFixed(2)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* 4. Recent Transactions Table & Direct Link to History */}
      <Card
        title="Recent Activity Ledger"
        subtitle="Latest live synchronized income and expense transactions"
        action={
          <Link
            to="/transactions"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
          >
            <span>Full History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        {loading ? (
          <div className="space-y-3 py-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : recentTransactions.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No Transactions Logged"
            description="Your recent transaction activity will appear here in real-time as soon as you record income or expense entries."
          >
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={() => setShowExpenseModal(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Expense
              </Button>
            </div>
          </EmptyState>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentTransactions.map((tx) => (
              <div
                key={`${tx.type}_${tx.id}`}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-lg transition-colors"
              >
                {/* Left side: Icon, Title, Subtitle */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/50'
                        : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {tx.title}
                      </p>
                      <Badge variant={tx.type === 'income' ? 'emerald' : 'rose'} size="sm">
                        {tx.type}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {tx.categoryOrSource} • {tx.paymentMethod}
                    </p>
                  </div>
                </div>

                {/* Right side: Amount, Date, Receipt */}
                <div className="text-right shrink-0">
                  <div
                    className={`text-xs font-bold font-mono ${
                      tx.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{tx.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Record Modals */}
      {showExpenseModal && (
        <ExpenseFormModal
          isOpen={showExpenseModal}
          onClose={() => setShowExpenseModal(false)}
          onSubmit={handleCreateExpense}
          categories={categories.filter((c) => c.categoryType !== 'income')}
          loading={submitting}
        />
      )}

      {showIncomeModal && (
        <IncomeFormModal
          isOpen={showIncomeModal}
          onClose={() => setShowIncomeModal(false)}
          onSubmit={handleCreateIncome}
          incomeCategories={categories.filter((c) => c.categoryType === 'income')}
          loading={submitting}
        />
      )}
    </div>
  );
}
