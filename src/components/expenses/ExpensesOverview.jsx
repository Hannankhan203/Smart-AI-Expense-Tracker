import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import ExpensesTable from './ExpensesTable';
import ExpenseFormModal from './ExpenseFormModal';
import ExpenseDeleteModal from './ExpenseDeleteModal';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import {
  subscribeToExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../../services/expenseService';
import { getUserCategories, subscribeToCategories } from '../../services/categoryService';
import {
  Plus,
  TrendingDown,
  Receipt,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

export default function ExpensesOverview() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Subscribe to real-time categories
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToCategories(
      user.uid,
      (data) => {
        const expenseCats = data.filter((c) => c.categoryType === 'expense');
        setCategories(expenseCats);
      },
      (err) => {
        console.error('Error listening to categories:', err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 2. Real-time expenses listener
  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);

    const unsubscribe = subscribeToExpenses(
      user.uid,
      (data) => {
        setExpenses(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching expenses:', err);
        setError('Failed to sync expenses with Cloud Firestore.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Calculations for Summary Cards
  const totalExpenseAmount = expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalCount = expenses.length;
  const highestExpense = expenses.reduce((max, item) => Math.max(max, parseFloat(item.amount) || 0), 0);
  const averageExpense = totalCount > 0 ? totalExpenseAmount / totalCount : 0;

  // Handlers for Add/Edit
  const handleOpenAddModal = () => {
    setSelectedExpense(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (expense) => {
    setSelectedExpense(expense);
    setModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (!user?.uid) return;
    setActionLoading(true);
    try {
      if (selectedExpense?.expenseId) {
        // Edit flow
        await updateExpense(selectedExpense.expenseId, formData);
        addToast({
          type: 'success',
          title: 'Expense Updated',
          message: `"${formData.title}" updated successfully.`,
        });
      } else {
        // Create flow
        await createExpense(user.uid, formData);
        addToast({
          type: 'success',
          title: 'Expense Recorded',
          message: `"${formData.title}" recorded successfully.`,
        });
      }
      setModalOpen(false);
      setSelectedExpense(null);
    } catch (err) {
      console.error('Error saving expense:', err);
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Could not save expense record. Please try again.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers for Delete
  const handleOpenDeleteModal = (expense) => {
    setSelectedExpense(expense);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedExpense?.expenseId) return;
    setActionLoading(true);
    try {
      await deleteExpense(selectedExpense.expenseId);
      addToast({
        type: 'success',
        title: 'Expense Deleted',
        message: 'The expense record has been permanently removed.',
      });
      setDeleteModalOpen(false);
      setSelectedExpense(null);
    } catch (err) {
      console.error('Error deleting expense:', err);
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete expense record. Please try again.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Expense Tracker
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Record and categorize every outflow with Firestore real-time sync
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenAddModal} className="shrink-0">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Expense</span>
        </Button>
      </div>

      {/* Global error banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Expenses</p>
              <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 font-mono">
                ${totalExpenseAmount.toFixed(2)}
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
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Records</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {totalCount}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Highest Expense</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">
                ${highestExpense.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Average Expense</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">
                ${averageExpense.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Expenses Table Card */}
      <Card title="Expenses Log" subtitle="Detailed list of all registered expenses">
        <ExpensesTable
          expenses={expenses}
          categories={categories}
          loading={loading}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
        />
      </Card>

      {/* Add / Edit Expense Modal */}
      <ExpenseFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedExpense}
        categories={categories}
        loading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <ExpenseDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        expense={selectedExpense}
        loading={actionLoading}
      />
    </div>
  );
}
