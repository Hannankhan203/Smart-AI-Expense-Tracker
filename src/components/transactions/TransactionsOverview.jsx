import React, { useState, useEffect, useMemo } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import Skeleton from '../common/Skeleton';
import Modal from '../common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { subscribeToExpenses } from '../../services/expenseService';
import { subscribeToIncome } from '../../services/incomeService';
import { subscribeToCategories } from '../../services/categoryService';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  CreditCard,
  Tag,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  FileText,
  Eye,
  X,
  Layers,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

export default function TransactionsOverview() {
  const { user } = useAuth();

  // Raw streams
  const [expenses, setExpenses] = useState([]);
  const [incomeList, setIncomeList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [loadingIncome, setLoadingIncome] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'expense', 'income'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [datePreset, setDatePreset] = useState('all'); // 'all', 'this_month', 'last_30', 'this_year'

  // Sorting & Pagination
  const [sortField, setSortField] = useState('date'); // 'date', 'amount', 'title'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc', 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Detail Modal
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // 1. Subscribe to Expenses
  useEffect(() => {
    if (!user?.uid) return;
    setLoadingExpenses(true);
    const unsubscribe = subscribeToExpenses(
      user.uid,
      (data) => {
        setExpenses(data);
        setLoadingExpenses(false);
      },
      (err) => {
        console.error('Error fetching expenses for transactions:', err);
        setLoadingExpenses(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // 2. Subscribe to Income
  useEffect(() => {
    if (!user?.uid) return;
    setLoadingIncome(true);
    const unsubscribe = subscribeToIncome(
      user.uid,
      (data) => {
        setIncomeList(data);
        setLoadingIncome(false);
      },
      (err) => {
        console.error('Error fetching income for transactions:', err);
        setLoadingIncome(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // 3. Subscribe to Categories
  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeToCategories(
      user.uid,
      (data) => {
        setCategories(data);
      },
      (err) => console.error('Error fetching categories:', err)
    );
    return () => unsubscribe();
  }, [user]);

  // Normalize and combine Expenses & Income
  const normalizedTransactions = useMemo(() => {
    const expNormalized = expenses.map((exp) => ({
      id: exp.expenseId || exp.id,
      type: 'expense',
      title: exp.title || 'Expense',
      categoryOrSource: exp.categoryName || 'Other Expenses',
      amount: parseFloat(exp.amount) || 0,
      date: exp.expenseDate || '',
      paymentMethod: exp.paymentMethod || 'Credit Card',
      description: exp.description || '',
      receiptURL: exp.receiptURL || null,
      raw: exp,
    }));

    const incNormalized = incomeList.map((inc) => ({
      id: inc.incomeId || inc.id,
      type: 'income',
      title: inc.title || 'Income',
      categoryOrSource: inc.source || 'Salary',
      amount: parseFloat(inc.amount) || 0,
      date: inc.date || '',
      paymentMethod: 'N/A',
      description: inc.notes || '',
      receiptURL: null,
      raw: inc,
    }));

    return [...expNormalized, ...incNormalized];
  }, [expenses, incomeList]);

  // Handle Date Presets
  const handlePresetChange = (preset) => {
    setDatePreset(preset);
    const today = new Date();
    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'this_month') {
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      setStartDate(`${year}-${month}-01`);
      const lastDay = new Date(year, today.getMonth() + 1, 0).getDate();
      setEndDate(`${year}-${month}-${String(lastDay).padStart(2, '0')}`);
    } else if (preset === 'last_30') {
      const past30 = new Date(today);
      past30.setDate(past30.getDate() - 30);
      setStartDate(past30.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else if (preset === 'this_year') {
      const year = today.getFullYear();
      setStartDate(`${year}-01-01`);
      setEndDate(`${year}-12-31`);
    }
  };

  // Filter Pipeline
  const filteredTransactions = useMemo(() => {
    return normalizedTransactions.filter((item) => {
      // Type Filter
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;

      // Search Term (Title, Category/Source, Description)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(term);
        const matchesCat = item.categoryOrSource.toLowerCase().includes(term);
        const matchesDesc = item.description.toLowerCase().includes(term);
        const matchesPayment = item.paymentMethod.toLowerCase().includes(term);
        if (!matchesTitle && !matchesCat && !matchesDesc && !matchesPayment) return false;
      }

      // Category / Source Filter
      if (categoryFilter !== 'all') {
        if (item.categoryOrSource.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      }

      // Payment Method Filter
      if (paymentMethodFilter !== 'all') {
        if (item.paymentMethod.toLowerCase() !== paymentMethodFilter.toLowerCase()) return false;
      }

      // Date Range Filter
      if (startDate && item.date < startDate) return false;
      if (endDate && item.date > endDate) return false;

      // Amount Range Filter
      if (minAmount && !isNaN(minAmount) && item.amount < parseFloat(minAmount)) return false;
      if (maxAmount && !isNaN(maxAmount) && item.amount > parseFloat(maxAmount)) return false;

      return true;
    });
  }, [
    normalizedTransactions,
    typeFilter,
    searchTerm,
    categoryFilter,
    paymentMethodFilter,
    startDate,
    endDate,
    minAmount,
    maxAmount,
  ]);

  // Sort Pipeline
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'title') {
        valA = (valA || '').toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTransactions, sortField, sortDirection]);

  // Pagination Calculations
  const totalItems = sortedTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset page if current page exceeds totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedTransactions.slice(startIndex, startIndex + pageSize);
  }, [sortedTransactions, currentPage, pageSize]);

  // Summary Metrics
  const summary = useMemo(() => {
    let incomeSum = 0;
    let expenseSum = 0;

    filteredTransactions.forEach((t) => {
      if (t.type === 'income') incomeSum += t.amount;
      if (t.type === 'expense') expenseSum += t.amount;
    });

    const netFlow = incomeSum - expenseSum;
    return { incomeSum, expenseSum, netFlow, count: filteredTransactions.length };
  }, [filteredTransactions]);

  // Unique list of categories/sources for filter dropdown
  const categoryOptions = useMemo(() => {
    const setCat = new Set();
    normalizedTransactions.forEach((t) => {
      if (t.categoryOrSource) setCat.add(t.categoryOrSource);
    });
    return Array.from(setCat).sort();
  }, [normalizedTransactions]);

  // Unique list of payment methods
  const paymentMethodOptions = useMemo(() => {
    const setPm = new Set();
    normalizedTransactions.forEach((t) => {
      if (t.paymentMethod && t.paymentMethod !== 'N/A') setPm.add(t.paymentMethod);
    });
    return Array.from(setPm).sort();
  }, [normalizedTransactions]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setPaymentMethodFilter('all');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setDatePreset('all');
    setCurrentPage(1);
  };

  const isFiltered =
    searchTerm ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    paymentMethodFilter !== 'all' ||
    startDate ||
    endDate ||
    minAmount ||
    maxAmount ||
    datePreset !== 'all';

  // Toggle sort field
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const isLoading = loadingExpenses || loadingIncome;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Unified Transaction History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Full consolidated ledger of all income and expense activities with advanced filtering
          </p>
        </div>

        {/* Filters Toggle & Reset Buttons */}
        <div className="flex items-center gap-2">
          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-rose-500 hover:text-rose-600">
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span>Reset Filters</span>
            </Button>
          )}

          <Button
            variant={showFiltersPanel ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
            <span>{showFiltersPanel ? 'Hide Extended Filters' : 'Filter Options'}</span>
            {isFiltered && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                Active
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Net Cash Flow</p>
              <h3
                className={`text-2xl font-bold mt-1 font-mono ${
                  summary.netFlow >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {summary.netFlow >= 0 ? '+' : ''}${summary.netFlow.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Income</p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                +${summary.incomeSum.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Expenses</p>
              <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 font-mono">
                -${summary.expenseSum.toFixed(2)}
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
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Records Found</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">
                {summary.count}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Container Card */}
      <Card title="Transactions Directory" subtitle="Comprehensive list of income and expense entries">
        <div className="space-y-4">
          {/* Primary Quick Controls: Search & Type Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search title, category, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Type Segmented Filter Pills */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium w-full sm:w-auto">
              <button
                onClick={() => setTypeFilter('all')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md transition-all ${
                  typeFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                All Records ({normalizedTransactions.length})
              </button>
              <button
                onClick={() => setTypeFilter('income')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md transition-all ${
                  typeFilter === 'income'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                Income ({incomeList.length})
              </button>
              <button
                onClick={() => setTypeFilter('expense')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md transition-all ${
                  typeFilter === 'expense'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                Expenses ({expenses.length})
              </button>
            </div>
          </div>

          {/* Extended Filters Panel */}
          {showFiltersPanel && (
            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
              {/* Category / Source Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>Category / Source</span>
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="all">All Categories & Sources</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  <span>Payment Method</span>
                </label>
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="all">All Payment Methods</option>
                  {paymentMethodOptions.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Presets */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Date Range Preset</span>
                </label>
                <select
                  value={datePreset}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="all">All Time</option>
                  <option value="this_month">This Month</option>
                  <option value="last_30">Last 30 Days</option>
                  <option value="this_year">This Year</option>
                </select>
              </div>

              {/* Custom Date Range */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Custom Dates (Start / End)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setDatePreset('custom');
                    }}
                    className="w-full text-[11px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg p-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setDatePreset('custom');
                    }}
                    className="w-full text-[11px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg p-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Amount Range Filter */}
              <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Minimum Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 10.00"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Maximum Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 5000.00"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Transactions Table Content */}
          {isLoading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : paginatedTransactions.length === 0 ? (
            <EmptyState
              icon={Filter}
              title={normalizedTransactions.length === 0 ? 'No Transactions Recorded' : 'No Matching Records'}
              description={
                normalizedTransactions.length === 0
                  ? 'Start by recording expenses or income entries in their respective modules to populate your transaction ledger.'
                  : 'No transaction matches your selected filter, date, or search criteria. Try clearing some filters.'
              }
            >
              {isFiltered && (
                <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-3">
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Clear Search & Filters
                </Button>
              )}
            </EmptyState>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow hover={false}>
                    <TableHead>Type</TableHead>

                    {/* Sortable Header: Title */}
                    <TableHead>
                      <button
                        type="button"
                        onClick={() => handleSort('title')}
                        className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold"
                      >
                        <span>Title / Details</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </button>
                    </TableHead>

                    <TableHead>Category / Source</TableHead>

                    {/* Sortable Header: Date */}
                    <TableHead>
                      <button
                        type="button"
                        onClick={() => handleSort('date')}
                        className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold"
                      >
                        <span>Date</span>
                        {sortField === 'date' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-emerald-500" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        )}
                      </button>
                    </TableHead>

                    <TableHead>Payment Method</TableHead>

                    {/* Sortable Header: Amount */}
                    <TableHead className="text-right">
                      <button
                        type="button"
                        onClick={() => handleSort('amount')}
                        className="flex items-center gap-1 justify-end w-full text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold"
                      >
                        <span>Amount</span>
                        {sortField === 'amount' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-emerald-500" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        )}
                      </button>
                    </TableHead>

                    <TableHead className="text-center">Receipt</TableHead>
                    <TableHead className="text-right">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((item) => (
                    <TableRow key={`${item.type}_${item.id}`}>
                      {/* Type Pill */}
                      <TableCell>
                        {item.type === 'income' ? (
                          <Badge variant="emerald" size="sm" className="font-semibold">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Income
                          </Badge>
                        ) : (
                          <Badge variant="rose" size="sm" className="font-semibold">
                            <TrendingDown className="w-3 h-3 mr-1" />
                            Expense
                          </Badge>
                        )}
                      </TableCell>

                      {/* Title */}
                      <TableCell>
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate max-w-[200px]">
                          {item.title}
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                            {item.description}
                          </p>
                        )}
                      </TableCell>

                      {/* Category / Source */}
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/80">
                          <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{item.categoryOrSource}</span>
                        </span>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
                        {item.date || 'N/A'}
                      </TableCell>

                      {/* Payment Method */}
                      <TableCell>
                        {item.type === 'expense' ? (
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                            {item.paymentMethod}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Direct Deposit</span>
                        )}
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="text-right font-mono font-bold text-xs">
                        {item.type === 'income' ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            +${item.amount.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400">
                            -${item.amount.toFixed(2)}
                          </span>
                        )}
                      </TableCell>

                      {/* Receipt Icon */}
                      <TableCell className="text-center">
                        {item.receiptURL ? (
                          <a
                            href={item.receiptURL}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 inline-flex items-center"
                            title="View receipt image"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-700 text-[11px]">—</span>
                        )}
                      </TableCell>

                      {/* Detail View Eye Button */}
                      <TableCell className="text-right">
                        <button
                          onClick={() => setSelectedTransaction(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View complete transaction details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                {/* Items Info & Page Size */}
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    Showing{' '}
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">
                      {Math.min((currentPage - 1) * pageSize + 1, totalItems)}
                    </strong>{' '}
                    to{' '}
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">
                      {Math.min(currentPage * pageSize, totalItems)}
                    </strong>{' '}
                    of <strong className="text-slate-800 dark:text-slate-200 font-mono">{totalItems}</strong> records
                  </span>

                  <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-3">
                    <span>Rows:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded px-1.5 py-0.5 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {/* Page Navigation Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="First page"
                  >
                    <ChevronsLeft className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <span className="px-2.5 py-1 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Next page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Last page"
                  >
                    <ChevronsRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Transaction Detail Lightbox Modal */}
      {selectedTransaction && (
        <Modal
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          title="Transaction Details"
          size="md"
        >
          <div className="space-y-4 pt-1">
            {/* Header Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Transaction Title
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {selectedTransaction.title}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Amount
                </span>
                <div
                  className={`text-lg font-bold font-mono mt-0.5 ${
                    selectedTransaction.type === 'income'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {selectedTransaction.type === 'income' ? '+' : '-'}${selectedTransaction.amount.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Grid Metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">Type</span>
                <div>
                  {selectedTransaction.type === 'income' ? (
                    <Badge variant="emerald" size="sm">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Income Entry
                    </Badge>
                  ) : (
                    <Badge variant="rose" size="sm">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      Expense Entry
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">Category / Source</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedTransaction.categoryOrSource}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">Date</span>
                <div className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {selectedTransaction.date || 'N/A'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">Payment Method</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedTransaction.paymentMethod}
                </div>
              </div>
            </div>

            {/* Description / Notes */}
            {selectedTransaction.description && (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <span className="text-slate-400 font-medium block">Description / Notes</span>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {selectedTransaction.description}
                </p>
              </div>
            )}

            {/* Receipt Attachment Link */}
            {selectedTransaction.receiptURL && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Receipt Attachment Available</span>
                </div>
                <a
                  href={selectedTransaction.receiptURL}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors text-[11px] flex items-center gap-1"
                >
                  <span>Open Image</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Close Button */}
            <div className="pt-2 flex justify-end">
              <Button variant="ghost" onClick={() => setSelectedTransaction(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
