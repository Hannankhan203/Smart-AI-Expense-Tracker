import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Skeleton from '../common/Skeleton';
import { AlertTriangle, Lock, ShieldAlert } from 'lucide-react';
import { checkCategoryInUse } from '../../services/categoryService';

export default function CategoryDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  category,
  userId,
  loading = false,
}) {
  const [checking, setChecking] = useState(true);
  const [usageInfo, setUsageInfo] = useState({ inUse: false, count: 0, details: '' });

  useEffect(() => {
    let isMounted = true;
    if (isOpen && category && userId) {
      setChecking(true);
      checkCategoryInUse(userId, category)
        .then((res) => {
          if (isMounted) {
            setUsageInfo(res);
            setChecking(false);
          }
        })
        .catch((err) => {
          console.error('Failed to check category usage:', err);
          if (isMounted) {
            setUsageInfo({ inUse: false, count: 0, details: '' });
            setChecking(false);
          }
        });
    } else {
      setChecking(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, category, userId]);

  if (!category) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Category"
      size="sm"
    >
      <div className="space-y-4 text-center py-2">
        {checking ? (
          <div className="space-y-2 py-4">
            <Skeleton className="h-10 w-10 rounded-full mx-auto" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-3 w-1/2 mx-auto" />
          </div>
        ) : usageInfo.inUse ? (
          /* Deletion Blocked Banner */
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-left bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3.5 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                <Lock className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Deletion Blocked</span>
              </div>
              <p className="text-amber-700 dark:text-amber-400">
                Cannot delete category "<span className="font-semibold text-slate-900 dark:text-slate-100">{category.categoryName}</span>" because it is currently assigned to{' '}
                <span className="font-bold text-amber-900 dark:text-amber-200">{usageInfo.details}</span>.
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-500 pt-1">
                To remove this category, please reassign or delete those existing transactions first.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="primary" onClick={onClose} className="w-full">
                Understood
              </Button>
            </div>
          </div>
        ) : (
          /* Normal Deletion Flow */
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Confirm Category Deletion
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete category "<span className="font-medium text-slate-700 dark:text-slate-300">{category.categoryName}</span>"?
                This will permanently delete this category configuration.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="ghost" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button variant="danger" onClick={onConfirm} loading={loading}>
                Yes, Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
