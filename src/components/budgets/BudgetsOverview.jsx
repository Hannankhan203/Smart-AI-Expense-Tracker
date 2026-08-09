import React, { useState, useEffect, useMemo } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import Skeleton from '../common/Skeleton';
import BudgetFormModal from './BudgetFormModal';
import BudgetDeleteModal from './BudgetDeleteModal';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import {
  subscribeToBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  MONTH_NAMES,
} from '../../services/budgetService';
import { subscribeToExpenses } from '../../services/expenseService';
import { subscribeToCategories } from '../../services/categoryService';
import {
  Plus,
  PieChart,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Search,
  Filter,
  DollarSign,
  TrendingDown,
  Calendar,
  Tag,
  Layers,
  Zap,
} from 'lucide-react';

export default function BudgetsOverview() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const currentDate = new Date();
  const currentMonthNum = currentDate.getMonth() + 1;
  const currentYearNum = currentDate.getFullYear();

  // State
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(String(currentMonthNum));
  const [selectedYear, setSelectedYear] = useState(String(currentYearNum));

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 1. Subscribe to Categories
  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeToCategories(
      user.uid,
      (catsData) => {
        const expCats = catsData.filter((c) => c.categoryType === 'expense');
        setCategories(expCats);
      },
      (err) => console.error('Error listening to categories:', err)
    );
    return () => unsubscribe();
  }, [user]);

  // 2. Subscribe to Expenses
  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeToExpenses(
      user.uid,
      (expData) => {
        setExpenses(expData);
      },
      (err) => console.error('Error listening to expenses:', err)
    );
    return () => unsubscribe();
  }, [user]);

  // 3. Subscribe to Budgets
  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    const unsubscribe = subscribeToBudgets(
      user.uid,
      (budgetData) => {
        setBudgets(budgetData);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to budgets:', err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Budget calculations mapping with expenses
  const budgetsWithStats = useMemo(() => {
    return budgets.map((b) => {
      // Calculate amount spent in this category for this month and year
      const matchingExpenses = expenses.filter((exp) => {
        if (!exp.expenseDate) return false;
        const [expY, expM] = exp.expenseDate.split('-').map(Number);
        
        const matchesDate = expY === Number(b.year) && expM === Number(b.month);
        const matchesCategory =
          (b.categoryId && exp.categoryId === b.categoryId) ||
          (b.categoryName && exp.categoryName?.toLowerCase() === b.categoryName?.toLowerCase());

        return matchesDate && matchesCategory;
      });

      const amountSpent = matchingExpenses.reduce(
        (sum, exp) => sum + (parseFloat(exp.amount) || 0),
        0
      );

      const monthlyLimit = parseFloat(b.monthlyLimit) || 0;
      const remainingAmount = monthlyLimit - amountSpent;
      const percentageUsed = monthlyLimit > 0 ? (amountSpent / monthlyLimit) * 100 : 0;

      // Warning state classification
      let healthState = 'healthy'; // 'healthy', 'warning', 'exceeded'
      if (percentageUsed >= 100) {
        healthState = 'exceeded';
      } else if (percentageUsed >= 80) {
        healthState = 'warning';
      }

      return {
        ...b,
        amountSpent,
        remainingAmount,
        percentageUsed,
        healthState,
      };
    });
  }, [budgets, expenses]);

  // Filtered budgets list
  const filteredBudgets = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return budgetsWithStats.filter((b) => {
      const matchesSearch = !term || b.categoryName?.toLowerCase().includes(term);
      const matchesMonth = !selectedMonth || selectedMonth === 'all' || Number(b.month) === Number(selectedMonth);
      const matchesYear = !selectedYear || selectedYear === 'all' || Number(b.year) === Number(selectedYear);
      return matchesSearch && matchesMonth && matchesYear;
    });
  }, [budgetsWithStats, searchTerm, selectedMonth, selectedYear]);

  // Global summary KPIs for selected month & year
  const summaryKPIs = useMemo(() => {
    const activeSet = filteredBudgets;
    const totalLimit = activeSet.reduce((acc, curr) => acc + curr.monthlyLimit, 0);
    const totalSpent = activeSet.reduce((acc, curr) => acc + curr.amountSpent, 0);
    const totalRemaining = totalLimit - totalSpent;
    const exceededCount = activeSet.filter((b) => b.healthState === 'exceeded').length;
    const warningCount = activeSet.filter((b) => b.healthState === 'warning').length;

    return { totalLimit, totalSpent, totalRemaining, exceededCount, warningCount };
  }, [filteredBudgets]);

  // Modal Action Handlers
  const handleOpenAddModal = () => {
    setSelectedBudget(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (b) => {
    setSelectedBudget(b);
    setModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (!user?.uid) return;
    setActionLoading(true);
    try {
      if (selectedBudget?.budgetId) {
        await updateBudget(selectedBudget.budgetId, formData);
        addToast({
          type: 'success',
          title: 'Budget Updated',
          message: `Budget for "${formData.categoryName}" updated.`,
        });
      } else {
        await createBudget(user.uid, formData);
        addToast({
          type: 'success',
          title: 'Budget Created',
          message: `Budget set for "${formData.categoryName}".`,
        });
      }
      setModalOpen(false);
      setSelectedBudget(null);
    } catch (err) {
      console.error('Failed to save budget:', err);
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not save budget record.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDeleteModal = (b) => {
    setSelectedBudget(b);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBudget?.budgetId) return;
    setActionLoading(true);
    try {
      await deleteBudget(selectedBudget.budgetId);
      addToast({
        type: 'success',
        title: 'Budget Deleted',
        message: 'Budget limit removed successfully.',
      });
      setDeleteModalOpen(false);
      setSelectedBudget(null);
    } catch (err) {
      console.error('Error deleting budget:', err);
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete budget limit.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Budget Management & Limits
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor monthly category caps, track actual spending, and prevent budget overruns
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenAddModal} className="shrink-0">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Create Budget</span>
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Budgeted</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">
                ${summaryKPIs.totalLimit.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Spent</p>
              <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 font-mono">
                ${summaryKPIs.totalSpent.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Remaining</p>
              <h3 className={`text-2xl font-bold mt-1 font-mono ${
                summaryKPIs.totalRemaining < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                ${summaryKPIs.totalRemaining.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Alert Status</p>
              <div className="flex items-center gap-2 mt-1">
                {summaryKPIs.exceededCount > 0 ? (
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {summaryKPIs.exceededCount} Exceeded
                  </span>
                ) : summaryKPIs.warningCount > 0 ? (
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {summaryKPIs.warningCount} Near Limit
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    All Healthy
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Zap className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Container Card */}
      <Card title="Budget Directory" subtitle="Filter by month/year and track category thresholds">
        <div className="space-y-4">
          {/* Controls Bar: Search & Date Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search category budgets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Month & Year Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg px-2.5 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="text-xs bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none font-medium"
                >
                  <option value="all">All Months</option>
                  {MONTH_NAMES.map((mName, idx) => (
                    <option key={mName} value={idx + 1}>
                      {mName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg px-2.5 py-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="text-xs bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none font-medium"
                >
                  <option value="all">All Years</option>
                  <option value={currentYearNum - 1}>{currentYearNum - 1}</option>
                  <option value={currentYearNum}>{currentYearNum}</option>
                  <option value={currentYearNum + 1}>{currentYearNum + 1}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Budget Grid Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-44 w-full rounded-2xl" />
              <Skeleton className="h-44 w-full rounded-2xl" />
              <Skeleton className="h-44 w-full rounded-2xl" />
            </div>
          ) : filteredBudgets.length === 0 ? (
            <EmptyState
              icon={PieChart}
              title={budgets.length === 0 ? 'No Budgets Configured' : 'No Matching Budgets'}
              description={
                budgets.length === 0
                  ? 'Set category spending limits to gain full control over your financial health and prevent unexpected overspending.'
                  : 'Try selecting a different month, year, or clearing your search term.'
              }
            >
              {budgets.length === 0 && (
                <Button variant="primary" size="sm" onClick={handleOpenAddModal} className="mt-3">
                  <Plus className="w-4 h-4 mr-1" />
                  Set First Budget
                </Button>
              )}
            </EmptyState>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBudgets.map((b) => {
                const monthName = MONTH_NAMES[b.month - 1] || `Month ${b.month}`;
                const pct = Math.min(100, Math.max(0, b.percentageUsed));

                // Color mappings based on warning states
                let borderClass = 'border-slate-200 dark:border-slate-800';
                let progressBg = 'bg-emerald-500';
                let badgeNode = (
                  <Badge variant="emerald" size="sm">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    On Track
                  </Badge>
                );

                if (b.healthState === 'exceeded') {
                  borderClass = 'border-rose-500/50 dark:border-rose-500/50 ring-1 ring-rose-500/20';
                  progressBg = 'bg-rose-500';
                  badgeNode = (
                    <Badge variant="rose" size="sm">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Budget Exceeded
                    </Badge>
                  );
                } else if (b.healthState === 'warning') {
                  borderClass = 'border-amber-500/50 dark:border-amber-500/50 ring-1 ring-amber-500/20';
                  progressBg = 'bg-amber-500';
                  badgeNode = (
                    <Badge variant="amber" size="sm">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Approaching Limit
                    </Badge>
                  );
                }

                return (
                  <div
                    key={b.budgetId || b.id}
                    className={`p-4 rounded-2xl bg-white dark:bg-slate-900/90 border ${borderClass} shadow-sm transition-all flex flex-col justify-between space-y-3`}
                  >
                    {/* Top Row: Category Name & Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[160px]">
                            {b.categoryName}
                          </h4>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {monthName} {b.year}
                          </span>
                        </div>
                      </div>

                      {/* Edit / Delete Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(b)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Budget"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(b)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete Budget"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Badge Indicator */}
                    <div>{badgeNode}</div>

                    {/* Progress Bar Container */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500 dark:text-slate-400">
                          Spent: <strong className="text-slate-900 dark:text-slate-100">${b.amountSpent.toFixed(2)}</strong>
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          Cap: <strong className="text-slate-900 dark:text-slate-100">${b.monthlyLimit.toFixed(2)}</strong>
                        </span>
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                        <div
                          className={`h-full ${progressBg} transition-all duration-500 rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-500">
                          {b.percentageUsed.toFixed(1)}% used
                        </span>
                        <span
                          className={`font-semibold ${
                            b.remainingAmount < 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {b.remainingAmount < 0
                            ? `Over by $${Math.abs(b.remainingAmount).toFixed(2)}`
                            : `$${b.remainingAmount.toFixed(2)} left`}
                        </span>
                      </div>
                    </div>

                    {/* Warning State Banner if Exceeded or Approaching */}
                    {b.healthState === 'exceeded' && (
                      <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-[11px] text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                        <span>You have exceeded this category's monthly limit.</span>
                      </div>
                    )}
                    {b.healthState === 'warning' && (
                      <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                        <span>Warning: Over 80% of budget limit spent.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Add / Edit Modal */}
      <BudgetFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        categories={categories}
        initialData={selectedBudget}
        loading={actionLoading}
      />

      {/* Delete Modal */}
      <BudgetDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        budget={selectedBudget}
        loading={actionLoading}
      />
    </div>
  );
}
