import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import DashboardOverview from '../components/dashboard/DashboardOverview';

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Welcome back! Here is your smart financial summary and analytics.
          </p>
        </div>
      </div>
      <DashboardOverview />
    </MainLayout>
  );
}
