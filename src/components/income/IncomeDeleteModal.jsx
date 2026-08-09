import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { AlertTriangle } from 'lucide-react';

export default function IncomeDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  income,
  loading = false,
}) {
  if (!income) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Delete Income"
      size="sm"
    >
      <div className="space-y-4 text-center py-2">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Are you sure you want to delete this income entry?
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            "<span className="font-medium text-slate-700 dark:text-slate-300">{income.title}</span>" of{' '}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              +${parseFloat(income.amount || 0).toFixed(2)}
            </span>{' '}
            will be permanently removed. This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            Yes, Delete Income
          </Button>
        </div>
      </div>
    </Modal>
  );
}
