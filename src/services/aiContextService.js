import { getExpenses } from './expenseService';
import { getIncome } from './incomeService';
import { getBudgets } from './budgetService';
import { getUserCategories } from './categoryService';

/**
 * AI Financial Context Service (READ-ONLY)
 * Safely fetches and formats existing financial data for the current authenticated user.
 * Strictly READ-ONLY. Does not create, modify, or delete any user data or Firestore structures.
 */

/**
 * Fetches all financial data for a specific user ID and constructs a structured summary.
 * @param {string} userId - Current authenticated user UID
 * @returns {Promise<Object>} Structured financial summary
 */
export const getUserFinancialContext = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required to fetch financial context.');
  }

  // Fetch user data in parallel using existing read-only functions
  const [expenses, incomes, budgets, categories] = await Promise.all([
    getExpenses(userId).catch(() => []),
    getIncome(userId).catch(() => []),
    getBudgets(userId).catch(() => []),
    getUserCategories(userId).catch(() => [])
  ]);

  // Map category IDs/names for easy lookup
  const categoryMap = {};
  categories.forEach((cat) => {
    categoryMap[cat.id] = cat.name || cat.title || 'Uncategorized';
  });

  // Calculate totals
  const totalExpenseAmount = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const totalIncomeAmount = incomes.reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0);
  const netSavings = totalIncomeAmount - totalExpenseAmount;
  const savingsRate = totalIncomeAmount > 0 ? ((netSavings / totalIncomeAmount) * 100).toFixed(1) : '0';

  // Expense breakdown by category
  const expenseByCategory = {};
  expenses.forEach((exp) => {
    const catName = exp.categoryName || categoryMap[exp.categoryId] || exp.category || 'Uncategorized';
    expenseByCategory[catName] = (expenseByCategory[catName] || 0) + (Number(exp.amount) || 0);
  });

  // Income breakdown by category/source
  const incomeByCategory = {};
  incomes.forEach((inc) => {
    const catName = inc.categoryName || categoryMap[inc.categoryId] || inc.category || inc.source || 'Other Income';
    incomeByCategory[catName] = (incomeByCategory[catName] || 0) + (Number(inc.amount) || 0);
  });

  // Budget progress summary
  const budgetSummary = budgets.map((b) => {
    const catName = b.categoryName || categoryMap[b.categoryId] || b.category || 'General';
    const limit = Number(b.monthlyLimit || b.amount || b.limit || 0);

    // Calculate spent matching the specific budget (by category and month/year if specified)
    const matchingExpenses = expenses.filter((exp) => {
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
    const isOverBudget = limit > 0 ? spent > limit : false;

    return {
      category: catName,
      limit,
      spent,
      remaining,
      percentUsed: `${percentUsed}%`,
      isOverBudget,
      month: b.month,
      year: b.year
    };
  });

  // Calculate current month vs previous month spending/income
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevYear = prevDate.getFullYear();
  const prevMonth = prevDate.getMonth() + 1; // 1-12

  let currentMonthExpenses = 0;
  let previousMonthExpenses = 0;
  let currentMonthIncome = 0;
  let previousMonthIncome = 0;

  expenses.forEach((exp) => {
    const expDateStr = exp.expenseDate || exp.date || '';
    if (expDateStr) {
      const [y, m] = expDateStr.split('-').map(Number);
      const amt = Number(exp.amount) || 0;
      if (y === currentYear && m === currentMonth) {
        currentMonthExpenses += amt;
      } else if (y === prevYear && m === prevMonth) {
        previousMonthExpenses += amt;
      }
    }
  });

  incomes.forEach((inc) => {
    const incDateStr = inc.incomeDate || inc.date || '';
    if (incDateStr) {
      const [y, m] = incDateStr.split('-').map(Number);
      const amt = Number(inc.amount) || 0;
      if (y === currentYear && m === currentMonth) {
        currentMonthIncome += amt;
      } else if (y === prevYear && m === prevMonth) {
        previousMonthIncome += amt;
      }
    }
  });

  const currentMonthSavings = currentMonthIncome - currentMonthExpenses;

  // Top spending categories
  const topCategories = Object.entries(expenseByCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenseAmount > 0 ? ((amount / totalExpenseAmount) * 100).toFixed(1) : '0'
    }))
    .sort((a, b) => b.amount - a.amount);

  // Top 5 largest single expenses
  const largestExpenses = [...expenses]
    .map((e) => ({
      amount: Number(e.amount) || 0,
      category: e.categoryName || categoryMap[e.categoryId] || e.category || 'Uncategorized',
      title: e.title || e.description || e.notes || 'Expense',
      date: e.expenseDate || e.date || 'N/A'
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Recent transactions (merged & sorted by date descending)
  const formattedExpenses = expenses.map((e) => ({
    id: e.id,
    type: 'Expense',
    amount: Number(e.amount) || 0,
    category: e.categoryName || categoryMap[e.categoryId] || e.category || 'Uncategorized',
    description: e.description || e.title || e.notes || '',
    date: e.expenseDate || e.date || e.createdAt || ''
  }));

  const formattedIncomes = incomes.map((i) => ({
    id: i.id,
    type: 'Income',
    amount: Number(i.amount) || 0,
    category: i.categoryName || categoryMap[i.categoryId] || i.category || i.source || 'Income',
    description: i.description || i.title || i.notes || '',
    date: i.incomeDate || i.date || i.createdAt || ''
  }));

  const recentTransactions = [...formattedExpenses, ...formattedIncomes]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 30); // Top 30 recent transactions

  return {
    summary: {
      totalIncome: totalIncomeAmount,
      totalExpenses: totalExpenseAmount,
      netSavings,
      savingsRate: `${savingsRate}%`,
      totalTransactionsCount: expenses.length + incomes.length,
      activeBudgetsCount: budgets.length,
      currentMonthExpenses,
      previousMonthExpenses,
      currentMonthIncome,
      previousMonthIncome,
      currentMonthSavings
    },
    topCategories,
    largestExpenses,
    expenseByCategory,
    incomeByCategory,
    budgets: budgetSummary,
    recentTransactions
  };
};

/**
 * Formats the user's financial context into a clean text prompt context for Gemini AI.
 * @param {Object} contextData - Data returned by getUserFinancialContext
 * @returns {string} Formatted text prompt block
 */
export const formatFinancialContextForPrompt = (contextData) => {
  if (!contextData) return 'No financial data available.';

  const { summary, topCategories, largestExpenses, expenseByCategory, incomeByCategory, budgets, recentTransactions } = contextData;

  let text = `=== OVERALL FINANCIAL SUMMARY ===\n`;
  text += `- Total Income (All Time/Logged): $${summary.totalIncome.toFixed(2)}\n`;
  text += `- Total Expenses (All Time/Logged): $${summary.totalExpenses.toFixed(2)}\n`;
  text += `- Net Savings / Balance: $${summary.netSavings.toFixed(2)}\n`;
  text += `- Overall Savings Rate: ${summary.savingsRate}\n\n`;

  text += `=== CURRENT VS PREVIOUS MONTH COMPARISON ===\n`;
  text += `- Current Month Spending: $${summary.currentMonthExpenses.toFixed(2)}\n`;
  text += `- Previous Month Spending: $${summary.previousMonthExpenses.toFixed(2)}\n`;
  text += `- Current Month Income: $${summary.currentMonthIncome.toFixed(2)}\n`;
  text += `- Previous Month Income: $${summary.previousMonthIncome.toFixed(2)}\n`;
  text += `- Current Month Net Savings: $${summary.currentMonthSavings.toFixed(2)}\n\n`;

  text += `=== TOP SPENDING CATEGORIES ===\n`;
  if (!topCategories || topCategories.length === 0) {
    text += `No spending category data logged.\n`;
  } else {
    topCategories.forEach((cat) => {
      text += `- ${cat.category}: $${cat.amount.toFixed(2)} (${cat.percentage}% of total expenses)\n`;
    });
  }
  text += `\n`;

  text += `=== LARGEST INDIVIDUAL EXPENSES (Unusual / High Spending Identification) ===\n`;
  if (!largestExpenses || largestExpenses.length === 0) {
    text += `No expense transactions recorded.\n`;
  } else {
    largestExpenses.forEach((exp) => {
      text += `- [${exp.date}] $${exp.amount.toFixed(2)} | Category: ${exp.category} | Title/Desc: ${exp.title}\n`;
    });
  }
  text += `\n`;

  text += `=== INCOME BY SOURCE / CATEGORY ===\n`;
  if (Object.keys(incomeByCategory).length === 0) {
    text += `No income category data found.\n`;
  } else {
    Object.entries(incomeByCategory).forEach(([cat, amount]) => {
      text += `- ${cat}: $${amount.toFixed(2)}\n`;
    });
  }
  text += `\n`;

  text += `=== BUDGET PERFORMANCE & OVERRUN ALERTS ===\n`;
  if (budgets.length === 0) {
    text += `No active budgets set up.\n`;
  } else {
    budgets.forEach((b) => {
      let statusText = 'ON TRACK';
      if (b.limit > 0) {
        if (b.spent > b.limit) {
          const over = (b.spent - b.limit).toFixed(2);
          statusText = `OVER BUDGET (by $${over})`;
        } else if (b.spent === b.limit) {
          statusText = 'AT LIMIT (100% used)';
        } else {
          statusText = `ON TRACK ($${b.remaining.toFixed(2)} remaining)`;
        }
      } else {
        statusText = 'NO LIMIT SET';
      }
      text += `- Category: ${b.category} | Budget Limit: $${b.limit.toFixed(2)} | Spent: $${b.spent.toFixed(2)} | Remaining: $${b.remaining.toFixed(2)} | Usage: ${b.percentUsed} | Status: ${statusText}\n`;
    });
  }
  text += `\n`;

  text += `=== RECENT TRANSACTIONS (Top ${recentTransactions.length}) ===\n`;
  if (recentTransactions.length === 0) {
    text += `No recent transactions found.\n`;
  } else {
    recentTransactions.forEach((t) => {
      text += `- [${t.date || 'N/A'}] ${t.type.toUpperCase()}: $${t.amount.toFixed(2)} | Category: ${t.category} | ${t.description ? `Desc: ${t.description}` : 'No description'}\n`;
    });
  }

  return text;
};
