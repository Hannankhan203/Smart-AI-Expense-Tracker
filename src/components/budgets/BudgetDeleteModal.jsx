import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { AlertTriangle } from 'lucide-react';
import { MONTH_NAMES } from '../../services/budgetService';

export default function BudgetDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  budget,
  loading = false,
}) {
  if (!budget) return null;

  const monthLabel = MONTH_NAMES[budget.month - 1] || budget.month;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Budget Limit"
      size="sm"
    >
      <div className="space-y-4 text-center py-2">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Confirm Budget Removal
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Are you sure you want to remove the budget limit for "<span className="font-medium text-slate-700 dark:text-slate-300">{budget.categoryName}</span>" ({monthLabel} {budget.year})?
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            Yes, Remove
          </Button>
        </div>
      </div>
    </Modal>
  );
}
