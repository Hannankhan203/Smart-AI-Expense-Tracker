import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import ExpensesOverview from '../components/expenses/ExpensesOverview';

export default function ExpensesPage() {
  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Expenses</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track, analyze, and manage your daily and recurring expenses.
          </p>
        </div>
      </div>
      <ExpensesOverview />
    </MainLayout>
  );
}
