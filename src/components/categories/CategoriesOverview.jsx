import React, { useState, useEffect, useMemo } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import Skeleton from '../common/Skeleton';
import CategoryFormModal from './CategoryFormModal';
import CategoryDeleteModal from './CategoryDeleteModal';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import {
  subscribeToCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  DEFAULT_CATEGORY_SUGGESTIONS,
} from '../../services/categoryService';
import {
  Plus,
  Tag,
  TrendingDown,
  TrendingUp,
  Search,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';

export default function CategoriesOverview() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'expense', 'income'

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Real-time synchronization
  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);

    const unsubscribe = subscribeToCategories(
      user.uid,
      (data) => {
        setCategories(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error syncing categories:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Filter pipeline
  const filteredCategories = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return categories.filter((cat) => {
      const matchesSearch = !term || cat.categoryName.toLowerCase().includes(term);
      const matchesType = activeTab === 'all' || cat.categoryType === activeTab;
      return matchesSearch && matchesType;
    });
  }, [categories, searchTerm, activeTab]);

  // Metrics
  const totalCategories = categories.length;
  const expenseCount = categories.filter((c) => c.categoryType === 'expense').length;
  const incomeCount = categories.filter((c) => c.categoryType === 'income').length;
  const customCount = categories.filter((c) => !c.isDefault).length;

  // Handlers
  const handleOpenAddModal = () => {
    setSelectedCategory(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setSelectedCategory(cat);
    setModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (!user?.uid) return;
    setActionLoading(true);
    try {
      if (selectedCategory?.categoryId && !selectedCategory.isDefault) {
        // Update existing custom category
        await updateCategory(selectedCategory.categoryId, formData);
        addToast({
          type: 'success',
          title: 'Category Updated',
          message: `Category "${formData.categoryName}" updated successfully.`,
        });
      } else {
        // Create new category
        await createCategory(user.uid, formData);
        addToast({
          type: 'success',
          title: 'Category Created',
          message: `Category "${formData.categoryName}" created successfully.`,
        });
      }
      setModalOpen(false);
      setSelectedCategory(null);
    } catch (err) {
      console.error('Failed to save category:', err);
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not save category. Please try again.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDeleteModal = (cat) => {
    setSelectedCategory(cat);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory?.categoryId) return;
    setActionLoading(true);
    try {
      await deleteCategory(selectedCategory.categoryId);
      addToast({
        type: 'success',
        title: 'Category Deleted',
        message: 'Category removed successfully.',
      });
      setDeleteModalOpen(false);
      setSelectedCategory(null);
    } catch (err) {
      console.error('Error deleting category:', err);
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete category.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Seed Default Category Handler
  const handleSeedDefaultCategory = async (suggestion) => {
    if (!user?.uid) return;
    try {
      await createCategory(user.uid, {
        categoryName: suggestion.categoryName,
        categoryType: suggestion.categoryType,
      });
      addToast({
        type: 'success',
        title: 'Category Added',
        message: `Default suggestion "${suggestion.categoryName}" added as custom category.`,
      });
    } catch (err) {
      console.error('Error adding suggestion:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Financial Category Library
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize expenses and income streams with custom and standard tags
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenAddModal} className="shrink-0">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Custom Category</span>
        </Button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Categories</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalCategories}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-slate-500/10 text-slate-500 border border-slate-500/20">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Expense Categories</p>
              <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{expenseCount}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Income Categories</p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{incomeCount}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Custom User Created</p>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{customCount}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card title="Categories Directory" subtitle="Search, filter, and customize your categorization schema">
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Type Segmented Filter Pills */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                All ({totalCategories})
              </button>
              <button
                onClick={() => setActiveTab('expense')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'expense'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                Expenses ({expenseCount})
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'income'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                Income ({incomeCount})
              </button>
            </div>
          </div>

          {/* Table Content */}
          {loading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <EmptyState
              icon={Filter}
              title="No Categories Found"
              description="No category matches your current search term or filter criteria."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Category Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((cat) => (
                  <TableRow key={cat.categoryId || cat.id}>
                    {/* Name */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            cat.categoryType === 'income'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          }`}
                        >
                          <Tag className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                          {cat.categoryName}
                        </span>
                      </div>
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      {cat.categoryType === 'income' ? (
                        <Badge variant="emerald" size="sm" className="font-medium">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Income
                        </Badge>
                      ) : (
                        <Badge variant="rose" size="sm" className="font-medium">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          Expense
                        </Badge>
                      )}
                    </TableCell>

                    {/* Source */}
                    <TableCell>
                      {cat.isDefault ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                          <CheckCircle2 className="w-3 h-3 text-slate-400" />
                          System Default
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/60">
                          <Sparkles className="w-3 h-3" />
                          Custom User
                        </span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      {!cat.isDefault ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(cat)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(cat)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Built-in</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Category Add/Edit Modal */}
      <CategoryFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedCategory}
        loading={actionLoading}
      />

      {/* Category Delete Modal */}
      <CategoryDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        category={selectedCategory}
        userId={user?.uid}
        loading={actionLoading}
      />
    </div>
  );
}
