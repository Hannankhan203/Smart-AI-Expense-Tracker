import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import ReceiptUploader from '../common/ReceiptUploader';
import { useAuth } from '../../hooks/useAuth';
import { PAYMENT_METHODS } from '../../services/expenseService';
import { DollarSign, Calendar, Tag, CreditCard, FileText, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

export default function ExpenseFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  categories = [],
  loading = false,
}) {
  const { user } = useAuth();
  const isEditing = !!initialData?.expenseId;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [expenseDate, setExpenseDate] = useState('');
  const [description, setDescription] = useState('');
  const [receiptURL, setReceiptURL] = useState('');
  const [showDirectUrlInput, setShowDirectUrlInput] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setAmount(initialData.amount ? String(initialData.amount) : '');
      const matchedCategory = categories.find(
        (c) => (c.categoryId || c.id) === initialData.categoryId ||
               c.categoryName?.toLowerCase() === initialData.categoryName?.toLowerCase()
      );
      setCategoryId(matchedCategory ? (matchedCategory.categoryId || matchedCategory.id) : (initialData.categoryId || ''));
      setPaymentMethod(initialData.paymentMethod || 'Credit Card');
      setExpenseDate(initialData.expenseDate || new Date().toISOString().split('T')[0]);
      setDescription(initialData.description || '');
      setReceiptURL(initialData.receiptURL || '');
      setShowDirectUrlInput(false);
    } else {
      setTitle('');
      setAmount('');
      setCategoryId(categories.length > 0 ? (categories[0].categoryId || categories[0].id) : 'def_food');
      setPaymentMethod('Credit Card');
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setReceiptURL('');
      setShowDirectUrlInput(false);
    }
    setErrors({});
  }, [initialData, isOpen, categories]);

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      errs.amount = 'Please enter a valid positive amount';
    }
    if (!categoryId) errs.categoryId = 'Please select a category';
    if (!expenseDate) errs.expenseDate = 'Expense date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedCategory = categories.find(
      (c) => (c.categoryId || c.id) === categoryId ||
             c.categoryName?.toLowerCase() === categoryId?.toLowerCase()
    );
    const categoryName = selectedCategory
      ? (selectedCategory.categoryName || selectedCategory.name || 'Other')
      : 'Other';

    onSubmit({
      title: title.trim(),
      amount: parseFloat(amount),
      categoryId,
      categoryName,
      paymentMethod,
      expenseDate,
      description: description.trim(),
      receiptURL: receiptURL.trim(),
    });
  };

  const categoryOptions = categories.map((cat, idx) => ({
    value: cat.categoryId || cat.id || `cat-${idx}`,
    label: cat.categoryName,
  }));

  const paymentOptions = PAYMENT_METHODS.map((pm) => ({
    value: pm,
    label: pm,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Expense Record' : 'Record New Expense'}
      subtitle={
        isEditing
          ? 'Update the details for this expense record'
          : 'Add a new expense item to keep track of your spending'
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Expense Title"
            icon={FileText}
            placeholder="e.g. Grocery Shopping at Target"
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Category"
            icon={Tag}
            options={categoryOptions}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            error={errors.categoryId}
            required
          />

          <Select
            label="Payment Method"
            icon={CreditCard}
            options={paymentOptions}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          />

          <Input
            label="Expense Date"
            type="date"
            icon={Calendar}
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            error={errors.expenseDate}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description / Notes (Optional)
          </label>
          <textarea
            rows="2"
            className="w-full text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 p-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            placeholder="Add additional context or items purchased..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Receipt Uploader Section */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <ReceiptUploader
            value={receiptURL}
            onChange={(newUrl) => setReceiptURL(newUrl)}
            userId={user?.uid}
            disabled={loading}
          />

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <button
              type="button"
              onClick={() => setShowDirectUrlInput(!showDirectUrlInput)}
              className="hover:underline text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium"
            >
              <LinkIcon className="w-3 h-3" />
              <span>{showDirectUrlInput ? 'Hide URL input' : 'Or enter direct receipt URL'}</span>
            </button>
          </div>

          {showDirectUrlInput && (
            <Input
              label="Direct Receipt URL"
              icon={ImageIcon}
              type="url"
              placeholder="https://example.com/receipt.jpg"
              value={receiptURL}
              onChange={(e) => setReceiptURL(e.target.value)}
              helperText="Paste an external direct web URL link to an uploaded image"
            />
          )}
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEditing ? 'Save Changes' : 'Create Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
