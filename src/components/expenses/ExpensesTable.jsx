import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../common/Table';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import Skeleton from '../common/Skeleton';
import Button from '../common/Button';
import {
  Search,
  Filter,
  ExternalLink,
  Edit2,
  Trash2,
  TrendingDown,
  CreditCard,
  Calendar,
  Tag,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Clock,
  Image as ImageIcon,
} from 'lucide-react';

export default function ExpensesTable({
  expenses = [],
  categories = [],
  loading = false,
  onEdit,
  onDelete,
}) {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [dateRange, setDateRange] = useState('all'); // 'all', 'today', 'thisWeek', 'thisMonth', 'lastMonth', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sorting State
  const [sortField, setSortField] = useState('date'); // 'date', 'amount', 'title'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedPaymentMethod, dateRange, startDate, endDate, sortField, sortOrder, pageSize]);

  // Date Range Helper
  const isWithinDateRange = (expDateStr) => {
    if (!expDateStr || dateRange === 'all') return true;

    const todayObj = new Date();
    const expDate = new Date(expDateStr + 'T00:00:00');

    if (dateRange === 'today') {
      const todayStr = new Date(todayObj.getTime() - todayObj.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];
      return expDateStr === todayStr;
    }

    if (dateRange === 'thisWeek') {
      const day = todayObj.getDay();
      const diffToMon = todayObj.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(todayObj.setDate(diffToMon));
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return expDate >= startOfWeek && expDate <= endOfWeek;
    }

    if (dateRange === 'thisMonth') {
      const startOfMonth = new Date(todayObj.getFullYear(), todayObj.getMonth(), 1);
      const endOfMonth = new Date(todayObj.getFullYear(), todayObj.getMonth() + 1, 0, 23, 59, 59, 999);
      return expDate >= startOfMonth && expDate <= endOfMonth;
    }

    if (dateRange === 'lastMonth') {
      const startOfLastMonth = new Date(todayObj.getFullYear(), todayObj.getMonth() - 1, 1);
      const endOfLastMonth = new Date(todayObj.getFullYear(), todayObj.getMonth(), 0, 23, 59, 59, 999);
      return expDate >= startOfLastMonth && expDate <= endOfLastMonth;
    }

    if (dateRange === 'custom') {
      if (startDate && expDateStr < startDate) return false;
      if (endDate && expDateStr > endDate) return false;
      return true;
    }

    return true;
  };

  // Filter & Sort Pipeline
  const filteredAndSortedExpenses = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    const filtered = expenses.filter((exp) => {
      // 1. Search filter across Title, Category, Amount, Payment Method
      const matchesSearch =
        !term ||
        exp.title?.toLowerCase().includes(term) ||
        exp.description?.toLowerCase().includes(term) ||
        exp.categoryName?.toLowerCase().includes(term) ||
        exp.paymentMethod?.toLowerCase().includes(term) ||
        (exp.amount !== undefined && String(exp.amount).includes(term));

      // 2. Category filter
      const matchesCategory =
        !selectedCategory || exp.categoryId === selectedCategory;

      // 3. Payment Method filter
      const matchesPayment =
        !selectedPaymentMethod || exp.paymentMethod === selectedPaymentMethod;

      // 4. Date Range filter
      const matchesDate = isWithinDateRange(exp.expenseDate);

      return matchesSearch && matchesCategory && matchesPayment && matchesDate;
    });

    // Sort execution
    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        const dateA = a.expenseDate || '';
        const dateB = b.expenseDate || '';
        comparison = dateA.localeCompare(dateB);
      } else if (sortField === 'amount') {
        const amtA = parseFloat(a.amount) || 0;
        const amtB = parseFloat(b.amount) || 0;
        comparison = amtA - amtB;
      } else if (sortField === 'title') {
        const titleA = a.title || '';
        const titleB = b.title || '';
        comparison = titleA.localeCompare(titleB);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [
    expenses,
    searchTerm,
    selectedCategory,
    selectedPaymentMethod,
    dateRange,
    startDate,
    endDate,
    sortField,
    sortOrder,
  ]);

  // Pagination Math
  const totalResults = filteredAndSortedExpenses.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalResults);
  const paginatedExpenses = filteredAndSortedExpenses.slice(startIndex, endIndex);

  // Column Header Sort Toggle Helper
  const handleSortToggle = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc'); // default to descending on field switch
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-200 transition-colors" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-emerald-500 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-emerald-500 font-bold" />
    );
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedPaymentMethod('');
    setDateRange('all');
    setStartDate('');
    setEndDate('');
    setSortField('date');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  if (loading && expenses.length === 0) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  const hasActiveFilters =
    !!searchTerm ||
    !!selectedCategory ||
    !!selectedPaymentMethod ||
    dateRange !== 'all' ||
    !!startDate ||
    !!endDate;

  return (
    <div className="space-y-4">
      {/* 1. Controls Bar: Search, Category, Payment Method, Date Range & Sort */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input (Title, Category, Amount, Payment Method) */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, category, payment method, amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Filters & Controls Group */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat, idx) => (
                <option key={cat.categoryId || cat.id || `cat-${idx}`} value={cat.categoryId || cat.id || ''}>
                  {cat.categoryName}
                </option>
              ))}
            </select>

            {/* Payment Method Filter */}
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Payment Methods</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI / Mobile Wallet">UPI / Mobile Wallet</option>
              <option value="Other">Other</option>
            </select>

            {/* Quick Date Range Dropdown */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="custom">Custom Date Range</option>
            </select>

            {/* Sort Dropdown Selector */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg px-2 py-1">
              <span className="text-[11px] text-slate-400 font-medium pl-1">Sort:</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="text-xs bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none font-medium"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="title">Title</option>
              </select>
              <button
                onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 transition-colors"
                title={`Switch to ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? (
                  <ArrowUp className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <ArrowDown className="w-3.5 h-3.5 text-emerald-500" />
                )}
              </button>
            </div>

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 text-xs font-medium hover:bg-rose-100 transition-colors"
                title="Clear all filters"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Custom Date Range Picker Inputs (Only shown when 'custom' selected) */}
        {dateRange === 'custom' && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center gap-3 flex-wrap text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Custom Range:</span>
            <div className="flex items-center gap-1.5">
              <label className="text-slate-500">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-slate-500">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Table Rendering or Empty State */}
      {filteredAndSortedExpenses.length === 0 ? (
        <EmptyState
          icon={Filter}
          title={expenses.length === 0 ? 'No Expenses Recorded Yet' : 'No Matching Expenses Found'}
          description={
            expenses.length === 0
              ? 'Start recording your daily expenses to gain complete visibility over your financial health.'
              : 'Try clearing your search query or adjusting your filter conditions.'
          }
        >
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-3">
              Clear All Filters
            </Button>
          )}
        </EmptyState>
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                {/* Clickable Column Headers for Sorting */}
                <TableHead>
                  <button
                    onClick={() => handleSortToggle('title')}
                    className="flex items-center gap-1.5 group font-bold focus:outline-none"
                  >
                    <span>Expense Item</span>
                    {getSortIcon('title')}
                  </button>
                </TableHead>

                <TableHead>Category</TableHead>

                <TableHead>Payment Method</TableHead>

                <TableHead>
                  <button
                    onClick={() => handleSortToggle('date')}
                    className="flex items-center gap-1.5 group font-bold focus:outline-none"
                  >
                    <span>Date</span>
                    {getSortIcon('date')}
                  </button>
                </TableHead>

                <TableHead>
                  <button
                    onClick={() => handleSortToggle('amount')}
                    className="flex items-center gap-1.5 group font-bold focus:outline-none"
                  >
                    <span>Amount</span>
                    {getSortIcon('amount')}
                  </button>
                </TableHead>

                <TableHead>Receipt</TableHead>

                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedExpenses.map((row) => (
                <TableRow key={row.expenseId || row.id}>
                  {/* Title & Notes */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/20">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">
                          {row.title}
                        </p>
                        {row.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                            {row.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Badge variant="subtle" size="sm" className="font-medium">
                      <Tag className="w-3 h-3 mr-1" />
                      {row.categoryName || 'Other'}
                    </Badge>
                  </TableCell>

                  {/* Payment Method */}
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      {row.paymentMethod || 'Credit Card'}
                    </span>
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {row.expenseDate}
                    </span>
                  </TableCell>

                  {/* Amount */}
                  <TableCell>
                    <span className="font-bold text-rose-600 dark:text-rose-400 text-xs font-mono">
                      -${parseFloat(row.amount || 0).toFixed(2)}
                    </span>
                  </TableCell>

                  {/* Receipt */}
                  <TableCell>
                    {row.receiptURL ? (
                      <div className="flex items-center gap-1.5">
                        <a
                          href={row.receiptURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                          title="Open full receipt image in new tab"
                        >
                          <ImageIcon className="w-3 h-3 shrink-0" />
                          <span>Receipt</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">None</span>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(row)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Expense"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(row)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 3. Responsive Pagination Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            {/* Page Size Selector & Total Results Counter */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>per page</span>
              </div>

              <span className="text-slate-300 dark:text-slate-700">|</span>

              <div>
                Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{totalResults === 0 ? 0 : startIndex + 1}</span> to{' '}
                <span className="font-semibold text-slate-900 dark:text-slate-100">{endIndex}</span> of{' '}
                <span className="font-semibold text-slate-900 dark:text-slate-100">{totalResults}</span> expenses
              </div>
            </div>

            {/* Pagination Navigation Buttons */}
            <div className="flex items-center gap-1 self-end sm:self-auto">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-200">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
