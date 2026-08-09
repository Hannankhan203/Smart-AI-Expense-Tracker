import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import ReportsOverview from '../components/reports/ReportsOverview';

export default function ReportsPage() {
  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive financial insights, cash flow trends, and budget compliance visualizers powered by Chart.js.
          </p>
        </div>
      </div>

      <ReportsOverview />
    </MainLayout>
  );
}

