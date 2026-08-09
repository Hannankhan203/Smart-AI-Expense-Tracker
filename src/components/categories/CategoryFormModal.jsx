import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { Tag, Layers, Sparkles } from 'lucide-react';

const SUGGESTION_PRESETS = [
  { name: 'Food', type: 'expense' },
  { name: 'Transport', type: 'expense' },
  { name: 'Shopping', type: 'expense' },
  { name: 'Bills', type: 'expense' },
  { name: 'Entertainment', type: 'expense' },
  { name: 'Fuel', type: 'expense' },
  { name: 'Education', type: 'expense' },
  { name: 'Healthcare', type: 'expense' },
  { name: 'Salary', type: 'income' },
  { name: 'Freelancing', type: 'income' },
];

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}) {
  const isEditing = !!initialData?.categoryId && !initialData?.isDefault;

  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState('expense');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setCategoryName(initialData.categoryName || '');
      setCategoryType(initialData.categoryType || 'expense');
    } else {
      setCategoryName('');
      setCategoryType('expense');
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const errs = {};
    if (!categoryName.trim()) {
      errs.categoryName = 'Category name is required';
    }
    if (!categoryType) {
      errs.categoryType = 'Category type is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      categoryName: categoryName.trim(),
      categoryType,
    });
  };

  const typeOptions = [
    { value: 'expense', label: 'Expense Category' },
    { value: 'income', label: 'Income Category' },
  ];

  const handleSelectPreset = (preset) => {
    setCategoryName(preset.name);
    setCategoryType(preset.type);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Category' : 'Create Custom Category'}
      subtitle={
        isEditing
          ? 'Update category title and transaction type'
          : 'Define a custom expense or income category for tracking'
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick Suggestion Chips */}
        {!isEditing && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>Quick Preset Suggestions</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTION_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-all ${
                    categoryName.toLowerCase() === preset.name.toLowerCase()
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {preset.name} ({preset.type})
                </button>
              ))}
            </div>
          </div>
        )}

        <Input
          label="Category Name"
          icon={Tag}
          placeholder="e.g. Subscriptions, Investments, Pet Care..."
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          error={errors.categoryName}
          required
        />

        <Select
          label="Category Type"
          icon={Layers}
          options={typeOptions}
          value={categoryType}
          onChange={(e) => setCategoryType(e.target.value)}
          error={errors.categoryType}
          required
        />

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEditing ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
