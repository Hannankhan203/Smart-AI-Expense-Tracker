import React from 'react';
import Modal from '../common/Modal';

export default function TransactionModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Transaction">
      <div className="space-y-4">
        <p className="text-xs text-slate-500">Transaction modal component shell ready for form inputs.</p>
        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
