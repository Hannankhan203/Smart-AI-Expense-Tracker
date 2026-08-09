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
  Edit2,
  Trash2,
  TrendingUp,
  Calendar,
  Briefcase,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  XCircle,
  FileText,
} from 'lucide-react';
import { INCOME_SOURCES } from '../../services/incomeService';

export default function IncomeTable({
  incomeList = [],
  loading = false,
  onEdit,
  onDelete,
}) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [dateRange, setDateRange] = useState('all'); // 'all', 'today', 'thisWeek', 'thisMonth', 'lastMonth', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sorting state
  const [sortField, setSortField] = useState('date'); // 'date', 'amount', 'title', 'source'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSource, dateRange, startDate, endDate, sortField, sortOrder, pageSize]);

  // Date Range Helper
  const isWithinDateRange = (itemDateStr) => {
    if (!itemDateStr || dateRange === 'all') return true;

    const todayObj = new Date();
    const itemDate = new Date(itemDateStr + 'T00:00:00');

    if (dateRange === 'today') {
      const todayStr = new Date(todayObj.getTime() - todayObj.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];
      return itemDateStr === todayStr;
    }

    if (dateRange === 'thisWeek') {
      const day = todayObj.getDay();
      const diffToMon = todayObj.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(todayObj.setDate(diffToMon));
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return itemDate >= startOfWeek && itemDate <= endOfWeek;
    }

    if (dateRange === 'thisMonth') {
      const startOfMonth = new Date(todayObj.getFullYear(), todayObj.getMonth(), 1);
      const endOfMonth = new Date(todayObj.getFullYear(), todayObj.getMonth() + 1, 0, 23, 59, 59, 999);
      return itemDate >= startOfMonth && itemDate <= endOfMonth;
    }

    if (dateRange === 'lastMonth') {
      const startOfLastMonth = new Date(todayObj.getFullYear(), todayObj.getMonth() - 1, 1);
      const endOfLastMonth = new Date(todayObj.getFullYear(), todayObj.getMonth(), 0, 23, 59, 59, 999);
      return itemDate >= startOfLastMonth && itemDate <= endOfLastMonth;
    }

    if (dateRange === 'custom') {
      if (startDate && itemDateStr < startDate) return false;
      if (endDate && itemDateStr > endDate) return false;
      return true;
    }

    return true;
  };

  // Filter & Sort Pipeline
  const filteredAndSortedIncome = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    const filtered = incomeList.filter((item) => {
      // 1. Search filter across Title, Source, Notes, Amount
      const matchesSearch =
        !term ||
        item.title?.toLowerCase().includes(term) ||
        item.source?.toLowerCase().includes(term) ||
        item.notes?.toLowerCase().includes(term) ||
        (item.amount !== undefined && String(item.amount).includes(term));

      // 2. Source filter
      const matchesSource = !selectedSource || item.source === selectedSource;

      // 3. Date Range filter
      const matchesDate = isWithinDateRange(item.date);

      return matchesSearch && matchesSource && matchesDate;
    });

    // Sort execution
    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        const dateA = a.date || '';
        const dateB = b.date || '';
        comparison = dateA.localeCompare(dateB);
      } else if (sortField === 'amount') {
        const amtA = parseFloat(a.amount) || 0;
        const amtB = parseFloat(b.amount) || 0;
        comparison = amtA - amtB;
      } else if (sortField === 'title') {
        const titleA = a.title || '';
        const titleB = b.title || '';
        comparison = titleA.localeCompare(titleB);
      } else if (sortField === 'source') {
        const srcA = a.source || '';
        const srcB = b.source || '';
        comparison = srcA.localeCompare(srcB);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [
    incomeList,
    searchTerm,
    selectedSource,
    dateRange,
    startDate,
    endDate,
    sortField,
    sortOrder,
  ]);

  // Pagination Math
  const totalResults = filteredAndSortedIncome.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalResults);
  const paginatedIncome = filteredAndSortedIncome.slice(startIndex, endIndex);

  // Column Header Sort Helper
  const handleSortToggle = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
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
    setSelectedSource('');
    setDateRange('all');
    setStartDate('');
    setEndDate('');
    setSortField('date');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  if (loading && incomeList.length === 0) {
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
    !!selectedSource ||
    dateRange !== 'all' ||
    !!startDate ||
    !!endDate;

  return (
    <div className="space-y-4">
      {/* 1. Filter Controls Header */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, source, notes, amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Filters & Dropdowns Group */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Source Filter */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Sources</option>
              {INCOME_SOURCES.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
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

            {/* Sort Dropdown */}
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
                <option value="source">Source</option>
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

        {/* Custom Date Range Picker Inputs */}
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

      {/* 2. Table or Empty State */}
      {filteredAndSortedIncome.length === 0 ? (
        <EmptyState
          icon={Filter}
          title={incomeList.length === 0 ? 'No Income Recorded Yet' : 'No Matching Income Found'}
          description={
            incomeList.length === 0
              ? 'Start logging your salary, side hustles, and revenue streams to track total earnings.'
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
                {/* Clickable Header for Sorting Title */}
                <TableHead>
                  <button
                    onClick={() => handleSortToggle('title')}
                    className="flex items-center gap-1.5 group font-bold focus:outline-none"
                  >
                    <span>Title</span>
                    {getSortIcon('title')}
                  </button>
                </TableHead>

                {/* Source */}
                <TableHead>
                  <button
                    onClick={() => handleSortToggle('source')}
                    className="flex items-center gap-1.5 group font-bold focus:outline-none"
                  >
                    <span>Source</span>
                    {getSortIcon('source')}
                  </button>
                </TableHead>

                {/* Date */}
                <TableHead>
                  <button
                    onClick={() => handleSortToggle('date')}
                    className="flex items-center gap-1.5 group font-bold focus:outline-none"
                  >
                    <span>Date</span>
                    {getSortIcon('date')}
                  </button>
                </TableHead>

                {/* Amount */}
                <TableHead>
                  <button
                    onClick={() => handleSortToggle('amount')}
                    className="flex items-center gap-1.5 group font-bold focus:outline-none"
                  >
                    <span>Amount</span>
                    {getSortIcon('amount')}
                  </button>
                </TableHead>

                {/* Notes */}
                <TableHead>Notes</TableHead>

                {/* Actions */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedIncome.map((row) => (
                <TableRow key={row.incomeId || row.id}>
                  {/* Title */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">
                          {row.title}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Source */}
                  <TableCell>
                    <Badge variant="emerald" size="sm" className="font-medium">
                      <Briefcase className="w-3 h-3 mr-1" />
                      {row.source || 'Salary'}
                    </Badge>
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {row.date}
                    </span>
                  </TableCell>

                  {/* Amount */}
                  <TableCell>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs font-mono">
                      +${parseFloat(row.amount || 0).toFixed(2)}
                    </span>
                  </TableCell>

                  {/* Notes */}
                  <TableCell>
                    {row.notes ? (
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-xs block" title={row.notes}>
                        {row.notes}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">—</span>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(row)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Income Entry"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(row)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Income Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 3. Responsive Pagination Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            {/* Page Size & Result Summary */}
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
                <span className="font-semibold text-slate-900 dark:text-slate-100">{totalResults}</span> entries
              </div>
            </div>

            {/* Pagination Controls */}
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
