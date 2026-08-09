import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { INCOME_SOURCES } from '../../services/incomeService';
import { DollarSign, Calendar, Briefcase, FileText, AlignLeft } from 'lucide-react';

export default function IncomeFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  incomeCategories = [],
  loading = false,
}) {
  const isEditing = !!initialData?.incomeId;

  const [title, setTitle] = useState('');
  const [source, setSource] = useState('Salary');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setSource(initialData.source || 'Salary');
      setAmount(initialData.amount ? String(initialData.amount) : '');
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setNotes(initialData.notes || '');
    } else {
      setTitle('');
      setSource('Salary');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      errs.amount = 'Please enter a valid positive amount';
    }
    if (!source) errs.source = 'Income source is required';
    if (!date) errs.date = 'Income date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      source,
      amount: parseFloat(amount),
      date,
      notes: notes.trim(),
    });
  };

  const combinedSources = Array.from(
    new Set([
      ...incomeCategories.map((c) => c.categoryName),
      ...INCOME_SOURCES,
    ])
  );

  const sourceOptions = combinedSources.map((s) => ({
    value: s,
    label: s,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Income Record' : 'Record New Income'}
      subtitle={
        isEditing
          ? 'Update the details for this income entry'
          : 'Log new earnings, salary, or revenue source'
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Income Title"
            icon={FileText}
            placeholder="e.g. Monthly Salary or Client Project Payment"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            required
          />

          <Input
            label="Amount ($ USD)"
            type="number"
            step="0.01"
            min="0"
            icon={DollarSign}
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Income Source"
            icon={Briefcase}
            options={sourceOptions}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            error={errors.source}
            required
          />

          <Input
            label="Received Date"
            type="date"
            icon={Calendar}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>Notes / Description (Optional)</span>
          </label>
          <textarea
            rows="3"
            className="w-full text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 p-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            placeholder="Add relevant payment notes, invoice references, or details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEditing ? 'Save Changes' : 'Record Income'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
