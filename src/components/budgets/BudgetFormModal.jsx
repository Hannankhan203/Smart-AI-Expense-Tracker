import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { MONTH_NAMES } from '../../services/budgetService';
import { DollarSign, Tag, Calendar, Layers } from 'lucide-react';

export default function BudgetFormModal({
  isOpen,
  onClose,
  onSubmit,
  categories = [],
  initialData = null,
  loading = false,
}) {
  const isEditing = !!initialData?.budgetId;

  const currentDate = new Date();
  const currentMonthNum = currentDate.getMonth() + 1;
  const currentYearNum = currentDate.getFullYear();

  const [categoryId, setCategoryId] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [month, setMonth] = useState(currentMonthNum);
  const [year, setYear] = useState(currentYearNum);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setCategoryId(initialData.categoryId || (categories[0]?.categoryId || categories[0]?.id || ''));
      setMonthlyLimit(initialData.monthlyLimit ? String(initialData.monthlyLimit) : '');
      setMonth(initialData.month || currentMonthNum);
      setYear(initialData.year || currentYearNum);
    } else {
      setCategoryId(categories[0]?.categoryId || categories[0]?.id || '');
      setMonthlyLimit('');
      setMonth(currentMonthNum);
      setYear(currentYearNum);
    }
    setErrors({});
  }, [initialData, isOpen, categories]);

  const validate = () => {
    const errs = {};
    if (!categoryId) errs.categoryId = 'Expense category is required';
    if (!monthlyLimit || isNaN(monthlyLimit) || parseFloat(monthlyLimit) <= 0) {
      errs.monthlyLimit = 'Please enter a valid positive monthly limit';
    }
    if (!month) errs.month = 'Month is required';
    if (!year) errs.year = 'Year is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const matchedCat = categories.find(
      (c) => (c.categoryId || c.id) === categoryId
    );

    onSubmit({
      categoryId,
      categoryName: matchedCat ? matchedCat.categoryName : 'Uncategorized',
      monthlyLimit: parseFloat(monthlyLimit),
      month: parseInt(month, 10),
      year: parseInt(year, 10),
    });
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.categoryId || cat.id,
    label: cat.categoryName,
  }));

  const monthOptions = MONTH_NAMES.map((mName, idx) => ({
    value: idx + 1,
    label: `${mName} (${idx + 1})`,
  }));

  const yearOptions = [
    { value: currentYearNum - 1, label: String(currentYearNum - 1) },
    { value: currentYearNum, label: String(currentYearNum) },
    { value: currentYearNum + 1, label: String(currentYearNum + 1) },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Budget Limit' : 'Set Category Budget'}
      subtitle={
        isEditing
          ? 'Update monthly spending target for this category'
          : 'Define a monthly spending threshold to control expenses'
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Expense Category"
          icon={Tag}
          options={categoryOptions}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          error={errors.categoryId}
          required
        />

        <Input
          label="Monthly Limit ($ USD)"
          type="number"
          step="0.01"
          min="0"
          icon={DollarSign}
          placeholder="500.00"
          value={monthlyLimit}
          onChange={(e) => setMonthlyLimit(e.target.value)}
          error={errors.monthlyLimit}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Month"
            icon={Calendar}
            options={monthOptions}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            error={errors.month}
            required
          />

          <Select
            label="Year"
            icon={Layers}
            options={yearOptions}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            error={errors.year}
            required
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEditing ? 'Save Changes' : 'Set Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
