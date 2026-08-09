import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import TransactionsOverview from '../components/transactions/TransactionsOverview';

export default function TransactionsPage() {
  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Transactions</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse and filter your complete transaction history.
          </p>
        </div>
      </div>
      <TransactionsOverview />
    </MainLayout>
  );
}
