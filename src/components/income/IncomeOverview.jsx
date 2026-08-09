import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import IncomeTable from './IncomeTable';
import IncomeFormModal from './IncomeFormModal';
import IncomeDeleteModal from './IncomeDeleteModal';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import {
  subscribeToIncome,
  createIncome,
  updateIncome,
  deleteIncome,
} from '../../services/incomeService';
import { subscribeToCategories } from '../../services/categoryService';
import {
  Plus,
  TrendingUp,
  Receipt,
  DollarSign,
  AlertCircle,
  Briefcase,
} from 'lucide-react';

export default function IncomeOverview() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [incomeList, setIncomeList] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Subscribe to real-time categories (income type)
  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeToCategories(
      user.uid,
      (data) => {
        const incCats = data.filter((c) => c.categoryType === 'income');
        setIncomeCategories(incCats);
      },
      (err) => console.error('Error listening to income categories:', err)
    );
    return () => unsubscribe();
  }, [user]);

  // Subscribe to real-time user income stream
  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);

    const unsubscribe = subscribeToIncome(
      user.uid,
      (data) => {
        setIncomeList(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching income stream:', err);
        setError('Failed to sync income data with Cloud Firestore.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Metric Calculations
  const totalIncomeAmount = incomeList.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalEntries = incomeList.length;
  const highestIncome = incomeList.reduce((max, item) => Math.max(max, parseFloat(item.amount) || 0), 0);
  const averageIncome = totalEntries > 0 ? totalIncomeAmount / totalEntries : 0;

  // Modal Handlers
  const handleOpenAddModal = () => {
    setSelectedIncome(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (income) => {
    setSelectedIncome(income);
    setModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (!user?.uid) return;
    setActionLoading(true);
    try {
      if (selectedIncome?.incomeId) {
        // Edit flow
        await updateIncome(selectedIncome.incomeId, formData);
        addToast({
          type: 'success',
          title: 'Income Updated',
          message: `"${formData.title}" updated successfully.`,
        });
      } else {
        // Create flow
        await createIncome(user.uid, formData);
        addToast({
          type: 'success',
          title: 'Income Logged',
          message: `"${formData.title}" recorded successfully.`,
        });
      }
      setModalOpen(false);
      setSelectedIncome(null);
    } catch (err) {
      console.error('Error saving income entry:', err);
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Could not save income record. Please try again.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDeleteModal = (income) => {
    setSelectedIncome(income);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedIncome?.incomeId) return;
    setActionLoading(true);
    try {
      await deleteIncome(selectedIncome.incomeId);
      addToast({
        type: 'success',
        title: 'Income Deleted',
        message: 'The income entry has been permanently removed.',
      });
      setDeleteModalOpen(false);
      setSelectedIncome(null);
    } catch (err) {
      console.error('Error deleting income entry:', err);
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete income entry. Please try again.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Income Streams & Earnings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log and manage salary, freelance, investments, and revenue sources with real-time sync
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenAddModal} className="shrink-0">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Income</span>
        </Button>
      </div>

      {/* Error banner if any */}
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
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Earnings</p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                +${totalIncomeAmount.toFixed(2)}
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
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Entries</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {totalEntries}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Highest Income</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">
                +${highestIncome.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Average Income</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">
                +${averageIncome.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Income Table Card */}
      <Card title="Income Log" subtitle="Detailed table of registered revenue and earnings">
        <IncomeTable
          incomeList={incomeList}
          loading={loading}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
        />
      </Card>

      {/* Add / Edit Income Modal */}
      <IncomeFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedIncome}
        incomeCategories={incomeCategories}
        loading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <IncomeDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        income={selectedIncome}
        loading={actionLoading}
      />
    </div>
  );
}
