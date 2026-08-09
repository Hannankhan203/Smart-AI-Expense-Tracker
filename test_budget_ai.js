import { formatFinancialContextForPrompt } from './src/services/aiContextService.js';

const mockBudgets = [
  {
    categoryName: 'Food',
    categoryId: 'def_food',
    monthlyLimit: 50,
    month: 8,
    year: 2026
  }
];

const mockExpenses = [
  {
    amount: 5,
    categoryName: 'Food',
    categoryId: 'def_food',
    expenseDate: '2026-08-09'
  }
];

// Replicate the calculation logic
const categoryMap = {};

const budgetSummary = mockBudgets.map((b) => {
  const catName = b.categoryName || categoryMap[b.categoryId] || b.category || 'General';
  const limit = Number(b.monthlyLimit || b.amount || b.limit || 0);

  const matchingExpenses = mockExpenses.filter((exp) => {
    const expDate = exp.expenseDate || exp.date;
    let matchesDate = true;
    if (expDate && b.year && b.month) {
      const [expY, expM] = expDate.split('-').map(Number);
      matchesDate = expY === Number(b.year) && expM === Number(b.month);
    }

    const matchesCategory =
      (b.categoryId && exp.categoryId === b.categoryId) ||
      (b.categoryName && exp.categoryName?.toLowerCase() === b.categoryName?.toLowerCase()) ||
      (catName && (exp.categoryName?.toLowerCase() === catName.toLowerCase() || exp.category?.toLowerCase() === catName.toLowerCase()));

    return matchesDate && matchesCategory;
  });

  const spent = matchingExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const remaining = limit - spent;
  const percentUsed = limit > 0 ? ((spent / limit) * 100).toFixed(1) : '0';

  return {
    category: catName,
    limit,
    spent,
    remaining,
    percentUsed: `${percentUsed}%`,
    isOverBudget: limit > 0 ? spent > limit : false,
    month: b.month,
    year: b.year
  };
});

console.log('Calculated Budget Summary:', JSON.stringify(budgetSummary, null, 2));
